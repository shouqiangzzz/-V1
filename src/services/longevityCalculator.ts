import { UserProfile, LifeCountdown, TimeAdjustment } from '../types';

/**
 * Calculates user's biological age offset based on clinical biomarkers
 */
export function calculateBiologicalAgeOffset(profile: UserProfile): number {
  let offset = 0; // Negative means younger, positive means older

  // 1. BMI calculation: weight / (height/100)^2
  const heightM = profile.height / 100;
  const bmi = heightM > 0 ? profile.weight / (heightM * heightM) : 22;
  if (bmi < 18.5) {
    offset += 0.8; // underweight risks
  } else if (bmi >= 24 && bmi < 28) {
    offset += 0.9; // overweight
  } else if (bmi >= 28) {
    offset += 2.2; // obesity
  } else {
    offset -= 0.8; // ideal weight bonus
  }

  // 2. Body Fat %
  if (profile.gender === 'male') {
    if (profile.bodyFat > 24) offset += 1.2;
    else if (profile.bodyFat < 10) offset += 0.4;
    else if (profile.bodyFat <= 18) offset -= 0.8;
  } else {
    if (profile.bodyFat > 32) offset += 1.2;
    else if (profile.bodyFat < 15) offset += 0.4;
    else if (profile.bodyFat <= 24) offset -= 0.8;
  }

  // 3. Fasting Blood Glucose (mmol/L)
  if (profile.fastingBloodSugar > 7.0) {
    offset += 2.5; // High glucose risk
  } else if (profile.fastingBloodSugar > 6.1) {
    offset += 1.2; // Impaired fasting glucose
  } else if (profile.fastingBloodSugar >= 4.0 && profile.fastingBloodSugar <= 5.5) {
    offset -= 0.8; // Optimal metabolic health
  }

  // 4. Blood Pressure (Systolic / Diastolic)
  if (profile.systolicBP >= 140 || profile.diastolicBP >= 90) {
    offset += 2.0; // Stage 2 hypertension
  } else if (profile.systolicBP >= 130 || profile.diastolicBP >= 80) {
    offset += 0.9; // Prehypertension
  } else if (profile.systolicBP <= 120 && profile.diastolicBP <= 80 && profile.systolicBP >= 95) {
    offset -= 0.7; // Optimal vascular health
  }

  // 5. Resting Heart Rate (bpm)
  if (profile.restingHeartRate > 85) {
    offset += 1.4;
  } else if (profile.restingHeartRate < 60 && profile.restingHeartRate >= 48) {
    offset -= 1.0; // Athletic heart
  } else if (profile.restingHeartRate <= 70) {
    offset -= 0.5;
  }

  // Cap the offset between -6 and +8 years for realistic scientific bounds
  return Math.round(Math.max(-6, Math.min(8, offset)) * 10) / 10;
}

/**
 * Calculates current countdown metrics in real-time
 */
export function calculateLifeCountdown(
  profile: UserProfile,
  adjustments: TimeAdjustment[],
  nowMs: number = Date.now()
): LifeCountdown {
  const birthMs = new Date(profile.birthDate).getTime();
  const elapsedMs = Math.max(0, nowMs - birthMs);
  const msPerYear = 365.2425 * 24 * 3600 * 1000;
  const chronologicalAge = elapsedMs / msPerYear;

  // Total net earned/lost seconds from all habit modifications
  const netGainSeconds = adjustments.reduce((acc, curr) => {
    return curr.type === 'gain' ? acc + curr.seconds : acc - curr.seconds;
  }, 0);

  // Biological age based on health indicators & uploaded report
  const biologicalAge = Math.max(1, chronologicalAge + profile.biologicalAgeOffset);

  // Baseline target lifespan in milliseconds from birth
  const baselineLifespanYears = profile.targetAge;
  const baselineTargetMs = birthMs + (baselineLifespanYears * msPerYear);

  // Adjust target timestamp with biological age offset and bonus seconds
  // Biological age offset shifts remaining years (if body is 2 years younger, you have +2 years)
  const bioAgeBonusMs = (-profile.biologicalAgeOffset) * msPerYear;
  const habitBonusMs = netGainSeconds * 1000;

  const adjustedTargetMs = baselineTargetMs + bioAgeBonusMs + habitBonusMs;
  const remainingMs = Math.max(0, adjustedTargetMs - nowMs);
  const remainingTotalSeconds = Math.floor(remainingMs / 1000);

  // Total life span seconds
  const totalLifespanMs = Math.max(1, adjustedTargetMs - birthMs);
  const livedPercentage = Math.min(100, Math.max(0, (elapsedMs / totalLifespanMs) * 100));

  const secondsPerDay = 86400;
  const secondsPerWeek = 86400 * 7;
  const secondsPerYear = 365.2425 * secondsPerDay;

  return {
    remainingYears: Number((remainingTotalSeconds / secondsPerYear).toFixed(3)),
    remainingWeeks: Math.floor(remainingTotalSeconds / secondsPerWeek),
    remainingDays: Math.floor(remainingTotalSeconds / secondsPerDay),
    remainingSeconds: remainingTotalSeconds,
    totalSeconds: Math.floor(totalLifespanMs / 1000),
    livedPercentage: Number(livedPercentage.toFixed(2)),
    totalLifeYears: Number((totalLifespanMs / msPerYear).toFixed(1)),
    chronologicalAge: Number(chronologicalAge.toFixed(2)),
    biologicalAge: Number(biologicalAge.toFixed(2)),
    netGainSeconds,
  };
}

/**
 * Format net seconds into "加的天数和秒数"
 * e.g., "+3天 12,480秒" or "-1天 3,600秒"
 */
export function formatGainLossBadge(netSeconds: number): {
  text: string;
  isPositive: boolean;
  days: number;
  remainderSeconds: number;
} {
  const isPositive = netSeconds >= 0;
  const absSeconds = Math.abs(netSeconds);
  const days = Math.floor(absSeconds / 86400);
  const remainderSeconds = absSeconds % 86400;

  const sign = isPositive ? '+' : '-';
  let text = '';
  if (days > 0 && remainderSeconds > 0) {
    text = `${sign}${days}天 ${remainderSeconds.toLocaleString()}秒`;
  } else if (days > 0) {
    text = `${sign}${days}天`;
  } else if (absSeconds > 0) {
    text = `${sign}${absSeconds.toLocaleString()}秒`;
  } else {
    text = `±0秒`;
  }

  return {
    text,
    isPositive,
    days: isPositive ? days : -days,
    remainderSeconds,
  };
}

/**
 * Format total seconds into structured breakdown (Years, Days, Hours, Minutes, Seconds)
 */
export function formatDetailedDuration(seconds: number): {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  secs: number;
} {
  const s = Math.max(0, Math.floor(seconds));
  const years = Math.floor(s / (365.25 * 86400));
  const days = Math.floor((s % (365.25 * 86400)) / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return { years, days, hours, minutes, secs };
}
