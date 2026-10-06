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
  Clock,
  Plus,
  Trash2,
  CigaretteOff,
  Headphones,
  Sun,
  BookOpen,
  X,
  AlertCircle
} from 'lucide-react';
import { HabitTrackerItem, UserProfile, TimeAdjustment, LongevityRuleConfig } from '../types';
import { useLanguage } from '../services/i18n';

interface HabitsTrackerProps {
  habits: HabitTrackerItem[];
  profile: UserProfile;
  rules?: LongevityRuleConfig[];
  onSaveRules?: (rules: LongevityRuleConfig[]) => void;
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
  rules = [],
  onSaveRules,
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

  // DIY Add Habit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRewardDays, setNewRewardDays] = useState(1);
  const [newPenaltyDays, setNewPenaltyDays] = useState(1);
  const [newGoalDays, setNewGoalDays] = useState(20);
  const [newIcon, setNewIcon] = useState('CigaretteOff');

  // Deletion confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-cyan-600" />;
      case 'Armchair': return <Armchair className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'CigaretteOff':
      case 'Cigarette': return <CigaretteOff className="w-5 h-5 text-emerald-600" />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-violet-600" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-sky-600" />;
      default: return <Zap className="w-5 h-5 text-teal-600" />;
    }
  };

  // Helper getters for i18n
  const getHabitTitle = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.title[language] || h.title;
  const getHabitDesc = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.description[language] || h.description;
  const getHabitPos = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.positiveCondition[language] || h.positiveCondition;
  const getHabitNeg = (h: HabitTrackerItem) => HABIT_I18N[h.id]?.negativeCondition[language] || h.negativeCondition;

  const customHabitsCount = habits.filter(h => h.isCustom || h.category === 'custom').length;

  // Preset Inspirations
  const QUICK_PRESETS = [
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
      title: '颈肩腰椎麦肯基拉伸',
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

  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setNewTitle(preset.title);
    setNewDesc(preset.desc);
    setNewRewardDays(preset.reward);
    setNewPenaltyDays(preset.penalty);
    setNewIcon(preset.icon);
    setNewGoalDays(preset.days);
  };

  // Add DIY Custom Habit
  const handleCreateCustomHabit = () => {
    if (!newTitle.trim()) return;

    const habitId = `habit_custom_${Date.now()}`;
    const cleanTitle = newTitle.trim();
    const cleanDesc = newDesc.trim() || '自律践行个人专属好习惯，持续赋能生命健康';
    const rewardSec = Math.round(Math.max(0.01, newRewardDays) * 86400);
    const penaltySec = Math.round(Math.max(0.01, newPenaltyDays) * 86400);
    const goalD = Math.max(1, newGoalDays || 20);

    const newHabit: HabitTrackerItem = {
      id: habitId,
      category: 'custom',
      title: cleanTitle,
      iconName: newIcon,
      color: 'emerald',
      currentPositiveStreak: 0,
      positiveGoalDays: goalD,
      positiveRewardSeconds: rewardSec,
      currentNegativeStreak: 0,
      negativeThresholdDays: goalD,
      negativePenaltySeconds: penaltySec,
      description: cleanDesc,
      positiveCondition: `持续坚持${cleanTitle}${goalD}天 → 寿命 +${newRewardDays}天`,
      negativeCondition: `中断或违规持续${goalD}天 → 寿命 -${newPenaltyDays}天`,
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

    const updatedHabits = [...habits, newHabit];
    onUpdateHabits(updatedHabits);

    if (onSaveRules && rules) {
      onSaveRules([...rules, newRule]);
    }

    showNotification(language === 'zh'
      ? `🎉 成功创建专属好习惯【${cleanTitle}】！已加入20天挑战卡片列表，随时开启打卡！`
      : `🎉 Custom habit [${cleanTitle}] created successfully! Added to your 20-day challenge.`
    );

    // Reset and close
    setNewTitle('');
    setNewDesc('');
    setNewRewardDays(1);
    setNewPenaltyDays(1);
    setIsAddModalOpen(false);
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    const target = habits.find(h => h.id === habitId);
    const habitTitle = target ? getHabitTitle(target) : '习惯项目';

    const updated = habits.filter(h => h.id !== habitId);
    onUpdateHabits(updated);

    if (onSaveRules && rules) {
      onSaveRules(rules.filter(r => r.id !== habitId && r.id !== `rule_${habitId}`));
    }

    setDeleteConfirmId(null);
    showNotification(language === 'zh'
      ? `🗑️ 已删除习惯项目【${habitTitle}】`
      : `🗑️ Deleted habit [${habitTitle}]`
    );
  };

  // Handle checking in a positive day
  const handleCheckInPositive = (habitId: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;

      const newPositiveStreak = h.currentPositiveStreak + 1;

      // Check if threshold reached (e.g. 20 days)
      if (newPositiveStreak >= h.positiveGoalDays) {
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

  // Handle checking in a negative day
  const handleCheckInNegative = (habitId: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;

      const newNegativeStreak = h.currentNegativeStreak + 1;

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
          <button onClick={() => setNotification(null)} className="text-[var(--bd-sub)] hover:text-white text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header & Science Explanation (抬头这个位置) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bd-card)] p-5 rounded-2xl border border-[var(--bd-border)]">
        <div>
          <h3 className="text-lg font-bold text-[var(--bd-text)] flex flex-wrap items-center gap-2">
            <span>{language === 'zh' ? '习惯持续性与寿命加减账本' : 'Habit Consistency & Lifespan Ledger'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] border border-emerald-500/30">
              {language === 'zh' ? '20天复利循环' : '20-Day Compound Cycle'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/25">
              {language === 'zh' ? `共 ${habits.length} 项 (含 ${customHabitsCount} 项DIY定制)` : `${habits.length} Habits (${customHabitsCount} Custom)`}
            </span>
          </h3>
          <p className="text-xs text-[var(--bd-sub)] mt-1 max-w-2xl leading-relaxed">
            {language === 'zh' 
              ? '根据生物节律与线粒体修复科学，健康习惯每持续20天可使机体端粒与表观遗传学年轻化（+1天寿命 / +86,400秒）。您可自由在抬头或下方卡片DIY增加新好习惯（如戒烟、听英语、晨走等），设定寿命奖励与惩罚！'
              : 'Based on circadian biology and mitochondrial repair, 20 consecutive days of healthy habits rejuvenate cellular telomeres and epigenetics (+1 Day / +86,400s). Disrupted routines deduct lifespan. Customize any habit anytime!'}
          </p>
        </div>

        {/* Personalized Benchmark Advice based on user's metrics (抬头操作按钮区) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* PROMINENT DIY ADD HABIT BUTTON IN HEADER */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'zh' ? '+ DIY 添加新习惯' : '+ DIY Add Habit'}</span>
          </button>

          <button
            onClick={onOpenFoodScanner}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 hover:bg-cyan-100 text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'zh' ? '拍照AI饮食识别' : 'Food AI Scan'}</span>
          </button>

          <button
            onClick={onOpenSedentary}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-100 text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
          >
            <Armchair className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'zh' ? '开启久坐后台检测' : 'Sedentary Guard'}</span>
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[var(--bd-card)] border border-[var(--bd-border)] text-[var(--bd-text)] hover:bg-[var(--bd-chip)] text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--bd-sub)] shrink-0" />
            <span>{language === 'zh' ? '生命增减规则自定义' : 'Custom Rules'}</span>
          </button>
        </div>
      </div>

      {/* Health Buddy Contract Banner */}
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
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold hover:opacity-90 shadow-md transition-all cursor-pointer"
            >
              {language === 'zh' ? '发起对赌契约' : 'New Contract'}
            </button>
          </div>
        </div>
      )}

      {/* Grid of 20-Day Habit Cards (下面这些位置) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {habits.map((habit) => {
          const title = getHabitTitle(habit);
          const desc = getHabitDesc(habit);
          const posCond = getHabitPos(habit);
          const negCond = getHabitNeg(habit);

          const hasNegativeWarning = habit.currentNegativeStreak > 0;
          const isCustom = habit.isCustom || habit.category === 'custom';
          const isConfirmingDelete = deleteConfirmId === habit.id;

          return (
            <div
              key={habit.id}
              className={`bg-[var(--bd-card)] rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative group ${
                isCustom
                  ? 'border-emerald-500/40 shadow-sm hover:shadow-md hover:border-emerald-500/70'
                  : 'border-[var(--bd-border)] hover:border-emerald-500/40 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Header: Icon, Title, DIY Badge, and Delete Button */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bd-chip)] border border-[var(--bd-border)] flex items-center justify-center shrink-0">
                      {getIcon(habit.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--bd-text)] leading-snug">
                        {title}
                      </h4>
                      <p className="text-[11px] text-[var(--bd-sub)] mt-0.5 line-clamp-2">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {isCustom && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30">
                        {language === 'zh' ? 'DIY定制' : 'DIY'}
                      </span>
                    )}

                    {/* Delete Habit Button */}
                    {isConfirmingDelete ? (
                      <div className="flex items-center space-x-1 bg-rose-50 border border-rose-200 p-1 rounded-xl animate-fade-in shadow-xs z-10">
                        <span className="text-[10px] text-rose-700 px-1 font-semibold">
                          {language === 'zh' ? '确定删除?' : 'Delete?'}
                        </span>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] rounded-lg font-bold cursor-pointer transition-colors"
                        >
                          {language === 'zh' ? '确认' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1 py-0.5 text-slate-500 hover:text-slate-800 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(habit.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                        title={language === 'zh' ? `自定义删除「${title}」习惯项目` : `Delete [${title}] habit`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Conditions breakdown */}
                <div className="space-y-1.5 text-[11px] my-3 p-3 rounded-xl bg-[var(--bd-chip)] border border-[var(--bd-border)]">
                  <div className="flex items-center space-x-1.5 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
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
                  title={language === 'zh' ? "标记今日违规（如熬夜、抽烟、暴饮暴食、严重久坐）" : "Mark today's disruption"}
                  className="py-2 px-2.5 rounded-xl bg-[var(--bd-card)] hover:bg-rose-50 border border-[var(--bd-border)] hover:border-rose-200 text-[var(--bd-sub)] hover:text-rose-600 text-xs cursor-pointer transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}

        {/* INTERACTIVE DASHED CARD AT THE END OF THE GRID (下面这些位置增加) */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500/80 bg-emerald-500/5 hover:bg-emerald-500/10 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[320px] shadow-xs hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all shadow-sm">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-sm font-bold text-[var(--bd-text)] group-hover:text-emerald-700 transition-colors">
            {language === 'zh' ? '+ DIY 增加想养成的个性化好习惯' : '+ DIY Add Custom Habit'}
          </h4>
          <p className="text-xs text-[var(--bd-sub)] mt-1.5 max-w-xs leading-relaxed">
            {language === 'zh' 
              ? '自由定制目标维度（如：每日戒烟、坚持听英语30分钟、晨走散步、背单词、八段锦等），设定20天达标奖励与扣减寿命！' 
              : 'Add custom habits like quitting smoking, English listening, morning walks, and set lifespan rewards/penalties!'}
          </p>
          <span className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold shadow-sm transition-all">
            {language === 'zh' ? '立即添加好习惯' : 'Add Habit Now'}
          </span>
        </div>

      </div>

      {/* DIY ADD HABIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'zh' ? 'DIY 新增想养成的好习惯维度' : 'DIY Add Custom Longevity Habit'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'zh' ? '设定专属于您的习惯名称、达成周期与寿命增减算法' : 'Configure habit title, goal cycle, and lifespan rewards'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Inspiration Presets */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {language === 'zh' ? '💡 点击一键填入热门灵感习惯：' : '💡 One-Click Presets:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-emerald-500/15 border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 block truncate">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      +{preset.reward}天 / -{preset.penalty}天
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {language === 'zh' ? '习惯名称 *' : 'Habit Title *'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === 'zh' ? '例如：每日彻底戒烟、听英语30分钟、背单词...' : 'e.g. Quit Smoking, English Listening'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {language === 'zh' ? '习惯说明与健康机制' : 'Description'}
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={language === 'zh' ? '例如：坚持远离尼古丁，促进肺泡纤毛净化与血管弹性修复' : 'Brief explanation of benefits'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-emerald-400 block mb-1 font-semibold">
                    {language === 'zh' ? '达标奖励增加 (天数)' : 'Reward Days'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="30"
                    step="0.5"
                    value={newRewardDays}
                    onChange={(e) => setNewRewardDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    = +{Math.round(newRewardDays * 86400).toLocaleString()} 秒
                  </span>
                </div>

                <div>
                  <label className="text-xs text-rose-400 block mb-1 font-semibold">
                    {language === 'zh' ? '违规扣减减少 (天数)' : 'Penalty Days'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="30"
                    step="0.5"
                    value={newPenaltyDays}
                    onChange={(e) => setNewPenaltyDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    = -{Math.round(newPenaltyDays * 86400).toLocaleString()} 秒
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    {language === 'zh' ? '挑战周期 (天数)' : 'Cycle (Days)'}
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="60"
                    value={newGoalDays}
                    onChange={(e) => setNewGoalDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {language === 'zh' ? '默认 20 天科学循环' : 'Default 20 days'}
                  </span>
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-semibold">
                  {language === 'zh' ? '选择专属图标：' : 'Select Icon:'}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'CigaretteOff', label: '🚭 戒烟' },
                    { id: 'Headphones', label: '🎧 听力学习' },
                    { id: 'Sun', label: '☀️ 晨光户外' },
                    { id: 'Sparkles', label: '🧘 冥想拉伸' },
                    { id: 'BookOpen', label: '📖 读书' },
                    { id: 'Droplets', label: '💧 饮水' },
                    { id: 'Flame', label: '💪 运动' },
                    { id: 'Moon', label: '🌙 睡眠' },
                    { id: 'Utensils', label: '🥗 控糖' },
                    { id: 'Zap', label: '⚡ 自定义' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewIcon(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        newIcon === item.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateCustomHabit}
                disabled={!newTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-40"
              >
                {language === 'zh' ? '确认添加并加入20天挑战' : 'Add to 20-Day Challenge'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
