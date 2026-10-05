import React, { useState, useEffect } from 'react';
import { 
  loadUserProfile, 
  saveUserProfile, 
  loadAdjustments, 
  saveAdjustments, 
  loadHabits, 
  saveHabits, 
  loadSedentaryState, 
  saveSedentaryState, 
  loadMeals, 
  saveMeals, 
  loadRules, 
  saveRules 
} from './services/storage';
import { calculateLifeCountdown } from './services/longevityCalculator';
import { 
  UserProfile, 
  TimeAdjustment, 
  HabitTrackerItem, 
  SedentaryMonitorState, 
  MealAnalysis, 
  LongevityRuleConfig,
  AchievementBadge,
  ExpertLectureVideo,
  CommunityPost,
  MerchantCertification,
  PostAppeal
} from './types';
import { loadAchievements, evaluateAchievements } from './services/achievements';
import { 
  loadExpertVideos, 
  saveExpertVideos, 
  loadCommunityPosts, 
  saveCommunityPosts, 
  loadMerchantCert, 
  saveMerchantCert, 
  loadFollowedUserIds, 
  saveFollowedUserIds 
} from './services/communityStorage';
import { AchievementCelebrationModal } from './components/AchievementCelebrationModal';
import { HealthCommunityHub } from './components/community/HealthCommunityHub';
import { PostUploadModal } from './components/community/PostUploadModal';
import { PostAppealModal } from './components/community/PostAppealModal';
import { MerchantCertificationModal } from './components/community/MerchantCertificationModal';
import { AdminVideoUploadModal } from './components/community/AdminVideoUploadModal';

// Components
import { Navbar } from './components/Navbar';
import { LifeClockHero } from './components/LifeClockHero';
import { HabitsTracker } from './components/HabitsTracker';
import { SedentaryMonitor } from './components/SedentaryMonitor';
import { LifeGridView } from './components/LifeGridView';
import { FoodScannerModal } from './components/FoodScannerModal';
import { HealthProfileModal } from './components/HealthProfileModal';
import { TimeLedgerModal } from './components/TimeLedgerModal';
import { RulesCustomizerModal } from './components/RulesCustomizerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { UI_STYLES } from './services/themeHelper';
import { AdminModal } from './components/AdminModal';
import { LongevityAuditModal } from './components/LongevityAuditModal';
import { DEFAULT_THEME_CONFIG } from './services/storage';
import { useLanguage } from './services/i18n';
import { 
  testConnection, 
  syncUserProfileToFirestore,
  fetchSystemConfig,
  DEFAULT_SYSTEM_CONFIG,
  BOOTSTRAP_ADMIN_EMAIL
} from './services/firebase';
import { SystemConfig } from './types';

// 5-Dimension Innovation Upgrades
import { 
  loadWallet, 
  saveWallet, 
  loadContracts, 
  saveContracts, 
  loadWearables, 
  saveWearables, 
  loadTimeCapsules, 
  saveTimeCapsules 
} from './services/innovationsStorage';
import { HealthContract, LifeCoinWallet, WearableDevice, TimeCapsule } from './types/innovations';
import { HealthContractModal } from './components/innovations/HealthContractModal';
import { ARShareCardModal } from './components/innovations/ARShareCardModal';
import { WearableSyncModal } from './components/innovations/WearableSyncModal';
import { LifeCoinBankModal } from './components/innovations/LifeCoinBankModal';
import { TimeCapsuleModal } from './components/innovations/TimeCapsuleModal';
import { ExpertConsultationModal } from './components/innovations/ExpertConsultationModal';
import { LongevityCopilotWidget } from './components/innovations/LongevityCopilotWidget';

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  // Primary persistent states
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [adjustments, setAdjustments] = useState<TimeAdjustment[]>(loadAdjustments);
  const [habits, setHabits] = useState<HabitTrackerItem[]>(loadHabits);
  const [sedentaryState, setSedentaryState] = useState<SedentaryMonitorState>(loadSedentaryState);
  const [meals, setMeals] = useState<MealAnalysis[]>(loadMeals);
  const [rules, setRules] = useState<LongevityRuleConfig[]>(loadRules);

  // 5-Dimension Innovation States
  const [wallet, setWallet] = useState<LifeCoinWallet>(loadWallet);
  const [contracts, setContracts] = useState<HealthContract[]>(loadContracts);
  const [wearables, setWearables] = useState<WearableDevice[]>(loadWearables);
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>(loadTimeCapsules);

  // Innovation Modals
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isARShareOpen, setIsARShareOpen] = useState(false);
  const [isWearableOpen, setIsWearableOpen] = useState(false);
  const [isTimeBankOpen, setIsTimeBankOpen] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'clock' | 'habits' | 'sedentary' | 'grid' | 'community'>('clock');

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'indicators' | 'report' | 'medals'>('indicators');
  const [isFoodScannerOpen, setIsFoodScannerOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'privacy' | 'rules'>('privacy');
  const [isVisitorPreviewMode, setIsVisitorPreviewMode] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [uiStyleId, setUiStyleId] = useState<string>(() => localStorage.getItem('bd_ui_style') || 'lavender');
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  // Life Medals & Achievements state
  const [achievements, setAchievements] = useState<AchievementBadge[]>(loadAchievements);
  const [celebratingBadge, setCelebratingBadge] = useState<AchievementBadge | null>(null);

  // Community, Video & Merchant states
  const [expertVideos, setExpertVideos] = useState<ExpertLectureVideo[]>(loadExpertVideos);
  const [posts, setPosts] = useState<CommunityPost[]>(loadCommunityPosts);
  const [merchantCert, setMerchantCert] = useState<MerchantCertification>(loadMerchantCert);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(loadFollowedUserIds);

  // Community Modals
  const [isUploadPostOpen, setIsUploadPostOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealTargetPost, setAppealTargetPost] = useState<CommunityPost | null>(null);
  const [isMerchantCertOpen, setIsMerchantCertOpen] = useState(false);
  const [isAdminUploadVideoOpen, setIsAdminUploadVideoOpen] = useState(false);

  // Check if current user is Administrator
  const isAdmin = 
    profile.role === 'admin' || 
    profile.accountIdentifier === BOOTSTRAP_ADMIN_EMAIL ||
    profile.accountIdentifier?.toLowerCase() === 'admin';

  // Initialize and test Firebase connection and load global system configuration
  useEffect(() => {
    testConnection().then((ok) => {
      setIsDbConnected(ok);
    });
    fetchSystemConfig().then((cfg) => {
      setSystemConfig(cfg);
    }).catch(console.error);
  }, []);

  // Real-time ticking timestamp
  const [nowMs, setNowMs] = useState(Date.now());

  // Second-by-second live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live countdown metrics
  const countdown = calculateLifeCountdown(profile, adjustments, nowMs);

  // Handlers for state updates with localStorage sync & Firestore sync
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
    syncUserProfileToFirestore(newProfile).catch(console.error);
  };

  const handleCompleteOnboarding = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
    syncUserProfileToFirestore(newProfile).catch(console.error);
  };

  const handleAddAdjustment = (newAdj: TimeAdjustment) => {
    const updated = [...adjustments, newAdj];
    setAdjustments(updated);
    saveAdjustments(updated);
  };

  const handleUpdateHabits = (newHabits: HabitTrackerItem[]) => {
    setHabits(newHabits);
    saveHabits(newHabits);

    // Evaluate achievement unlocks upon habit streak changes
    const { updatedBadges, newlyUnlocked } = evaluateAchievements(newHabits, countdown, profile, achievements);
    setAchievements(updatedBadges);
    if (newlyUnlocked.length > 0) {
      setCelebratingBadge(newlyUnlocked[0]);
    }
  };

  // Keep achievements in sync when net gain seconds or biological age updates
  useEffect(() => {
    const { updatedBadges, newlyUnlocked } = evaluateAchievements(habits, countdown, profile, achievements);
    setAchievements(updatedBadges);
    if (newlyUnlocked.length > 0) {
      setCelebratingBadge(newlyUnlocked[0]);
    }
  }, [countdown.netGainSeconds, profile.biologicalAgeOffset]);

  const handleUpdateSedentary = (newState: SedentaryMonitorState) => {
    setSedentaryState(newState);
    saveSedentaryState(newState);
  };

  const handleSaveMeal = (newMeal: MealAnalysis) => {
    const updated = [newMeal, ...meals];
    setMeals(updated);
    saveMeals(updated);
  };

  const handleSaveRules = (newRules: LongevityRuleConfig[]) => {
    setRules(newRules);
    saveRules(newRules);
  };

  // Community action handlers
  const handleToggleFollow = (authorId: string) => {
    const updated = followedUserIds.includes(authorId)
      ? followedUserIds.filter(id => id !== authorId)
      : [...followedUserIds, authorId];
    setFollowedUserIds(updated);
    saveFollowedUserIds(updated);
  };

  const handleLikePost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: nextLiked,
          likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
        };
      }
      return p;
    });
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  const handleAddComment = (postId: string, text: string) => {
    const targetPost = posts.find(p => p.id === postId);
    const isFan = targetPost ? followedUserIds.includes(targetPost.authorId) : false;
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c_${Date.now()}`,
              authorId: profile.id,
              authorName: profile.name,
              authorAvatar: profile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=LifeSeeker88',
              createdAt: Date.now(),
              text,
              isLifeFan: isFan,
            }
          ]
        };
      }
      return p;
    });
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  // 5-Dimension Innovation Upgrades Handlers
  const handleUpdateWallet = (newW: LifeCoinWallet) => {
    setWallet(newW);
    saveWallet(newW);
  };
  const handleUpdateContracts = (newC: HealthContract[]) => {
    setContracts(newC);
    saveContracts(newC);
  };
  const handleUpdateWearables = (newW: WearableDevice[]) => {
    setWearables(newW);
    saveWearables(newW);
  };
  const handleUpdateTimeCapsules = (newC: TimeCapsule[]) => {
    setTimeCapsules(newC);
    saveTimeCapsules(newC);
  };

  const handleAddPost = (newPost: CommunityPost) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  const handleAdminApprovePost = (postId: string) => {
    const updated = posts.map(p => p.id === postId ? { ...p, moderationStatus: 'approved' as const, moderationReason: undefined } : p);
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  const handleAdminRejectPost = (postId: string, reason: string) => {
    const updated = posts.map(p => p.id === postId ? { ...p, moderationStatus: 'rejected' as const, moderationReason: reason } : p);
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  const handleAdminResolveAppeal = (postId: string, approved: boolean, notes: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          moderationStatus: approved ? ('approved' as const) : ('rejected' as const),
          appeal: p.appeal ? {
            ...p.appeal,
            status: approved ? ('resolved_approved' as const) : ('resolved_rejected' as const),
            adminNotes: notes,
            resolvedAt: Date.now(),
          } : undefined
        };
      }
      return p;
    });
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  const handleSaveMerchantCert = (updatedCert: MerchantCertification) => {
    setMerchantCert(updatedCert);
    saveMerchantCert(updatedCert);
  };

  const handleAddExpertVideo = (newVid: ExpertLectureVideo) => {
    const updated = [newVid, ...expertVideos];
    setExpertVideos(updated);
    saveExpertVideos(updated);
  };

  const handleInitiateAppealForPost = (post: CommunityPost) => {
    setAppealTargetPost(post);
    setIsAppealModalOpen(true);
  };

  const handleConfirmAppeal = (postId: string, appeal: PostAppeal) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          appeal,
        };
      }
      return p;
    });
    setPosts(updated);
    saveCommunityPosts(updated);
  };

  const handleToggleBioAgeAuth = () => {
    const updated: UserProfile = {
      ...profile,
      authorizeBioAgeToOthers: !profile.authorizeBioAgeToOthers,
    };
    handleSaveProfile(updated);
  };

  // Active theme configuration
  const currentTheme = profile.themeConfig || DEFAULT_THEME_CONFIG;
  // Active UI style (10 presets)
  const uiStyle = UI_STYLES.find(s => s.id === uiStyleId) || UI_STYLES[5];

  return (
    <div 
      className="min-h-screen text-[var(--bd-text)] flex flex-col selection:bg-[var(--bd-accent)] selection:text-white relative transition-colors duration-500"
      style={{
        backgroundColor: uiStyle.vars.bg,
        '--bd-bg': uiStyle.vars.bg,
        '--bd-bg-soft': uiStyle.vars.bgSoft,
        '--bd-card': uiStyle.vars.card,
        '--bd-border': uiStyle.vars.border,
        '--bd-text': uiStyle.vars.text,
        '--bd-sub': uiStyle.vars.sub,
        '--bd-muted': uiStyle.vars.muted,
        '--bd-accent': uiStyle.vars.accent,
        '--bd-accent-strong': uiStyle.vars.accentStrong,
        '--bd-accent-soft': uiStyle.vars.accentSoft,
        '--bd-nav': uiStyle.vars.nav,
        '--bd-nav-border': uiStyle.vars.navBorder,
        '--bd-chip': uiStyle.vars.chip,
      } as any}
    >
      {/* Ambient background atmosphere layer */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-700 -z-10"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% -10%, ${uiStyle.vars.bgSoft} 0%, transparent 80%), radial-gradient(ellipse 70% 50% at 90% 90%, ${uiStyle.vars.accent}12 0%, transparent 60%)`,
          opacity: currentTheme.blurOpacity ?? 0.85
        }}
      />

      {/* Optional Background Pattern Texture */}
      {currentTheme.backgroundPattern === 'grid' && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-20 -z-10"
          style={{
            backgroundImage: `linear-gradient(to right, ${currentTheme.customAccentColor}22 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.customAccentColor}22 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {currentTheme.backgroundPattern === 'stars' && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-30 -z-10"
          style={{
            backgroundImage: `radial-gradient(${currentTheme.customAccentColor} 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px, 96px 96px',
            backgroundPosition: '0 0, 24px 24px',
          }}
        />
      )}

      {/* Global System Announcement Banner (Configured by Administrator) */}
      {systemConfig.bannerNotice && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-xs text-amber-200/90 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{systemConfig.bannerNotice}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar with the prominent "+X天 Y秒" Gain/Loss Annotation */}
      <Navbar
        netGainSeconds={countdown.netGainSeconds}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFoodScanner={() => setIsFoodScannerOpen(true)}
        onOpenRules={() => {
          setSettingsInitialTab('privacy');
          setIsRulesOpen(true);
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenTheme={() => setIsThemeOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminOpen(true)}
        avatarUrl={profile.avatarUrl}
        isDbConnected={isDbConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={wallet.balance}
        onOpenTimeBank={() => setIsTimeBankOpen(true)}
        onOpenWearables={() => setIsWearableOpen(true)}
        onOpenContract={() => setIsContractOpen(true)}
        onOpenARShare={() => setIsARShareOpen(true)}
        onOpenTimeCapsule={() => setIsTimeCapsuleOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 sm:pt-4 sm:pb-8">
        
        {/* Core Showpiece: The Life Clock Hero Countdown is visible across views or at top */}
        <LifeClockHero
          countdown={countdown}
          profile={profile}
          systemMotto={systemConfig.systemMotto}
          onOpenProfile={() => {
            setProfileInitialTab('indicators');
            setIsProfileOpen(true);
          }}
          onOpenLedger={() => setIsLedgerOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenHabits={() => setActiveTab('habits')}
          onOpenTheme={() => setIsThemeOpen(true)}
          unlockedMedalsCount={achievements.filter(a => a.unlocked).length}
          onOpenMedals={() => {
            setProfileInitialTab('medals');
            setIsProfileOpen(true);
          }}
          onOpenSettings={() => {
            setSettingsInitialTab('privacy');
            setIsRulesOpen(true);
          }}
          isVisitorPreviewMode={isVisitorPreviewMode}
          onToggleVisitorPreview={() => setIsVisitorPreviewMode(prev => !prev)}
          isDbConnected={isDbConnected}
          walletBalance={wallet.balance}
          onOpenTimeBank={() => setIsTimeBankOpen(true)}
          onOpenWearables={() => setIsWearableOpen(true)}
        />

        {/* Dynamic Tab Content */}
        {activeTab === 'clock' && (
          <div className="space-y-8">
            {/* Quick Habits Preview */}
            <div className="pt-2">
              <HabitsTracker
                habits={habits}
                profile={profile}
                onUpdateHabits={handleUpdateHabits}
                onAddAdjustment={handleAddAdjustment}
                onOpenFoodScanner={() => setIsFoodScannerOpen(true)}
                onOpenSedentary={() => setActiveTab('sedentary')}
                onOpenRules={() => setIsRulesOpen(true)}
                onOpenContract={() => setIsContractOpen(true)}
                onOpenARShare={() => setIsARShareOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="space-y-6">
            <HabitsTracker
              habits={habits}
              profile={profile}
              onUpdateHabits={handleUpdateHabits}
              onAddAdjustment={handleAddAdjustment}
              onOpenFoodScanner={() => setIsFoodScannerOpen(true)}
              onOpenSedentary={() => setActiveTab('sedentary')}
              onOpenRules={() => setIsRulesOpen(true)}
              onOpenContract={() => setIsContractOpen(true)}
              onOpenARShare={() => setIsARShareOpen(true)}
            />
          </div>
        )}

        {activeTab === 'sedentary' && (
          <div className="space-y-6">
            <SedentaryMonitor
              state={sedentaryState}
              profile={profile}
              onUpdateState={handleUpdateSedentary}
              onAddAdjustment={handleAddAdjustment}
            />
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="space-y-6">
            <LifeGridView
              countdown={countdown}
              profile={profile}
            />
          </div>
        )}

        {/* Section 7 Community Hub is displayed in community tab or at the bottom */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <HealthCommunityHub
              expertVideos={expertVideos}
              posts={posts}
              currentUser={profile}
              isAdmin={isAdmin}
              followedUserIds={followedUserIds}
              merchantCert={merchantCert}
              onToggleFollow={handleToggleFollow}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onOpenUploadPost={() => setIsUploadPostOpen(true)}
              onOpenUploadVideoAdmin={() => setIsAdminUploadVideoOpen(true)}
              onOpenMerchantCert={() => setIsMerchantCertOpen(true)}
              onOpenAppealModal={handleInitiateAppealForPost}
              onAdminApprovePost={handleAdminApprovePost}
              onAdminRejectPost={handleAdminRejectPost}
              onOpenConsultation={() => setIsConsultationOpen(true)}
              onOpenContract={() => setIsContractOpen(true)}
              onOpenARShare={() => setIsARShareOpen(true)}
              onOpenTimeBank={() => setIsTimeBankOpen(true)}
            />
          </div>
        )}

        {/* Section 7 is also appended at bottom of main clock view for direct continuous scrolling */}
        {activeTab === 'clock' && (
          <div className="mt-10 sm:mt-14">
          <HealthCommunityHub
            expertVideos={expertVideos}
            posts={posts}
            currentUser={profile}
            isAdmin={isAdmin}
            followedUserIds={followedUserIds}
            merchantCert={merchantCert}
            onToggleFollow={handleToggleFollow}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onOpenUploadPost={() => setIsUploadPostOpen(true)}
            onOpenUploadVideoAdmin={() => setIsAdminUploadVideoOpen(true)}
            onOpenMerchantCert={() => setIsMerchantCertOpen(true)}
            onOpenAppealModal={handleInitiateAppealForPost}
            onAdminApprovePost={handleAdminApprovePost}
            onAdminRejectPost={handleAdminRejectPost}
            onOpenConsultation={() => setIsConsultationOpen(true)}
            onOpenContract={() => setIsContractOpen(true)}
            onOpenARShare={() => setIsARShareOpen(true)}
            onOpenTimeBank={() => setIsTimeBankOpen(true)}
          />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-700 font-mono-num">{t.appName}</span>
            <span>·</span>
            <span>{t.footerSlogan}</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-slate-500">{t.footerBenchmark}</span>
            <span>·</span>
            <button 
              onClick={() => setIsRulesOpen(true)} 
              className="text-emerald-600 hover:underline cursor-pointer"
            >
              {t.footerRulesConfig}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Portals */}
      <HealthProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onAddAdjustment={handleAddAdjustment}
        achievements={achievements}
        initialSubTab={profileInitialTab}
        adjustments={adjustments}
        habits={habits}
      />

      <FoodScannerModal
        isOpen={isFoodScannerOpen}
        onClose={() => setIsFoodScannerOpen(false)}
        profile={profile}
        onSaveMeal={handleSaveMeal}
        onAddAdjustment={handleAddAdjustment}
      />

      <TimeLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        adjustments={adjustments}
        netGainSeconds={countdown.netGainSeconds}
        onAddManualAdjustment={handleAddAdjustment}
      />

      <RulesCustomizerModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={rules}
        profile={profile}
        onSaveRules={handleSaveRules}
        onSaveProfile={handleSaveProfile}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminOpen(true)}
        initialTab={settingsInitialTab}
        isVisitorPreviewMode={isVisitorPreviewMode}
        onToggleVisitorPreview={() => setIsVisitorPreviewMode(prev => !prev)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={profile}
        onCompleteProfile={handleCompleteOnboarding}
        onAddAdjustment={handleAddAdjustment}
      />

      <ThemeCustomizerModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        uiStyleId={uiStyleId}
        onSelectStyle={(id) => { setUiStyleId(id); localStorage.setItem('bd_ui_style', id); }}
      />

      {/* Administrator System Authority Console */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        systemConfig={systemConfig}
        onUpdateSystemConfig={(newCfg) => setSystemConfig(newCfg)}
        currentProfile={profile}
        communityPosts={posts}
        onAdminApprovePost={handleAdminApprovePost}
        onAdminRejectPost={handleAdminRejectPost}
        onAdminResolveAppeal={handleAdminResolveAppeal}
        merchantCert={merchantCert}
      />

      {/* User Post Upload Modal */}
      <PostUploadModal
        isOpen={isUploadPostOpen}
        onClose={() => setIsUploadPostOpen(false)}
        currentUser={profile}
        merchantCert={merchantCert}
        onOpenMerchantCert={() => setIsMerchantCertOpen(true)}
        onAddPost={handleAddPost}
        onInitiateAppealForPost={handleInitiateAppealForPost}
      />

      {/* User Appeal Modal */}
      <PostAppealModal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
        post={appealTargetPost}
        onConfirmAppeal={handleConfirmAppeal}
      />

      {/* Merchant Certification & Deposit Modal */}
      <MerchantCertificationModal
        isOpen={isMerchantCertOpen}
        onClose={() => setIsMerchantCertOpen(false)}
        cert={merchantCert}
        onSaveCert={handleSaveMerchantCert}
      />

      {/* Admin Expert Video Upload Modal */}
      <AdminVideoUploadModal
        isOpen={isAdminUploadVideoOpen}
        onClose={() => setIsAdminUploadVideoOpen(false)}
        onAddVideo={handleAddExpertVideo}
      />

      {/* Longevity Gain Logic & Positive Action Audit Modal */}
      <LongevityAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        adjustments={adjustments}
        countdown={countdown}
        habits={habits}
        profile={profile}
        onAddManualAdjustment={handleAddAdjustment}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsAuditOpen(false);
        }}
      />

      {/* Achievement Unlock Celebration Modal */}
      <AchievementCelebrationModal
        badge={celebratingBadge}
        onClose={() => setCelebratingBadge(null)}
        onViewProfile={() => {
          setProfileInitialTab('medals');
          setIsProfileOpen(true);
        }}
      />

      {/* 5-Dimension Innovation Modals */}
      <HealthContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        contracts={contracts}
        onUpdateContracts={handleUpdateContracts}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
      />

      <ARShareCardModal
        isOpen={isARShareOpen}
        onClose={() => setIsARShareOpen(false)}
        profile={profile}
        netGainSeconds={countdown.netGainSeconds}
      />

      <WearableSyncModal
        isOpen={isWearableOpen}
        onClose={() => setIsWearableOpen(false)}
        devices={wearables}
        onUpdateDevices={handleUpdateWearables}
        onAddAdjustment={handleAddAdjustment}
      />

      <LifeCoinBankModal
        isOpen={isTimeBankOpen}
        onClose={() => setIsTimeBankOpen(false)}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
        onOpenConsultation={() => {
          setIsTimeBankOpen(false);
          setIsConsultationOpen(true);
        }}
      />

      <TimeCapsuleModal
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
        capsules={timeCapsules}
        onUpdateCapsules={handleUpdateTimeCapsules}
        profile={profile}
      />

      <ExpertConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
      />

      {/* 24-Hour AI Longevity Copilot (Floating Assistant) */}
      <LongevityCopilotWidget
        profile={profile}
        habits={habits}
        wearables={wearables}
        onOpenConsultation={() => setIsConsultationOpen(true)}
      />

    </div>
  );
};

export default App;
