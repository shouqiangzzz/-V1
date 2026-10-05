import React from 'react';
import { 
  Hourglass, 
  Sparkles, 
  UserCheck, 
  Armchair, 
  Camera, 
  Settings, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  Cloud,
  ClipboardList,
  Palette,
  UserPlus,
  Crown,
  Coins,
  Watch,
  Users,
  Share2
} from 'lucide-react';
import { formatGainLossBadge } from '../services/longevityCalculator';
import { useLanguage } from '../services/i18n';

interface NavbarProps {
  netGainSeconds: number;
  onOpenLedger: () => void;
  onOpenProfile: () => void;
  onOpenFoodScanner: () => void;
  onOpenRules: () => void;
  onOpenOnboarding: () => void;
  onOpenTheme: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  avatarUrl?: string;
  isDbConnected: boolean;
  activeTab: 'clock' | 'habits' | 'sedentary' | 'grid' | 'community';
  setActiveTab: (tab: 'clock' | 'habits' | 'sedentary' | 'grid' | 'community') => void;
  walletBalance?: number;
  onOpenTimeBank?: () => void;
  onOpenWearables?: () => void;
  onOpenContract?: () => void;
  onOpenARShare?: () => void;
  onOpenTimeCapsule?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  netGainSeconds,
  onOpenLedger,
  onOpenProfile,
  onOpenFoodScanner,
  onOpenRules,
  onOpenOnboarding,
  onOpenTheme,
  isAdmin,
  onOpenAdmin,
  avatarUrl,
  isDbConnected,
  activeTab,
  setActiveTab,
  walletBalance = 680,
  onOpenTimeBank,
  onOpenWearables,
  onOpenContract,
  onOpenARShare,
  onOpenTimeCapsule,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const badgeInfo = formatGainLossBadge(netGainSeconds);

  return (
    <header className="sticky top-0 z-40 bg-[var(--bd-nav)] backdrop-blur-md border-b border-[var(--bd-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Title: strictly single-line */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('clock')}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[var(--bd-card)] rounded-[10px] flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-[var(--bd-accent)] animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
          </div>
          <div className="shrink-0 whitespace-nowrap">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--bd-accent-strong)] via-[var(--bd-accent)] to-[var(--bd-accent)] bg-clip-text text-transparent font-mono-num whitespace-nowrap inline-block">
              {t.appName}
            </span>
          </div>
        </div>

        {/* Navigation Tabs: balanced characters on Line 1 & Line 2 */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-[var(--bd-chip)] p-1.5 rounded-xl border border-[var(--bd-border)] shrink-0">
          <button
            onClick={() => setActiveTab('clock')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center leading-snug text-center ${
              activeTab === 'clock'
                ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] shadow-sm border border-emerald-500/30 font-semibold'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]/60'
            }`}
          >
            {language === 'zh' ? (
              <>
                <span className="whitespace-nowrap">生命</span>
                <span className="whitespace-nowrap">主时钟</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Life</span>
                <span className="whitespace-nowrap">Clock</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center leading-snug text-center ${
              activeTab === 'habits'
                ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] shadow-sm border border-emerald-500/30 font-semibold'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]/60'
            }`}
          >
            {language === 'zh' ? (
              <>
                <span className="whitespace-nowrap">20天</span>
                <span className="whitespace-nowrap">习惯挑战</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">20-Day</span>
                <span className="whitespace-nowrap">Habits</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sedentary')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center leading-snug text-center ${
              activeTab === 'sedentary'
                ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] shadow-sm border border-emerald-500/30 font-semibold'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]/60'
            }`}
          >
            {language === 'zh' ? (
              <>
                <span className="whitespace-nowrap">久坐</span>
                <span className="whitespace-nowrap">危害监测</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Sedentary</span>
                <span className="whitespace-nowrap">Monitor</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center leading-snug text-center ${
              activeTab === 'grid'
                ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] shadow-sm border border-emerald-500/30 font-semibold'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]/60'
            }`}
          >
            {language === 'zh' ? (
              <>
                <span className="whitespace-nowrap">生命</span>
                <span className="whitespace-nowrap">周格图</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Life</span>
                <span className="whitespace-nowrap">Grid</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center leading-snug text-center ${
              activeTab === 'community'
                ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)] shadow-sm border border-emerald-500/30 font-semibold'
                : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)]/60'
            }`}
          >
            {language === 'zh' ? (
              <>
                <span className="whitespace-nowrap">健康视界</span>
                <span className="whitespace-nowrap">与社区</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Video &</span>
                <span className="whitespace-nowrap">Community</span>
              </>
            )}
          </button>
        </nav>

        {/* Right Section: Actions & Top-Right Language Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">

          {/* Quick AI Food Camera Button */}
          <button
            onClick={onOpenFoodScanner}
            title={t.foodScannerBtn}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 hover:bg-cyan-100 transition-all text-xs font-medium cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t.foodScannerBtn}</span>
          </button>

          {/* User Registration Button (Requirement: 注册按钮放在 右侧换肤与头像的地方，将换肤与头像功能框去掉) */}
          <button
            onClick={onOpenOnboarding}
            title={language === 'zh' ? "用户注册：支持大陆与海外多元通道（内容设置完全可选）" : "User Registration"}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/15 to-teal-600/15 hover:from-emerald-600/25 hover:to-teal-600/25 border border-emerald-500/40 text-[var(--bd-accent-strong)] transition-all text-xs font-semibold cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[var(--bd-accent)]" />
            <span className="font-medium">{t.onboardingBtn}</span>
          </button>

          {/* User Profile & Health Report Button */}
          <button
            onClick={onOpenProfile}
            title={t.healthProfileBtn}
            className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[var(--bd-card)] border border-[var(--bd-border)] text-[var(--bd-text)] hover:bg-[var(--bd-chip)] transition-all text-xs font-medium cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">{t.healthProfileBtn}</span>
          </button>

          {/* Settings / Rules (Requirement: 将自定义规则的按钮设置 变成一个小齿轮形状，功能暂时不变) */}
          <button
            onClick={onOpenRules}
            title={t.rulesBtn}
            className="p-1.5 rounded-lg bg-[var(--bd-card)] border border-[var(--bd-border)] text-[var(--bd-sub)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-chip)] transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[var(--bd-sub)] hover:rotate-45 transition-transform" />
          </button>

          {/* Top-Right Language Switcher */}
          <div 
            className="flex items-center bg-[var(--bd-card)] border border-[var(--bd-border)] rounded-xl p-0.5 text-xs font-semibold shrink-0 shadow-sm ml-1"
            title={language === 'zh' ? '切换语言 (当前：中文)' : 'Switch Language (Current: English)'}
          >
            <button
              type="button"
              onClick={() => setLanguage('zh')}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                language === 'zh'
                  ? 'bg-emerald-500 text-white font-bold shadow-xs'
                  : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)]'
              }`}
            >
              中
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-emerald-500 text-white font-bold shadow-xs'
                  : 'text-[var(--bd-sub)] hover:text-[var(--bd-text)]'
              }`}
            >
              EN
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-[var(--bd-border)] px-2 py-1.5 overflow-x-auto space-x-1 bg-[var(--bd-card)]">
        <button
          onClick={() => setActiveTab('clock')}
          className={`flex-1 min-w-[70px] py-1 text-center text-xs rounded-md ${
            activeTab === 'clock' ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'text-[var(--bd-sub)]'
          }`}
        >
          主时钟
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex-1 min-w-[64px] py-1 text-center text-xs rounded-md ${
            activeTab === 'habits' ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'text-[var(--bd-sub)]'
          }`}
        >
          习惯打卡
        </button>
        <button
          onClick={() => setActiveTab('sedentary')}
          className={`flex-1 min-w-[64px] py-1 text-center text-xs rounded-md ${
            activeTab === 'sedentary' ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'text-[var(--bd-sub)]'
          }`}
        >
          久坐监测
        </button>
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 min-w-[64px] py-1 text-center text-xs rounded-md ${
            activeTab === 'grid' ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'text-[var(--bd-sub)]'
          }`}
        >
          生命格子
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 min-w-[64px] py-1 text-center text-xs rounded-md ${
            activeTab === 'community' ? 'bg-[var(--bd-accent-soft)] text-[var(--bd-accent-strong)]' : 'text-[var(--bd-sub)]'
          }`}
        >
          社区
        </button>
      </div>
    </header>
  );
};
