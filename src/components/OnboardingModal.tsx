import React, { useState } from 'react';
import { 
  Database, 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Heart, 
  ArrowRight, 
  Smile, 
  Activity, 
  Clock,
  UserCheck,
  Flame,
  Cloud,
  Globe2,
  Smartphone,
  Mail,
  User,
  MessageCircle,
  CreditCard,
  Crown,
  ChevronRight,
  Shield,
  Send,
  LogIn
} from 'lucide-react';
import { UserProfile, TimeAdjustment, UserRegion, AccountChannel, UserRole } from '../types';
import { calculateBiologicalAgeOffset } from '../services/longevityCalculator';
import { 
  syncUserProfileToFirestore, 
  saveQuestionnaireSubmission, 
  saveHealthReportRecord,
  signInWithGoogle,
  fetchUserProfileById,
  BOOTSTRAP_ADMIN_EMAIL
} from '../services/firebase';
import { useLanguage } from '../services/i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onCompleteProfile: (updatedProfile: UserProfile) => void;
  onAddAdjustment?: (adj: TimeAdjustment) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onCompleteProfile,
}) => {
  const { language } = useLanguage();

  // Step 1: Account Registration | Step 2: Health Setting (Optional / 不强制)
  const [currentStep, setCurrentStep] = useState<'register' | 'health' | 'login'>('register');

  // Region: 'mainland' (中国大陆) | 'overseas' (海外/全球)
  const [region, setRegion] = useState<UserRegion>(currentProfile.region || 'mainland');

  // Selected Channel
  const [channel, setChannel] = useState<AccountChannel>(currentProfile.accountType || (region === 'mainland' ? 'username' : 'google'));

  // Account identifiers
  const [username, setUsername] = useState(currentProfile.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [emailAddress, setEmailAddress] = useState(currentProfile.accountIdentifier || '');
  const [wechatId, setWechatId] = useState('');
  const [alipayId, setAlipayId] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [socialAccount, setSocialAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminRegister, setIsAdminRegister] = useState(
    currentProfile.role === 'admin' || currentProfile.accountIdentifier === BOOTSTRAP_ADMIN_EMAIL
  );

  // Optional Health Settings (保留但完全不强制)
  const [birthYear, setBirthYear] = useState('1998');
  const [birthMonth, setBirthMonth] = useState('06');
  const [birthDay, setBirthDay] = useState('15');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(currentProfile.gender || 'male');
  const [targetAge, setTargetAge] = useState<number>(currentProfile.targetAge || 85);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentProfile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=LifeSeeker88'
  );

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Send SMS Code simulation
  const handleSendSms = () => {
    if (!phoneNumber) return;
    setSmsCountdown(60);
    setSmsCode('8869'); // simulated auto-fill code
    const timer = setInterval(() => {
      setSmsCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Google Sign In trigger for overseas
  const handleGoogleAuth = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setEmailAddress(user.email || '');
        setUsername(user.displayName || 'Google User');
        if (user.photoURL) setSelectedAvatar(user.photoURL);
        if (user.email === BOOTSTRAP_ADMIN_EMAIL) setIsAdminRegister(true);
        setAuthSuccessNotice(`已成功连接谷歌账号: ${user.email}`);
      }
    } catch (e) {
      console.warn('Google sign-in error:', e);
    }
  };

  const handleExistingAccountLogin = async () => {
    setIsSubmitting(true);
    setLoginNotice(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) {
        setLoginNotice(language === 'zh' ? 'Google 登录未完成，请重试或关闭登录窗口后再试。' : 'Google sign-in was not completed. Please try again.');
        return;
      }

      const savedProfile = await fetchUserProfileById(firebaseUser.uid);
      if (!savedProfile) {
        setLoginNotice(language === 'zh'
          ? '该 Google 账号尚未关联生命维度档案。请先完成注册，再使用此账号登录。'
          : 'No Life Dimensions profile is linked to this Google account. Register first, then sign in with this account.');
        return;
      }

      onCompleteProfile(savedProfile);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Registration & Save
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Determine account identifier
      let accountIdentifier = '';
      let displayName = username.trim();

      if (region === 'mainland') {
        if (channel === 'username') {
          accountIdentifier = username || `用户_${Date.now().toString().slice(-6)}`;
          if (!displayName) displayName = accountIdentifier;
        } else if (channel === 'phone') {
          accountIdentifier = phoneNumber || '13800000000';
          if (!displayName) displayName = `尾号${accountIdentifier.slice(-4)}的探索者`;
        } else if (channel === 'email') {
          accountIdentifier = emailAddress || 'user@domain.com';
          if (!displayName) displayName = accountIdentifier.split('@')[0];
        } else if (channel === 'wechat') {
          accountIdentifier = wechatId || `wx_${Date.now().toString().slice(-6)}`;
          if (!displayName) displayName = `微信探索者#${accountIdentifier.slice(-4)}`;
        } else if (channel === 'alipay') {
          accountIdentifier = alipayId || `alipay_${Date.now().toString().slice(-6)}`;
          if (!displayName) displayName = `支付宝用户#${accountIdentifier.slice(-4)}`;
        }
      } else {
        if (channel === 'google') {
          accountIdentifier = emailAddress || 'google.user@gmail.com';
          if (!displayName) displayName = accountIdentifier.split('@')[0];
        } else if (channel === 'phone') {
          accountIdentifier = `${countryCode} ${phoneNumber || '123456789'}`;
          if (!displayName) displayName = `User (${countryCode})`;
        } else if (channel === 'facebook') {
          accountIdentifier = socialAccount || 'facebook_user';
          if (!displayName) displayName = `Meta_${accountIdentifier}`;
        } else if (channel === 'whatsapp') {
          accountIdentifier = `${countryCode} ${phoneNumber || 'WhatsApp'}`;
          if (!displayName) displayName = `WhatsApp_${accountIdentifier.slice(-4)}`;
        } else if (channel === 'twitter') {
          accountIdentifier = socialAccount ? `@${socialAccount.replace('@', '')}` : '@LifeSeeker';
          if (!displayName) displayName = accountIdentifier;
        }
      }

      // Check if role should be admin
      const isBootstrapAdmin = 
        isAdminRegister ||
        accountIdentifier === BOOTSTRAP_ADMIN_EMAIL ||
        emailAddress === BOOTSTRAP_ADMIN_EMAIL ||
        accountIdentifier.toLowerCase() === 'admin';

      const userRole: UserRole = isBootstrapAdmin ? 'admin' : 'user';

      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: displayName || '探索者',
        birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
        gender,
        targetAge: Number(targetAge) || 85,
        avatarUrl: selectedAvatar,
        role: userRole,
        region,
        accountType: channel,
        accountIdentifier,
      };

      // Save to Cloud Firestore
      await syncUserProfileToFirestore(updatedProfile);

      // Notify parent app
      onCompleteProfile(updatedProfile);
      onClose();
    } catch (err) {
      console.error('Registration save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {language === 'zh' ? '用户注册与账号登录' : 'Account Registration & Login'}
                </h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {language === 'zh' ? '云端数据库存储' : 'Cloud Firestore'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'zh' ? '支持大陆多元快捷通道与全球海外注册 · 内容设置完全自主可选' : 'Mainland China & Global registration channels · Profile settings optional'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator tabs */}
        <div className="flex border-b border-slate-800/60 bg-slate-950">
          <button
            type="button"
            onClick={() => setCurrentStep('register')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
              currentStep === 'register'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '第 1 步：账号注册通道 (必须)' : 'Step 1: Registration Channel'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep('health')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
              currentStep === 'health'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '第 2 步：健康目标配置 (选填/可跳过)' : 'Step 2: Profile Settings (Optional)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginNotice(null);
              setCurrentStep('login');
            }}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
              currentStep === 'login'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '第 3 步：已有账号登录' : 'Step 3: Existing Account Login'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {currentStep === 'register' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Region Selection: 中国大陆 vs 海外/全球 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'zh' ? '请选择您所在的注册区域：' : 'Select Registration Region:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRegion('mainland');
                      setChannel('username');
                    }}
                    className={`flex items-center justify-center space-x-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                      region === 'mainland'
                        ? 'border-emerald-400 bg-emerald-500/10 text-white font-bold shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">🇨🇳</span>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm">{language === 'zh' ? '中国大陆用户' : 'Mainland China'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">用户名 / 手机 / 邮箱 / 微信 / 支付宝</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegion('overseas');
                      setChannel('google');
                    }}
                    className={`flex items-center justify-center space-x-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                      region === 'overseas'
                        ? 'border-emerald-400 bg-emerald-500/10 text-white font-bold shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">🌐</span>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm">{language === 'zh' ? '中国大陆以外用户' : 'Overseas / Global'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">谷歌邮箱 / 手机 / Facebook / WhatsApp / X</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Channels for Mainland China */}
              {region === 'mainland' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {language === 'zh' ? '选择注册与登录方式：' : 'Select Registration Method:'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                    {[
                      { id: 'username', label: '用户名', icon: User },
                      { id: 'phone', label: '手机号', icon: Smartphone },
                      { id: 'email', label: '邮箱', icon: Mail },
                      { id: 'wechat', label: '微信号', icon: MessageCircle },
                      { id: 'alipay', label: '支付宝', icon: CreditCard },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setChannel(item.id as AccountChannel)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                            channel === item.id
                              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 font-bold shadow-sm'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1.5" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Channel Specific Inputs for Mainland */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    {channel === 'username' && (
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">个性用户名 / 昵称</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="如：长寿行者888 或 自律先锋"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">支持汉字、英文字母或数字，用于生成您的专属生命时间轴</p>
                      </div>
                    )}

                    {channel === 'phone' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">中国大陆手机号码 (+86)</label>
                          <div className="flex space-x-2">
                            <span className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-400 flex items-center">+86</span>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="请输入 11 位手机号码"
                              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                            />
                            <button
                              type="button"
                              onClick={handleSendSms}
                              disabled={smsCountdown > 0 || !phoneNumber}
                              className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer hover:bg-emerald-500/30 disabled:opacity-50"
                            >
                              {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">短信验证码</label>
                          <input
                            type="text"
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            placeholder="请输入 4-6 位短信验证码"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400 font-mono-num"
                          />
                        </div>
                      </div>
                    )}

                    {channel === 'email' && (
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">电子邮箱地址 (支持 QQ邮箱、网易、新浪等)</label>
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="例如: yourname@qq.com 或 163.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    )}

                    {channel === 'wechat' && (
                      <div className="flex items-center space-x-3 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white">微信快捷一键授权注册</div>
                          <div className="text-[11px] text-slate-400">点击授权将自动同步微信安全认证并建立生命档案</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWechatId(`wx_${Date.now().toString().slice(-6)}`);
                            setUsername(username || '微信好友');
                            setAuthSuccessNotice('已成功模拟绑定微信一键授权通道！');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                        >
                          一键绑定
                        </button>
                      </div>
                    )}

                    {channel === 'alipay' && (
                      <div className="flex items-center space-x-3 p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white">支付宝快捷授权注册</div>
                          <div className="text-[11px] text-slate-400">通过蚂蚁认证快捷同步健康习惯授权</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAlipayId(`alipay_${Date.now().toString().slice(-6)}`);
                            setUsername(username || '支付宝用户');
                            setAuthSuccessNotice('已成功模拟绑定支付宝快捷授权通道！');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 cursor-pointer"
                        >
                          快捷授权
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Channels for Overseas Users */}
              {region === 'overseas' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Global Registration Method:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                    {[
                      { id: 'google', label: 'Google', icon: Mail },
                      { id: 'phone', label: 'Phone', icon: Smartphone },
                      { id: 'facebook', label: 'Facebook', icon: Globe2 },
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { id: 'twitter', label: 'X / Twitter', icon: Send },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setChannel(item.id as AccountChannel)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                            channel === item.id
                              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 font-bold shadow-sm'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1.5" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Channel Specific Inputs for Overseas */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    {channel === 'google' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">🇬</span>
                            <div>
                              <div className="text-xs font-bold text-white">Google Account Sign-In</div>
                              <div className="text-[11px] text-slate-400">One-tap authentication with Firebase Google Auth</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleGoogleAuth}
                            className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                          >
                            Sign In with Google
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Or enter Google / Gmail address directly</label>
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="e.g. shouqiangzzz@gmail.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>
                    )}

                    {channel === 'phone' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Country / Region Code & Mobile Number</label>
                          <div className="flex space-x-2">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                            >
                              <option value="+1">+1 USA/Canada</option>
                              <option value="+44">+44 UK</option>
                              <option value="+81">+81 Japan</option>
                              <option value="+65">+65 Singapore</option>
                              <option value="+852">+852 Hong Kong</option>
                              <option value="+886">+886 Taiwan</option>
                              <option value="+61">+61 Australia</option>
                              <option value="+49">+49 Germany</option>
                            </select>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Mobile phone number"
                              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(channel === 'facebook' || channel === 'whatsapp' || channel === 'twitter') && (
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          {channel === 'twitter' ? 'Twitter / X Handle' : `${channel.toUpperCase()} Username / Account`}
                        </label>
                        <input
                          type="text"
                          value={socialAccount}
                          onChange={(e) => setSocialAccount(e.target.value)}
                          placeholder={channel === 'twitter' ? '@YourTwitterHandle' : 'Your social account ID or phone'}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notice Feedback */}
              {authSuccessNotice && (
                <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{authSuccessNotice}</span>
                </div>
              )}

              {/* Admin Privileges Toggle (Requirement: 设置一个管理员) */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">
                      {language === 'zh' ? '申请/识别管理员权限 (Admin Authority)' : 'Administrator Authority Access'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === 'zh' 
                        ? '管理员可调整全站系统界面、健康寄语、项目基准指标与用户权限' 
                        : 'Admin can configure system themes, mottos, benchmarks & access control'}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAdminRegister} 
                    onChange={(e) => setIsAdminRegister(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

            </div>
          )}

          {/* Step 2: Optional Health Settings (保留设置，但完全不强制) */}
          {currentStep === 'health' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">
                    {language === 'zh' ? '内容设置完全自愿，可直接保留默认值' : 'Profile Settings are Completely Optional'}
                  </strong>
                  {language === 'zh'
                    ? '以下健康指标与出生信息仅用于测算生命时间轴，系统已填充科学推荐值，您可直接点击下方按钮完成注册，稍后随时可在主页修改。'
                    : 'Values are pre-filled with scientific standards. You can skip or fine-tune anytime later.'}
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'zh' ? '出生日期 (用于起步计算已度过生命周数)' : 'Birth Date'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="年 YYYY"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs text-center font-mono-num"
                  />
                  <input
                    type="number"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value.padStart(2, '0'))}
                    placeholder="月 MM"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs text-center font-mono-num"
                  />
                  <input
                    type="number"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value.padStart(2, '0'))}
                    placeholder="日 DD"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs text-center font-mono-num"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'zh' ? '生理性别 (影响基础代谢与期望寿命模型)' : 'Gender'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'male', label: '男 (Male)' },
                    { id: 'female', label: '女 (Female)' },
                    { id: 'other', label: '保密/多元' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                        gender === g.id
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Lifespan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {language === 'zh' ? '目标希望寿命' : 'Target Lifespan Goal'}
                  </label>
                  <span className="text-sm font-bold font-mono-num text-emerald-400">
                    {targetAge} {language === 'zh' ? '岁' : 'Years'}
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={120}
                  step={1}
                  value={targetAge}
                  onChange={(e) => setTargetAge(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono-num mt-1">
                  <span>60岁</span>
                  <span>85岁 (标杆推荐)</span>
                  <span>100岁</span>
                  <span>120岁</span>
                </div>
              </div>

            </div>
          )}

          {currentStep === 'login' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <LogIn className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{language === 'zh' ? '已有账号登录' : 'Log in to an existing account'}</h3>
                    <p className="text-xs text-slate-400">{language === 'zh' ? '通过注册时绑定的 Google 账号验证身份并恢复云端档案' : 'Verify with the Google account linked to your cloud profile'}</p>
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-slate-300 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  {language === 'zh'
                    ? '当前只有 Google 登录接入了真实身份验证。用户名、手机号、邮箱、微信、支付宝等注册方式目前只保存档案标识，没有设置或验证密码/验证码，因此暂不能安全地用于跨设备登录。'
                    : 'Google is currently the only sign-in method with real identity verification. Other registration options save a profile identifier but do not verify a password or code, so they cannot safely support cross-device login yet.'}
                </div>
              </div>

              {loginNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200" role="status">
                  {loginNotice}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950">
          {currentStep === 'register' ? (
            <button
              type="button"
              onClick={() => setCurrentStep('health')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>{language === 'zh' ? '前往偏好设置' : 'Optional settings'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : currentStep === 'health' ? (
            <button
              type="button"
              onClick={() => setCurrentStep('register')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>{language === 'zh' ? '返回账号注册' : 'Back to account'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep('register')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>{language === 'zh' ? '返回账号注册' : 'Back to registration'}</span>
            </button>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={currentStep === 'login' ? handleExistingAccountLogin : handleFinalSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {currentStep === 'login'
                  ? (isSubmitting
                    ? (language === 'zh' ? '登录中...' : 'Signing in...')
                    : (language === 'zh' ? '使用 Google 账号登录' : 'Continue with Google'))
                  : (isSubmitting
                    ? (language === 'zh' ? '保存注册中...' : 'Saving...')
                    : (language === 'zh' ? '完成注册并存入数据库' : 'Complete Registration'))}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
