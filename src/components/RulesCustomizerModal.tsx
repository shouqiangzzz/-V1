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
  Trophy,
  Plus,
  Trash2,
  CigaretteOff,
  Headphones,
  Sun,
  Flame,
  Moon,
  Droplets,
  Utensils,
  Armchair,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { LongevityRuleConfig, UserProfile, PrivacyDisplaySettings, HabitTrackerItem } from '../types';
import { INITIAL_RULES, INITIAL_HABITS, DEFAULT_PRIVACY_SETTINGS } from '../services/storage';
import { useLanguage } from '../services/i18n';

interface RulesCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: LongevityRuleConfig[];
  profile: UserProfile;
  habits?: HabitTrackerItem[];
  onSaveRules: (rules: LongevityRuleConfig[]) => void;
  onSaveHabits?: (habits: HabitTrackerItem[]) => void;
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
  habits = [],
  onSaveRules,
  onSaveHabits,
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
  const [editableHabits, setEditableHabits] = useState<HabitTrackerItem[]>([...habits]);
  
  // Local privacy settings
  const [privacy, setPrivacy] = useState<PrivacyDisplaySettings>(
    profile.privacySettings || DEFAULT_PRIVACY_SETTINGS
  );
  
  // DIY Habit Creation Panel State
  const [isDiyFormOpen, setIsDiyFormOpen] = useState(false);
  const [diyTitle, setDiyTitle] = useState('');
  const [diyDesc, setDiyDesc] = useState('');
  const [diyRewardDays, setDiyRewardDays] = useState(1);
  const [diyPenaltyDays, setDiyPenaltyDays] = useState(1);
  const [diyGoalDays, setDiyGoalDays] = useState(20);
  const [diyIcon, setDiyIcon] = useState('CigaretteOff');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveSettingsTab(initialTab);
      setPrivacy(profile.privacySettings || DEFAULT_PRIVACY_SETTINGS);
      setEditableRules([...rules]);
      setEditableHabits([...habits]);
      setIsDiyFormOpen(false);
      setDeleteConfirmId(null);
    }
  }, [isOpen, initialTab, profile.privacySettings, rules, habits]);

  if (!isOpen) return null;

  // Preset DIY Inspirations
  const DIY_PRESETS = [
    {
      title: '每日彻底戒烟',
      desc: '零抽烟、远离二手烟，加速肺泡纤毛净化与血管内皮修复',
      reward: 2,
      penalty: 2,
      icon: 'CigaretteOff',
      days: 20
    },
    {
      title: '坚持听英语/外语30分钟',
      desc: '每日专注外语精听或口语表达，刺激神经突触可塑性与认知储备',
      reward: 1,
      penalty: 0.5,
      icon: 'Headphones',
      days: 20
    },
    {
      title: '晨光户外漫步 (20min)',
      desc: '晨起接受自然光照，重置视交叉上核生物节律，促进日间腺苷累积',
      reward: 0.5,
      penalty: 0.25,
      icon: 'Sun',
      days: 20
    },
    {
      title: '颈肩麦肯基拉伸与护脊',
      desc: '伏案工作期间做颈部后缩推纳与比目鱼肌微泵，减缓脊椎深层痉挛',
      reward: 0.5,
      penalty: 0.5,
      icon: 'Sparkles',
      days: 20
    },
    {
      title: '睡前纸质书深度阅读',
      desc: '睡前30分钟彻底远离手机蓝光，通过纸质阅读引导脑波平稳入眠',
      reward: 0.5,
      penalty: 0.25,
      icon: 'BookOpen',
      days: 20
    },
    {
      title: '每日饮淡绿茶抗氧化',
      desc: '摄入儿茶素EGCG与茶多酚，清除自由基并激活自噬长寿通路',
      reward: 0.5,
      penalty: 0.25,
      icon: 'Droplets',
      days: 20
    }
  ];

  const handleApplyPreset = (preset: typeof DIY_PRESETS[0]) => {
    setDiyTitle(preset.title);
    setDiyDesc(preset.desc);
    setDiyRewardDays(preset.reward);
    setDiyPenaltyDays(preset.penalty);
    setDiyIcon(preset.icon);
    setDiyGoalDays(preset.days);
  };

  const handleCreateDiyHabit = () => {
    if (!diyTitle.trim()) return;

    const habitId = `habit_custom_${Date.now()}`;
    const cleanTitle = diyTitle.trim();
    const cleanDesc = diyDesc.trim() || '自律坚持健康微习惯，持续赋能生命健康';
    const rewardSec = Math.round(Math.max(0.01, diyRewardDays) * 86400);
    const penaltySec = Math.round(Math.max(0.01, diyPenaltyDays) * 86400);
    const goalD = Math.max(1, diyGoalDays || 20);

    const newHabit: HabitTrackerItem = {
      id: habitId,
      category: 'custom',
      title: cleanTitle,
      iconName: diyIcon,
      color: 'emerald',
      currentPositiveStreak: 0,
      positiveGoalDays: goalD,
      positiveRewardSeconds: rewardSec,
      currentNegativeStreak: 0,
      negativeThresholdDays: goalD,
      negativePenaltySeconds: penaltySec,
      description: cleanDesc,
      positiveCondition: `持续坚持${cleanTitle}${goalD}天 → 寿命 +${diyRewardDays}天`,
      negativeCondition: `中断或违规持续${goalD}天 → 寿命 -${diyPenaltyDays}天`,
      todayStatus: 'none',
      recentDates: {},
      isCustom: true,
    };

    const newRule: LongevityRuleConfig = {
      id: `rule_${habitId}`,
      category: 'custom',
      name: cleanTitle,
      description: cleanDesc,
      conditionPositive: `符合${cleanTitle}标准，持续${goalD}天`,
      conditionNegative: `违背或未达标，持续${goalD}天`,
      rewardSeconds: rewardSec,
      positiveDaysNeeded: goalD,
      penaltySeconds: penaltySec,
      negativeDaysNeeded: goalD,
      ageAdjustmentFactor: '个人DIY定制好习惯，坚持20天享受细胞级正向复利。',
      isCustom: true,
    };

    setEditableHabits(prev => [newHabit, ...prev]);
    setEditableRules(prev => [newRule, ...prev]);

    // Reset inputs
    setDiyTitle('');
    setDiyDesc('');
    setDiyRewardDays(1);
    setDiyPenaltyDays(1);
    setIsDiyFormOpen(false);
  };

  const handleDeleteHabitAndRule = (targetId: string) => {
    // Determine the base id
    const baseId = targetId.startsWith('rule_') ? targetId.replace('rule_', '') : targetId;
    setEditableHabits(prev => prev.filter(h => h.id !== baseId && h.id !== targetId));
    setEditableRules(prev => prev.filter(r => r.id !== targetId && r.id !== `rule_${baseId}` && r.id !== baseId));
    setDeleteConfirmId(null);
  };

  const handleRuleChange = (id: string, field: keyof LongevityRuleConfig, value: any) => {
    setEditableRules(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    }));

    // Keep habits in sync with edited reward/penalty
    const baseId = id.startsWith('rule_') ? id.replace('rule_', '') : id;
    if (field === 'rewardSeconds') {
      setEditableHabits(prev => prev.map(h => (h.id === baseId || `rule_${h.id}` === id) ? { ...h, positiveRewardSeconds: value } : h));
    }
    if (field === 'penaltySeconds') {
      setEditableHabits(prev => prev.map(h => (h.id === baseId || `rule_${h.id}` === id) ? { ...h, negativePenaltySeconds: value } : h));
    }
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
    setEditableHabits([...INITIAL_HABITS]);
    setDeleteConfirmId(null);
  };

  const handleSave = () => {
    onSaveRules(editableRules);
    if (onSaveHabits) {
      onSaveHabits(editableHabits);
    }
    
    if (onSaveProfile) {
      const updatedProfile: UserProfile = {
        ...profile,
        privacySettings: privacy,
        authorizeBioAgeToOthers: privacy.showBiologicalAge,
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
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    {language === 'zh' ? '主页个人核心数据隐私保护准则' : 'Personal Data Privacy Standards'}
                  </span>
                  {language === 'zh'
                    ? '实际年龄、推算生理年龄与生命倒计时天数默认处于私密状态。您在此明确授权后，其他用户访问主页时才能看到；未授权则展示安全保密遮罩。'
                    : 'Your chronological age, biological age, and live countdown are private by default. Only items you explicitly authorize here will be visible to other visitors.'}
                </div>
              </div>

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

              {/* Toggles */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-sm font-semibold text-white block">实际日历年龄</span>
                      <span className="text-xs text-slate-400">公开后访客可查看依据出生日期推算的日历岁数</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showChronologicalAge}
                    onChange={() => handlePrivacyToggle('showChronologicalAge')}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-sm font-semibold text-white block">推算生理年龄与逆龄倍数</span>
                      <span className="text-xs text-slate-400">公开后访客可查看您的表观遗传学年轻化岁数</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showBiologicalAge}
                    onChange={() => handlePrivacyToggle('showBiologicalAge')}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-sm font-semibold text-white block">生命主时钟倒计时天数</span>
                      <span className="text-xs text-slate-400">公开后访客可看到您宏大的生命剩余倒计时天数</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showCountdownTime}
                    onChange={() => handlePrivacyToggle('showCountdownTime')}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LONGEVITY RULES & DIY HABITS */}
          {activeSettingsTab === 'rules' && (
            <div className="space-y-4">
              
              {/* Top Banner & DIY Toggle */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'zh' ? '生命增减自定义规则 & DIY 习惯维度养成' : 'Longevity Rules & DIY Habits'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {language === 'zh'
                      ? '您可以为任何好习惯（如戒烟、听英语、晨走）定制20天奖励天数与未达标惩罚天数，打卡数据将实时增减生命倒计时！'
                      : 'Customize 20-day reward/penalty lifespan days for any habit (quitting smoking, English, morning walk).'}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDiyFormOpen(prev => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold hover:opacity-90 flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isDiyFormOpen ? (language === 'zh' ? '收起DIY表单' : 'Close DIY') : (language === 'zh' ? '+ DIY 增加新习惯' : '+ DIY Add Habit')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
                    title={language === 'zh' ? '重置为系统默认的规则与习惯' : 'Reset to default rules and habits'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '恢复默认' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {/* DIY Add Habit Dimension Form */}
              {isDiyFormOpen && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        +
                      </div>
                      <span className="text-xs font-bold text-white">
                        {language === 'zh' ? 'DIY 新增想养成的好习惯与寿命规则' : 'DIY Add Custom Habit & Lifespan Rule'}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {language === 'zh' ? '同步至20天挑战卡片与生命时钟' : 'Syncs to 20-Day Cards'}
                    </span>
                  </div>

                  {/* Preset Quick Click Pills */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                      {language === 'zh' ? '💡 点击一键填入灵感好习惯：' : '💡 Quick Presets:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DIY_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-500/15 border border-slate-700 hover:border-emerald-500/40 text-[11px] text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title & Description Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                        {language === 'zh' ? '习惯名称 *' : 'Habit Title *'}
                      </label>
                      <input
                        type="text"
                        value={diyTitle}
                        onChange={(e) => setDiyTitle(e.target.value)}
                        placeholder={language === 'zh' ? '例如：每日彻底戒烟、听英语30分钟' : 'e.g. Quit Smoking, English 30min'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                        {language === 'zh' ? '习惯说明与健康机制' : 'Description'}
                      </label>
                      <input
                        type="text"
                        value={diyDesc}
                        onChange={(e) => setDiyDesc(e.target.value)}
                        placeholder={language === 'zh' ? '例如：坚持远离尼古丁，促进肺泡自洁' : 'Brief explanation'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Reward & Penalty Days Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">
                        {language === 'zh' ? '连续达标奖励 (天数)' : 'Reward Days'}
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.5"
                        value={diyRewardDays}
                        onChange={(e) => setDiyRewardDays(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        = +{Math.round(diyRewardDays * 86400).toLocaleString()} 秒
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] text-rose-400 block mb-1 font-semibold">
                        {language === 'zh' ? '连续违规扣减 (天数)' : 'Penalty Days'}
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.5"
                        value={diyPenaltyDays}
                        onChange={(e) => setDiyPenaltyDays(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        = -{Math.round(diyPenaltyDays * 86400).toLocaleString()} 秒
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                        {language === 'zh' ? '挑战周期 (天数)' : 'Cycle (Days)'}
                      </label>
                      <input
                        type="number"
                        min="7"
                        max="60"
                        value={diyGoalDays}
                        onChange={(e) => setDiyGoalDays(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {language === 'zh' ? '默认 20 天科学复利循环' : 'Default 20 days'}
                      </span>
                    </div>
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                      {language === 'zh' ? '选择对应图标：' : 'Select Icon:'}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'CigaretteOff', label: '🚭 戒烟' },
                        { id: 'Headphones', label: '🎧 听力学习' },
                        { id: 'Sun', label: '☀️ 晨光户外' },
                        { id: 'Sparkles', label: '🧘 冥想拉伸' },
                        { id: 'BookOpen', label: '📖 读书' },
                        { id: 'Droplets', label: '💧 饮水代谢' },
                        { id: 'Flame', label: '💪 运动健身' },
                        { id: 'Moon', label: '🌙 作息规律' },
                        { id: 'Utensils', label: '🥗 控糖膳食' },
                        { id: 'Zap', label: '⚡ 自定义' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDiyIcon(item.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            diyIcon === item.id
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setIsDiyFormOpen(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateDiyHabit}
                      disabled={!diyTitle.trim()}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {language === 'zh' ? '确认创建该好习惯' : 'Create Custom Habit'}
                    </button>
                  </div>
                </div>
              )}

              {/* Rules & Habits List with Delete Option */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span>
                    {language === 'zh' ? `已生效习惯挑战规则 (${editableRules.length} 项)` : `Active Habit Rules (${editableRules.length})`}
                  </span>
                  <span>{language === 'zh' ? '支持直接编辑天数或点击垃圾桶删除' : 'Edit days or delete items'}</span>
                </div>

                {editableRules.map((rule) => {
                  const isCustom = rule.isCustom || rule.category === 'custom';
                  const isConfirmingDelete = deleteConfirmId === rule.id;

                  return (
                    <div 
                      key={rule.id} 
                      className={`p-4 rounded-2xl bg-slate-950/70 border transition-all space-y-3 ${
                        isCustom ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{rule.name}</span>
                          {isCustom && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              {language === 'zh' ? 'DIY定制' : 'DIY Custom'}
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {rule.category}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <div className="flex items-center space-x-1.5">
                          {isConfirmingDelete ? (
                            <div className="flex items-center space-x-1 bg-rose-950/80 border border-rose-500/40 p-1 rounded-xl animate-fade-in">
                              <span className="text-[11px] text-rose-300 px-1 font-semibold">
                                {language === 'zh' ? '确定删除?' : 'Confirm?'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteHabitAndRule(rule.id)}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] rounded-lg font-bold cursor-pointer"
                              >
                                {language === 'zh' ? '删除' : 'Delete'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(rule.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title={language === 'zh' ? '自定义删除此习惯规则' : 'Delete this habit rule'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>
                      
                      {/* Reward Days vs Penalty Days Edit */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">
                            {language === 'zh' ? '达标奖励增加天数' : 'Reward Days'}
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="30"
                            step="0.5"
                            value={Number((rule.rewardSeconds / 86400).toFixed(2))}
                            onChange={(e) => handleRuleChange(rule.id, 'rewardSeconds', Math.max(0, Number(e.target.value)) * 86400)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-rose-400 block mb-1 font-semibold">
                            {language === 'zh' ? '违规扣减减少天数' : 'Penalty Days'}
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="30"
                            step="0.5"
                            value={Number((rule.penaltySeconds / 86400).toFixed(2))}
                            onChange={(e) => handleRuleChange(rule.id, 'penaltySeconds', Math.max(0, Number(e.target.value)) * 86400)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {successToast && (
              <span className="text-emerald-400 font-bold flex items-center space-x-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'zh' ? '规则与自定义好习惯已保存并同步！' : 'Rules and custom habits saved!'}</span>
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
              <span>{language === 'zh' ? '保存设置与自定义规则' : 'Save Settings & Rules'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
