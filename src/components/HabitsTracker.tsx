import React, { useState } from 'react';
import { 
  Moon, 
  Flame, 
  Utensils, 
  Armchair, 
  Sparkles, 
  Droplets, 
  HeartHandshake, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Camera, 
  Sliders, 
  Info,
  Calendar,
  Zap,
  Clock
} from 'lucide-react';
import { HabitTrackerItem, UserProfile, TimeAdjustment } from '../types';
import { useLanguage } from '../services/i18n';

interface HabitsTrackerProps {
  habits: HabitTrackerItem[];
  profile: UserProfile;
  onUpdateHabits: (habits: HabitTrackerItem[]) => void;
  onAddAdjustment: (adj: TimeAdjustment) => void;
  onOpenFoodScanner: () => void;
  onOpenSedentary: () => void;
  onOpenRules: () => void;
  onOpenContract?: () => void;
  onOpenARShare?: () => void;
}

const HABIT_I18N: Record<string, {
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  positiveCondition: { zh: string; en: string };
  negativeCondition: { zh: string; en: string };
}> = {
  habit_sleep: {
    title: { zh: '规律优质睡眠 (7-8h)', en: 'Quality Sleep (7-8h)' },
    description: { zh: '每晚23:00前入睡，保持7-8小时深度睡眠，不熬夜', en: 'In bed before 23:00, 7-8 hours deep restful sleep, no late nights' },
    positiveCondition: { zh: '健康规律睡眠持续20天 → 寿命 +1天', en: 'Regular sleep for 20 days → Lifespan +1 Day' },
    negativeCondition: { zh: '熬夜/作息紊乱持续20天 → 寿命 -1天', en: 'Disrupted sleep for 20 days → Lifespan -1 Day' },
  },
  habit_exercise: {
    title: { zh: '中高强度活动 (>1h)', en: 'Moderate/High Activity (>1h)' },
    description: { zh: '每日累计快走、跑步、健身、球类等活跃时间达到60分钟', en: 'Daily brisk walk, running, fitness, or sports reaching 60 minutes' },
    positiveCondition: { zh: '每天持续健康活动超过1小时持续20天 → 寿命 +1天', en: 'Daily activity >1h for 20 days → Lifespan +1 Day' },
    negativeCondition: { zh: '严重缺乏锻炼活动持续20天 → 寿命 -12小时', en: 'Lack of exercise for 20 days → Lifespan -12 Hours' },
  },
  habit_sedentary: {
    title: { zh: '久坐时间控制 (<4h/天)', en: 'Sedentary Control (<4h/day)' },
    description: { zh: '工作间隙定时站立走动，单日累计连续静态坐姿不超过4小时', en: 'Stand and stretch during work; daily continuous sitting < 4 hours' },
    positiveCondition: { zh: '每日久坐严格<4小时持续15天 → 寿命 +8小时', en: 'Sedentary <4h for 15 days → Lifespan +8 Hours' },
    negativeCondition: { zh: '一天久坐超过4小时持续10天 → 寿命 -1小时', en: 'Sedentary >4h for 10 days → Lifespan -1 Hour' },
  },
  habit_diet: {
    title: { zh: '低GI控糖与抗炎饮食', en: 'Low-GI & Anti-inflammatory Diet' },
    description: { zh: '戒绝高糖奶茶饮料，多摄入蔬菜、优质蛋白与抗氧化深海多酚', en: 'Avoid sugary drinks; emphasize vegetables, lean protein and polyphenols' },
    positiveCondition: { zh: '严格控糖与健康餐食持续20天 → 寿命 +12小时', en: 'Low sugar & healthy meals for 20 days → Lifespan +12 Hours' },
    negativeCondition: { zh: '持续暴饮暴食或高糖重油持续20天 → 寿命 -12小时', en: 'Uncontrolled binge eating for 20 days → Lifespan -12 Hours' },
  },
  habit_hydration: {
    title: { zh: '每日足量纯净饮水 (>2000ml)', en: 'Adequate Hydration (>2000ml)' },
    description: { zh: '清晨一杯温水，全天匀速补充纯净水或淡茶，拒绝含糖冷饮', en: 'Morning warm water, steady hydration with pure water or green tea' },
    positiveCondition: { zh: '每日饮水达标持续20天 → 寿命 +8小时', en: 'Daily hydration goal for 20 days → Lifespan +8 Hours' },
    negativeCondition: { zh: '长期重度缺水或高糖饮料代水持续20天 → 寿命 -6小时', en: 'Chronic dehydration for 20 days → Lifespan -6 Hours' },
  },
  habit_mindfulness: {
    title: { zh: '冥想放空与压力管理', en: 'Mindfulness & Stress Resilience' },
    description: { zh: '每日正念呼吸或散步15分钟，降低皮质醇压力荷尔蒙对海马体的损伤', en: '15 mins daily breathwork or walking; lower cortisol impact' },
    positiveCondition: { zh: '每日正念减压持续20天 → 寿命 +6小时', en: 'Daily stress resilience for 20 days → Lifespan +6 Hours' },
    negativeCondition: { zh: '长期高压焦虑无宣泄持续20天 → 寿命 -6小时', en: 'Chronic unmanaged distress for 20 days → Lifespan -6 Hours' },
  },
};

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  habits,
  profile,
  onUpdateHabits,
  onAddAdjustment,
  onOpenFoodScanner,
  onOpenSedentary,
  onOpenRules,
  onOpenContract,
  onOpenARShare,
}) => {
  const { language } = useLanguage();
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-[var(--bd-accent-strong)]" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-cyan-600" />;
      case 'Armchair': return <Armchair className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-blue-600" />;
      default: return <Zap className="w-5 h-5 text-teal-600" />;
    }
  };

  // Helper getters for i18n
  const getHabitTitle = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.title[language] || h.title;
  const getHabitDesc = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.description[language] || h.description;
  const getHabitPos = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.positiveCondition[language] || h.positiveCondition;
  const getHabitNeg = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.negativeCondition[language] || h.negativeCondition;

  // Handle checking in a positive day
  const handleCheckInPositive = (habitId: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;

      const newPositiveStreak = h.currentPositiveStreak + 1;
      let newNegativeStreak = 0; // reset negative streak on positive check-in

      // Check if threshold reached (e.g. 20 days)
      if (newPositiveStreak >= h.positiveGoalDays) {
        // Milestone reached! Add time adjustment
        const rewardDays = Math.floor(h.positiveRewardSeconds / 86400);
        const rewardText = rewardDays > 0 
          ? (language === 'zh' ? `+${rewardDays}天寿命` : `+${rewardDays} Day(s) Lifespan`)
          : (language === 'zh' ? `+${h.positiveRewardSeconds / 3600}小时寿命` : `+${h.positiveRewardSeconds / 3600}h Lifespan`);
        
        onAddAdjustment({
          id: `adj_${h.category}_${Date.now()}`,
          timestamp: Date.now(),
          category: h.category,
          type: 'gain',
          seconds: h.positiveRewardSeconds,
          reason: language === 'zh'
            ? `🎉 达成连续${h.positiveGoalDays}天【${getHabitTitle(h)}】！成功延长 ${rewardText} (${h.positiveRewardSeconds.toLocaleString()}秒)`
            : `🎉 Achieved ${h.positiveGoalDays}-day streak for [${getHabitTitle(h)}]! Extended ${rewardText} (${h.positiveRewardSeconds.toLocaleString()}s)`,
          streakTriggered: h.positiveGoalDays,
        });

        showNotification(language === 'zh'
          ? `🎉 祝贺！【${getHabitTitle(h)}】达成连续${h.positiveGoalDays}天目标，寿命成功延长 ${rewardText}！右上角已同步更新！`
          : `🎉 Congratulations! [${getHabitTitle(h)}] reached ${h.positiveGoalDays}-day goal! Lifespan extended by ${rewardText}!`
        );

        return {
          ...h,
          currentPositiveStreak: 0,
          currentNegativeStreak: 0,
          todayStatus: 'completed' as const,
        };
      }

      showNotification(language === 'zh'
        ? `✓ 今日【${getHabitTitle(h)}】打卡成功！当前连续：${newPositiveStreak}/${h.positiveGoalDays} 天`
        : `✓ Checked in [${getHabitTitle(h)}] today! Current streak: ${newPositiveStreak}/${h.positiveGoalDays} Days`
      );

      return {
        ...h,
        currentPositiveStreak: newPositiveStreak,
        currentNegativeStreak: 0,
        todayStatus: 'completed' as const,
      };
    });

    onUpdateHabits(updated);
  };

  // Handle checking in a negative day (e.g. staying up late, extreme junk food)
  const handleCheckInNegative = (habitId: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;

      const newNegativeStreak = h.currentNegativeStreak + 1;
      let newPositiveStreak = 0; // broken streak

      // Check if penalty threshold reached
      if (newNegativeStreak >= h.negativeThresholdDays) {
        const penaltyDays = Math.floor(h.negativePenaltySeconds / 86400);
        const penaltyText = penaltyDays > 0 
          ? (language === 'zh' ? `-${penaltyDays}天寿命` : `-${penaltyDays} Day(s)`) 
          : (language === 'zh' ? `-${h.negativePenaltySeconds / 3600}小时寿命` : `-${h.negativePenaltySeconds / 3600}h`);

        onAddAdjustment({
          id: `adj_loss_${h.category}_${Date.now()}`,
          timestamp: Date.now(),
          category: h.category,
          type: 'loss',
          seconds: h.negativePenaltySeconds,
          reason: language === 'zh'
            ? `⚠️ 触发负面阈值：连续${h.negativeThresholdDays}天【${getHabitNeg(h)}】，扣减 ${penaltyText} (${h.negativePenaltySeconds.toLocaleString()}秒)`
            : `⚠️ Penalty triggered: ${h.negativeThresholdDays} days of negative routine, deducted ${penaltyText}`,
          streakTriggered: h.negativeThresholdDays,
        });

        showNotification(language === 'zh'
          ? `⚠️ 警示：已连续${h.negativeThresholdDays}天出现有害习惯，生命时钟减少 ${penaltyText}，请珍惜身体！`
          : `⚠️ Warning: ${h.negativeThresholdDays} days of disrupted routine, life deducted by ${penaltyText}!`
        );

        return {
          ...h,
          currentPositiveStreak: 0,
          currentNegativeStreak: 0,
          todayStatus: 'negative' as const,
        };
      }

      showNotification(language === 'zh'
        ? `⚠️ 记录不良状态：【${getHabitTitle(h)}】已连续偏离 ${newNegativeStreak}/${h.negativeThresholdDays} 天`
        : `⚠️ Warning logged: [${getHabitTitle(h)}] disrupted ${newNegativeStreak}/${h.negativeThresholdDays} Days`
      );

      return {
        ...h,
        currentPositiveStreak: 0,
        currentNegativeStreak: newNegativeStreak,
        todayStatus: 'negative' as const,
      };
    });

    onUpdateHabits(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[var(--bd-accent-strong)] shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-[var(--bd-sub)] hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header & Science Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bd-card)] p-5 rounded-2xl border border-[var(--bd-border)]">
        <div>
          <h3 className="text-lg font-bold text-[var(--bd-text)] flex items-center space-x-2">
            <span>{language === 'zh' ? '习惯持续性与寿命加减账本' : 'Habit Consistency & Lifespan Ledger'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] border border-emerald-500/30">
              {language === 'zh' ? '20天复利循环' : '20-Day Compound Cycle'}
            </span>
          </h3>
          <p className="text-xs text-[var(--bd-sub)] mt-1 max-w-2xl leading-relaxed">
            {language === 'zh' 
              ? '根据生物节律与线粒体修复科学，健康习惯每持续20天可使机体端粒与表观遗传学年轻化（+1天寿命 / +86,400秒）。反之，熬夜或久坐累积将按规则折损寿命秒数。右上角动态更新全量增减！'
              : 'Based on circadian biology and mitochondrial repair, 20 consecutive days of healthy habits rejuvenate cellular telomeres and epigenetics (+1 Day / +86,400s). Disrupted routines deduct lifespan. Real-time gain/loss synced at top!'}
          </p>
        </div>

        {/* Personalized Benchmark Advice based on user's metrics */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenFoodScanner}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 hover:bg-cyan-100 text-xs font-semibold cursor-pointer transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '拍照AI饮食识别' : 'Food AI Scan'}</span>
          </button>

          <button
            onClick={onOpenSedentary}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-100 text-xs font-semibold cursor-pointer transition-all"
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '开启久坐后台检测' : 'Sedentary Guard'}</span>
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] text-[var(--bd-text)] hover:bg-[var(--bd-chip)] text-xs font-semibold cursor-pointer transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--bd-sub)]" />
            <span>{language === 'zh' ? '差异化标准' : 'Custom Rules'}</span>
          </button>
        </div>
      </div>

      {/* Health Buddy Contract & AR Share Action Banner */}
      {onOpenContract && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{language === 'zh' ? '寻找健康搭子 · 发起 20 天抗衰对赌契约' : 'Health Buddy Longevity Contract'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  瓜分奖池
                </span>
              </div>
              <p className="text-[11px] text-[var(--bd-sub)] mt-0.5">
                {language === 'zh' 
                  ? '单兵作战易倦怠？2-4人组队挑战深睡与晨跑，押注虚拟生命币，违约触发扣除惩罚，全员通关瓜分大奖！' 
                  : 'Struggle alone? Team up with 2-4 buddies, stake Life-Coins, conquer habits and split the prize pool!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            {onOpenARShare && (
              <button
                onClick={onOpenARShare}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-700 text-[var(--bd-sub)] text-xs font-semibold cursor-pointer transition-colors"
              >
                {language === 'zh' ? '生成打卡AR海报' : 'AR Card'}
              </button>
            )}
            <button
              onClick={onOpenContract}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-md hover:scale-102 cursor-pointer transition-all"
            >
              {language === 'zh' ? '加入/发起对赌' : 'Join Contract'}
            </button>
          </div>
        </div>
      )}

      {/* Personalized Health Tailoring Tip */}
      <div className="bg-[var(--bd-card)] rounded-xl p-3.5 border border-[var(--bd-border)] text-xs flex items-center justify-between text-[var(--bd-sub)]">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            {language === 'zh' ? '当前匹配指标：' : 'Matched Biomarkers: '}
            {language === 'zh' ? '体脂率' : 'Body Fat'} <strong className="text-[var(--bd-text)]">{profile.bodyFat}%</strong> · 
            {language === 'zh' ? '空腹血糖' : ' Fasting Glucose'} <strong className="text-[var(--bd-text)]">{profile.fastingBloodSugar} mmol/L</strong> · 
            {language === 'zh' ? '血压' : ' Blood Pressure'} <strong className="text-[var(--bd-text)]">{profile.systolicBP}/{profile.diastolicBP} mmHg</strong>
          </span>
        </div>
        <span className="text-[11px] text-teal-600 hidden sm:inline">
          {language === 'zh' ? '已自动匹配差异化标准' : 'Personalized Standards Matched'}
        </span>
      </div>

      {/* Grid of Habit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {habits.map((habit) => {
          const hasNegativeWarning = habit.currentNegativeStreak > 0;
          const title = getHabitTitle(habit);
          const description = getHabitDesc(habit);
          const posCond = getHabitPos(habit);
          const negCond = getHabitNeg(habit);

          return (
            <div 
              key={habit.id}
              className="bg-[var(--bd-card)] border border-[var(--bd-border)] hover:border-[var(--bd-border)] rounded-2xl p-5 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-[var(--bd-chip)] border border-[var(--bd-border)]">
                      {getIcon(habit.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--bd-text)]">{title}</h4>
                      <p className="text-[11px] text-[var(--bd-sub)] mt-0.5">{description}</p>
                    </div>
                  </div>
                </div>

                {/* Rules / Rewards Text */}
                <div className="space-y-1.5 text-xs bg-[var(--bd-chip)] p-3 rounded-xl border border-[var(--bd-border)] my-3">
                  <div className="flex items-center space-x-1.5 text-[var(--bd-accent-strong)] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{posCond}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-rose-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{negCond}</span>
                  </div>
                </div>

                {/* 20-Day Streak Progress Bar & Circles */}
                <div className="my-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[var(--bd-sub)]">
                      {language === 'zh' ? '连续达成进度:' : 'Streak Progress:'}{' '}
                      <strong className="text-[var(--bd-text)] font-mono-num">{habit.currentPositiveStreak}</strong> / {habit.positiveGoalDays} {language === 'zh' ? '天' : 'Days'}
                    </span>
                    <span className="text-[var(--bd-accent-strong)] font-semibold text-[11px]">
                      {language === 'zh' 
                        ? `还差 ${Math.max(0, habit.positiveGoalDays - habit.currentPositiveStreak)} 天达标`
                        : `${Math.max(0, habit.positiveGoalDays - habit.currentPositiveStreak)} Days to Target`}
                    </span>
                  </div>

                  {/* 20 Dots Matrix for visual streak */}
                  <div className="grid grid-cols-10 gap-1 my-2">
                    {Array.from({ length: habit.positiveGoalDays }).map((_, idx) => {
                      const isFilled = idx < habit.currentPositiveStreak;
                      return (
                        <div
                          key={idx}
                          title={language === 'zh' ? `第 ${idx + 1} 天` : `Day ${idx + 1}`}
                          className={`h-2 rounded-sm transition-all ${
                            isFilled
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-xs'
                              : 'bg-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Negative streak warning if active */}
                  {hasNegativeWarning && (
                    <div className="mt-2 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-center justify-between">
                      <span>
                        {language === 'zh' 
                          ? `⚠️ 已连续违规: ${habit.currentNegativeStreak} / ${habit.negativeThresholdDays} 天`
                          : `⚠️ Consecutive Warning: ${habit.currentNegativeStreak} / ${habit.negativeThresholdDays} Days`}
                      </span>
                      <span>
                        {language === 'zh' 
                          ? `满 ${habit.negativeThresholdDays} 天将扣减寿命`
                          : `Deducts life at ${habit.negativeThresholdDays} Days`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Check-in positive vs negative */}
              <div className="pt-3 border-t border-[var(--bd-border)] flex items-center space-x-2">
                <button
                  onClick={() => handleCheckInPositive(habit.id)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                    habit.todayStatus === 'completed'
                      ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] border border-emerald-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-md hover:shadow-emerald-500/20'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {habit.todayStatus === 'completed' 
                      ? (language === 'zh' ? '今日已健康达标' : 'Completed Today') 
                      : (language === 'zh' ? '今日达标打卡' : 'Check In Today')}
                  </span>
                </button>

                <button
                  onClick={() => handleCheckInNegative(habit.id)}
                  title={language === 'zh' ? "标记今日违规（如熬夜、暴饮暴食、严重久坐）" : "Mark today's disruption (e.g. late night, binge eating, excess sitting)"}
                  className="py-2 px-2.5 rounded-xl bg-[var(--bd-card)] hover:bg-rose-50 border border-[var(--bd-border)] hover:border-rose-200 text-[var(--bd-sub)] hover:text-rose-600 text-xs cursor-pointer transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
