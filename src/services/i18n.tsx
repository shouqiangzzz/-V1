import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

export interface Translations {
  appName: string;
  appSlogan: string;
  dbConnected: string;
  dbReady: string;
  onboardingBtn: string;
  onboardingBtnShort: string;
  adminConsoleBtn: string;
  foodScannerBtn: string;
  healthProfileBtn: string;
  themeBtn: string;
  rulesBtn: string;
  timeLedgerTooltip: string;
  
  // Navigation Tabs
  tabClock: string;
  tabHabits: string;
  tabSedentary: string;
  tabGrid: string;
  
  // Hero Section
  heroTitleSuffix: string;
  targetGoalPrefix: string;
  birthDateLabel: string;
  chronologicalAgeLabel: string;
  biologicalAgeLabel: string;
  youngerBy: string;
  olderBy: string;
  heroCountdownBadge: string;
  daysUnit: string;
  yearsUnit: string;
  monthsUnit: string;
  weeksUnit: string;
  secondsUnit: string;
  approxPrefix: string;
  lifeWeeksSuffix: string;
  
  // Metric Cards
  metricYearsTitle: string;
  metricYearsSub: string;
  metricMonthsTitle: string;
  metricMonthsSub: string;
  metricWeeksTitle: string;
  metricWeeksSub: string;
  metricSecondsTitle: string;
  metricSecondsSub: string;
  
  // Progress Bar
  livedLifeLabel: string;
  remainingLifeLabel: string;
  motivationalQuote: string;
  checkInBtn: string;
  viewLedgerBtn: string;
  
  // Bottom Right Seconds Dock
  bottomRightSecondsLabel: string;
  
  // Footer
  footerSlogan: string;
  footerBenchmark: string;
  footerRulesConfig: string;
  
  // Habits & Sedentary & Grid
  habitsTitle: string;
  habitsSubtitle: string;
  sedentaryTitle: string;
  gridTitle: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    appName: '生命维度',
    appSlogan: '精准生命倒计时 · 科学健康加减算法',
    dbConnected: '云端已连通',
    dbReady: '云端准备就绪',
    onboardingBtn: '注册/登录',
    onboardingBtnShort: '注册/登录',
    adminConsoleBtn: '管理控制台',
    foodScannerBtn: '饮食拍照AI',
    healthProfileBtn: '健康档案/体检',
    themeBtn: '换肤与头像',
    rulesBtn: '自定义规则',
    timeLedgerTooltip: '点击查看详细加减寿命账本',
    
    tabClock: '生命主时钟',
    tabHabits: '20天习惯挑战',
    tabSedentary: '久坐危害监测',
    tabGrid: '生命周格图',
    
    heroTitleSuffix: '的生命时间轴',
    targetGoalPrefix: '预期目标：',
    birthDateLabel: '出生日期',
    chronologicalAgeLabel: '实际年龄',
    biologicalAgeLabel: '体检/指标推算生理年龄',
    youngerBy: '比实际年轻',
    olderBy: '比实际偏高',
    heroCountdownBadge: '生命希望倒计时 · 剩余设计天数',
    daysUnit: '天',
    yearsUnit: '年',
    monthsUnit: '个月',
    weeksUnit: '周',
    secondsUnit: '秒',
    approxPrefix: '折合约',
    lifeWeeksSuffix: '周生命格',
    
    metricYearsTitle: '剩余寿命年数',
    metricYearsSub: '总设计寿命',
    metricMonthsTitle: '剩余寿命月数',
    metricMonthsSub: '四季更迭的珍贵印记',
    metricWeeksTitle: '剩余周数 (生命格)',
    metricWeeksSub: '见「生命周格图」点亮人生',
    metricSecondsTitle: '倒计时秒数',
    metricSecondsSub: '实时生命心跳 · 每一秒皆不可逆',
    
    livedLifeLabel: '已度过人生',
    remainingLifeLabel: '剩余待绽放时光',
    motivationalQuote: '健康规律睡眠持续20天即可为时钟多赚 +1天 (86,400秒) 寿命！',
    checkInBtn: '立即进行自律打卡',
    viewLedgerBtn: '查看寿命得失账本',
    
    bottomRightSecondsLabel: '倒计时秒数',
    
    footerSlogan: '科学延长有质量的生命跨度 (Healthspan)',
    footerBenchmark: '预期标的：85岁标准生命模型',
    footerRulesConfig: '差异化参数配置',
    
    habitsTitle: '20天连续习惯挑战与长寿积分',
    habitsSubtitle: '连续20天达成奖励1天寿命，连续20天放纵惩罚1天寿命',
    sedentaryTitle: '久坐时间动态监测与减寿预警',
    gridTitle: '生命周格图 (90年 4680周人生画布)',
  },
  en: {
    appName: 'Life Dimensions',
    appSlogan: 'Precision Life Countdown · Scientific Longevity Algorithm',
    dbConnected: 'Cloud Connected',
    dbReady: 'Cloud Ready',
    onboardingBtn: 'Register / Log In',
    onboardingBtnShort: 'Register / Log In',
    adminConsoleBtn: 'Admin Console',
    foodScannerBtn: 'Food AI Scan',
    healthProfileBtn: 'Health Profile',
    themeBtn: 'Theme & Avatar',
    rulesBtn: 'Custom Rules',
    timeLedgerTooltip: 'Click to view Longevity Gain & Loss Ledger',
    
    tabClock: 'Life Clock',
    tabHabits: '20-Day Habits',
    tabSedentary: 'Sedentary Guard',
    tabGrid: 'Life Grid Map',
    
    heroTitleSuffix: "'s Life Timeline",
    targetGoalPrefix: 'Target: ',
    birthDateLabel: 'Birth Date',
    chronologicalAgeLabel: 'Actual Age',
    biologicalAgeLabel: 'Biological / Biomarker Age',
    youngerBy: 'Younger by',
    olderBy: 'Older by',
    heroCountdownBadge: 'Life Span Countdown · Remaining Days',
    daysUnit: 'Days',
    yearsUnit: 'Years',
    monthsUnit: 'Months',
    weeksUnit: 'Weeks',
    secondsUnit: 'Secs',
    approxPrefix: 'Approx.',
    lifeWeeksSuffix: 'Life Weeks',
    
    metricYearsTitle: 'Remaining Years',
    metricYearsSub: 'Total Designed Lifespan',
    metricMonthsTitle: 'Remaining Months',
    metricMonthsSub: 'Precious seasons of life',
    metricWeeksTitle: 'Remaining Weeks',
    metricWeeksSub: 'See Life Grid visualization',
    metricSecondsTitle: 'Countdown Seconds',
    metricSecondsSub: 'Real-time heartbeat · Irreversible',
    
    livedLifeLabel: 'Life Elapsed',
    remainingLifeLabel: 'Remaining Journey',
    motivationalQuote: 'Maintain 20 days of regular sleep to earn +1 Day (86,400s) of life!',
    checkInBtn: 'Check In Habits Now',
    viewLedgerBtn: 'View Gain / Loss Ledger',
    
    bottomRightSecondsLabel: 'Countdown Seconds',
    
    footerSlogan: 'Scientifically extending quality Healthspan',
    footerBenchmark: 'Baseline Model: 85-Year Longevity Profile',
    footerRulesConfig: 'Custom Rule Parameters',
    
    habitsTitle: '20-Day Consecutive Habit Streaks & Longevity Credits',
    habitsSubtitle: '20 days of discipline rewards +1 Day; 20 days of indulgence deducts -1 Day',
    sedentaryTitle: 'Sedentary Duration Monitor & Life Deduction Alert',
    gridTitle: 'Life Grid (90-Year 4,680-Week Canvas)',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('life_dimensions_lang');
      if (saved === 'en' || saved === 'zh') return saved;
      return navigator.language.startsWith('zh') ? 'zh' : 'en';
    } catch {
      return 'zh';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('life_dimensions_lang', lang);
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  };

  const t = translations[language];

  useEffect(() => {
    document.title = language === 'zh' ? '生命维度' : 'Life Dimensions';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'zh',
      setLanguage: () => {},
      t: translations.zh,
    };
  }
  return context;
};
