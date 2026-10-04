import { 
  LifeCoinWallet, 
  HealthContract, 
  WearableDevice, 
  TimeCapsule, 
  ExpertConsultationProfile 
} from '../types/innovations';

const WALLET_KEY = 'life_clock_wallet_v1';
const CONTRACTS_KEY = 'life_clock_contracts_v1';
const WEARABLES_KEY = 'life_clock_wearables_v1';
const CAPSULES_KEY = 'life_clock_capsules_v1';

export const INITIAL_WALLET: LifeCoinWallet = {
  balance: 680,
  lifetimeEarned: 1420,
  currentInterestRate: 4.2, // 4.2% annual interest on life time saved
  transactions: [
    {
      id: 'tx-1',
      timestamp: Date.now() - 3600 * 1000 * 4,
      type: 'earn',
      amount: 50,
      title: '达成连续7天深度睡眠奖励',
      category: 'habit_reward',
    },
    {
      id: 'tx-2',
      timestamp: Date.now() - 3600 * 1000 * 24,
      type: 'earn',
      amount: 80,
      title: '契约对赌胜利：20天晨跑小组奖池瓜分',
      category: 'contract_win',
    },
    {
      id: 'tx-3',
      timestamp: Date.now() - 3600 * 1000 * 48,
      type: 'earn',
      amount: 12,
      title: '生命时间银行复利结息 (4.2%年化)',
      category: 'interest',
    },
  ],
};

export const INITIAL_CONTRACTS: HealthContract[] = [
  {
    id: 'contract-sleep-20',
    title: '🌙 20天深睡抗衰复利契约 (4人组)',
    category: 'sleep',
    targetDays: 20,
    currentDay: 14,
    dailyStakeCoins: 20,
    totalPrizePool: 1600,
    startDate: '2026-09-20',
    endDate: '2026-10-10',
    status: 'in_progress',
    penaltyRuleDescription: '每晚 23:00 前入睡且深睡达 90 分钟。若当日未达标，押注 20 生命币自动划入小组奖池，全员达标者瓜分！',
    isUserJoined: true,
    members: [
      { id: 'm-1', name: '探索者 (您)', avatar: '🧬', streakDays: 14, checkedToday: true, status: 'active' },
      { id: 'm-2', name: '长寿长跑侠', avatar: '🏃', streakDays: 14, checkedToday: true, status: 'active' },
      { id: 'm-3', name: '分子生物小林', avatar: '🔬', streakDays: 13, checkedToday: true, status: 'warning' },
      { id: 'm-4', name: '生机饮食Ada', avatar: '🥑', streakDays: 14, checkedToday: true, status: 'active' },
    ],
  },
  {
    id: 'contract-run-14',
    title: '⚡ 14天晨光高心肺耐力搭子契约',
    category: 'exercise',
    targetDays: 14,
    currentDay: 6,
    dailyStakeCoins: 30,
    totalPrizePool: 1200,
    startDate: '2026-09-28',
    endDate: '2026-10-12',
    status: 'in_progress',
    penaltyRuleDescription: '早间 6:00-8:30 完成 5KM 慢跑或 30 分钟 Zone2 心肺训练。违规扣除押注并公示！',
    isUserJoined: false,
    members: [
      { id: 'm-5', name: '波士顿马拉松老刘', avatar: '👟', streakDays: 6, checkedToday: true, status: 'active' },
      { id: 'm-6', name: '线粒体充电机', avatar: '⚡', streakDays: 6, checkedToday: false, status: 'active' },
      { id: 'm-7', name: '冥想极简生', avatar: '🧘', streakDays: 5, checkedToday: true, status: 'warning' },
    ],
  },
  {
    id: 'contract-fasting-7',
    title: '🌿 7天 16:8 细胞自噬间歇轻断食挑战',
    category: 'fasting',
    targetDays: 7,
    currentDay: 1,
    dailyStakeCoins: 15,
    totalPrizePool: 600,
    startDate: '2026-10-04',
    endDate: '2026-10-11',
    status: 'recruiting',
    penaltyRuleDescription: '每日进食窗口严格限定在 8 小时内，禁食 16 小时启动线粒体与细胞自噬清除损伤。',
    isUserJoined: false,
    members: [
      { id: 'm-8', name: '营养学博士Grace', avatar: '🥗', streakDays: 1, checkedToday: true, status: 'active' },
      { id: 'm-9', name: '抗衰客Kev', avatar: '🧬', streakDays: 1, checkedToday: true, status: 'active' },
    ],
  },
];

export const INITIAL_WEARABLES: WearableDevice[] = [
  {
    id: 'dev-apple-watch',
    brand: 'apple',
    name: 'Apple Watch Ultra 2 (HealthKit)',
    iconName: 'Watch',
    isConnected: true,
    batteryLevel: 84,
    lastSyncTime: '刚刚 08:24',
    metrics: {
      restingHeartRate: 52, // bpm (excellent)
      hrvMs: 68, // ms
      vo2Max: 48.5, // ml/kg/min (high cardiovascular fitness)
      deepSleepMinutes: 104,
      remSleepMinutes: 86,
      dailySteps: 9420,
      activeCalories: 530,
      sedentaryInterrupts: 8,
      todayLifeGainSeconds: 6840, // +1.9 hours earned today!
    },
  },
  {
    id: 'dev-whoop',
    brand: 'whoop',
    name: 'WHOOP 4.0 (Recovery & Strain)',
    iconName: 'Activity',
    isConnected: true,
    batteryLevel: 92,
    lastSyncTime: '3分钟前',
    metrics: {
      restingHeartRate: 51,
      hrvMs: 72,
      vo2Max: 49.0,
      deepSleepMinutes: 110,
      remSleepMinutes: 92,
      dailySteps: 9600,
      activeCalories: 550,
      sedentaryInterrupts: 9,
      todayLifeGainSeconds: 7200, // +2.0 hours
    },
  },
  {
    id: 'dev-garmin',
    brand: 'garmin',
    name: 'Garmin Forerunner 965',
    iconName: 'Compass',
    isConnected: false,
    batteryLevel: 65,
    lastSyncTime: '昨日 22:15',
    metrics: {
      restingHeartRate: 54,
      hrvMs: 62,
      vo2Max: 47.8,
      deepSleepMinutes: 90,
      remSleepMinutes: 75,
      dailySteps: 8200,
      activeCalories: 480,
      sedentaryInterrupts: 6,
      todayLifeGainSeconds: 5400,
    },
  },
  {
    id: 'dev-huawei',
    brand: 'huawei',
    name: '华为运动健康 (Huawei HealthKit)',
    iconName: 'Smartphone',
    isConnected: false,
    batteryLevel: 78,
    lastSyncTime: '2天前',
    metrics: {
      restingHeartRate: 56,
      hrvMs: 58,
      vo2Max: 46.2,
      deepSleepMinutes: 85,
      remSleepMinutes: 70,
      dailySteps: 7500,
      activeCalories: 420,
      sedentaryInterrupts: 5,
      todayLifeGainSeconds: 4800,
    },
  },
];

export const INITIAL_CAPSULES: TimeCapsule[] = [
  {
    id: 'cap-5yr',
    title: '✉️ 写给5年后的自己：保持24岁的线粒体与少年感',
    createdDate: '2026-10-04',
    unlockDate: '2031-10-04',
    yearsAhead: 5,
    letterContent: '未来的我，你好。写下这封信时，我的生物年龄为 24.71 岁，比实际年轻 3.6 岁。我坚持着每天 7.5 小时深睡、晨光 5KM 跑步与地中海抗炎轻食。希望当你拆开这封信时，你的身体依旧轻盈充沛，细胞表观遗传学年轻度依旧跑赢同龄人，没有为无谓的焦虑耗损生命时钟。',
    lockedData: {
      chronologicalAge: 28.31,
      biologicalAge: 24.71,
      healthScore: 92,
      targetAge: 85,
      unlockedMedals: 9,
    },
    isUnlocked: false,
    requiredStreakDays: 100,
  },
];

export const EXPERT_CONSULTATION_LIST: ExpertConsultationProfile[] = [
  {
    id: 'exp-1',
    name: '周维信 教授/主任医师',
    title: '国家衰老与线粒体转化医学重点实验室 · 领衔专家',
    hospital: '北京协和医学院附属医院 · 老年抗衰医学中心',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces',
    rating: 4.98,
    reviewCount: 382,
    specialtyTags: ['表观遗传学DNA甲基化逆龄', 'NAD+与线粒体复壮', '多组学深度体检定制'],
    priceCoins: 300,
    priceRmb: 299,
    availableSlots: ['今日 19:30-20:00 (可约)', '明日 14:00-14:30 (可约)', '周六 10:00-10:30 (可约)'],
    introduction: '从事线粒体衰老与代谢综合干预临床 26 年，曾主持国家级衰老时钟队列研究，擅长通过精准生化指标调校个人生命时钟延寿方案。',
    consultationTypes: ['video', 'voice', 'report_audit'],
  },
  {
    id: 'exp-2',
    name: '林雅薇 博士/副研究员',
    title: '国际长寿医学会 (IMLA) 认证抗衰临床顾问',
    hospital: '上海华山运动医学与抗阻逆龄研究所',
    avatar: 'https://images.unsplash.com/photo-1594824813566-7875a3594026?w=200&h=200&fit=crop&crop=faces',
    rating: 4.96,
    reviewCount: 264,
    specialtyTags: ['Zone2 心肺VO2Max极速提升', '久坐血管内皮微循环修复', '骨密度与肌肉衰减逆转'],
    priceCoins: 260,
    priceRmb: 259,
    availableSlots: ['今日 20:30-21:00 (可约)', '明日 16:30-17:00 (可约)'],
    introduction: '哈佛医学院衰老生物学访问学者，专精于高心肺耐力运动处方与自律神经调节，帮助超过 500 位高净值学员实现体能年轻化。',
    consultationTypes: ['video', 'voice', 'report_audit'],
  },
  {
    id: 'exp-3',
    name: '陈墨凡 临床营养主任',
    title: '地中海长寿饮食与间歇轻断食临床带头人',
    hospital: '广东省人民医院 · 临床营养医学科',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=faces',
    rating: 4.95,
    reviewCount: 198,
    specialtyTags: ['肠道微生态多酚抗炎', '16:8间歇断食个体化', '糖脂代谢与胰岛素敏感性'],
    priceCoins: 200,
    priceRmb: 199,
    availableSlots: ['明日 09:30-10:00 (可约)', '明日 15:00-15:30 (可约)'],
    introduction: '著有《长寿食谱的分子密码》，擅长基于个人生化报告出具抗炎抗糖化专属膳食方案，用食物逆转细胞氧化损伤。',
    consultationTypes: ['video', 'voice', 'report_audit'],
  },
];

// Helper functions for persistent state
export const loadWallet = (): LifeCoinWallet => {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : INITIAL_WALLET;
  } catch {
    return INITIAL_WALLET;
  }
};

export const saveWallet = (wallet: LifeCoinWallet) => {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
};

export const loadContracts = (): HealthContract[] => {
  try {
    const raw = localStorage.getItem(CONTRACTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CONTRACTS;
  } catch {
    return INITIAL_CONTRACTS;
  }
};

export const saveContracts = (contracts: HealthContract[]) => {
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
};

export const loadWearables = (): WearableDevice[] => {
  try {
    const raw = localStorage.getItem(WEARABLES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_WEARABLES;
  } catch {
    return INITIAL_WEARABLES;
  }
};

export const saveWearables = (wearables: WearableDevice[]) => {
  localStorage.setItem(WEARABLES_KEY, JSON.stringify(wearables));
};

export const loadTimeCapsules = (): TimeCapsule[] => {
  try {
    const raw = localStorage.getItem(CAPSULES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CAPSULES;
  } catch {
    return INITIAL_CAPSULES;
  }
};

export const saveTimeCapsules = (capsules: TimeCapsule[]) => {
  localStorage.setItem(CAPSULES_KEY, JSON.stringify(capsules));
};
