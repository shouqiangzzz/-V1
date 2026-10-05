import React, { useMemo } from 'react';
import { 
  Hourglass, 
  Calendar, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck, 
  Flame, 
  Timer,
  ChevronRight,
  History,
  AlertTriangle,
  Palette,
  Trophy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Database,
  Coins,
  Watch
} from 'lucide-react';
import { LifeCountdown, UserProfile } from '../types';
import { formatDetailedDuration } from '../services/longevityCalculator';
import { useLanguage } from '../services/i18n';
import { DEFAULT_PRIVACY_SETTINGS } from '../services/storage';

interface LifeClockHeroProps {
  countdown: LifeCountdown;
  profile: UserProfile;
  systemMotto?: string;
  onOpenProfile: () => void;
  onOpenLedger: () => void;
  onOpenAudit: () => void;
  onOpenHabits: () => void;
  onOpenTheme?: () => void;
  unlockedMedalsCount?: number;
  onOpenMedals?: () => void;
  onOpenSettings?: () => void;
  isVisitorPreviewMode?: boolean;
  onToggleVisitorPreview?: () => void;
  isDbConnected?: boolean;
  walletBalance?: number;
  onOpenTimeBank?: () => void;
  onOpenWearables?: () => void;
}

export const LifeClockHero: React.FC<LifeClockHeroProps> = ({
  countdown,
  profile,
  systemMotto,
  onOpenProfile,
  onOpenLedger,
  onOpenAudit,
  onOpenHabits,
  onOpenTheme,
  unlockedMedalsCount,
  onOpenMedals,
  onOpenSettings,
  isVisitorPreviewMode = false,
  onToggleVisitorPreview,
  isDbConnected = true,
  walletBalance = 680,
  onOpenTimeBank,
  onOpenWearables,
}) => {
  const { language, t } = useLanguage();
  const duration = formatDetailedDuration(countdown.remainingSeconds);
  const isBioYounger = profile.biologicalAgeOffset < 0;

  // Privacy authorization evaluation
  const privacy = profile.privacySettings || DEFAULT_PRIVACY_SETTINGS;
  const isChronologicalAgeVisible = !isVisitorPreviewMode || privacy.showChronologicalAge;
  const isBioAgeVisible = !isVisitorPreviewMode || privacy.showBiologicalAge;
  const isCountdownVisible = !isVisitorPreviewMode || privacy.showCountdownTime;

  const isAllPublic = privacy.showChronologicalAge && privacy.showBiologicalAge && privacy.showCountdownTime;
  const isAnyAuthorized = privacy.showChronologicalAge || privacy.showBiologicalAge || privacy.showCountdownTime;

  // Calculate net gained/deducted time in DAYS ONLY (只显示天数)
  const isGainPositive = countdown.netGainSeconds >= 0;
  const absDays = Math.floor(Math.abs(countdown.netGainSeconds) / 86400);
  const sign = isGainPositive ? '+' : '-';
  const gainDaysText = `${sign}${absDays} ${t.daysUnit}`;

  // Localize default seeker name dynamically when toggling English/Chinese
  const localizedName = useMemo(() => {
    const rawName = (profile.name || '').trim();
    if (!rawName || rawName === '探索者 (Seeker)' || rawName === '探索者' || rawName === 'Seeker') {
      return language === 'zh' ? '探索者' : 'Seeker';
    }
    if (rawName.includes('探索者') && rawName.includes('Seeker')) {
      return language === 'zh' ? '探索者' : 'Seeker';
    }
    if (rawName.includes('探索者') && language === 'en') {
      return rawName.replace(/探索者/g, 'Seeker').replace(/\(Seeker\)/g, '').trim();
    }
    return rawName;
  }, [profile.name, language]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[var(--bd-card)] border border-[var(--bd-border)] shadow-2xl backdrop-blur-xl px-4 pt-3 pb-5 sm:px-7 sm:pt-3.5 sm:pb-7">
      
      {/* Visitor Preview Mode Active Banner */}
      {isVisitorPreviewMode && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span className="font-semibold">
              {language === 'zh' 
                ? '当前处于「他人访问视角」预览模式：直观测试他人查看您主页时的隐私授权拦截效果（未授权信息将完全保密）' 
                : 'Previewing as another visitor: Testing privacy authorization view'}
            </span>
          </div>
          <button
            onClick={onToggleVisitorPreview}
            className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors cursor-pointer self-end sm:self-auto shrink-0"
          >
            {language === 'zh' ? '退出他人视角' : 'Exit Preview'}
          </button>
        </div>
      )}

      {/* Background radial accent glow */}
      <div className="absolute top-0 right-1/4 -mt-12 w-96 h-96 bg-[var(--bd-accent-soft)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Profile & Target Lifespan Header */}
      <div className="pb-4 sm:pb-5 border-b border-[var(--bd-border)] relative">
        
        {/* Status Indicators & Authorization Badge in single line with matching size (云端已连通, 680币, 穿戴同步, 仅本人) */}
        <div className="flex items-center justify-end flex-wrap gap-2 mb-2">
          {/* 1. 云端已连通 */}
          <div 
            title={isDbConnected ? (language === 'zh' ? "云端 Firestore 数据库已成功联通并持久化" : "Cloud database connected") : t.dbReady}
            className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bd-accent-soft)] border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold whitespace-nowrap shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-[var(--bd-accent)] shrink-0" />
            <span className="whitespace-nowrap">{isDbConnected ? (language === 'zh' ? '云端已连通' : 'Cloud Connected') : (language === 'zh' ? '云端就绪' : 'Cloud Ready')}</span>
          </div>

          {/* 2. 680 币 */}
          <button
            type="button"
            onClick={onOpenTimeBank}
            title={language === 'zh' ? `生命时间银行：结余 ${walletBalance} 币，年化 4.2% 计息中` : `Life-Coins: ${walletBalance}`}
            className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-semibold whitespace-nowrap hover:bg-amber-500/25 transition-all cursor-pointer shadow-xs"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap font-mono-num">{walletBalance} 币</span>
          </button>

          {/* 3. 穿戴同步 */}
          <button
            type="button"
            onClick={onOpenWearables}
            title={language === 'zh' ? "智能穿戴同步：Apple Watch / Garmin / Whoop (已连接实时流)" : "Wearable Sync"}
            className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold whitespace-nowrap hover:bg-cyan-500/25 transition-all cursor-pointer shadow-xs"
          >
            <Watch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap">{language === 'zh' ? '穿戴同步' : 'Wearable Sync'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          </button>

          {/* 4. 仅本人 (权限控制) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-semibold whitespace-nowrap hover:bg-amber-500/25 hover:border-amber-400 transition-all cursor-pointer shadow-xs group shrink-0"
            title={language === 'zh' ? "访问此功能需本人授权，仅本人可见（点击设置展示范围）" : "Access requires authorization, restricted to myself"}
          >
            {isAllPublic ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-[var(--bd-accent)] shrink-0" />
                <span className="text-emerald-300 whitespace-nowrap">{language === 'zh' ? '已授权公开' : 'Public'}</span>
              </>
            ) : isAnyAuthorized ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-105 transition-transform shrink-0" />
                <span className="whitespace-nowrap">{language === 'zh' ? '部分授权' : 'Partial Auth'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-105 transition-transform shrink-0" />
                <span className="whitespace-nowrap">{language === 'zh' ? '仅本人' : 'Private to Me'}</span>
              </>
            )}
          </button>
        </div>

        {/* The Two Main Modules: Box 1 (Left) and Box 2 (Right) Vertically Aligned (上下对齐) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Box 1: User Identity, Lifespan Target & Actual Age */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onOpenTheme || onOpenProfile}
              className="relative group w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-transform hover:scale-105 active:scale-95 text-left shrink-0"
              title={language === 'zh' ? "点击换肤与换头像" : "Click to change theme & avatar"}
            >
              <div className="w-full h-full rounded-[14px] overflow-hidden flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-xl sm:text-2xl">🧬</span>
                )}
              </div>

              {/* Hover overlay with clear prompt */}
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-[14px] transition-all">
                <Palette className="w-3.5 h-3.5 text-amber-300 mb-0.5" />
                <span className="text-[9px] text-white font-bold leading-tight">{language === 'zh' ? '换肤/换头像' : 'Theme'}</span>
              </div>

              {/* Small corner badge indicating Theme & Avatar feature */}
              <div 
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--bd-card)] border border-emerald-400/80 flex items-center justify-center text-amber-300 shadow-md group-hover:rotate-12 transition-transform"
                title={language === 'zh' ? "点击换肤与换头像" : "Theme & Avatar"}
              >
                <Palette className="w-2.5 h-2.5 text-amber-400" />
              </div>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-[var(--bd-text)] tracking-tight">
                  {localizedName}{t.heroTitleSuffix}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bd-chip)] text-[var(--bd-text)] border border-[var(--bd-border)]">
                  {t.targetGoalPrefix}{profile.targetAge} {t.yearsUnit}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--bd-muted)] mt-1">
                <span>
                  {t.chronologicalAgeLabel}: {isChronologicalAgeVisible ? (
                    <strong className="text-[var(--bd-text)]">{countdown.chronologicalAge} {t.yearsUnit}</strong>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-amber-300 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px]">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{language === 'zh' ? '需本人授权' : 'Requires Auth'}</span>
                    </span>
                  )}
                </span>
                {unlockedMedalsCount !== undefined && (
                  <>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={onOpenMedals || onOpenProfile}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all font-semibold text-[11px] cursor-pointer shadow-xs"
                      title={language === 'zh' ? "点击在个人资料中查看已点亮的生命勋章" : "Click to view Life Medals in Profile"}
                    >
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>
                        {language === 'zh' ? `${unlockedMedalsCount} 枚生命勋章` : `${unlockedMedalsCount} Life Medals`}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Box 2: Biological Age & Health Offset Badge (Right-aligned, vertically aligned with Box 1) */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center space-x-3 px-3.5 py-2 rounded-2xl bg-[var(--bd-card)] border border-[var(--bd-border)] hover:border-[var(--bd-accent)] cursor-pointer transition-all group shadow-sm shrink-0 self-start sm:self-center"
          >
            <div className={`p-2 rounded-xl shrink-0 ${isBioYounger ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'bg-amber-500/10 text-amber-600'}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--bd-sub)]">{t.biologicalAgeLabel}</div>
              {isBioAgeVisible ? (
                <div className="flex items-center space-x-1.5 font-bold text-sm mt-0.5">
                  <span className="text-[var(--bd-text)] font-mono-num">{countdown.biologicalAge} {t.yearsUnit}</span>
                  <span className={`text-xs px-1.5 py-0.2 rounded font-medium ${
                    isBioYounger ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'bg-amber-500/15 text-amber-700'
                  }`}>
                    {isBioYounger ? `${t.youngerBy} ${Math.abs(profile.biologicalAgeOffset)} ${t.yearsUnit}` : `${t.olderBy} ${profile.biologicalAgeOffset} ${t.yearsUnit}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-amber-300 text-xs font-semibold mt-0.5">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>{language === 'zh' ? '需本人授权查看' : 'Requires Auth'}</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--bd-muted)] group-hover:text-[var(--bd-text)] transition-colors ml-1" />
          </div>

        </div>
      </div>

      {/* Main Focus: The Live Remaining Days Countdown (主界面倒计时显示天数) */}
      <div className="py-4 sm:py-6 relative">
        
        {/* Centered Longevity Gain/Loss Pill Badge */}
        <div className="flex justify-center mb-3">
          <button
            type="button"
            onClick={onOpenAudit}
            title={language === 'zh' ? '点击追溯具体做对了哪些事，增加了多少寿命，查看科学逻辑与成就解析' : 'Click to trace positive actions & calculation logic'}
            className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all shadow-sm active:scale-98 group ${
              isGainPositive
                ? 'bg-[var(--bd-accent-soft)] border-emerald-500/30 text-[var(--bd-accent-strong)] hover:border-emerald-400 hover:shadow-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 hover:border-rose-400 hover:shadow-rose-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isGainPositive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
            <span className="text-[var(--bd-text)] font-normal">
              {language === 'zh' ? '寿命增减:' : 'Gain/Loss:'}
            </span>
            <span className="font-mono-num font-bold text-[var(--bd-text)] group-hover:text-[var(--bd-accent-strong)] transition-colors">
              {gainDaysText}
            </span>
            <History className="w-3.5 h-3.5 text-[var(--bd-sub)] group-hover:text-[var(--bd-text)] transition-colors" />
          </button>
        </div>

        {/* Massive ticking Days display OR Protected Lock State */}
        {isCountdownVisible ? (
          <div className="text-center font-mono-num font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm select-all">
            {countdown.remainingDays.toLocaleString()}
            <span className="text-2xl sm:text-4xl lg:text-5xl text-[var(--bd-accent-strong)] ml-3 font-semibold">{t.daysUnit}</span>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="inline-flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[var(--bd-chip)] border border-amber-500/30 shadow-xl max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--bd-text)] mb-1.5">
                {language === 'zh' ? '生命倒计时时间已加密保护' : 'Countdown Clock Protected'}
              </h3>
              <p className="text-xs text-amber-300/90 max-w-xs leading-relaxed">
                {language === 'zh' 
                  ? '该用户未授权公开其生命倒计时剩余时间，仅用户本人授权后其他用户方可查看' 
                  : 'The user has not authorized public display of their life countdown clock.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.16fr] gap-3.5 sm:gap-4 mt-4">
        
        {/* Metric 1: Remaining Years */}
        <div className="relative group bg-[var(--bd-card)] border border-[var(--bd-border)] hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between text-[var(--bd-sub)] mb-1.5">
            <span className="text-xs font-medium truncate">{t.metricYearsTitle}</span>
            <div className="p-1 rounded-lg bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] shrink-0 ml-1">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono-num font-bold text-xl sm:text-2xl text-[var(--bd-text)]">
            {isCountdownVisible ? (
              <>
                {countdown.remainingYears}
                <span className="text-xs text-[var(--bd-sub)] ml-1 font-normal">{t.yearsUnit}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-amber-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '需本人授权' : 'Protected'}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--bd-sub)] mt-1.5 truncate">
            {isCountdownVisible ? (
              <span>{t.metricYearsSub}: {countdown.totalLifeYears} {t.yearsUnit}</span>
            ) : (
              <span>{language === 'zh' ? '隐私保护中' : 'Private'}</span>
            )}
          </div>
        </div>

        {/* Metric 2: Remaining Months */}
        <div className="relative group bg-[var(--bd-card)] border border-[var(--bd-border)] hover:border-teal-500/40 rounded-2xl p-4 transition-all shadow-lg hover:shadow-teal-500/10">
          <div className="flex items-center justify-between text-[var(--bd-sub)] mb-1.5">
            <span className="text-xs font-medium truncate">{t.metricMonthsTitle}</span>
            <div className="p-1 rounded-lg bg-teal-500/10 text-teal-600 shrink-0 ml-1">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono-num font-bold text-xl sm:text-2xl text-teal-600">
            {isCountdownVisible ? (
              <>
                {Math.floor(countdown.remainingWeeks / 4.33)}
                <span className="text-xs text-[var(--bd-sub)] ml-1 font-normal">{t.monthsUnit}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-amber-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '需本人授权' : 'Protected'}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--bd-sub)] mt-1.5 truncate">
            <span>{t.metricMonthsSub}</span>
          </div>
        </div>

        {/* Metric 3: Remaining Weeks */}
        <div className="relative group bg-[var(--bd-card)] border border-[var(--bd-border)] hover:border-cyan-500/40 rounded-2xl p-4 transition-all shadow-lg hover:shadow-cyan-500/10">
          <div className="flex items-center justify-between text-[var(--bd-sub)] mb-1.5">
            <span className="text-xs font-medium truncate">{t.metricWeeksTitle}</span>
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0 ml-1">
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono-num font-bold text-xl sm:text-2xl text-cyan-600">
            {isCountdownVisible ? (
              <>
                {countdown.remainingWeeks.toLocaleString()}
                <span className="text-xs text-[var(--bd-sub)] ml-1 font-normal">{t.weeksUnit}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-amber-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '需本人授权' : 'Protected'}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--bd-sub)] mt-1.5 truncate">
            <span>{t.metricWeeksSub}</span>
          </div>
        </div>

        {/* Metric 4: Live Countdown Seconds */}
        <div className="col-span-2 lg:col-span-1 relative group bg-[var(--bd-card)] border border-[var(--bd-border)] hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between text-[var(--bd-sub)] mb-1.5">
            <span className="text-xs font-medium">{t.metricSecondsTitle}</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="p-1 rounded-lg bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]">
                <Timer className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="font-mono-num font-bold text-xl sm:text-2xl text-[var(--bd-accent)] tracking-tight whitespace-nowrap overflow-x-hidden">
            {isCountdownVisible ? (
              <>
                {countdown.remainingSeconds.toLocaleString()}
                <span className="text-xs text-[var(--bd-sub)] ml-1 font-normal">{t.secondsUnit}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-amber-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '需本人授权' : 'Protected'}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--bd-sub)] mt-1.5 truncate">
            <span>{t.metricSecondsSub}</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator Bar */}
      <div className="mt-6 pt-5 border-t border-[var(--bd-border)]">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[var(--bd-sub)]">{t.remainingLifeLabel}:</span>
            <span className="font-mono-num font-bold text-[var(--bd-accent)]">{(100 - countdown.livedPercentage).toFixed(2)}%</span>
          </div>
          <div className="flex items-center space-x-2 text-[var(--bd-muted)]">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>{t.livedLifeLabel}:</span>
            <span className="font-mono-num font-medium text-[var(--bd-sub)]">{countdown.livedPercentage.toFixed(2)}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-[var(--bd-chip)] rounded-full overflow-hidden p-0.5 border border-[var(--bd-border)]">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 shadow-sm shadow-emerald-500/50"
            style={{ width: `${Math.max(0, Math.min(100, 100 - countdown.livedPercentage))}%` }}
          />
        </div>
      </div>

      {/* Motivational Bottom Ticker */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--bd-muted)] gap-2">
        <div className="flex items-center space-x-2 truncate">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate italic">
            "{systemMotto || t.motivationalQuote}"
          </span>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={onOpenHabits}
            className="text-[var(--bd-accent-strong)] hover:text-emerald-500 font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>{t.checkInBtn}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[var(--bd-text)]">|</span>
          <button 
            onClick={onOpenLedger}
            className="text-cyan-600 hover:text-cyan-500 font-medium flex items-center space-x-1 transition-colors cursor-pointer"
            title={t.timeLedgerTooltip}
          >
            <span>{t.viewLedgerBtn}</span>
          </button>
        </div>
      </div>

    </section>
  );
};
