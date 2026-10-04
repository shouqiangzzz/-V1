// Types for the 5-dimension innovation upgrades
import { UserProfile } from '../types';

export interface LifeCoinTransaction {
  id: string;
  timestamp: number;
  type: 'earn' | 'spend';
  amount: number;
  title: string;
  category: 'habit_reward' | 'contract_stake' | 'contract_win' | 'consultation' | 'store_discount' | 'interest' | 'tip';
}

export interface LifeCoinWallet {
  balance: number;
  lifetimeEarned: number;
  currentInterestRate: number; // e.g. 3.8% annual compound interest on saved life time
  transactions: LifeCoinTransaction[];
}

export interface ContractMember {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  checkedToday: boolean;
  status: 'active' | 'warning' | 'failed';
}

export interface HealthContract {
  id: string;
  title: string;
  category: 'sleep' | 'exercise' | 'diet' | 'fasting' | 'all_in';
  targetDays: number;
  currentDay: number;
  dailyStakeCoins: number;
  totalPrizePool: number;
  members: ContractMember[];
  startDate: string;
  endDate: string;
  status: 'recruiting' | 'in_progress' | 'settled';
  penaltyRuleDescription: string;
  isUserJoined: boolean;
}

export interface WearableDevice {
  id: string;
  brand: 'apple' | 'garmin' | 'huawei' | 'whoop' | 'xiaomi';
  name: string;
  iconName: string;
  isConnected: boolean;
  batteryLevel: number;
  lastSyncTime: string;
  metrics: {
    restingHeartRate: number; // bpm
    hrvMs: number; // Heart Rate Variability (ms)
    vo2Max: number; // ml/kg/min
    deepSleepMinutes: number;
    remSleepMinutes: number;
    dailySteps: number;
    activeCalories: number;
    sedentaryInterrupts: number;
    todayLifeGainSeconds: number; // auto-earned life seconds
  };
}

export interface TimeCapsule {
  id: string;
  title: string;
  createdDate: string;
  unlockDate: string;
  yearsAhead: number; // 1, 5, 10
  letterContent: string;
  lockedData: {
    chronologicalAge: number;
    biologicalAge: number;
    healthScore: number;
    targetAge: number;
    unlockedMedals: number;
  };
  isUnlocked: boolean;
  requiredStreakDays: number;
}

export interface ExpertConsultationProfile {
  id: string;
  name: string;
  title: string;
  hospital: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialtyTags: string[];
  priceCoins: number;
  priceRmb: number;
  availableSlots: string[];
  introduction: string;
  consultationTypes: ('video' | 'voice' | 'report_audit')[];
}
