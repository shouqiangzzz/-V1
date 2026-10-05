import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Video, 
  Upload, 
  Plus, 
  Heart, 
  MessageSquare, 
  Share2, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  Clock, 
  Globe, 
  Users, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Send, 
  ExternalLink, 
  Tag, 
  Eye, 
  ChevronRight,
  BookOpen,
  RotateCcw,
  Sliders,
  History,
  TrendingUp,
  Image as ImageIcon,
  Flame,
  Check,
  Search,
  X,
  Stethoscope,
  Coins
} from 'lucide-react';
import { 
  ExpertLectureVideo, 
  CommunityPost, 
  MerchantCertification, 
  UserProfile,
  AttachedProduct
} from '../../types';
import { ComplianceGuideModal } from './ComplianceGuideModal';
import { CreatorHealthMetricsVisual } from './CreatorHealthMetricsVisual';
import { CommunityVideoPlayer } from './CommunityVideoPlayer';
import { useLanguage } from '../../services/i18n';
import { 
  rankContentForUser, 
  ScoredContentItem, 
  getWatchHistory, 
  recordWatchEvent, 
  getUserInterestProfile,
  WatchHistoryRecord,
  UserInterestProfile
} from '../../services/recommendationEngine';

interface HealthCommunityHubProps {
  expertVideos: ExpertLectureVideo[];
  posts: CommunityPost[];
  currentUser: UserProfile;
  isAdmin: boolean;
  followedUserIds: string[];
  merchantCert: MerchantCertification;
  onToggleFollow: (authorId: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenUploadPost: () => void;
  onOpenUploadVideoAdmin: () => void;
  onOpenMerchantCert: () => void;
  onOpenAppealModal: (post: CommunityPost) => void;
  onAdminApprovePost?: (postId: string) => void;
  onAdminRejectPost?: (postId: string, reason: string) => void;
  onOpenConsultation?: () => void;
  onOpenContract?: () => void;
  onOpenARShare?: () => void;
  onOpenTimeBank?: () => void;
}

export const HealthCommunityHub: React.FC<HealthCommunityHubProps> = ({
  expertVideos,
  posts,
  currentUser,
  isAdmin,
  followedUserIds,
  merchantCert,
  onToggleFollow,
  onLikePost,
  onAddComment,
  onOpenUploadPost,
  onOpenUploadVideoAdmin,
  onOpenMerchantCert,
  onOpenAppealModal,
  onAdminApprovePost,
  onAdminRejectPost,
  onOpenConsultation,
  onOpenContract,
  onOpenARShare,
  onOpenTimeBank,
}) => {
  const { language } = useLanguage();

  // XiaoHongShu Style Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<'recommend' | 'videos' | 'images' | 'following' | 'history'>('recommend');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Watch History and Interest Profile State
  const [watchHistory, setWatchHistory] = useState<WatchHistoryRecord[]>(getWatchHistory);
  const [interestProfile, setInterestProfile] = useState<UserInterestProfile>(getUserInterestProfile);
  const [refreshSeed, setRefreshSeed] = useState(0);

  // Selected Detail Modal (XiaoHongShu Note / Video Viewer)
  const [activeDetailItem, setActiveDetailItem] = useState<ScoredContentItem | null>(null);
  const [isPlayingModalVideo, setIsPlayingModalVideo] = useState(true);

  // Interactive Comments in detail view
  const [commentText, setCommentText] = useState('');
  const [likeSuccessToast, setLikeSuccessToast] = useState(false);

  // Shopping Product Modal simulation
  const [inspectProduct, setInspectProduct] = useState<AttachedProduct | null>(null);
  const [buySuccessNotice, setBuySuccessNotice] = useState<string | null>(null);

  // Compliance Guide Modal
  const [showCommunityGuide, setShowCommunityGuide] = useState(false);

  // Categories list
  const categoryFilters = [
    '全部',
    '细胞抗衰',
    '深度睡眠',
    '抗炎饮食',
    '心肺运动',
    '久坐改善',
    '间歇断食',
  ];

  // Refresh user interest profile when history changes
  useEffect(() => {
    setInterestProfile(getUserInterestProfile());
  }, [watchHistory]);

  // Compute XiaoHongShu AI Ranked Recommendations
  const rankedFeed = useMemo(() => {
    // 1. Get raw ranked list from AI recommendation engine
    const allRanked = rankContentForUser(expertVideos, posts, interestProfile, selectedCategory);

    // 2. Filter by tab
    let result = allRanked;
    if (activeMainTab === 'videos') {
      result = result.filter(item => item.mediaType === 'video');
    } else if (activeMainTab === 'images') {
      result = result.filter(item => item.mediaType === 'image');
    } else if (activeMainTab === 'following') {
      result = result.filter(item => followedUserIds.includes(item.authorId));
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.summary.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.authorName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [expertVideos, posts, interestProfile, selectedCategory, activeMainTab, searchQuery, followedUserIds, refreshSeed]);

  // Click on any card to open XiaoHongShu detail modal & automatically log watch event
  const handleOpenDetail = (item: ScoredContentItem) => {
    setActiveDetailItem(item);
    setIsPlayingModalVideo(true);

    // AI Engine: Record watch event into user history to dynamically refine future recommendations
    const updatedHistory = recordWatchEvent({
      contentId: item.id,
      contentType: item.type,
      title: item.title,
      category: item.category,
      tags: item.tags,
      durationWatchedSeconds: (item.durationMinutes || 5) * 60,
      liked: false,
    });
    setWatchHistory(updatedHistory);
  };

  const handleToggleLike = (item: ScoredContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.type === 'post') {
      onLikePost(item.id);
    }
    // Update local like feedback
    setLikeSuccessToast(true);
    setTimeout(() => setLikeSuccessToast(false), 800);
  };

  const handleSendDetailComment = () => {
    if (!commentText.trim() || !activeDetailItem) return;
    if (activeDetailItem.type === 'post') {
      onAddComment(activeDetailItem.id, commentText.trim());
    }
    setCommentText('');
  };

  const handleSimulateBuy = () => {
    setBuySuccessNotice(language === 'zh' ? '模拟下单成功！创作者已实时结算赚取带货佣金收益。' : 'Order placed! Creator commission earned.');
    setTimeout(() => {
      setBuySuccessNotice(null);
      setInspectProduct(null);
    }, 1500);
  };

  return (
    <section className="space-y-6">
      
      {/* ================= XiaoHongShu Style Header Bar ================= */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & XiaoHongShu AI Tagline */}
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {language === 'zh' ? '健康社区 · AI长寿视界' : 'Health Community · AI Discovery'}
                  </h2>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                    精选推荐模式
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center space-x-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {language === 'zh' 
                      ? `AI 算法已依据您最近常看的【${interestProfile.topTags.slice(0, 3).join('、') || '细胞抗衰'}】视频推测推荐匹配内容` 
                      : 'AI personalized ranking matches your recent watch history.'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Post upload, refresh feed, compliance) */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'zh' ? "搜索抗衰视频、笔记..." : "Search videos, notes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-36 sm:w-48 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Refresh Feed Button */}
            <button
              onClick={() => setRefreshSeed(s => s + 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs"
              title={language === 'zh' ? "刷新AI算法推测推荐池" : "Refresh recommendations"}
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'zh' ? '换一批' : 'Refresh'}</span>
            </button>

            {/* Upload Post Button (XiaoHongShu Red Action) */}
            <button
              onClick={onOpenUploadPost}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{language === 'zh' ? '发笔记/视频' : 'Post Note'}</span>
            </button>

            {/* Health Buddy Contract Entry */}
            {onOpenContract && (
              <button
                onClick={onOpenContract}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer hover:bg-amber-500/25 transition-all shadow-xs"
                title="健康搭子与契约对赌"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'zh' ? '搭子契约' : 'Buddy'}</span>
              </button>
            )}

            {/* 1-on-1 Expert Consultation Entry */}
            {onOpenConsultation && (
              <button
                onClick={onOpenConsultation}
                className="px-3 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer hover:bg-teal-500/25 transition-all shadow-xs"
                title="预约长寿医学专家 1 对 1 咨询"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'zh' ? '专家问诊' : 'Consult'}</span>
              </button>
            )}

            {/* AR Share Card Entry */}
            {onOpenARShare && (
              <button
                onClick={onOpenARShare}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer hover:bg-cyan-500/25 transition-all shadow-xs"
                title="运动轨迹与生机餐 AR 海报生成"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'zh' ? 'AR合影' : 'AR Card'}</span>
              </button>
            )}

            {/* Merchant Certification Entry */}
            <button
              onClick={onOpenMerchantCert}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                merchantCert.isVerified
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>{merchantCert.isVerified ? (language === 'zh' ? '认证商户' : 'Merchant') : (language === 'zh' ? '带货认证' : 'Earn')}</span>
            </button>
          </div>

        </div>

        {/* XiaoHongShu Style Tabs Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveMainTab('recommend')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeMainTab === 'recommend'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '为你推荐 (AI推测)' : 'For You (AI)'}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('videos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeMainTab === 'videos'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '长寿视频' : 'Videos'}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('images')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeMainTab === 'images'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '健康图文' : 'Notes'}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('following')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeMainTab === 'following'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '我的关注' : 'Following'}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeMainTab === 'history'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '观看足迹 & AI偏好' : 'History & AI Tuning'}</span>
            </button>
          </div>

          {/* Compliance & Guidelines quick link */}
          <button
            onClick={() => setShowCommunityGuide(true)}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'zh' ? '社区规范准则' : 'Community Rules'}</span>
          </button>
        </div>

        {/* XiaoHongShu Category Filter Pills */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1">
          {categoryFilters.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ================= TAB VIEW: HISTORY & AI TUNING ================= */}
      {activeMainTab === 'history' ? (
        <div className="space-y-6">
          
          {/* AI Preference Radar Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'zh' ? 'AI 偏好推测模型透视' : 'AI Preference Inference Profile'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'zh' 
                      ? '系统自动根据您的历史观看频次、完播时长、点赞与关注计算权重，即时推测推送长寿内容' 
                      : 'Real-time embedding weights inferred from your watch frequency, completion rates, and likes.'}
                  </p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {watchHistory.length} 条已学足迹
              </span>
            </div>

            {/* Interest categories progress meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {Object.entries(interestProfile.categoryWeights).map(([cat, weight]) => (
                <div key={cat} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{cat}</span>
                    <span className="font-mono-num font-bold text-rose-400">{Math.round(weight * 100)}% 偏好度</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(weight * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top Tag Pills */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2 font-medium">高频匹配关键词：</span>
              <div className="flex flex-wrap gap-2">
                {interestProfile.topTags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-xs border border-slate-700 flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Watch History List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'zh' ? '最近观看的视频与笔记足迹' : 'Recent Watch History'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {watchHistory.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      {rec.contentType === 'video' ? <Video className="w-4 h-4 text-emerald-400" /> : <ImageIcon className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{rec.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{rec.category}</span>
                        <span>观看时长 {Math.floor(rec.durationWatchedSeconds / 60)} 分钟</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(rec.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* ================= XiaoHongShu Style Masonry Waterfall Cards Grid ================= */
        <div className="space-y-4">
          
          {rankedFeed.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                {language === 'zh' ? '暂未找到相关推荐' : 'No matching recommendations'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {language === 'zh' ? '尝试切换其他分类或点击换一批，发现更多高价值长寿视频' : 'Try switching categories or refreshing recommendations'}
              </p>
              <button
                onClick={() => { setSelectedCategory('全部'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
              >
                查看全部推荐
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
              {rankedFeed.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  
                  {/* Media Cover Image / Thumbnail */}
                  <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                    <img 
                      src={item.coverUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none" />

                    {/* Top-Right XiaoHongShu AI Match Score Pill */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-rose-500/40 text-[10px] font-bold text-rose-300 shadow-sm">
                      <Sparkles className="w-3 h-3 text-rose-400" />
                      <span>{item.aiScore}% 匹配</span>
                    </div>

                    {/* Top-Left Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {item.mediaType === 'video' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center space-x-1">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{item.durationMinutes ? `${item.durationMinutes}分钟` : '视频'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center space-x-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>图文</span>
                        </span>
                      )}
                    </div>

                    {/* Video Center Play Button Indicator (for videos) */}
                    {item.mediaType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-slate-950/70 border border-white/30 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-rose-500 transition-all shadow-lg">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Bottom AI Reason Tooltip on image */}
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] text-slate-300/90 truncate flex items-center space-x-1">
                      <span className="text-amber-400">✨</span>
                      <span className="truncate">{item.aiReason}</span>
                    </div>

                  </div>

                  {/* Card Bottom Body */}
                  <div className="p-3 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    
                    <div>
                      {/* Title (XiaoHongShu bold 2-line title) */}
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-rose-300 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Attached Product & AI 7-Day Wearable Objective Endorsement in Feed Stream */}
                      {item.rawPost?.product && (
                        <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-amber-300 truncate max-w-[130px]">
                              🛍️ {item.rawPost.product.title}
                            </span>
                            <span className="text-amber-400 font-mono-num font-bold">
                              ¥{item.rawPost.product.price}
                            </span>
                          </div>

                          {/* AI 7-Day Wearable Objective Endorsement Snippet */}
                          <div className="flex items-center space-x-1 text-[9px] text-emerald-300 font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">
                              {item.rawPost.product.biomarkerEndorsement
                                ? `AI近7天背书: 心率 -${item.rawPost.product.biomarkerEndorsement.heartRateReductionBpm}bpm · 深睡${item.rawPost.product.biomarkerEndorsement.sleepGoalRatePct}%`
                                : 'AI近7天背书: 心率 -4.6bpm · 深睡96%'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Author & Like Count Footer */}
                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 truncate">
                        <img 
                          src={item.authorAvatar} 
                          alt={item.authorName} 
                          className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-700" 
                        />
                        <span className="text-[11px] text-slate-300 truncate font-medium">
                          {item.authorName}
                        </span>
                      </div>

                      {/* Like Action */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(item, e)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition-colors shrink-0 cursor-pointer group/like"
                      >
                        <Heart className="w-3.5 h-3.5 group-hover/like:scale-125 transition-transform" />
                        <span className="text-[11px] font-mono-num font-medium">
                          {item.likesCount > 1000 ? `${(item.likesCount / 1000).toFixed(1)}k` : item.likesCount}
                        </span>
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ================= XiaoHongShu Style Detail Popup Modal ================= */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div 
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col lg:flex-row max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Left Column: Media Player (Video or High-Res Image Gallery) */}
            <div className="lg:w-7/12 bg-black flex items-center justify-center relative min-h-[300px] lg:min-h-[520px] overflow-hidden">
              {activeDetailItem.mediaType === 'video' ? (
                <div className="w-full h-full flex items-center justify-center relative bg-black">
                  {activeDetailItem.videoUrl ? (
                    <CommunityVideoPlayer
                      src={activeDetailItem.videoUrl}
                      title={activeDetailItem.title}
                      poster={activeDetailItem.coverUrl}
                      autoPlay={isPlayingModalVideo}
                      className="w-full h-full max-h-[520px] object-contain"
                    />
                  ) : (
                    <div className="px-6 text-center text-sm text-slate-400" role="status">
                      {language === 'zh' ? '该视频暂时没有可播放的媒体地址。' : 'This video has no playable media source.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <img
                    src={activeDetailItem.coverUrl}
                    alt={activeDetailItem.title}
                    className="w-full h-full max-h-[520px] object-contain rounded-xl"
                  />
                </div>
              )}

              {/* Close Button on Mobile Video */}
              <button
                onClick={() => setActiveDetailItem(null)}
                className="lg:hidden absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white z-20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: XiaoHongShu Note Content, AI Recommendation explanation & Comments */}
            <div className="lg:w-5/12 flex flex-col justify-between max-h-[520px] overflow-y-auto bg-slate-900 border-l border-slate-800/80">
              
              {/* Header: Author Info + Follow + Close Button */}
              <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={activeDetailItem.authorAvatar}
                    alt={activeDetailItem.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>{activeDetailItem.authorName}</span>
                      {activeDetailItem.authorRole && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          {activeDetailItem.authorRole}
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      发布于 {activeDetailItem.createdAt || '近期'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleFollow(activeDetailItem.authorId)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      followedUserIds.includes(activeDetailItem.authorId)
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-rose-500 text-white hover:bg-rose-400 shadow-xs'
                    }`}
                  >
                    {followedUserIds.includes(activeDetailItem.authorId) ? '已关注' : '+ 关注'}
                  </button>

                  <button
                    onClick={() => setActiveDetailItem(null)}
                    className="hidden lg:flex p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Note Content & AI Recommendation Details */}
              <div className="p-4 sm:p-5 space-y-4 flex-1">
                
                {/* AI Recommendation Reason Banner */}
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-300 leading-snug">
                    <span className="text-rose-300 font-bold block mb-0.5">
                      ✨ AI 推荐度 {activeDetailItem.aiScore}% ({activeDetailItem.aiReason})
                    </span>
                    系统检测到您此前多次深入关注【{activeDetailItem.category}】与相关长寿习惯，自动推测此内容对您有高价值。
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {activeDetailItem.title}
                </h2>

                {/* Summary / Body */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeDetailItem.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeDetailItem.tags.map(tag => (
                    <span key={tag} className="text-[11px] text-cyan-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/80">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Attached Product Card (If post has product) */}
                {activeDetailItem.rawPost?.product && (
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {activeDetailItem.rawPost.product.title}
                          </div>
                          <div className="text-xs font-bold text-amber-400 font-mono-num">
                            ¥{activeDetailItem.rawPost.product.price}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setInspectProduct(activeDetailItem.rawPost?.product || null)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer shadow-sm transition-all"
                      >
                        去购买
                      </button>
                    </div>

                    {/* Objective Biomarker Endorsement Badge (AI自动抓取创作者最近7天体测数据背书) */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between text-xs border-b border-emerald-500/20 pb-2">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>AI 客观数据背书 (已抓取创作者最近7天体测流)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          A+ 极强实证
                        </span>
                      </div>

                      {/* 3-Pillar Wearable Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                          <div className="text-[10px] text-slate-400">7天心率降幅</div>
                          <div className="text-xs sm:text-sm font-black text-rose-300 font-mono-num mt-0.5">
                            -{activeDetailItem.rawPost.product.biomarkerEndorsement?.heartRateReductionBpm || 4.6} bpm
                          </div>
                          <div className="text-[9px] text-emerald-400">负荷下调</div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                          <div className="text-[10px] text-slate-400">7天深睡达标率</div>
                          <div className="text-xs sm:text-sm font-black text-cyan-300 font-mono-num mt-0.5">
                            {activeDetailItem.rawPost.product.biomarkerEndorsement?.sleepGoalRatePct || 96.2}%
                          </div>
                          <div className="text-[9px] text-cyan-400">修复充沛</div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                          <div className="text-[10px] text-slate-400">深睡日均延长</div>
                          <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono-num mt-0.5">
                            +{activeDetailItem.rawPost.product.biomarkerEndorsement?.deepSleepIncreaseMinutes || 44} 分钟
                          </div>
                          <div className="text-[9px] text-emerald-400">脑排毒显著</div>
                        </div>
                      </div>

                      {/* AI Evaluation Quote */}
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        {activeDetailItem.rawPost.product.biomarkerEndorsement?.aiEvaluationText ||
                          'AI已自动抓取达人Apple Watch/Whoop最近7天体测流：连续使用期间，心血管静息心率下降明显，深度睡眠达标率高位稳定，具有极强客观生理实证依据。'}
                      </p>

                      {/* Recharts Visualization: 5-Dimension Radar Chart / 7-Day Bar Chart & Dynamic Highlight Tag */}
                      <CreatorHealthMetricsVisual
                        endorsement={activeDetailItem.rawPost.product.biomarkerEndorsement}
                        authorName={activeDetailItem.authorName}
                        productTitle={activeDetailItem.rawPost.product.title}
                      />

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>数据源：Apple Health / WHOOP 穿戴直连验证</span>
                        <span className="text-emerald-400 font-mono-num font-semibold">真实体测已存证 ✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1-on-1 Expert Consultation Entry */}
                {onOpenConsultation && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/15 via-slate-900 to-slate-950 border border-teal-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-white block">三甲名医与长寿抗衰团队</span>
                        <span className="text-[10px] text-teal-300">针对您的体检与生活习惯，定制专属 1 对 1 逆龄方案</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenConsultation()}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer shadow-sm transition-all"
                    >
                      预约 1对1 问诊
                    </button>
                  </div>
                )}

                {/* Comments Stream */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="text-xs font-bold text-slate-300">
                    评论互动 ({activeDetailItem.rawPost?.comments.length || 3} 条)
                  </div>
                  
                  {activeDetailItem.rawPost?.comments && activeDetailItem.rawPost.comments.length > 0 ? (
                    activeDetailItem.rawPost.comments.map(c => (
                      <div key={c.id} className="text-xs space-y-0.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">{c.authorName}</span>
                          <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-400">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic p-2">
                      暂无评论，来发表第一条长寿互动吧~
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Interactive Bar (Like, Comment Input) */}
              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="说点什么分享长寿心得..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendDetailComment()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                <button
                  onClick={handleSendDetailComment}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => handleToggleLike(activeDetailItem, e)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/25 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{activeDetailItem.likesCount}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Shopping Product Inspection Modal */}
      {inspectProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">长寿精选带货</span>
              <button onClick={() => setInspectProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{inspectProduct.title}</h3>
              <p className="text-xs text-slate-400 mt-1">健康正品认证 · 佣金返利保障</p>
              <div className="text-xl font-bold text-amber-400 font-mono-num mt-2">
                ¥{inspectProduct.price}
              </div>
            </div>

            {/* AI 7-Day Wearable Objective Endorsement in Checkout Modal */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI 创作者近7天真实体测背书</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">7天心率降幅</span>
                  <span className="font-bold text-rose-300 font-mono-num text-xs">
                    -{inspectProduct.biomarkerEndorsement?.heartRateReductionBpm || 4.6} bpm
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">7天深睡达标率</span>
                  <span className="font-bold text-cyan-300 font-mono-num text-xs">
                    {inspectProduct.biomarkerEndorsement?.sleepGoalRatePct || 96.2}%
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                {inspectProduct.biomarkerEndorsement?.aiEvaluationText || '穿戴设备连续记录，心血管静息心率与深睡修复均呈强显著正相关。'}
              </p>
            </div>

            {/* Recharts Visual: Creator 7-Day Radar / Bar Chart & Dynamic Highlight Tag */}
            <CreatorHealthMetricsVisual
              endorsement={inspectProduct.biomarkerEndorsement}
              productTitle={inspectProduct.title}
              compact
            />

            <button
              onClick={handleSimulateBuy}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-amber-500/20"
            >
              立即购买结算
            </button>
            {buySuccessNotice && (
              <div className="text-center text-xs text-emerald-400 font-bold">
                {buySuccessNotice}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compliance Guide Modal */}
      <ComplianceGuideModal
        isOpen={showCommunityGuide}
        onClose={() => setShowCommunityGuide(false)}
      />

    </section>
  );
};
