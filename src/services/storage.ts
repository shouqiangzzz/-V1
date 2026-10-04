import { 
  UserProfile, 
  TimeAdjustment, 
  HabitTrackerItem, 
  SedentaryMonitorState, 
  MealAnalysis, 
  LongevityRuleConfig,
  ThemeConfig
} from '../types';
import { calculateBiologicalAgeOffset } from './longevityCalculator';

const STORAGE_KEYS = {
  USER_PROFILE: 'life_clock_user_profile',
  ADJUSTMENTS: 'life_clock_adjustments',
  HABITS: 'life_clock_habits',
  SEDENTARY: 'life_clock_sedentary',
  MEALS: 'life_clock_meals',
  RULES: 'life_clock_rules',
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  style: 'space',
  customBgColor: '#e9d5ff',
  customSecondaryColor: '#ddd6fe',
  customAccentColor: '#10b981',
  backgroundPattern: 'mesh',
  blurOpacity: 0.45,
};

export const DEFAULT_PRIVACY_SETTINGS = {
  showChronologicalAge: false, // 必须本人授权才展示
  showBiologicalAge: false,     // 必须本人授权才展示
  showCountdownTime: false,     // 必须本人授权才展示
  showLifeMedals: true,
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_default',
  name: '探索者 (Seeker)',
  birthDate: '1998-06-15',
  gender: 'male',
  targetAge: 85,
  height: 175,
  weight: 68,
  bodyFat: 17.5,
  fastingBloodSugar: 5.1,
  systolicBP: 116,
  diastolicBP: 76,
  restingHeartRate: 64,
  dailyActivityTargetHours: 1.0,
  maxSedentaryHoursLimit: 4.0,
  biologicalAgeOffset: -1.2, // 1.2 years younger due to good baseline
  hasUploadedReport: true,
  uploadedReportName: '2026年度三甲医院综合健康体检报告.pdf',
  lastReportDate: '2026-03-15',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=LifeSeeker88',
  avatarType: 'preset',
  themeConfig: DEFAULT_THEME_CONFIG,
  role: 'admin',
  region: 'mainland',
  accountType: 'username',
  accountIdentifier: 'shouqiangzzz@gmail.com',
  authorizeBioAgeToOthers: false,
  privacySettings: DEFAULT_PRIVACY_SETTINGS,
};

export const INITIAL_RULES: LongevityRuleConfig[] = [
  {
    id: 'rule_sleep',
    category: 'sleep',
    name: '规律健康睡眠',
    description: '每晚7-8小时规律作息，昼夜节律稳定',
    conditionPositive: '连续20天健康规律睡眠',
    conditionNegative: '连续20天熬夜或睡眠不规律',
    rewardSeconds: 86400, // +1天
    positiveDaysNeeded: 20,
    penaltySeconds: 86400, // -1天
    negativeDaysNeeded: 20,
    ageAdjustmentFactor: '青年及中年建议7.5小时深度睡眠；老年人重在作息规律与午休补足。',
  },
  {
    id: 'rule_exercise',
    category: 'exercise',
    name: '运动与活动量',
    description: '中高强度有氧或抗阻锻炼，增强心肺机能与线粒体活性',
    conditionPositive: '每天持续健康活动超过1小时，持续20天',
    conditionNegative: '连续未达标或严重缺乏身体运动',
    rewardSeconds: 86400, // +1天
    positiveDaysNeeded: 20,
    penaltySeconds: 43200, // -12小时
    negativeDaysNeeded: 20,
    ageAdjustmentFactor: '根据体脂率分级：体脂>25%注重燃脂有氧；高龄人群注重关节保护与太极/快走。',
  },
  {
    id: 'rule_sedentary',
    category: 'sedentary',
    name: '久坐时间管理',
    description: '长期静态久坐引发代谢衰减与心血管风险',
    conditionPositive: '每日久坐严格控制在4小时内，持续15天',
    conditionNegative: '一天久坐超过4小时，持续10天',
    rewardSeconds: 28800, // +8小时
    positiveDaysNeeded: 15,
    penaltySeconds: 3600, // -1小时
    negativeDaysNeeded: 10,
    ageAdjustmentFactor: '久坐每超1小时建议起身活动5分钟，促进下肢血液回流。',
  },
  {
    id: 'rule_diet',
    category: 'diet',
    name: '合理膳食与控油控糖',
    description: '依据体重、血糖、体脂量身定制营养摄入，抗炎抗氧化',
    conditionPositive: '符合个人体脂与血糖标准的健康均衡膳食，持续20天',
    conditionNegative: '极度损害身体（过度油脂、过度高盐、甜冷饮料食品等）持续10天',
    rewardSeconds: 86400, // +1天
    positiveDaysNeeded: 20,
    penaltySeconds: 86400, // -1天
    negativeDaysNeeded: 10,
    ageAdjustmentFactor: '空腹血糖偏高者严格控制高GI升糖饮食；体脂高者减少反式脂肪摄入。',
  },
  {
    id: 'rule_mindfulness',
    category: 'mindfulness',
    name: '心理减压与情绪正念',
    description: '低压力皮质醇水平、良好心态延缓端粒缩短',
    conditionPositive: '每日正念冥想或深度放松保持20天',
    conditionNegative: '持续处于焦虑重压或情绪内耗20天',
    rewardSeconds: 43200, // +12小时
    positiveDaysNeeded: 20,
    penaltySeconds: 43200, // -12小时
    negativeDaysNeeded: 20,
    ageAdjustmentFactor: '不同年龄段压力源各异，注重心率变异性(HRV)调节。',
  },
  {
    id: 'rule_hydration',
    category: 'hydration',
    name: '充足水分与体液循环',
    description: '维持细胞渗透压与肾脏代谢滤过',
    conditionPositive: '每日足量温水(>2000ml)且规律饮水持续20天',
    conditionNegative: '每日饮水不足1000ml或以高糖饮料代水持续20天',
    rewardSeconds: 28800, // +8小时
    positiveDaysNeeded: 20,
    penaltySeconds: 21600, // -6小时
    negativeDaysNeeded: 20,
    ageAdjustmentFactor: '按体重计算最佳饮水量：体重(kg) x 35ml。',
  }
];

export const INITIAL_HABITS: HabitTrackerItem[] = [
  {
    id: 'habit_sleep',
    category: 'sleep',
    title: '规律优质睡眠 (7-8h)',
    iconName: 'Moon',
    color: 'indigo',
    currentPositiveStreak: 18, // 18/20 days
    positiveGoalDays: 20,
    positiveRewardSeconds: 86400,
    currentNegativeStreak: 0,
    negativeThresholdDays: 20,
    negativePenaltySeconds: 86400,
    description: '每晚23:00前入睡，保持7-8小时深度睡眠，不熬夜',
    positiveCondition: '健康规律睡眠持续20天 → 寿命 +1天',
    negativeCondition: '熬夜/作息紊乱持续20天 → 寿命 -1天',
    todayStatus: 'completed',
    recentDates: {},
  },
  {
    id: 'habit_exercise',
    category: 'exercise',
    title: '中高强度活动 (>1h)',
    iconName: 'Flame',
    color: 'emerald',
    currentPositiveStreak: 14, // 14/20 days
    positiveGoalDays: 20,
    positiveRewardSeconds: 86400,
    currentNegativeStreak: 0,
    negativeThresholdDays: 20,
    negativePenaltySeconds: 43200,
    description: '每日累计快走、跑步、健身、球类等活跃时间达到60分钟',
    positiveCondition: '每天持续健康活动超过1小时持续20天 → 寿命 +1天',
    negativeCondition: '严重缺乏锻炼活动持续20天 → 寿命 -12小时',
    todayStatus: 'completed',
    recentDates: {},
  },
  {
    id: 'habit_sedentary',
    category: 'sedentary',
    title: '久坐时间控制 (<4h/天)',
    iconName: 'Armchair',
    color: 'amber',
    currentPositiveStreak: 8,
    positiveGoalDays: 15,
    positiveRewardSeconds: 28800,
    currentNegativeStreak: 2, // sitting > 4 hrs for 2 days
    negativeThresholdDays: 10,
    negativePenaltySeconds: 3600, // -1 hour
    description: '工作间隙定时站立走动，单日累计连续静态坐姿不超过4小时',
    positiveCondition: '每日久坐严格<4小时持续15天 → 寿命 +8小时',
    negativeCondition: '一天久坐超过4小时持续10天 → 寿命 -1小时',
    todayStatus: 'none',
    recentDates: {},
  },
  {
    id: 'habit_diet',
    category: 'diet',
    title: '低糖低脂抗炎饮食',
    iconName: 'Utensils',
    color: 'cyan',
    currentPositiveStreak: 19, // 19/20 - very close!
    positiveGoalDays: 20,
    positiveRewardSeconds: 86400,
    currentNegativeStreak: 0,
    negativeThresholdDays: 10,
    negativePenaltySeconds: 86400,
    description: '配合个人体脂与血糖标准，摄取优质蛋白、膳食纤维与复合碳水',
    positiveCondition: '合理健康营养膳食持续20天 → 寿命 +1天',
    negativeCondition: '极度损伤身体(过度油脂/超咸甜冷) → 寿命 -1天',
    todayStatus: 'completed',
    recentDates: {},
  },
  {
    id: 'habit_mindfulness',
    category: 'mindfulness',
    title: '身心放松与正念冥想',
    iconName: 'Sparkles',
    color: 'purple',
    currentPositiveStreak: 9,
    positiveGoalDays: 20,
    positiveRewardSeconds: 43200,
    currentNegativeStreak: 0,
    negativeThresholdDays: 20,
    negativePenaltySeconds: 43200,
    description: '每日20分钟正念冥想或深呼吸，降低皮质醇压力荷尔蒙',
    positiveCondition: '每日冥想放松持续20天 → 寿命 +12小时',
    negativeCondition: '极度焦虑持续20天 → 寿命 -12小时',
    todayStatus: 'completed',
    recentDates: {},
  },
  {
    id: 'habit_hydration',
    category: 'hydration',
    title: '充足补水 (>2000ml)',
    iconName: 'Droplets',
    color: 'blue',
    currentPositiveStreak: 12,
    positiveGoalDays: 20,
    positiveRewardSeconds: 28800,
    currentNegativeStreak: 0,
    negativeThresholdDays: 20,
    negativePenaltySeconds: 21600,
    description: '清晨一杯温水，全天匀速补充纯净水或淡茶，拒绝含糖冷饮',
    positiveCondition: '每日饮水达标持续20天 → 寿命 +8小时',
    negativeCondition: '长期重度缺水或高糖饮料代水持续20天 → 寿命 -6小时',
    todayStatus: 'completed',
    recentDates: {},
  }
];

export const INITIAL_ADJUSTMENTS: TimeAdjustment[] = [
  {
    id: 'adj_init_report',
    timestamp: Date.now() - 30 * 86400 * 1000,
    category: 'report',
    type: 'gain',
    seconds: 86400 * 2, // 2 days bonus
    reason: '体检报告解析优异：空腹血糖与心肺指标优秀，奖励生命时间',
  },
  {
    id: 'adj_sleep_1',
    timestamp: Date.now() - 25 * 86400 * 1000,
    category: 'sleep',
    type: 'gain',
    seconds: 86400, // +1 day
    reason: '睡眠里程碑：达成首次连续20天健康规律睡眠！',
    streakTriggered: 20,
  },
  {
    id: 'adj_exercise_1',
    timestamp: Date.now() - 15 * 86400 * 1000,
    category: 'exercise',
    type: 'gain',
    seconds: 86400, // +1 day
    reason: '运动里程碑：达成连续20天每日活动超1小时！',
    streakTriggered: 20,
  },
  {
    id: 'adj_sedentary_1',
    timestamp: Date.now() - 8 * 86400 * 1000,
    category: 'sedentary',
    type: 'loss',
    seconds: 3600, // -1 hour
    reason: '久坐警告：工作赶项目连续10天久坐超过4小时，扣除寿命1小时',
    streakTriggered: 10,
  },
  {
    id: 'adj_diet_1',
    timestamp: Date.now() - 2 * 86400 * 1000,
    category: 'diet',
    type: 'gain',
    seconds: 43200, // +12 hours bonus
    reason: '营养优化：控糖与减脂餐打卡达标奖励',
  }
];

export const INITIAL_SEDENTARY_STATE: SedentaryMonitorState = {
  isActive: true,
  currentSittingSeconds: 52 * 60, // 52 minutes sitting currently
  todaySittingSeconds: 2.8 * 3600, // 2.8 hours total sitting today
  todayExerciseSeconds: 1.1 * 3600, // 1.1 hours exercise today (already exceeded 1h!)
  lastStandTimestamp: Date.now() - 52 * 60 * 1000,
  sittingAlertThresholdMinutes: 50,
  dailySedentaryExcessDays: 2,
};

export const INITIAL_MEALS: MealAnalysis[] = [
  {
    id: 'meal_1',
    timestamp: Date.now() - 4 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    mealType: 'lunch',
    dishName: '地中海轻食低GI三文鱼糙米碗',
    calories: 520,
    fatGrams: 14.5,
    sugarGrams: 3.2,
    sodiumMg: 420,
    healthScore: 94,
    isExcessOilOrSugar: false,
    isNutritionallyBalanced: true,
    personalizedAdvice: '富含优质Omega-3与未精制谷物，极佳契合当前17.5%体脂目标，有助于血管年轻化。',
    estimatedLifeImpactText: '极佳抗炎餐点，为今日饮食打卡提供关键增益！',
  },
  {
    id: 'meal_2',
    timestamp: Date.now() - 22 * 3600 * 1000,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    mealType: 'breakfast',
    dishName: '全麦牛油果水波蛋配黑咖啡',
    calories: 380,
    fatGrams: 12.0,
    sugarGrams: 1.8,
    sodiumMg: 280,
    healthScore: 91,
    isExcessOilOrSugar: false,
    isNutritionallyBalanced: true,
    personalizedAdvice: '高饱腹感优质卵磷脂组合，平稳早间空腹血糖反应。',
    estimatedLifeImpactText: '心血管保护性早餐，维持胰岛素敏感度。',
  }
];

// Helper functions for reading and writing to localStorage
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return INITIAL_USER_PROFILE;
    const parsed = JSON.parse(raw);
    const merged: UserProfile = {
      ...INITIAL_USER_PROFILE,
      ...parsed,
      role: parsed.role || (parsed.accountIdentifier === 'shouqiangzzz@gmail.com' ? 'admin' : 'admin'),
      region: parsed.region || 'mainland',
      accountType: parsed.accountType || 'username',
      accountIdentifier: parsed.accountIdentifier || 'shouqiangzzz@gmail.com',
      avatarUrl: parsed.avatarUrl || INITIAL_USER_PROFILE.avatarUrl,
      avatarType: parsed.avatarType || INITIAL_USER_PROFILE.avatarType,
      themeConfig: {
        ...DEFAULT_THEME_CONFIG,
        ...(parsed.themeConfig || {})
      }
    };
    merged.biologicalAgeOffset = calculateBiologicalAgeOffset(merged);
    return merged;
  } catch {
    return INITIAL_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  profile.biologicalAgeOffset = calculateBiologicalAgeOffset(profile);
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export function loadAdjustments(): TimeAdjustment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
    if (!raw) return INITIAL_ADJUSTMENTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADJUSTMENTS;
  }
}

export function saveAdjustments(adjustments: TimeAdjustment[]): void {
  localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
}

export function loadHabits(): HabitTrackerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return INITIAL_HABITS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_HABITS;
  }
}

export function saveHabits(habits: HabitTrackerItem[]): void {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function loadSedentaryState(): SedentaryMonitorState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEDENTARY);
    if (!raw) return INITIAL_SEDENTARY_STATE;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEDENTARY_STATE;
  }
}

export function saveSedentaryState(state: SedentaryMonitorState): void {
  localStorage.setItem(STORAGE_KEYS.SEDENTARY, JSON.stringify(state));
}

export function loadMeals(): MealAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) return INITIAL_MEALS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEALS;
  }
}

export function saveMeals(meals: MealAnalysis[]): void {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

export function loadRules(): LongevityRuleConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    if (!raw) return INITIAL_RULES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_RULES;
  }
}

export function saveRules(rules: LongevityRuleConfig[]): void {
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
}
