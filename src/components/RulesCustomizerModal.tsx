import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  CheckCircle2,
  Info,
  Crown,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Activity,
  Trophy
} from 'lucide-react';
import { LongevityRuleConfig, UserProfile, PrivacyDisplaySettings } from '../types';
import { INITIAL_RULES, DEFAULT_PRIVACY_SETTINGS } from '../services/storage';
import { useLanguage } from '../services/i18n';

interface RulesCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: LongevityRuleConfig[];
  profile: UserProfile;
  onSaveRules: (rules: LongevityRuleConfig[]) => void;
  onSaveProfile?: (profile: UserProfile) => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  initialTab?: 'privacy' | 'rules';
  isVisitorPreviewMode?: boolean;
  onToggleVisitorPreview?: () => void;
}

export const RulesCustomizerModal: React.FC<RulesCustomizerModalProps> = ({
  isOpen,
  onClose,
  rules,
  profile,
  onSaveRules,
  onSaveProfile,
  isAdmin = false,
  onOpenAdmin,
  initialTab = 'privacy',
  isVisitorPreviewMode = false,
  onToggleVisitorPreview,
}) => {
  const { language } = useLanguage();
  const [activeSettingsTab, setActiveSettingsTab] = useState<'privacy' | 'rules'>(initialTab);
  const [editableRules, setEditableRules] = useState<LongevityRuleConfig[]>([...rules]);
  
  // Local privacy settings
  const [privacy, setPrivacy] = useState<PrivacyDisplaySettings>(
    profile.privacySettings || DEFAULT_PRIVACY_SETTINGS
  );
  
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveSettingsTab(initialTab);
      setPrivacy(profile.privacySettings || DEFAULT_PRIVACY_SETTINGS);
      setEditableRules([...rules]);
    }
  }, [isOpen, initialTab, profile.privacySettings, rules]);

  if (!isOpen) return null;

  const handleRuleChange = (id: string, field: keyof LongevityRuleConfig, value: any) => {
    setEditableRules(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  const handlePrivacyToggle = (key: keyof PrivacyDisplaySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAuthorizeAll = () => {
    setPrivacy({
      showChronologicalAge: true,
      showBiologicalAge: true,
      showCountdownTime: true,
      showLifeMedals: true,
    });
  };

  const handleMakeAllPrivate = () => {
    setPrivacy({
      showChronologicalAge: false,
      showBiologicalAge: false,
      showCountdownTime: false,
      showLifeMedals: true,
    });
  };

  const handleReset = () => {
    setEditableRules([...INITIAL_RULES]);
  };

  const handleSave = () => {
    // Save rules
    onSaveRules(editableRules);
    
    // Save privacy settings to profile
    if (onSaveProfile) {
      const updatedProfile: UserProfile = {
        ...profile,
        privacySettings: privacy,
        authorizeBioAgeToOthers: privacy.showBiologicalAge, // Keep bio age auth in sync
      };
      onSaveProfile(updatedProfile);
    }
    
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-emerald-400 border border-slate-700/80">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>{language === 'zh' ? '系统与展示设置' : 'System & Display Settings'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'zh' 
                  ? '主页隐私展示范围授权（实际年龄/生理年龄/倒计时时间）与生命增减自定义规则' 
                  : 'Configure display scopes, homepage privacy authorization, and custom longevity rules.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSettingsTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeSettingsTab === 'privacy'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'zh' ? '主页展示范围与隐私授权' : 'Display Scope & Privacy'}</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeSettingsTab === 'rules'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'zh' ? '生命增减自定义规则' : 'Longevity Rules'}</span>
            </button>
          </div>

          {/* Quick Simulation Mode Toggle */}
          {onToggleVisitorPreview && (
            <button
              type="button"
              onClick={onToggleVisitorPreview}
              className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isVisitorPreviewMode
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title={language === 'zh' ? "模拟其他用户访问您主页时的视角" : "Toggle visitor simulation view"}
            >
              {isVisitorPreviewMode ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isVisitorPreviewMode ? (language === 'zh' ? '他人视角预览中' : 'Visitor Mode ON') : (language === 'zh' ? '模拟他人访问视角' : 'Preview as Visitor')}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* TAB 1: DISPLAY SCOPE & PRIVACY AUTHORIZATION */}
          {activeSettingsTab === 'privacy' && (
            <div className="space-y-4">
              
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    {language === 'zh' ? '主页个人核心数据隐私保护准则' : 'Personal Data Privacy Standards'}
                  </span>
                  {language === 'zh'
                    ? '根据生物数据与个人隐私规范：实际年龄、推算生理年龄与生命倒计时天数默认处于私密加密状态，必须由您本人在此处明确授权，其他用户访问您的主页时才能看到；若未授权，其他用户仅能看到安全保密遮罩。'
                    : 'Your chronological age, biological age, and live countdown are private by default. Only items you explicitly authorize here will be visible to other visitors.'}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'zh' ? '各项核心信息对外展示范围授权' : 'Display Scope Authorization'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAuthorizeAll}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    {language === 'zh' ? '一键全部授权展示' : 'Authorize All'}
                  </button>
                  <button
                    type="button"
                    onClick={handleMakeAllPrivate}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    {language === 'zh' ? '一键全部设为私密' : 'Make All Private'}
                  </button>
                </div>
              </div>

              {/* Item 1: Chronological Age (实际年龄) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${privacy.showChronologicalAge ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">
                        {language === 'zh' ? '实际年龄展示授权' : 'Chronological Age Display'}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        privacy.showChronologicalAge
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {privacy.showChronologicalAge ? (language === 'zh' ? '已授权他人可见' : 'Authorized') : (language === 'zh' ? '仅本人可见 (用户未授权)' : 'Private to Me')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {language === 'zh'
                        ? '开启后，其他用户访问您的主页时可查验您的实际周岁年龄；若关闭，其他用户仅显示「🔒 需本人授权」。'
                        : 'Allow other users to view your chronological age when visiting your profile.'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={privacy.showChronologicalAge}
                    onChange={() => handlePrivacyToggle('showChronologicalAge')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Item 2: Biological Age (生理年龄) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${privacy.showBiologicalAge ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">
                        {language === 'zh' ? '生理年龄与逆龄年数展示授权' : 'Biological Age Display'}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        privacy.showBiologicalAge
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {privacy.showBiologicalAge ? (language === 'zh' ? '已授权他人可见' : 'Authorized') : (language === 'zh' ? '仅本人可见 (用户未授权)' : 'Private to Me')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {language === 'zh'
                        ? '开启后，其他用户可查验您的体检及指标推算生理年龄与比实际年轻的岁数；若关闭，对外保密。'
                        : 'Allow other users to view your calculated biological age and longevity offset.'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={privacy.showBiologicalAge}
                    onChange={() => handlePrivacyToggle('showBiologicalAge')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Item 3: Countdown Time & Metrics (倒计时时间与剩余天数) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${privacy.showCountdownTime ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">
                        {language === 'zh' ? '生命倒计时时间与剩余天数展示授权' : 'Countdown Clock Display'}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        privacy.showCountdownTime
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {privacy.showCountdownTime ? (language === 'zh' ? '已授权他人可见' : 'Authorized') : (language === 'zh' ? '仅本人可见 (用户未授权)' : 'Private to Me')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {language === 'zh'
                        ? '开启后，其他用户查看您的主页时可看到您的生命倒计时剩余天数、月数、周数与实时秒数；若关闭，倒计时时间将对他人显示保密锁。'
                        : 'Allow other visitors to view your live countdown days, months, and seconds.'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={privacy.showCountdownTime}
                    onChange={() => handlePrivacyToggle('showCountdownTime')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Item 4: Life Medals (生命勋章) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${privacy.showLifeMedals ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">
                        {language === 'zh' ? '已点亮生命勋章对外展示授权' : 'Life Medals Display'}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        privacy.showLifeMedals
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {privacy.showLifeMedals ? (language === 'zh' ? '已授权他人可见' : 'Authorized') : (language === 'zh' ? '仅本人可见' : 'Private')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {language === 'zh'
                        ? '允许他人查验您点亮的百岁行者、晨曦节律、生机饮食等长寿勋章。'
                        : 'Allow other users to view your earned longevity achievement badges.'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={privacy.showLifeMedals}
                    onChange={() => handlePrivacyToggle('showLifeMedals')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

            </div>
          )}

          {/* TAB 2: LONGEVITY RULES */}
          {activeSettingsTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400">
                  {language === 'zh' ? '定制20天习惯挑战加减算法的寿命时间奖励与惩罚' : 'Custom longevity reward and penalty parameters'}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'zh' ? '恢复默认' : 'Reset'}</span>
                </button>
              </div>

              {editableRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rule.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">
                        {language === 'zh' ? '奖励增加天数' : 'Reward Days'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={rule.rewardSeconds / 86400}
                        onChange={(e) => handleRuleChange(rule.id, 'rewardSeconds', Math.max(0, Number(e.target.value)) * 86400)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-rose-400 block mb-1 font-semibold">
                        {language === 'zh' ? '扣减减少天数' : 'Penalty Days'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={rule.penaltySeconds / 86400}
                        onChange={(e) => handleRuleChange(rule.id, 'penaltySeconds', Math.max(0, Number(e.target.value)) * 86400)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {successToast && (
              <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'zh' ? '设置已成功保存并同步！' : 'Settings saved successfully!'}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'zh' ? '保存设置与展示范围' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
