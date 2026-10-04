import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Palette, 
  Quote, 
  Sliders, 
  Users, 
  Save, 
  CheckCircle2, 
  Crown, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Smartphone,
  Globe2,
  Lock,
  ArrowUpRight,
  Mail,
  ShoppingBag
} from 'lucide-react';
import { 
  SystemConfig, 
  UserProfile, 
  UserRole, 
  ThemeConfig, 
  BackgroundStyle, 
  BackgroundPattern,
  CommunityPost,
  MerchantCertification
} from '../types';
import { saveSystemConfig, fetchAllUsers, updateUserRole, BOOTSTRAP_ADMIN_EMAIL } from '../services/firebase';
import { useLanguage } from '../services/i18n';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemConfig: SystemConfig;
  onUpdateSystemConfig: (newConfig: SystemConfig) => void;
  currentProfile: UserProfile;
  communityPosts?: CommunityPost[];
  onAdminApprovePost?: (postId: string) => void;
  onAdminRejectPost?: (postId: string, reason: string) => void;
  onAdminResolveAppeal?: (postId: string, approved: boolean, notes: string) => void;
  merchantCert?: MerchantCertification;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  systemConfig,
  onUpdateSystemConfig,
  currentProfile,
  communityPosts = [],
  onAdminApprovePost,
  onAdminRejectPost,
  onAdminResolveAppeal,
  merchantCert,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'interface' | 'motto' | 'metrics' | 'users' | 'moderation'>('interface');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin Notification Channel settings
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [adminEmailInput, setAdminEmailInput] = useState('shouqiangzzz@gmail.com');
  const [notifyBySms, setNotifyBySms] = useState(true);
  const [adminPhoneInput, setAdminPhoneInput] = useState('13800008869');

  // Form states initialized from systemConfig
  const [systemMotto, setSystemMotto] = useState(systemConfig.systemMotto);
  const [bannerNotice, setBannerNotice] = useState(systemConfig.bannerNotice);
  const [appSlogan, setAppSlogan] = useState(systemConfig.appSlogan);
  const [baselineLifespan, setBaselineLifespan] = useState(systemConfig.baselineLifespan);
  const [habitRewardSeconds, setHabitRewardSeconds] = useState(systemConfig.habitRewardSeconds);
  const [habitPenaltySeconds, setHabitPenaltySeconds] = useState(systemConfig.habitPenaltySeconds);
  const [sedentaryAlertMinutes, setSedentaryAlertMinutes] = useState(systemConfig.sedentaryAlertMinutes);
  const [maxSedentaryHours, setMaxSedentaryHours] = useState(systemConfig.maxSedentaryHours);

  // Interface styling
  const [accentColor, setAccentColor] = useState(systemConfig.globalTheme?.customAccentColor || '#10b981');
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>(systemConfig.globalTheme?.style || 'obsidian');
  const [bgPattern, setBgPattern] = useState<BackgroundPattern>(systemConfig.globalTheme?.backgroundPattern || 'mesh');

  // Users list
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSystemMotto(systemConfig.systemMotto);
      setBannerNotice(systemConfig.bannerNotice);
      setAppSlogan(systemConfig.appSlogan);
      setBaselineLifespan(systemConfig.baselineLifespan);
      setHabitRewardSeconds(systemConfig.habitRewardSeconds);
      setHabitPenaltySeconds(systemConfig.habitPenaltySeconds);
      setSedentaryAlertMinutes(systemConfig.sedentaryAlertMinutes);
      setMaxSedentaryHours(systemConfig.maxSedentaryHours);
      if (systemConfig.globalTheme) {
        setAccentColor(systemConfig.globalTheme.customAccentColor);
        setBgStyle(systemConfig.globalTheme.style);
        setBgPattern(systemConfig.globalTheme.backgroundPattern);
      }
      loadUsers();
    }
  }, [isOpen, systemConfig]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchAllUsers();
      setUsersList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedTheme: ThemeConfig = {
        style: bgStyle,
        customBgColor: '#030712',
        customSecondaryColor: '#0b1329',
        customAccentColor: accentColor,
        backgroundPattern: bgPattern,
        blurOpacity: 0.8,
      };

      const newConfig: SystemConfig = {
        ...systemConfig,
        systemMotto,
        bannerNotice,
        appSlogan,
        baselineLifespan: Number(baselineLifespan),
        habitRewardSeconds: Number(habitRewardSeconds),
        habitPenaltySeconds: Number(habitPenaltySeconds),
        sedentaryAlertMinutes: Number(sedentaryAlertMinutes),
        maxSedentaryHours: Number(maxSedentaryHours),
        globalTheme: updatedTheme,
        updatedAt: new Date().toISOString(),
      };

      await saveSystemConfig(newConfig);
      onUpdateSystemConfig(newConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save system config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = async (targetUser: UserProfile) => {
    const nextRole: UserRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(targetUser.id, nextRole);
      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: nextRole } : u));
    } catch (err) {
      console.error('Failed to change user role:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {language === 'zh' ? '系统管理员控制台' : 'System Admin Console'}
                </h2>
                <span className="text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {language === 'zh' ? '全域特权' : 'ROOT PRIVILEGE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'zh' ? `当前管理账号: ${currentProfile.name} (${currentProfile.accountIdentifier || '本地超管'})` : `Administrator: ${currentProfile.name}`}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/50 px-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('interface')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'interface'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{language === 'zh' ? '系统界面与主题' : 'System Theme & UI'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motto')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'motto'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Quote className="w-4 h-4" />
            <span>{language === 'zh' ? '系统寄语与标语' : 'Mottos & Slogans'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'metrics'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{language === 'zh' ? '项目指标与参数' : 'Project Benchmarks'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'zh' ? '注册用户与权限' : 'Users & Access Control'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'moderation'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'zh' ? '社区风控与申诉审核' : 'Community Moderation & Appeals'}</span>
            {(communityPosts.filter(p => p.moderationStatus === 'pending_admin' || p.appeal?.status === 'pending').length > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {communityPosts.filter(p => p.moderationStatus === 'pending_admin' || p.appeal?.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tab 1: System Theme & UI */}
          {activeTab === 'interface' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">
                    {language === 'zh' ? '管理员专属：系统全局界面控制' : 'Administrator Global UI Authority'}
                  </strong>
                  {language === 'zh'
                    ? '此处调整将改变全站默认视觉风格，普通用户仅能查看不可修改。'
                    : 'Changes configured here apply to the global baseline visual presentation for all users.'}
                </div>
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'zh' ? '全局核心高亮色 (Accent Color)' : 'Global Accent Color'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {[
                    { name: '生命翡翠', color: '#10b981' },
                    { name: '极光青蓝', color: '#06b6d4' },
                    { name: '赛博蔚蓝', color: '#3b82f6' },
                    { name: '星空紫', color: '#8b5cf6' },
                    { name: '活力赤橙', color: '#f97316' },
                    { name: '荣耀纯金', color: '#eab308' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setAccentColor(c.color)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        accentColor === c.color 
                          ? 'border-white bg-slate-800 shadow-md ring-2 ring-amber-400/50' 
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full mb-1.5 shadow" style={{ backgroundColor: c.color }} />
                      <span className="text-[11px] text-slate-300">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'zh' ? '系统背景底色风格' : 'System Background Theme'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'obsidian', label: '黑曜石深空 (Obsidian Void)', desc: '深沉内敛' },
                    { id: 'cyber', label: '未来赛博 (Cyber Neon)', desc: '极客科技' },
                    { id: 'ocean', label: '深海深邃 (Deep Ocean)', desc: '沉静辽阔' },
                    { id: 'aurora', label: '极夜极光 (Aurora Borealis)', desc: '流光跃动' },
                    { id: 'sunset', label: '暮光晨曦 (Sunset Dawn)', desc: '温润余晖' },
                    { id: 'space', label: '星云漫游 (Cosmic Space)', desc: '浩瀚未知' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setBgStyle(style.id as BackgroundStyle)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        bgStyle === style.id
                          ? 'border-amber-400 bg-slate-900 ring-1 ring-amber-400/30'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{style.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Particles/Pattern */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'zh' ? '动态背景微粒纹理' : 'Dynamic Texture Pattern'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'mesh', label: '光晕渐变网' },
                    { id: 'stars', label: '璀璨星辰' },
                    { id: 'grid', label: '科技矩阵网格' },
                    { id: 'dots', label: '微光量子波点' },
                    { id: 'none', label: '纯净无纹理' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setBgPattern(p.id as BackgroundPattern)}
                      className={`py-2 px-3 rounded-lg border text-center text-xs transition-all cursor-pointer ${
                        bgPattern === p.id 
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold' 
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Banner Notice */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'zh' ? '顶部系统全局横幅广播' : 'System Global Banner Notice'}
                </label>
                <input
                  type="text"
                  value={bannerNotice}
                  onChange={(e) => setBannerNotice(e.target.value)}
                  placeholder="如：系统全域指标更新完成，每日坚持好习惯延年益寿！"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Mottos & Quotes */}
          {activeTab === 'motto' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed flex items-start space-x-3">
                <Quote className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">
                    {language === 'zh' ? '生命寄语与精神标语管理' : 'System Motto & Inspiration Management'}
                  </strong>
                  {language === 'zh'
                    ? '管理员可以自定义主页倒计时底部的每日寄语，向全站用户传递自律、健康与珍惜光阴的理念。'
                    : 'Customize daily mottos and philosophical quotes broadcasted across the user experience.'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'zh' ? '每日长寿与生命励志寄语 (Daily Life Motto)' : 'Daily Longevity Motto'}
                </label>
                <textarea
                  rows={4}
                  value={systemMotto}
                  onChange={(e) => setSystemMotto(e.target.value)}
                  placeholder="自律以致远，每一分坚持皆是对生命的最高敬意..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'zh' ? '该寄语将在首页倒计时与习惯打卡模块中重点展示。' : 'Displayed in the main clock and habit dashboard.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'zh' ? '产品副标语 (App Slogan)' : 'Product Slogan'}
                </label>
                <input
                  type="text"
                  value={appSlogan}
                  onChange={(e) => setAppSlogan(e.target.value)}
                  placeholder="精准生命倒计时 · 科学健康加减算法"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Project Metrics & Benchmarks */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed flex items-start space-x-3">
                <Sliders className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">
                    {language === 'zh' ? '核心项目指标与标准参数设置' : 'Project Metric Calibration & Standards'}
                  </strong>
                  {language === 'zh'
                    ? '调整生命计算模型的全域标准数值，普通用户只能调整自身身体指标，无法更改这些全域标杆。'
                    : 'Configure mathematical algorithm weights and global longevity benchmarks.'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Baseline Lifespan */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {language === 'zh' ? '系统基准标准寿命预期 (岁)' : 'Default Baseline Target Lifespan'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {language === 'zh' ? '新用户注册时默认的标杆寿命模型' : 'Initial target for newly registered users'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={60}
                      max={120}
                      value={baselineLifespan}
                      onChange={(e) => setBaselineLifespan(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-center font-mono-num font-bold text-sm"
                    />
                    <span className="text-xs text-slate-400">{language === 'zh' ? '岁 (Years)' : 'Years'}</span>
                  </div>
                </div>

                {/* 20-Day Streak Reward */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {language === 'zh' ? '20天习惯挑战延寿奖励 (秒数)' : '20-Day Streak Reward (Seconds)'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {language === 'zh' ? '86,400 秒 = 整整 1 天寿命' : '86,400s = 1 Full Day of Life'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step={3600}
                      value={habitRewardSeconds}
                      onChange={(e) => setHabitRewardSeconds(Number(e.target.value))}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 text-center font-mono-num font-bold text-sm"
                    />
                    <span className="text-xs text-slate-400">
                      ≈ {(habitRewardSeconds / 86400).toFixed(1)} {language === 'zh' ? '天' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Sedentary Alarm Threshold */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {language === 'zh' ? '久坐监测单次预警阈值 (分钟)' : 'Sedentary Single Session Alert (Mins)'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {language === 'zh' ? '连续久坐超过该分钟触发站立休息告警' : 'Continuous sitting alarm trigger'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={20}
                      max={120}
                      value={sedentaryAlertMinutes}
                      onChange={(e) => setSedentaryAlertMinutes(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 text-center font-mono-num font-bold text-sm"
                    />
                    <span className="text-xs text-slate-400">{language === 'zh' ? '分钟 (Mins)' : 'Minutes'}</span>
                  </div>
                </div>

                {/* Daily Sedentary Redline */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {language === 'zh' ? '每日累计久坐健康红线 (小时)' : 'Daily Sedentary Excess Limit (Hours)'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {language === 'zh' ? '每日总久坐超时则按秒扣除寿命' : 'Cumulative sitting daily limit'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={maxSedentaryHours}
                      onChange={(e) => setMaxSedentaryHours(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-300 text-center font-mono-num font-bold text-sm"
                    />
                    <span className="text-xs text-slate-400">{language === 'zh' ? '小时 (Hours)' : 'Hours'}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 4: Users & RBAC */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'zh' ? '全域注册用户与权限分配' : 'Registered Users & Role-Based Access Control'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'zh' ? '实时拉取 Firestore 数据库中的注册用户记录，普通用户仅拥有自我健康设置权限' : 'Users from database. Standard users only configure their personal records.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                  <span>{language === 'zh' ? '刷新列表' : 'Refresh'}</span>
                </button>
              </div>

              {loadingUsers ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>{language === 'zh' ? '正在读取数据库用户档案...' : 'Loading users from database...'}</span>
                </div>
              ) : usersList.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  {language === 'zh' ? '暂未检索到其他注册用户记录。' : 'No users retrieved yet.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/70">
                  {usersList.map((user) => {
                    const isSelf = user.id === currentProfile.id;
                    const isAdmin = user.role === 'admin' || user.accountIdentifier === BOOTSTRAP_ADMIN_EMAIL;

                    return (
                      <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-base shrink-0 overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>👤</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-200">{user.name}</span>
                              {isAdmin ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                                  <Crown className="w-3 h-3" />
                                  <span>{language === 'zh' ? '系统管理员' : 'Admin'}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  {language === 'zh' ? '普通用户' : 'User'}
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] text-emerald-400 font-mono-num">
                                  ({language === 'zh' ? '当前登录' : 'You'})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>
                                {user.region === 'mainland' ? '🇨🇳 中国大陆' : '🌐 海外/全球'}
                              </span>
                              <span>·</span>
                              <span>
                                渠道: <strong className="text-slate-300 capitalize">{user.accountType || '用户名'}</strong>
                              </span>
                              {user.accountIdentifier && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono-num text-slate-400">{user.accountIdentifier}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(user)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isAdmin
                                ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-rose-500/50 hover:text-rose-300'
                                : 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 hover:brightness-110 font-bold'
                            }`}
                          >
                            {isAdmin 
                              ? (language === 'zh' ? '降为普通用户' : 'Demote to User')
                              : (language === 'zh' ? '设为管理员' : 'Promote to Admin')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Community Moderation, Ambiguous Queue & Appeals */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              
              {/* Channel Alert Settings (管理员设定短信/邮箱通知，时长不超过24小时) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {language === 'zh' ? '管理员审核预警通道设置 (24小时时限机制)' : 'Admin Moderation Alert Channels (24h SLA)'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'zh' 
                          ? '当 AI 遇到模糊不清、无法判定是否触及敏感内容时，暂时不上架并自动通过短信/邮件加急提醒管理员。' 
                          : 'Ambiguous posts are withheld from public feed and sent to admin with 24-hour review SLA.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono-num font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⏱️ 时长 ≤ 24 小时
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'zh' ? '邮箱审核提醒' : 'Email Alerts'}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifyByEmail} 
                        onChange={(e) => setNotifyByEmail(e.target.checked)} 
                        className="accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <input
                      type="email"
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder="shouqiangzzz@gmail.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                        <Smartphone className="w-4 h-4 text-cyan-400" />
                        <span>{language === 'zh' ? '短信加急提醒' : 'SMS Text Alerts'}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifyBySms} 
                        onChange={(e) => setNotifyBySms(e.target.checked)} 
                        className="accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <input
                      type="tel"
                      value={adminPhoneInput}
                      onChange={(e) => setAdminPhoneInput(e.target.value)}
                      placeholder="13800008869"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none font-mono-num"
                    />
                  </div>
                </div>
              </div>

              {/* Pending Ambiguous Queue (AI无法判断，转人工复核) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <span>{language === 'zh' ? 'AI 存疑待人工复核队列 (未上架系统)' : 'Pending AI-Ambiguous Queue (Withheld)'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      {communityPosts.filter(p => p.moderationStatus === 'pending_admin').length} 条
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {language === 'zh' ? '管理员审核后将根据作者设定的公开范围向系统分发' : 'Approvals will distribute per visibility'}
                  </span>
                </div>

                {communityPosts.filter(p => p.moderationStatus === 'pending_admin').length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                    ✓ 当前暂无待审核的存疑动态，所有合规内容均已由 AI 自动完成上架分发。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {communityPosts.filter(p => p.moderationStatus === 'pending_admin').map((post) => (
                      <div key={post.id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <div className="text-xs font-bold text-white">{post.authorName}</div>
                              <div className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            ⚠️ AI 存疑转人工
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          {post.content}
                        </p>

                        {post.moderationReason && (
                          <div className="text-[11px] text-amber-300/90 flex items-center space-x-1">
                            <span>🔍 AI 存疑标注：</span>
                            <span>{post.moderationReason}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => onAdminRejectPost?.(post.id, '经人工审核：存在非科学调理误导风险，予以驳回')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                          >
                            驳回上架
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdminApprovePost?.(post.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                          >
                            核准并直接上架系统
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Appeals Queue (用户申诉通道，包括被拒或被强制下架后的申诉) */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <span>{language === 'zh' ? '用户申诉工单复核队列 (含被拒或被下架内容)' : 'User Appeals Queue (Rejections & Take-downs)'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                      {communityPosts.filter(p => p.appeal && p.appeal.status === 'pending').length} 条
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {language === 'zh' ? '结论将通过短信/邮箱自动回复用户' : 'Feedback dispatched via SMS/Email'}
                  </span>
                </div>

                {communityPosts.filter(p => p.appeal && p.appeal.status === 'pending').length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                    ✓ 当前暂无待处理的用户申诉工单。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {communityPosts.filter(p => p.appeal && p.appeal.status === 'pending').map((post) => (
                      <div key={post.id} className="p-4 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{post.authorName}</span>
                            <span className="text-[10px] text-slate-400">({post.appeal?.contactMethod === 'email' ? '邮箱' : '短信'}: {post.appeal?.contactValue})</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            申诉待决
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                          <div className="text-slate-400 text-[11px]">申诉人阐述理由：</div>
                          <div className="text-emerald-300 font-medium">"{post.appeal?.appealReason}"</div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => onAdminResolveAppeal?.(post.id, false, '经审核原判定准确，维持驳回结论')}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                          >
                            维持原驳回结论
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdminResolveAppeal?.(post.id, true, '申诉理由充分，已恢复正常上架')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                          >
                            申诉成立 · 恢复上架分发
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Merchant Certification & Deposit Registry */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>{language === 'zh' ? '创作者挂车带货 · 商家实名资质与保证金监管' : 'Merchant Compliance & Deposit Escrow'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">普通商品保证金基准</span>
                    <span className="text-white font-bold font-mono">≥ ¥500 RMB</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">保健食品类保证金基准</span>
                    <span className="text-amber-400 font-bold font-mono">≥ ¥2,000 RMB</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">月营收&gt;100万元强制资质</span>
                    <span className="text-cyan-400 font-bold">必须注册营销执照</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer with Save Button */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2 text-xs">
            {saveSuccess ? (
              <span className="flex items-center text-emerald-400 space-x-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'zh' ? '系统配置已成功保存并同步！' : 'System configuration saved successfully!'}</span>
              </span>
            ) : (
              <span className="text-slate-500">
                {language === 'zh' ? '修改将持久化存入云端数据库' : 'Changes will persist into Cloud Firestore'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存系统配置' : 'Save Config')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
