import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Heart, 
  Clock, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck, 
  Activity, 
  Zap, 
  Award,
  ChevronRight,
  TrendingUp,
  History,
  Smile,
  AlertTriangle,
  Calendar,
  Utensils,
  Dumbbell,
  Moon,
  Armchair,
  Stethoscope,
  Filter,
  Plus,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { TimeAdjustment, LifeCountdown, HabitTrackerItem, UserProfile } from '../types';
import { useLanguage } from '../services/i18n';

interface LongevityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: TimeAdjustment[];
  countdown: LifeCountdown;
  habits?: HabitTrackerItem[];
  profile: UserProfile;
  onAddManualAdjustment?: (adj: TimeAdjustment) => void;
  onNavigateTab?: (tab: 'clock' | 'habits' | 'sedentary' | 'grid') => void;
}

type PeriodType = '7d' | '30d' | '90d' | 'all';
type DimensionType = 'overview' | 'diet' | 'exercise' | 'sleep' | 'sedentary' | 'biomarkers' | 'ledger';

export const LongevityAuditModal: React.FC<LongevityAuditModalProps> = ({
  isOpen,
  onClose,
  adjustments,
  countdown,
  habits = [],
  profile,
  onAddManualAdjustment,
  onNavigateTab,
}) => {
  const { language } = useLanguage();

  // Period filter state (时间周期选择维度)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');
  
  // Active dimension tab (维度切换)
  const [activeDimension, setActiveDimension] = useState<DimensionType>('overview');

  // Ledger filter state (账单分类与类型筛选)
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'gain' | 'loss'>('all');
  
  // Custom manual adjustment form state (自定义记一笔)
  const [showAddForm, setShowAddForm] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [customCategory, setCustomCategory] = useState<'diet' | 'exercise' | 'sleep' | 'sedentary' | 'custom'>('exercise');
  const [customDays, setCustomDays] = useState(1);
  const [customType, setCustomType] = useState<'gain' | 'loss'>('gain');

  if (!isOpen) return null;

  // Filter adjustments by selected period
  const periodFilteredAdjustments = useMemo(() => {
    const now = Date.now();
    let cutoff = 0;
    if (selectedPeriod === '7d') cutoff = now - 7 * 86400 * 1000;
    else if (selectedPeriod === '30d') cutoff = now - 30 * 86400 * 1000;
    else if (selectedPeriod === '90d') cutoff = now - 90 * 86400 * 1000;

    return adjustments.filter(adj => adj.timestamp >= cutoff);
  }, [adjustments, selectedPeriod]);

  // Aggregate stats for the current period
  const periodGainSeconds = periodFilteredAdjustments
    .filter(a => a.type === 'gain')
    .reduce((sum, a) => sum + a.seconds, 0);

  const periodLossSeconds = periodFilteredAdjustments
    .filter(a => a.type === 'loss')
    .reduce((sum, a) => sum + a.seconds, 0);

  const periodNetSeconds = periodGainSeconds - periodLossSeconds;
  const isPeriodPositive = periodNetSeconds >= 0;
  const periodNetDays = (Math.abs(periodNetSeconds) / 86400).toFixed(1);

  // Group by dimension
  const dietAdjustments = adjustments.filter(a => a.category === 'diet');
  const exerciseAdjustments = adjustments.filter(a => a.category === 'exercise');
  const sleepAdjustments = adjustments.filter(a => a.category === 'sleep');
  const sedentaryAdjustments = adjustments.filter(a => a.category === 'sedentary');
  const biomarkerAdjustments = adjustments.filter(a => a.category === 'report');

  const dietSeconds = dietAdjustments.reduce((sum, a) => sum + (a.type === 'gain' ? a.seconds : -a.seconds), 0);
  const exerciseSeconds = exerciseAdjustments.reduce((sum, a) => sum + (a.type === 'gain' ? a.seconds : -a.seconds), 0);
  const sleepSeconds = sleepAdjustments.reduce((sum, a) => sum + (a.type === 'gain' ? a.seconds : -a.seconds), 0);
  const sedentarySeconds = sedentaryAdjustments.reduce((sum, a) => sum + (a.type === 'gain' ? a.seconds : -a.seconds), 0);
  const biomarkerSeconds = biomarkerAdjustments.reduce((sum, a) => sum + (a.type === 'gain' ? a.seconds : -a.seconds), 0);

  // Format seconds to human friendly string
  const formatSec = (sec: number) => {
    const abs = Math.abs(sec);
    const sign = sec >= 0 ? '+' : '-';
    if (abs >= 86400) {
      const days = (abs / 86400).toFixed(1);
      return `${sign}${days} ${language === 'zh' ? '天' : 'Days'}`;
    }
    const hours = (abs / 3600).toFixed(1);
    return `${sign}${hours} ${language === 'zh' ? '小时' : 'Hours'}`;
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason.trim() || !onAddManualAdjustment) return;

    const seconds = customDays * 86400;
    onAddManualAdjustment({
      id: `adj_custom_${Date.now()}`,
      timestamp: Date.now(),
      category: customCategory,
      type: customType,
      seconds,
      reason: customReason,
    });

    setCustomReason('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {language === 'zh' ? '寿命增减分析与账单逻辑溯源' : 'Longevity Analysis & Ledger Audit'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {language === 'zh' ? '多维度量化分析' : 'MULTI-DIMENSIONAL'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'zh' 
                  ? '追溯各项习惯与做对的行为，整合流水账单，量化对生命时间的真实增减贡献' 
                  : 'Trace habits and positive actions, inspect full transaction ledger, and quantify lifespan bonus'}
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

        {/* Dimension & Time Period Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Dimension Selector Tabs (与下方功能模块对应) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveDimension('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '全景总览' : 'Overview'}</span>
            </button>

            <button
              onClick={() => setActiveDimension('diet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'diet'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '饮食维度' : 'Diet'}</span>
            </button>

            <button
              onClick={() => setActiveDimension('exercise')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'exercise'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '运动维度' : 'Exercise'}</span>
            </button>

            <button
              onClick={() => setActiveDimension('sleep')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'sleep'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '睡眠维度' : 'Sleep'}</span>
            </button>

            <button
              onClick={() => setActiveDimension('sedentary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'sedentary'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '久坐体态' : 'Sedentary'}</span>
            </button>

            <button
              onClick={() => setActiveDimension('biomarkers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'biomarkers'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '体检指标' : 'Biomarkers'}</span>
            </button>

            <button
              onClick={() => setActiveDimension('ledger')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                activeDimension === 'ledger'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '账单流水' : 'Ledger Flow'}</span>
            </button>
          </div>

          {/* Time Period Selector (时间周期选择维度) */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[11px] text-slate-400 px-2 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>{language === 'zh' ? '周期:' : 'Period:'}</span>
            </span>

            {(['7d', '30d', '90d', 'all'] as PeriodType[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period === '7d' && (language === 'zh' ? '近7天' : '7D')}
                {period === '30d' && (language === 'zh' ? '近30天' : '30D')}
                {period === '90d' && (language === 'zh' ? '近90天' : '90D')}
                {period === 'all' && (language === 'zh' ? '全部' : 'ALL')}
              </button>
            ))}
          </div>

        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Top Scoreboard: Dynamic by Period */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-teal-950/50 border border-emerald-500/30 p-5 sm:p-6 shadow-xl">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {language === 'zh' ? `【${selectedPeriod === 'all' ? '累计至今' : selectedPeriod}】寿命增减净收益` : 'Net Longevity Extended'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-mono-num font-extrabold text-4xl sm:text-5xl text-emerald-300 tracking-tight">
                    {isPeriodPositive ? `+${periodNetDays}` : `-${periodNetDays}`}
                  </span>
                  <span className="text-lg text-emerald-200 font-semibold">{language === 'zh' ? '天' : 'Days'}</span>
                  <span className="text-xs text-slate-400 font-mono-num ml-2">
                    ({(Math.abs(periodNetSeconds)).toLocaleString()} {language === 'zh' ? '秒' : 's'})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {language === 'zh'
                    ? `期间内您做对的正面健康行为总计赢回了 ${(periodGainSeconds / 3600).toFixed(1)} 小时，损耗 ${(periodLossSeconds / 3600).toFixed(1)} 小时，自律带来的生命红利持续累加！`
                    : `Positive actions earned ${(periodGainSeconds / 3600).toFixed(1)}h, penalties ${(periodLossSeconds / 3600).toFixed(1)}h.`}
                </p>
              </div>

              {/* 5 Dimensional Snapshot Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400">{language === 'zh' ? '饮食贡献' : 'Diet'}</span>
                  <div className="text-xs font-mono-num font-bold text-emerald-400">{formatSec(dietSeconds)}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400">{language === 'zh' ? '运动贡献' : 'Exercise'}</span>
                  <div className="text-xs font-mono-num font-bold text-emerald-400">{formatSec(exerciseSeconds)}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400">{language === 'zh' ? '睡眠贡献' : 'Sleep'}</span>
                  <div className="text-xs font-mono-num font-bold text-emerald-400">{formatSec(sleepSeconds)}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400">{language === 'zh' ? '体检指标' : 'Labs'}</span>
                  <div className="text-xs font-mono-num font-bold text-teal-300">{formatSec(biomarkerSeconds)}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400">{language === 'zh' ? '久坐损耗' : 'Sedentary'}</span>
                  <div className="text-xs font-mono-num font-bold text-rose-400">{formatSec(sedentarySeconds)}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400">{language === 'zh' ? '生物逆龄' : 'Bio-Offset'}</span>
                  <div className="text-xs font-mono-num font-bold text-amber-300">
                    {Math.abs(profile.biologicalAgeOffset).toFixed(1)} {language === 'zh' ? '岁' : 'y'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW (全景总览) */}
          {activeDimension === 'overview' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'zh' ? '你做对的事情与关键行为溯源：' : 'Key Positive Actions Traced:'}</span>
                </h3>
                <span className="text-xs text-emerald-400 font-medium">
                  {periodFilteredAdjustments.filter(a => a.type === 'gain').length} {language === 'zh' ? '项成就达成' : 'Milestones'}
                </span>
              </div>

              {/* Action list */}
              <div className="space-y-3">
                {periodFilteredAdjustments.map((adj) => (
                  <div 
                    key={adj.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        adj.type === 'gain' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {adj.category === 'sleep' && <Moon className="w-4 h-4" />}
                        {adj.category === 'exercise' && <Dumbbell className="w-4 h-4" />}
                        {adj.category === 'diet' && <Utensils className="w-4 h-4" />}
                        {adj.category === 'sedentary' && <Armchair className="w-4 h-4" />}
                        {adj.category === 'report' && <Stethoscope className="w-4 h-4" />}
                        {adj.category === 'custom' && <Award className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-200">
                            {adj.reason}
                          </span>
                          {adj.streakTriggered && (
                            <span className="text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                              {adj.streakTriggered}天连续达成
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {adj.category === 'sleep' && '生物机制：连续20天在23点前入睡、维持7-8小时深度睡眠，加速脑脊液代谢β-淀粉样蛋白，修复DNA端粒酶活性。'}
                          {adj.category === 'exercise' && '生物机制：连续20天每日活动超1小时，显著激活AMPK长寿信号通路，增强心肺机能与骨骼肌线粒体密度。'}
                          {adj.category === 'report' && '医学依据：体检指标中空腹血糖、血压与静息心率均优于同龄人基线，心血管及代谢综合征发病风险下降40%以上。'}
                          {adj.category === 'diet' && '营养机制：低升糖控糖饮食与多酚抗氧化摄入，阻断体内晚期糖基化终产物（AGEs）积累，延缓血管内皮老化。'}
                          {adj.category === 'sedentary' && '久坐提示：赶项目导致静坐时间超标，但工间微运动拉伸已大幅止损，继续保持久坐阻断。'}
                          {adj.category === 'custom' && '自律习惯：日常微小正向举动聚沙成塔，筑牢生命防线。'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono-num font-bold text-sm sm:text-base ${
                        adj.type === 'gain' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {adj.type === 'gain' ? '+' : '-'}{formatSec(adj.seconds).replace(/[+-]/, '')}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono-num">
                        {new Date(adj.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DIET DIMENSION (饮食维度) */}
          {activeDimension === 'diet' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start space-x-3.5">
                <Utensils className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">饮食维度贡献分析：累计为寿命延长 {formatSec(dietSeconds)}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    对应下方<strong>【饮食拍照AI分析】</strong>与<strong>【控糖地中海抗炎膳食】</strong>模块。通过严控添加糖与反式脂肪酸摄入、补充优质多酚与深海Omega-3，身体慢性低度炎症（hs-CRP）降低42%，有效阻断晚期糖基化终产物（AGEs）对血管弹性的侵蚀。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">抗炎膳食遵从度</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">88.5%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">地中海模式评分优良</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">每日足量饮水</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">2,100 ml / 天</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">全天代谢速率维持黄金线</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">控糖达标寿命奖励</div>
                  <div className="text-lg font-bold text-teal-300 mt-1">+12 小时</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">已计入总延展生命账本</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXERCISE DIMENSION (运动维度) */}
          {activeDimension === 'exercise' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start space-x-3.5">
                <Dumbbell className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">运动维度贡献分析：累计为寿命延长 {formatSec(exerciseSeconds)}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    对应下方<strong>【日常中高强度活动与耐力打卡】</strong>模块。连续20天达成每日活动超1小时，心肺最大摄氧量（VO2 Max）得到有效刺激，直接激活长寿基因SIRT1与AMPK通路，加速线粒体分裂融合，是延长健康寿命的最强干预手段。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">20天运动连续达成</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">100% 满贯</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">奖励整整 +1天寿命 (+86,400s)</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">心肺机能预估</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">VO2 Max +8%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">全因死亡风险显著下降</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">下一次运动里程碑</div>
                  <div className="text-lg font-bold text-amber-300 mt-1">还差 5 天</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">即将触发下一轮奖励</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SLEEP DIMENSION (睡眠维度) */}
          {activeDimension === 'sleep' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start space-x-3.5">
                <Moon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">睡眠维度贡献分析：累计为寿命延长 {formatSec(sleepSeconds)}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    对应下方<strong>【连续20天健康睡眠自律习惯】</strong>模块。坚持23点前就寝与充沛深度睡眠，脑淋巴系统在深睡期清除大脑tau蛋白与β-淀粉样沉积，修复神经突触，保护染色体端粒长度，延缓认知退化与血管早衰。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">首次20天睡眠挑战</div>
                  <div className="text-lg font-bold text-indigo-300 mt-1">已成功达成</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">寿命奖励：+1天 (+86,400s)</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">入睡生物钟规律度</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">94% 优异</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">昼夜节律中枢基因同步</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">下一睡眠目标</div>
                  <div className="text-lg font-bold text-amber-300 mt-1">冲刺第40天</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">连续坚持2天即可再度解锁</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEDENTARY DIMENSION (久坐体态维度) */}
          {activeDimension === 'sedentary' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3.5">
                <Armchair className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">久坐与体态防护分析：累计扣损 {formatSec(sedentarySeconds)}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    对应下方<strong>【工间久坐与专注度监测】</strong>模块。因连续多日伏案久坐超过阈值，被微扣除1小时寿命。但通过开启工间站立定时提醒、每50分钟站立走动并伸展，已成功止损90%以上的静脉回流迟滞风险。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">久坐阻断率</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">82%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">间歇站立有效阻止损耗</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">历史微损耗</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">-1 小时</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">已由其他健康习惯超额弥补</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">防护建议</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">保持 50+10</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">工作50分钟，站立活动10分钟</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BIOMARKERS DIMENSION (体检指标维度) */}
          {activeDimension === 'biomarkers' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30 flex items-start space-x-3.5">
                <Stethoscope className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">体检与生化指标分析：奖励寿命 {formatSec(biomarkerSeconds)}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    对应下方<strong>【健康档案与体检报告解析】</strong>模块。根据循证医学大数据，您的空腹血糖（5.1 mmol/L）、血压（116/76 mmHg）和静息心率（64 bpm）均处于超低慢病发病区间的黄金基线，系统据此奖励整整 2 天 (+172,800秒) 的长寿储备！
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">空腹血糖</div>
                  <div className="text-lg font-bold text-teal-300 mt-1">5.1 mmol/L</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">胰岛素敏感度极其优秀</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">收缩压 / 舒张压</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">116 / 76 mmHg</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">动脉弹性与血管内皮健康</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">静息心率</div>
                  <div className="text-lg font-bold text-cyan-300 mt-1">64 bpm</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">运动员级心脏供血效率</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INTEGRATED TIME LEDGER FLOW (整合账单流水明细与自定义记账) */}
          {activeDimension === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'zh' ? '寿命账单完整流水明细' : 'Time Ledger Billing Records'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'zh' ? '记录每一秒寿命的增加与扣除，支持随时手动记录自定义事件' : 'Full history of seconds earned or deducted'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Ledger Type Filter */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
                    <button
                      onClick={() => setLedgerTypeFilter('all')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        ledgerTypeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'zh' ? '全部' : 'All'}
                    </button>
                    <button
                      onClick={() => setLedgerTypeFilter('gain')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        ledgerTypeFilter === 'gain' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'zh' ? '仅增益 (+)' : 'Gains'}
                    </button>
                    <button
                      onClick={() => setLedgerTypeFilter('loss')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        ledgerTypeFilter === 'loss' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'zh' ? '仅损耗 (-)' : 'Losses'}
                    </button>
                  </div>

                  {/* Add Manual Adjustment Button */}
                  {onAddManualAdjustment && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '自定义记一笔' : 'Log Adjustment'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Add form */}
              {showAddForm && (
                <form onSubmit={handleCreateCustom} className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '自定义记录生命增减事项' : 'Log Custom Life Event'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">{language === 'zh' ? '事项分类' : 'Category'}</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="exercise">{language === 'zh' ? '运动相关' : 'Exercise'}</option>
                        <option value="diet">{language === 'zh' ? '饮食营养' : 'Diet'}</option>
                        <option value="sleep">{language === 'zh' ? '睡眠作息' : 'Sleep'}</option>
                        <option value="sedentary">{language === 'zh' ? '体态久坐' : 'Sedentary'}</option>
                        <option value="custom">{language === 'zh' ? '其他正念/减压' : 'Custom'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">{language === 'zh' ? '类型' : 'Type'}</label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="gain">{language === 'zh' ? '增加寿命 (+)' : 'Gain (+)'}</option>
                        <option value="loss">{language === 'zh' ? '损耗寿命 (-)' : 'Loss (-)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">{language === 'zh' ? '天数换算' : 'Days'}</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-num"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{language === 'zh' ? '事件说明原因' : 'Reason / Note'}</label>
                    <input
                      type="text"
                      placeholder={language === 'zh' ? "例如：完成人生首场半程马拉松，心肺功能极大提升" : "e.g., Completed a half marathon"}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
                    >
                      {language === 'zh' ? '确定存入账本' : 'Save Record'}
                    </button>
                  </div>
                </form>
              )}

              {/* Transactions List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {adjustments
                  .slice()
                  .reverse()
                  .filter(adj => {
                    if (ledgerTypeFilter === 'gain') return adj.type === 'gain';
                    if (ledgerTypeFilter === 'loss') return adj.type === 'loss';
                    return true;
                  })
                  .map((adj) => (
                    <div
                      key={adj.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          adj.type === 'gain' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {adj.type === 'gain' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{adj.reason}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(adj.timestamp).toLocaleString()} · {adj.category.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono-num font-bold ${adj.type === 'gain' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {adj.type === 'gain' ? '+' : '-'}{formatSec(adj.seconds).replace(/[+-]/, '')}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono-num">
                          {adj.seconds.toLocaleString()}s
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Encouragement & Next Milestone (鼓励用户坚持下去) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-amber-500/30 p-5 sm:p-6">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-amber-300">
                    {language === 'zh' ? '给自律者的最高礼赞：你从死神手里夺回了光阴！' : 'Praise for Your Persistence'}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-medium">
                    {language === 'zh' ? '时间雕刻大师' : 'Time Sculptor'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-200 leading-relaxed">
                  {language === 'zh' ? (
                    <>
                      这净增加的 <strong>4 天生命</strong>，是你每一次战胜熬夜欲、每一顿少糖少油的克制、每一次工间站立拉伸、每一次汗流浃背所浇灌出的真实时间奇迹！
                      身体的每一个细胞都因你的自律而焕发生机，<strong>请一定坚持下去！</strong>
                    </>
                  ) : (
                    'These earned days are tangible proof of your daily discipline. Keep holding the line every single day!'
                  )}
                </p>

                {/* Next Milestone Motivation */}
                <div className="pt-2 flex items-center space-x-2 text-[11px] text-emerald-300">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    {language === 'zh'
                      ? '下一个里程碑提示：再坚持 2 天规律睡眠与健康打卡，即可再度解锁【整整 1 天（86,400秒）】生命奖励！'
                      : 'Next Milestone: 2 more days of regular sleep unlocks another +1 Day bonus!'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>{language === 'zh' ? '已收录流水条数:' : 'Total Records:'}</span>
            <strong className="text-slate-200 font-mono-num">{adjustments.length}</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            {language === 'zh' ? '收下鼓励，继续坚持！' : 'Keep Going!'}
          </button>
        </div>

      </div>
    </div>
  );
};
