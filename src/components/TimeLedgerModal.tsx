import React, { useState, useMemo } from 'react';
import { 
  History, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Sparkles, 
  Calendar, 
  Plus,
  Calculator,
  CheckCircle2,
  TrendingUp,
  Moon,
  Flame,
  Utensils,
  Armchair,
  Droplets,
  Compass,
  Activity,
  Heart,
  Scale,
  Zap,
  Info
} from 'lucide-react';
import { TimeAdjustment, HabitTrackerItem, UserProfile, LifeCountdown } from '../types';
import { formatGainLossBadge } from '../services/longevityCalculator';
import { useLanguage } from '../services/i18n';

interface TimeLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: TimeAdjustment[];
  netGainSeconds: number;
  habits?: HabitTrackerItem[];
  profile?: UserProfile;
  countdown?: LifeCountdown;
  onAddManualAdjustment: (adj: TimeAdjustment) => void;
  onOpenAudit?: () => void;
}

export const TimeLedgerModal: React.FC<TimeLedgerModalProps> = ({
  isOpen,
  onClose,
  adjustments = [],
  netGainSeconds = 0,
  habits = [],
  profile,
  countdown,
  onAddManualAdjustment,
  onOpenAudit,
}) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'gain' | 'loss'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [customDays, setCustomDays] = useState(1);
  const [customType, setCustomType] = useState<'gain' | 'loss'>('gain');
  const [customCategory, setCustomCategory] = useState<string>('exercise');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'calculation' | 'breakdown' | 'transactions'>('calculation');

  // Category dimension breakdown for the calculation process (UNCONDITIONAL HOOK)
  const categoryStats = useMemo(() => {
    const stats: Record<string, { name: string; gainSec: number; lossSec: number; netSec: number; count: number; icon: any }> = {
      sleep: { name: language === 'zh' ? '规律优质睡眠' : 'Sleep', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: Moon },
      exercise: { name: language === 'zh' ? '运动与心肺' : 'Exercise', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: Flame },
      diet: { name: language === 'zh' ? '控糖抗炎饮食' : 'Diet', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: Utensils },
      sedentary: { name: language === 'zh' ? '久坐控制' : 'Sedentary', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: Armchair },
      hydration: { name: language === 'zh' ? '充足饮水' : 'Hydration', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: Droplets },
      mindfulness: { name: language === 'zh' ? '正念减压' : 'Mindfulness', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: Sparkles },
      custom: { name: language === 'zh' ? 'DIY定制习惯' : 'Custom DIY', gainSec: 0, lossSec: 0, netSec: 0, count: 0, icon: CheckCircle2 },
    };

    (adjustments || []).forEach(adj => {
      if (!adj) return;
      const catKey = stats[adj.category] ? adj.category : 'custom';
      stats[catKey].count += 1;
      const sec = Number(adj.seconds || 0);
      if (adj.type === 'gain') {
        stats[catKey].gainSec += sec;
        stats[catKey].netSec += sec;
      } else {
        stats[catKey].lossSec += sec;
        stats[catKey].netSec -= sec;
      }
    });

    return Object.entries(stats).filter(([_, s]) => s.count > 0 || s.netSec !== 0);
  }, [adjustments, language]);

  // UNCONDITIONAL EARLY RETURN CHECK AFTER ALL HOOKS
  if (!isOpen) return null;

  const badgeInfo = formatGainLossBadge(netGainSeconds);

  const safeAdjustments = adjustments || [];

  const filteredAdjustments = safeAdjustments
    .slice()
    .reverse()
    .filter(adj => {
      if (!adj) return false;
      if (filter === 'gain' && adj.type !== 'gain') return false;
      if (filter === 'loss' && adj.type !== 'loss') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const reason = (adj.reason || '').toLowerCase();
        const cat = (adj.category || '').toLowerCase();
        return reason.includes(q) || cat.includes(q);
      }
      return true;
    });

  const totalGainSeconds = safeAdjustments
    .filter(a => a && a.type === 'gain')
    .reduce((sum, a) => sum + Number(a.seconds || 0), 0);

  const totalLossSeconds = safeAdjustments
    .filter(a => a && a.type === 'loss')
    .reduce((sum, a) => sum + Number(a.seconds || 0), 0);

  const totalGainDays = Number((totalGainSeconds / 86400).toFixed(2));
  const totalLossDays = Number((totalLossSeconds / 86400).toFixed(2));
  const netDays = Number((netGainSeconds / 86400).toFixed(2));

  // Full lifespan master calculation values
  const targetAge = profile?.targetAge || 100;
  const birthYear = profile?.birthDate ? new Date(profile.birthDate).getFullYear() : 1996;
  const chronoAge = countdown?.chronologicalAge || (profile?.birthDate ? Number(((Date.now() - new Date(profile.birthDate).getTime()) / (365.2425 * 86400000)).toFixed(1)) : 28.4);
  const bioAgeOffset = profile?.biologicalAgeOffset ?? -3.3;
  const bioAge = countdown?.biologicalAge || Number((chronoAge + bioAgeOffset).toFixed(1));
  const bioGainDays = Number(((-bioAgeOffset) * 365.2425).toFixed(1));
  const remainingDays = countdown?.remainingDays || Math.floor((targetAge - chronoAge - bioAgeOffset) * 365.2425 + netDays);

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason.trim()) return;

    const seconds = Math.round(customDays * 86400);
    onAddManualAdjustment({
      id: `adj_custom_${Date.now()}`,
      timestamp: Date.now(),
      category: customCategory as any,
      type: customType,
      seconds,
      reason: customReason.trim(),
    });

    setCustomReason('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[var(--bd-card)] border border-[var(--bd-border)] rounded-3xl p-5 sm:p-7 shadow-2xl my-6 transition-all max-h-[92vh] flex flex-col overflow-hidden text-[var(--bd-text)]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--bd-border)] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--bd-text)] tracking-tight flex items-center space-x-2">
                <span>{language === 'zh' ? '寿命时间得失账本与合计计算过程' : 'Longevity Calculation Process & Ledger'}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono-num font-bold ${netGainSeconds >= 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                  {badgeInfo.text}
                </span>
              </h2>
              <p className="text-xs text-[var(--bd-sub)] mt-0.5">
                {language === 'zh' 
                  ? '记录所有健康习惯达成与生活习惯偏离产生的寿命增减明细，实时驱动主时钟倒计时' 
                  : 'Track all lifespan gain and penalty transactions that drive your live countdown clock'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs for Calculation View */}
        <div className="flex items-center space-x-1.5 pt-3 pb-2 border-b border-[var(--bd-border)] shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('calculation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'calculation'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '合计计算过程与数学公式' : 'Calculation Process'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'breakdown'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '各习惯维度贡献分析' : 'Dimension Breakdown'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? `流水账溯源清单 (${safeAdjustments.length})` : `Ledger Records (${safeAdjustments.length})`}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">

          {/* TAB 1: CALCULATION PROCESS & FORMULAS (合计计算过程与数学公式) */}
          {activeTab === 'calculation' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Core Banner: Habit Net Gain Equation */}
              <div className="p-4 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--bd-text)] flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'zh' ? '公式一：自律习惯寿命增减净收益合计推导' : 'Formula 1: Habit Net Gain Longevity Equation'}</span>
                  </span>
                  <span className="text-[11px] font-mono-num text-[var(--bd-accent-strong)] font-semibold">
                    {language === 'zh' ? '实时动态核算' : 'Live Aggregate'}
                  </span>
                </div>

                {/* Visual Formula Chain */}
                <div className="p-3.5 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] font-mono-num text-xs sm:text-sm text-[var(--bd-text)] flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center shadow-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-[var(--bd-sub)] text-xs font-sans">{language === 'zh' ? '累计赚得:' : 'Gained:'}</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">+{totalGainDays}天</strong>
                    <span className="text-[10px] text-[var(--bd-sub)] font-normal">(+{totalGainSeconds.toLocaleString()}s)</span>
                  </div>

                  <span className="text-[var(--bd-sub)] font-bold text-base">−</span>

                  <div className="flex items-center space-x-1">
                    <span className="text-[var(--bd-sub)] text-xs font-sans">{language === 'zh' ? '不良扣除:' : 'Deducted:'}</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-extrabold">-{totalLossDays}天</strong>
                    <span className="text-[10px] text-[var(--bd-sub)] font-normal">(-{totalLossSeconds.toLocaleString()}s)</span>
                  </div>

                  <span className="text-[var(--bd-sub)] font-bold text-base">=</span>

                  <div className="flex items-center space-x-1">
                    <span className="text-[var(--bd-sub)] text-xs font-sans">{language === 'zh' ? '净收益合计:' : 'Net Gain:'}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-extrabold ${netGainSeconds >= 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'}`}>
                      {netDays >= 0 ? `+${netDays}` : netDays} 天 ({netGainSeconds >= 0 ? `+${netGainSeconds.toLocaleString()}` : netGainSeconds.toLocaleString()}秒)
                    </span>
                  </div>
                </div>
                
                <p className="text-[11px] text-[var(--bd-sub)] leading-relaxed">
                  {language === 'zh'
                    ? '说明：根据表观遗传学与自律复利算法，用户每完成一项20天挑战（如睡眠、运动、控糖、戒烟、正念等），系统将自动把预设的奖励秒数累加至生命倒计时中；若出现连续违规，则扣减对应惩罚秒数。'
                    : 'Note: Each completed 20-day streak awards longevity seconds added directly to your master life countdown clock.'}
                </p>
              </div>

              {/* Master Full-Lifecycle Longevity Derivation (大时钟主倒计时全流程推导) */}
              <div className="p-4 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--bd-text)] flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>{language === 'zh' ? '公式二：生命倒计时大时钟剩余天数与终身寿命核算总推导' : 'Formula 2: Master Life Clock Countdown Calculation'}</span>
                  </span>
                  <span className="text-[11px] text-[var(--bd-sub)] font-mono-num">
                    {language === 'zh' ? '精准至秒级' : 'Precision to Second'}
                  </span>
                </div>

                {/* Step-by-Step Breakdown Cards */}
                <div className="space-y-2 text-xs">
                  {/* Step 1: Base Target */}
                  <div className="p-3 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px]">
                        1
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--bd-text)]">
                          {language === 'zh' ? '基础目标寿命基准' : 'Base Lifespan Target'}
                        </div>
                        <div className="text-[10px] text-[var(--bd-sub)]">
                          {language === 'zh' ? `出生于 ${birthYear}年 · 设定目标期望寿命 ${targetAge} 岁` : `Born ${birthYear} · Target ${targetAge} yrs`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono-num font-bold text-[var(--bd-text)]">
                      {(targetAge * 365.2425).toFixed(0)} {language === 'zh' ? '天基准' : 'days base'}
                    </div>
                  </div>

                  {/* Step 2: Biological Age Offset */}
                  <div className="p-3 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[11px]">
                        2
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--bd-text)]">
                          {language === 'zh' ? '表观生理年龄逆龄加成' : 'Biological Age Offset Bonus'}
                        </div>
                        <div className="text-[10px] text-[var(--bd-sub)]">
                          {language === 'zh' 
                            ? `实际年龄 ${chronoAge} 岁 · 生理年龄 ${bioAge} 岁 (表观逆龄 ${bioAgeOffset < 0 ? Math.abs(bioAgeOffset) : bioAgeOffset} 岁)`
                            : `Actual ${chronoAge}y · Bio ${bioAge}y (Offset ${bioAgeOffset}y)`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono-num font-bold text-purple-600 dark:text-purple-400">
                      {bioGainDays >= 0 ? `+${bioGainDays}` : bioGainDays} {language === 'zh' ? '天' : 'days'}
                    </div>
                  </div>

                  {/* Step 3: Habits Net Gain */}
                  <div className="p-3 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                        3
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--bd-text)]">
                          {language === 'zh' ? '自律习惯净收益合计 (来自本账本)' : 'Habits Net Longevity Gain'}
                        </div>
                        <div className="text-[10px] text-[var(--bd-sub)]">
                          {language === 'zh' 
                            ? `奖励 (+${totalGainDays}天) 减去 违规扣除 (-${totalLossDays}天)`
                            : `Rewarded (+${totalGainDays}d) minus Penalties (-${totalLossDays}d)`}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-mono-num font-bold ${netDays >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {netDays >= 0 ? `+${netDays}` : netDays} {language === 'zh' ? '天' : 'days'}
                    </div>
                  </div>

                  {/* Step 4: Final Current Countdown Result */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold text-[11px]">
                        =
                      </div>
                      <div>
                        <div className="font-bold text-[var(--bd-text)]">
                          {language === 'zh' ? '主时钟实时剩余生命倒计时' : 'Live Remaining Countdown'}
                        </div>
                        <div className="text-[10px] text-[var(--bd-sub)]">
                          {language === 'zh' ? '【目标寿命】+【生理逆龄】+【习惯净收益】−【已度过生命】' : '[Target] + [Bio-Offset] + [Habits] - [Lived]'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono-num">
                      <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 block">
                        {remainingDays.toLocaleString()} {language === 'zh' ? '天' : 'days'}
                      </span>
                      <span className="text-[10px] text-[var(--bd-sub)]">
                        {language === 'zh' ? '主界面大字实时滚动' : 'Ticking in real-time'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 3 Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] shadow-xs">
                  <span className="text-[11px] text-[var(--bd-sub)] block mb-1">
                    {language === 'zh' ? '当前最终净寿命增益' : 'Net Lifespan Balance'}
                  </span>
                  <span className={`text-xl font-bold font-mono-num ${netGainSeconds >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {badgeInfo.text}
                  </span>
                  <span className="text-[10px] text-[var(--bd-sub)] block mt-0.5">
                    {netGainSeconds >= 0 ? `+${netGainSeconds.toLocaleString()}秒` : `${netGainSeconds.toLocaleString()}秒`}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] shadow-xs">
                  <span className="text-[11px] text-[var(--bd-sub)] block mb-1">
                    {language === 'zh' ? '累计各项达标奖励' : 'Total Rewarded Gain'}
                  </span>
                  <span className="text-xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
                    +{totalGainDays} 天
                  </span>
                  <span className="text-[10px] text-[var(--bd-sub)] block mt-0.5">
                    +{totalGainSeconds.toLocaleString()} 秒
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] shadow-xs">
                  <span className="text-[11px] text-[var(--bd-sub)] block mb-1">
                    {language === 'zh' ? '违规/不良习惯扣除' : 'Total Penalties Deducted'}
                  </span>
                  <span className="text-xl font-bold font-mono-num text-rose-600 dark:text-rose-400">
                    -{totalLossDays} 天
                  </span>
                  <span className="text-[10px] text-[var(--bd-sub)] block mt-0.5">
                    -{totalLossSeconds.toLocaleString()} 秒
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CATEGORY DIMENSION CONTRIBUTION BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--bd-text)] flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'zh' ? '各健康习惯维度对净增益的贡献核算' : 'Contribution by Dimension'}</span>
                  </span>
                  <span className="text-[11px] text-[var(--bd-sub)]">
                    {language === 'zh' ? '逐项细分核算' : 'Detailed breakdown'}
                  </span>
                </div>

                {categoryStats.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[var(--bd-sub)]">
                    {language === 'zh' ? '暂无各维度记录' : 'No records by dimension yet'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {categoryStats.map(([catKey, stat]) => {
                      const Icon = stat.icon;
                      const catDays = Number((stat.netSec / 86400).toFixed(2));
                      const isPositive = stat.netSec >= 0;

                      return (
                        <div 
                          key={catKey}
                          className="p-3 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] flex items-center justify-between shadow-xs hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-[var(--bd-chip)] text-[var(--bd-accent-strong)]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-[var(--bd-text)] block">
                                {stat.name}
                              </span>
                              <span className="text-[10px] text-[var(--bd-sub)]">
                                {stat.count} {language === 'zh' ? '次调整记录' : 'records'} · 奖 +{(stat.gainSec / 86400).toFixed(1)}d / 扣 -{(stat.lossSec / 86400).toFixed(1)}d
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono-num">
                            <span className={`text-sm font-bold block ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {isPositive ? `+${catDays}` : catDays}天
                            </span>
                            <span className="text-[10px] text-[var(--bd-sub)]">
                              {stat.netSec.toLocaleString()}s
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION TIMELINE & ADD CUSTOM ADJUSTMENT */}
          {activeTab === 'transactions' && (
            <div className="space-y-4 animate-fade-in">
              {/* Filter & Add Special Record Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-1 bg-[var(--bd-chip)] p-1 rounded-xl border border-[var(--bd-border)] text-xs overflow-x-auto">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      filter === 'all' 
                        ? 'bg-[var(--bd-card)] text-[var(--bd-text)] font-bold shadow-xs' 
                        : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)]'
                    }`}
                  >
                    {language === 'zh' ? `全部 (${safeAdjustments.length})` : `All (${safeAdjustments.length})`}
                  </button>
                  <button
                    onClick={() => setFilter('gain')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      filter === 'gain' 
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold' 
                        : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)]'
                    }`}
                  >
                    {language === 'zh' ? '增寿记录' : 'Gains'}
                  </button>
                  <button
                    onClick={() => setFilter('loss')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      filter === 'loss' 
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold' 
                        : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)]'
                    }`}
                  >
                    {language === 'zh' ? '扣减记录' : 'Losses'}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={language === 'zh' ? '搜索明细...' : 'Search...'}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--bd-chip)] border border-[var(--bd-border)] text-xs text-[var(--bd-text)] w-28 sm:w-36 focus:outline-none"
                  />

                  {onOpenAudit && (
                    <button
                      type="button"
                      onClick={onOpenAudit}
                      className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer transition-all shrink-0"
                      title="切换至全景多维度长寿溯源深度分析"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '全景审计' : 'Audit'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[var(--bd-chip)] hover:bg-[var(--bd-chip)]/80 text-[var(--bd-text)] border border-[var(--bd-border)] text-xs font-semibold cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'zh' ? '补记事项' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* Add custom adjustment form */}
              {showAddForm && (
                <form onSubmit={handleCreateCustom} className="p-4 rounded-2xl bg-[var(--bd-chip)] border border-[var(--bd-border)] animate-fade-in text-xs space-y-3 shadow-xs">
                  <h4 className="font-bold text-[var(--bd-text)]">
                    {language === 'zh' ? '记录个性化健康特殊事件（增/减寿命）' : 'Record Custom Health Event'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <input
                      type="text"
                      placeholder={language === 'zh' ? '事件说明（例如：完成全马跑、辟谷断食、严重熬夜）' : 'Event description'}
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      className="sm:col-span-2 bg-[var(--bd-card)] border border-[var(--bd-border)] rounded-xl px-3 py-2 text-[var(--bd-text)] focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <select
                      value={customType}
                      onChange={e => setCustomType(e.target.value as any)}
                      className="bg-[var(--bd-card)] border border-[var(--bd-border)] rounded-xl px-2 py-2 text-[var(--bd-text)] focus:outline-none"
                    >
                      <option value="gain">{language === 'zh' ? '+ 增加寿命' : '+ Gain Lifespan'}</option>
                      <option value="loss">{language === 'zh' ? '- 扣减寿命' : '- Deduct Lifespan'}</option>
                    </select>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={customDays}
                        onChange={e => setCustomDays(Number(e.target.value))}
                        className="w-16 bg-[var(--bd-card)] border border-[var(--bd-border)] rounded-xl px-2 py-2 text-[var(--bd-text)] text-center focus:outline-none"
                      />
                      <span className="text-[var(--bd-sub)]">{language === 'zh' ? '天' : 'Days'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl text-[var(--bd-sub)] hover:text-[var(--bd-text)] cursor-pointer"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-bold cursor-pointer shadow-xs"
                    >
                      {language === 'zh' ? '确认记入账本' : 'Save Record'}
                    </button>
                  </div>
                </form>
              )}

              {/* Itemized Transaction Records Timeline */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[var(--bd-text)] block px-1">
                  {language === 'zh' ? '流水账溯源明细清单：' : 'Transaction History:'}
                </span>

                {filteredAdjustments.length === 0 ? (
                  <div className="text-center py-12 text-[var(--bd-sub)] text-xs bg-[var(--bd-chip)] rounded-2xl border border-[var(--bd-border)]">
                    {language === 'zh' ? '暂无匹配的寿命得失记录' : 'No records match filter'}
                  </div>
                ) : (
                  filteredAdjustments.map((adj) => {
                    const isGain = adj.type === 'gain';
                    const sec = Number(adj.seconds || 0);
                    const days = Number((sec / 86400).toFixed(2));
                    const hours = Number((sec / 3600).toFixed(1));
                    const dateStr = adj.timestamp 
                      ? new Date(adj.timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently';

                    return (
                      <div
                        key={adj.id || Math.random().toString()}
                        className="p-3.5 rounded-2xl bg-[var(--bd-chip)]/80 border border-[var(--bd-border)] hover:border-emerald-500/40 flex items-center justify-between transition-all shadow-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl shrink-0 ${isGain ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                            {isGain ? <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> : <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[var(--bd-text)]">
                              {adj.reason || '健康习惯结算'}
                            </div>
                            <div className="text-[10px] text-[var(--bd-sub)] mt-0.5 flex items-center space-x-1.5">
                              <span>{dateStr}</span>
                              <span>·</span>
                              <span className="capitalize px-1.5 py-0.2 bg-[var(--bd-card)] rounded-md border border-[var(--bd-border)]">
                                {adj.category || 'custom'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono-num ml-3">
                          <span className={`font-bold text-sm block ${isGain ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isGain ? '+' : '-'}{days >= 1 ? `${days}天` : `${hours}小时`}
                          </span>
                          <span className="text-[10px] text-[var(--bd-sub)] block">
                            {isGain ? '+' : '-'}{sec.toLocaleString()}秒
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--bd-border)] flex items-center justify-between shrink-0">
          <div className="text-xs text-[var(--bd-sub)] font-mono-num flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--bd-accent)] shrink-0" />
            <span>{language === 'zh' ? `共累计结算 ${safeAdjustments.length} 笔 · 净收益 ${netDays >= 0 ? `+${netDays}` : netDays} 天` : `${safeAdjustments.length} transactions total`}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            {language === 'zh' ? '关闭账本' : 'Close Ledger'}
          </button>
        </div>

      </div>
    </div>
  );
};
