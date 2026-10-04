export type Gender = 'male' | 'female' | 'other';

export type BackgroundStyle = 'space' | 'cyber' | 'aurora' | 'sunset' | 'obsidian' | 'ocean' | 'custom';
export type BackgroundPattern = 'mesh' | 'grid' | 'dots' | 'stars' | 'none';

export interface ThemeConfig {
  style: BackgroundStyle;
  customBgColor: string; // e.g. '#030712'
  customSecondaryColor: string; // e.g. '#0b1329'
  customAccentColor: string; // e.g. '#10b981'
  backgroundPattern: BackgroundPattern;
  blurOpacity: number; // 0.1 to 1.0
}

export type UserRole = 'admin' | 'user';
export type UserRegion = 'mainland' | 'overseas';
export type AccountChannel = 
  | 'username'
  | 'phone'
  | 'email'
  | 'wechat'
  | 'alipay'
  | 'google'
  | 'facebook'
  | 'whatsapp'
  | 'twitter'
  | 'anonymous';

export interface PrivacyDisplaySettings {
  showChronologicalAge: boolean; // 授权其他用户查看实际年龄，默认 false (必须本人授权才展示)
  showBiologicalAge: boolean;     // 授权其他用户查看生理年龄，默认 false (必须本人授权才展示)
  showCountdownTime: boolean;     // 授权其他用户查看倒计时时间，默认 false (必须本人授权才展示)
  showLifeMedals: boolean;       // 授权其他用户查看生命勋章，默认 true
}

export interface UserProfile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  targetAge: number; // default 85
  height: number; // cm
  weight: number; // kg
  bodyFat: number; // percentage %
  fastingBloodSugar: number; // mmol/L (normal ~3.9 - 6.1)
  systolicBP: number; // 收缩压 mmHg (normal ~90 - 120)
  diastolicBP: number; // 舒张压 mmHg (normal ~60 - 80)
  restingHeartRate: number; // bpm (normal ~60 - 80)
  dailyActivityTargetHours: number; // default 1.0 hr
  maxSedentaryHoursLimit: number; // default 4.0 hr
  biologicalAgeOffset: number; // calculated years offset (+ older, - younger)
  hasUploadedReport: boolean;
  uploadedReportName?: string;
  lastReportDate?: string;
  avatarUrl?: string;
  avatarType?: 'preset' | 'custom' | 'cartoon';
  themeConfig?: ThemeConfig;
  role: UserRole;
  region?: UserRegion;
  accountType?: AccountChannel;
  accountIdentifier?: string;
  authorizeBioAgeToOthers?: boolean; // 授权其他用户查看生理年龄 (仅本人授权才可被他人查看)
  privacySettings?: PrivacyDisplaySettings; // 主页隐私展示范围设置 (实际年龄、生理年龄、倒计时时间必须本人授权才展示给他人)
}

export interface SystemConfig {
  configId: string;
  systemMotto: string;
  bannerNotice: string;
  appSlogan: string;
  baselineLifespan: number; // e.g. 85
  habitRewardSeconds: number; // e.g. 86400 (1 day)
  habitPenaltySeconds: number; // e.g. 86400 (1 day)
  sedentaryAlertMinutes: number; // e.g. 50 mins
  maxSedentaryHours: number; // e.g. 4 hrs
  globalTheme?: ThemeConfig;
  updatedAt: string;
  updatedBy: string;
}

export type AdjustmentCategory = 
  | 'sleep' 
  | 'exercise' 
  | 'diet' 
  | 'sedentary' 
  | 'mindfulness' 
  | 'hydration' 
  | 'substance' 
  | 'report' 
  | 'custom';

export interface TimeAdjustment {
  id: string;
  timestamp: number;
  category: AdjustmentCategory;
  type: 'gain' | 'loss';
  seconds: number; // absolute seconds
  reason: string;
  streakTriggered?: number;
}

export interface HabitTrackerItem {
  id: string;
  category: AdjustmentCategory;
  title: string;
  iconName: string;
  color: string;
  currentPositiveStreak: number;
  positiveGoalDays: number; // e.g. 20 days
  positiveRewardSeconds: number; // 1 day = 86400s
  currentNegativeStreak: number;
  negativeThresholdDays: number; // e.g. 20 days or 10 days
  negativePenaltySeconds: number; // e.g. 86400s or 3600s
  description: string;
  positiveCondition: string;
  negativeCondition: string;
  todayStatus: 'completed' | 'negative' | 'none';
  recentDates: { [dateStr: string]: 'good' | 'bad' | 'neutral' };
}

export interface SedentaryMonitorState {
  isActive: boolean;
  currentSittingSeconds: number; // live seconds in current sitting session
  todaySittingSeconds: number; // total cumulative sitting today
  todayExerciseSeconds: number; // total cumulative exercise today
  lastStandTimestamp: number;
  sittingAlertThresholdMinutes: number; // alert every 50 mins
  dailySedentaryExcessDays: number; // days where sitting > 4 hours
}

export interface MealAnalysis {
  id: string;
  timestamp: number;
  imageUrl: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dishName: string;
  calories: number;
  fatGrams: number;
  sugarGrams: number;
  sodiumMg: number;
  healthScore: number; // 0-100
  isExcessOilOrSugar: boolean;
  isNutritionallyBalanced: boolean;
  personalizedAdvice: string;
  estimatedLifeImpactText: string;
}

export interface LongevityRuleConfig {
  id: string;
  category: AdjustmentCategory;
  name: string;
  description: string;
  conditionPositive: string;
  conditionNegative: string;
  rewardSeconds: number;
  positiveDaysNeeded: number;
  penaltySeconds: number;
  negativeDaysNeeded: number;
  ageAdjustmentFactor: string; // e.g., "50岁以上需降低高冲击运动，增加平衡训练"
}

export interface LifeCountdown {
  remainingYears: number;
  remainingWeeks: number;
  remainingDays: number;
  remainingSeconds: number;
  totalSeconds: number;
  livedPercentage: number;
  totalLifeYears: number;
  chronologicalAge: number;
  biologicalAge: number;
  netGainSeconds: number; // Total net bonus seconds gained (can be positive or negative)
}

export interface AchievementBadge {
  id: string;
  category: AdjustmentCategory | 'milestone' | 'master';
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  icon: string;
  color: string;
  requirementZh: string;
  requirementEn: string;
  thresholdType: 'streak' | 'total_gain' | 'bio_age' | 'total_medals';
  thresholdValue: number;
  habitCategory?: AdjustmentCategory;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  rewardLifeBonusTextZh?: string;
  rewardLifeBonusTextEn?: string;
}

// ================= Community, Video & Commerce Types =================

export interface ExpertLectureVideo {
  id: string;
  title: string;
  titleEn?: string;
  speaker: string;
  speakerTitle: string;
  speakerAvatar: string;
  videoUrl: string;
  coverUrl: string;
  duration: string; // e.g. "28:40"
  viewsCount: number;
  likesCount: number;
  category: 'longevity' | 'sleep' | 'nutrition' | 'fitness' | 'cardio';
  description: string;
  keyTakeaways: string[];
  uploadedAt: number;
  isFeatured?: boolean;
}

export type PostVisibility = 'public' | 'fans' | 'private';
export type ModerationStatus = 'approved' | 'pending_admin' | 'rejected' | 'appealing' | 'taken_down';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: number;
  text: string;
  isLifeFan?: boolean;
}

export interface CreatorBiomarkerEndorsement {
  heartRateReductionBpm: number; // e.g. 4.6 bpm
  sleepGoalRatePct: number; // e.g. 96.2%
  deepSleepIncreaseMinutes: number; // e.g. 44 mins
  consecutiveDays: number; // 7 days
  aiEvaluationText: string;
  verifiedAt: string;
}

export interface AttachedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  coverUrl: string;
  category: 'supplements' | 'fitness_gear' | 'organic_food' | 'sleep_device';
  commissionRate: number; // e.g. 15 for 15%
  merchantId: string;
  merchantName: string;
  isCertifiedMerchant: boolean;
  depositTier: 'general' | 'health_food';
  salesCount: number;
  biomarkerEndorsement?: CreatorBiomarkerEndorsement;
}

export interface PostAppeal {
  appealReason: string;
  appealTimestamp: number;
  contactMethod: 'email' | 'sms';
  contactValue: string;
  status: 'pending' | 'resolved_approved' | 'resolved_rejected';
  adminNotes?: string;
  resolvedAt?: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  createdAt: number;
  content: string;
  mediaType: 'video' | 'image' | 'text';
  mediaUrl?: string;
  mediaDuration?: string;
  videoThumbnail?: string;
  visibility: PostVisibility;
  moderationStatus: ModerationStatus;
  moderationReason?: string;
  pendingAdminDeadline?: number; // 24 hours deadline
  appeal?: PostAppeal;
  product?: AttachedProduct;
  likesCount: number;
  likedByMe?: boolean;
  comments: PostComment[];
  tags: string[];
  viewsCount: number;
}

export interface MerchantCertification {
  userId: string;
  realName: string;
  idCardNumber: string;
  contactPhone: string;
  merchantType: 'general' | 'health_food';
  depositAmount: number; // 500 or 2000
  depositStatus: 'paid' | 'unpaid';
  depositPaidAt?: number;
  monthlyRevenue: number; // e.g. 350000 or 1200000
  hasBusinessLicense: boolean;
  businessLicenseNumber?: string;
  businessLicenseName?: string;
  isVerified: boolean;
  certifiedAt?: number;
}

