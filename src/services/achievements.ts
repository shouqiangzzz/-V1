import { AchievementBadge, HabitTrackerItem, LifeCountdown, UserProfile } from '../types';

export const ACHIEVEMENTS_STORAGE_KEY = 'life_clock_achievements';

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge_sleep_7d',
    category: 'sleep',
    titleZh: '安睡守护者',
    titleEn: 'Sleep Guardian (7-Day)',
    descZh: '连续 7 天保持规律优质作息与深度睡眠，稳定昼夜节律与褪黑素分泌',
    descEn: 'Maintain 7 consecutive days of regular restful 7-8h sleep',
    icon: 'Moon',
    color: 'indigo',
    requirementZh: '连续 7 天睡眠健康打卡达标',
    requirementEn: '7-day consecutive sleep streak',
    thresholdType: 'streak',
    thresholdValue: 7,
    habitCategory: 'sleep',
    unlocked: true, // Initial mock state has streak 18/20, so 7d is already unlocked
    unlockedAt: Date.now() - 86400000 * 11,
    progress: 7,
    maxProgress: 7,
    rewardLifeBonusTextZh: '奠定生命黄金修复节律',
    rewardLifeBonusTextEn: 'Solidifies circadian regenerative rhythms',
  },
  {
    id: 'badge_sleep_20d',
    category: 'sleep',
    titleZh: '深度修复宗师',
    titleEn: 'Deep Rest Master (20-Day)',
    descZh: '达成连续 20 天规律作息复利循环，线粒体与端粒逆龄修护，为生命赢得整整 +1天 寿命',
    descEn: 'Complete a full 20-day restorative sleep cycle for +1 Day of life',
    icon: 'Sparkles',
    color: 'purple',
    requirementZh: '连续 20 天睡眠健康打卡达标',
    requirementEn: '20-day consecutive sleep streak',
    thresholdType: 'streak',
    thresholdValue: 20,
    habitCategory: 'sleep',
    unlocked: false,
    progress: 18,
    maxProgress: 20,
    rewardLifeBonusTextZh: '寿命奖励 +1天 (86,400秒)',
    rewardLifeBonusTextEn: 'Lifespan reward +1 Day (86,400s)',
  },
  {
    id: 'badge_exercise_7d',
    category: 'exercise',
    titleZh: '晨光活力践行者',
    titleEn: 'Active Vitality (7-Day)',
    descZh: '连续 7 天完成中高强度运动累计达标，增强机体心肺储备与血管内皮弹性',
    descEn: 'Complete 60+ mins of daily active movement for 7 days',
    icon: 'Flame',
    color: 'emerald',
    requirementZh: '连续 7 天运动健康打卡达标',
    requirementEn: '7-day consecutive exercise streak',
    thresholdType: 'streak',
    thresholdValue: 7,
    habitCategory: 'exercise',
    unlocked: true, // Initial streak is 14/20
    unlockedAt: Date.now() - 86400000 * 7,
    progress: 7,
    maxProgress: 7,
    rewardLifeBonusTextZh: '大幅改善外周血管阻力与VO2Max',
    rewardLifeBonusTextEn: 'Significantly improves arterial compliance & VO2Max',
  },
  {
    id: 'badge_exercise_20d',
    category: 'exercise',
    titleZh: '长寿动力引擎',
    titleEn: 'Longevity Engine (20-Day)',
    descZh: '达成连续 20 天运动复利挑战，肌肉线粒体数量倍增，抵御代谢综合征',
    descEn: 'Maintain 20 consecutive days of vigorous exercise',
    icon: 'Trophy',
    color: 'amber',
    requirementZh: '连续 20 天运动健康打卡达标',
    requirementEn: '20-day consecutive exercise streak',
    thresholdType: 'streak',
    thresholdValue: 20,
    habitCategory: 'exercise',
    unlocked: false,
    progress: 14,
    maxProgress: 20,
    rewardLifeBonusTextZh: '寿命奖励 +1天 (86,400秒)',
    rewardLifeBonusTextEn: 'Lifespan reward +1 Day (86,400s)',
  },
  {
    id: 'badge_sedentary_7d',
    category: 'sedentary',
    titleZh: '久坐终结者',
    titleEn: 'Sedentary Slayer (7-Day)',
    descZh: '连续 7 天严格控制单日久坐时间在 4 小时以内，定时起身打破下肢静脉停滞',
    descEn: 'Keep daily sedentary sitting under 4 hours for 7 consecutive days',
    icon: 'Armchair',
    color: 'amber',
    requirementZh: '连续 7 天久坐时间达标 (<4h)',
    requirementEn: '7-day sedentary control streak',
    thresholdType: 'streak',
    thresholdValue: 7,
    habitCategory: 'sedentary',
    unlocked: true, // Initial streak is 8/15
    unlockedAt: Date.now() - 86400000 * 1,
    progress: 7,
    maxProgress: 7,
    rewardLifeBonusTextZh: '消除代谢迟滞与深静脉血栓隐患',
    rewardLifeBonusTextEn: 'Mitigates venous stasis & insulin resistance',
  },
  {
    id: 'badge_diet_7d',
    category: 'diet',
    titleZh: '抗炎控糖先锋',
    titleEn: 'Anti-Inflammatory Vanguard',
    descZh: '连续 7 天坚持低GI饮食、多酚果蔬与优质蛋白摄入，守护胰岛素敏感度',
    descEn: '7 consecutive days of anti-inflammatory low-GI nutrition',
    icon: 'Utensils',
    color: 'cyan',
    requirementZh: '连续 7 天抗炎饮食打卡达标',
    requirementEn: '7-day anti-inflammatory diet streak',
    thresholdType: 'streak',
    thresholdValue: 7,
    habitCategory: 'diet',
    unlocked: false,
    progress: 4,
    maxProgress: 7,
    rewardLifeBonusTextZh: '稳固细胞水平抗氧化防御机制',
    rewardLifeBonusTextEn: 'Strengthens cellular antioxidant defense',
  },
  {
    id: 'badge_hydration_7d',
    category: 'hydration',
    titleZh: '生命之源使者',
    titleEn: 'Hydration Hero',
    descZh: '连续 7 天每日规律饮用足量纯净水 (>2000ml)，加速肾脏清除代谢废物',
    descEn: '7 consecutive days of optimal pure hydration (>2000ml)',
    icon: 'Droplets',
    color: 'blue',
    requirementZh: '连续 7 天每日饮水达标 (>2000ml)',
    requirementEn: '7-day hydration goal streak',
    thresholdType: 'streak',
    thresholdValue: 7,
    habitCategory: 'hydration',
    unlocked: false,
    progress: 5,
    maxProgress: 7,
    rewardLifeBonusTextZh: '优化血液粘稠度与体液渗透压平衡',
    rewardLifeBonusTextEn: 'Optimizes blood viscosity and fluid balance',
  },
  {
    id: 'badge_mindfulness_7d',
    category: 'mindfulness',
    titleZh: '心流宁静使者',
    titleEn: 'Zen Serenity',
    descZh: '连续 7 天保持每日正念呼吸或散步冥想，阻断皮质醇对海马体神经元的损伤',
    descEn: '7 consecutive days of mindfulness or stress regulation',
    icon: 'Heart',
    color: 'rose',
    requirementZh: '连续 7 天正念减压打卡达标',
    requirementEn: '7-day mindfulness streak',
    thresholdType: 'streak',
    thresholdValue: 7,
    habitCategory: 'mindfulness',
    unlocked: false,
    progress: 3,
    maxProgress: 7,
    rewardLifeBonusTextZh: '提升迷走神经张力与情绪韧性',
    rewardLifeBonusTextEn: 'Enhances vagal tone & psychological resilience',
  },
  {
    id: 'badge_life_gain_1d',
    category: 'milestone',
    titleZh: '岁月偷渡者',
    titleEn: 'Time Vanguard (+1 Day)',
    descZh: '凭借持之以恒的自律打卡与健康生活，累计为生命时钟赢得超过 +1天 (86,400秒) 净寿命',
    descEn: 'Net accumulated lifespan extension exceeding +1 Day (86,400s)',
    icon: 'Award',
    color: 'teal',
    requirementZh: '生命时钟净延寿超过 +1天 (86,400秒)',
    requirementEn: 'Accumulate > +1 Day of net lifespan gain',
    thresholdType: 'total_gain',
    thresholdValue: 86400,
    unlocked: true, // Initial gain is +4 days, so this is unlocked
    unlockedAt: Date.now() - 86400000 * 3,
    progress: 1,
    maxProgress: 1,
    rewardLifeBonusTextZh: '生命时钟净值持续扩张',
    rewardLifeBonusTextEn: 'Net expansion of biological life clock',
  },
  {
    id: 'badge_bio_young_3y',
    category: 'milestone',
    titleZh: '时光倒流先驱',
    titleEn: 'Chronos Reverser (-3 Years)',
    descZh: '各项生物标志物指标综合推算的生理年龄，比实际日历年龄年轻 3 岁以上',
    descEn: 'Biological biomarker age verified 3+ years younger than chronological age',
    icon: 'Shield',
    color: 'cyan',
    requirementZh: '生理年龄比实际年龄年轻 3 岁以上',
    requirementEn: 'Biological age is 3+ years younger than actual age',
    thresholdType: 'bio_age',
    thresholdValue: 3,
    unlocked: true, // Baseline has 3.6 years younger
    unlockedAt: Date.now() - 86400000 * 5,
    progress: 3,
    maxProgress: 3,
    rewardLifeBonusTextZh: '表观遗传学时钟显著逆龄',
    rewardLifeBonusTextEn: 'Epigenetic biological age reversal',
  },
  {
    id: 'badge_master_discipline',
    category: 'master',
    titleZh: '生命维度荣耀领航者',
    titleEn: 'Grandmaster of Longevity',
    descZh: '同时点亮至少 5 枚生命勋章，达成全生命维度自律闭环与坚实健康护城河',
    descEn: 'Unlock at least 5 Life Medals to attain Grandmaster status',
    icon: 'Crown',
    color: 'amber',
    requirementZh: '累计解锁任意 5 枚生命勋章',
    requirementEn: 'Unlock any 5 Life Medals',
    thresholdType: 'total_medals',
    thresholdValue: 5,
    unlocked: true, // 5 badges are unlocked initially (sleep_7d, exercise_7d, sedentary_7d, life_gain_1d, bio_young_3y)
    unlockedAt: Date.now() - 86400000 * 1,
    progress: 5,
    maxProgress: 5,
    rewardLifeBonusTextZh: '长寿勋章至高荣誉认证',
    rewardLifeBonusTextEn: 'Highest honor of longevity discipline',
  },
];

export function loadAchievements(): AchievementBadge[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with INITIAL_ACHIEVEMENTS in case new badges were added
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
    return INITIAL_ACHIEVEMENTS;
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: AchievementBadge[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (e) {
    console.warn('Could not save achievements:', e);
  }
}

export function evaluateAchievements(
  habits: HabitTrackerItem[],
  countdown: LifeCountdown,
  profile: UserProfile,
  existingBadges: AchievementBadge[]
): { updatedBadges: AchievementBadge[]; newlyUnlocked: AchievementBadge[] } {
  const newlyUnlocked: AchievementBadge[] = [];

  // Pass 1: Evaluate standard badges
  let currentList = existingBadges.map((badge) => {
    let currentProgress = badge.progress;
    let shouldUnlock = badge.unlocked;

    if (badge.thresholdType === 'streak' && badge.habitCategory) {
      const habit = habits.find((h) => h.category === badge.habitCategory);
      const streak = habit ? habit.currentPositiveStreak : 0;
      currentProgress = Math.min(badge.maxProgress, streak);
      if (streak >= badge.thresholdValue) {
        shouldUnlock = true;
      }
    } else if (badge.thresholdType === 'total_gain') {
      const daysGained = Math.max(0, Math.floor(countdown.netGainSeconds / 86400));
      currentProgress = Math.min(badge.maxProgress, daysGained);
      if (countdown.netGainSeconds >= badge.thresholdValue) {
        shouldUnlock = true;
      }
    } else if (badge.thresholdType === 'bio_age') {
      const youngerYears = Math.max(0, -profile.biologicalAgeOffset);
      currentProgress = Math.min(badge.maxProgress, Number(youngerYears.toFixed(1)));
      if (youngerYears >= badge.thresholdValue) {
        shouldUnlock = true;
      }
    }

    if (shouldUnlock && !badge.unlocked) {
      const unlockedBadge = {
        ...badge,
        unlocked: true,
        unlockedAt: Date.now(),
        progress: badge.maxProgress,
      };
      newlyUnlocked.push(unlockedBadge);
      return unlockedBadge;
    }

    return {
      ...badge,
      progress: currentProgress,
      unlocked: shouldUnlock,
    };
  });

  // Pass 2: Evaluate master badge (depends on total unlocked count)
  const nonMasterUnlockedCount = currentList.filter(
    (b) => b.id !== 'badge_master_discipline' && b.unlocked
  ).length;

  currentList = currentList.map((badge) => {
    if (badge.id === 'badge_master_discipline') {
      const progress = Math.min(badge.maxProgress, nonMasterUnlockedCount);
      const shouldUnlock = nonMasterUnlockedCount >= badge.thresholdValue;
      if (shouldUnlock && !badge.unlocked) {
        const unlockedBadge = {
          ...badge,
          unlocked: true,
          unlockedAt: Date.now(),
          progress: badge.maxProgress,
        };
        newlyUnlocked.push(unlockedBadge);
        return unlockedBadge;
      }
      return {
        ...badge,
        progress,
        unlocked: shouldUnlock || badge.unlocked,
      };
    }
    return badge;
  });

  saveAchievements(currentList);
  return { updatedBadges: currentList, newlyUnlocked };
}
