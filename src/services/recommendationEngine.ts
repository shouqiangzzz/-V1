import { ExpertLectureVideo, CommunityPost } from '../types';
import { 
  COMMUNITY_EN_TRANSLATIONS, 
  translateCategory, 
  translateTag 
} from './communityTranslations';

export interface WatchHistoryRecord {
  id: string;
  contentId: string;
  contentType: 'video' | 'post';
  title: string;
  category: string;
  tags: string[];
  watchedAt: number;
  durationWatchedSeconds: number;
  liked?: boolean;
}

export interface UserInterestProfile {
  categoryWeights: Record<string, number>; // e.g. { '细胞抗衰': 0.95, '深度睡眠': 0.8, '抗炎饮食': 0.7 }
  topTags: string[];
  totalWatchedCount: number;
  lastUpdated: number;
}

const STORAGE_KEY_WATCH_HISTORY = 'life_clock_watch_history_v1';
const STORAGE_KEY_USER_INTERESTS = 'life_clock_user_interests_v1';

// Initial seed history so the AI recommendation engine starts with rich, realistic recommendations
const SEED_WATCH_HISTORY: WatchHistoryRecord[] = [
  {
    id: 'wh_1',
    contentId: 'vid_1',
    contentType: 'video',
    title: '哈佛大学长寿实验室：逆转表观遗传生物年龄的3个核心分子通路',
    category: '细胞抗衰',
    tags: ['NMN', '细胞自噬', 'NAD+', '表观遗传', '抗衰医学'],
    watchedAt: Date.now() - 3600 * 1000 * 2,
    durationWatchedSeconds: 1420,
    liked: true,
  },
  {
    id: 'wh_2',
    contentId: 'vid_2',
    contentType: 'video',
    title: '诺奖得主详解：16+8轻断食如何激活线粒体自噬与清除衰老细胞',
    category: '细胞抗衰',
    tags: ['间歇断食', '线粒体', '自噬', '长寿基因SIRT1'],
    watchedAt: Date.now() - 3600 * 1000 * 8,
    durationWatchedSeconds: 1180,
    liked: true,
  },
  {
    id: 'wh_3',
    contentId: 'vid_3',
    contentType: 'video',
    title: '斯坦福神经生物学讲座：非快速眼动深睡对大脑类淋巴排毒的决定性作用',
    category: '深度睡眠',
    tags: ['深睡排毒', '昼夜节律', '腺苷', '褪黑素', '脑健康'],
    watchedAt: Date.now() - 3600 * 1000 * 24,
    durationWatchedSeconds: 1850,
    liked: false,
  },
  {
    id: 'wh_4',
    contentId: 'post_1',
    contentType: 'post',
    title: '抗炎地中海饮食实录：连续打卡20天体检指标复测惊喜',
    category: '抗炎饮食',
    tags: ['地中海饮食', '多酚', '特级初榨橄榄油', 'Omega-3'],
    watchedAt: Date.now() - 3600 * 1000 * 36,
    durationWatchedSeconds: 420,
    liked: true,
  }
];

export function getWatchHistory(): WatchHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WATCH_HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_WATCH_HISTORY, JSON.stringify(SEED_WATCH_HISTORY));
      return SEED_WATCH_HISTORY;
    }
    return JSON.parse(raw);
  } catch (err) {
    return SEED_WATCH_HISTORY;
  }
}

export function recordWatchEvent(item: Omit<WatchHistoryRecord, 'id' | 'watchedAt'>): WatchHistoryRecord[] {
  const current = getWatchHistory();
  const newRecord: WatchHistoryRecord = {
    ...item,
    id: 'wh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    watchedAt: Date.now(),
  };

  // Keep latest 50 records
  const updated = [newRecord, ...current.filter(c => c.contentId !== item.contentId)].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY_WATCH_HISTORY, JSON.stringify(updated));
    recalculateUserInterests(updated);
  } catch (e) {
    console.error('Failed to save watch record', e);
  }
  return updated;
}

export function getUserInterestProfile(): UserInterestProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_INTERESTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return recalculateUserInterests(getWatchHistory());
}

export function recalculateUserInterests(history: WatchHistoryRecord[]): UserInterestProfile {
  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  history.forEach((rec, idx) => {
    // Time decay weight: recent watches have higher weight
    const recencyWeight = Math.max(0.3, 1 - idx * 0.05);
    const likeMultiplier = rec.liked ? 1.5 : 1.0;
    const weight = recencyWeight * likeMultiplier;

    if (rec.category) {
      categoryCounts[rec.category] = (categoryCounts[rec.category] || 0) + weight;
    }

    if (Array.isArray(rec.tags)) {
      rec.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + weight;
      });
    }
  });

  // Normalize category weights 0 - 1
  const maxCat = Math.max(1, ...Object.values(categoryCounts));
  const categoryWeights: Record<string, number> = {};
  for (const [cat, val] of Object.entries(categoryCounts)) {
    categoryWeights[cat] = Math.round((val / maxCat) * 100) / 100;
  }

  // Top 10 tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);

  const profile: UserInterestProfile = {
    categoryWeights,
    topTags,
    totalWatchedCount: history.length,
    lastUpdated: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_USER_INTERESTS, JSON.stringify(profile));
  } catch (e) {}

  return profile;
}

export interface ScoredContentItem {
  id: string;
  type: 'video' | 'post';
  title: string;
  summary: string;
  coverUrl: string;
  videoUrl?: string;
  mediaType: 'video' | 'image';
  authorName: string;
  authorAvatar: string;
  authorId: string;
  authorRole?: string;
  category: string;
  tags: string[];
  durationText?: string;
  durationMinutes?: number;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  createdAt: number;
  aiScore: number; // 0 - 100 match percentage
  aiReason: string; // e.g. "基于您常看【细胞抗衰】推算推荐"
  rawVideo?: ExpertLectureVideo;
  rawPost?: CommunityPost;
}

const CATEGORY_MAP: Record<string, string> = {
  longevity: '细胞抗衰',
  sleep: '深度睡眠',
  nutrition: '抗炎饮食',
  fitness: '心肺运动',
  cardio: '心肺运动',
};

/**
 * XiaoHongShu style recommendation ranker
 * Blends User History Embedding match + Trending Weight + Diversity Boost
 */
export function rankContentForUser(
  videos: ExpertLectureVideo[],
  posts: CommunityPost[],
  userProfile?: UserInterestProfile,
  selectedCategory?: string,
  language: 'zh' | 'en' = 'zh'
): ScoredContentItem[] {
  const profile = userProfile || getUserInterestProfile();
  const allItems: ScoredContentItem[] = [];

  // Convert expert videos to feed items
  videos.forEach(v => {
    const zhCategory = CATEGORY_MAP[v.category] || '细胞抗衰';
    const rawTags = [zhCategory, '前沿长寿医学', '权威讲座', '逆龄研究'];
    const trans = language === 'en' ? COMMUNITY_EN_TRANSLATIONS[v.id] : undefined;

    const finalTitle = trans?.title || (language === 'en' ? v.titleEn : undefined) || v.title;
    const finalSpeaker = trans?.speaker || v.speaker;
    const finalSpeakerRole = trans?.speakerTitle || v.speakerTitle;
    const finalDescription = trans?.description || v.description || v.keyTakeaways?.join(' · ') || '';
    const finalTags = trans?.tags || rawTags.map(t => translateTag(t, language));

    allItems.push({
      id: v.id,
      type: 'video',
      title: finalTitle,
      summary: finalDescription,
      coverUrl: v.coverUrl,
      videoUrl: v.videoUrl,
      mediaType: 'video',
      authorName: finalSpeaker,
      authorAvatar: v.speakerAvatar,
      authorId: 'expert_' + v.id,
      authorRole: finalSpeakerRole,
      category: zhCategory,
      tags: finalTags,
      durationText: v.duration,
      durationMinutes: Math.round(Number(v.duration.split(':')[0]) || 20),
      likesCount: v.likesCount || 1280,
      viewsCount: v.viewsCount || 8900,
      commentsCount: 38,
      createdAt: v.uploadedAt,
      aiScore: 0,
      aiReason: '',
      rawVideo: v,
    });
  });

  // Convert posts to feed items
  posts.forEach(p => {
    // Determine category based on content tags or text
    let category = '长寿日常';
    if (p.tags.some(t => t.includes('饮食') || t.includes('餐') || t.includes('断食'))) category = '抗炎饮食';
    else if (p.tags.some(t => t.includes('睡') || t.includes('昼夜'))) category = '深度睡眠';
    else if (p.tags.some(t => t.includes('坐') || t.includes('动') || t.includes('健身') || t.includes('心肺'))) category = '心肺运动';
    else if (p.tags.some(t => t.includes('抗衰') || t.includes('基因') || t.includes('细胞'))) category = '细胞抗衰';

    const trans = language === 'en' ? COMMUNITY_EN_TRANSLATIONS[p.id] : undefined;
    const contentLines = p.content.split('\n').filter(Boolean);
    const fallbackTitle = contentLines[0] ? (contentLines[0].length > 36 ? contentLines[0].substring(0, 36) + '...' : contentLines[0]) : '长寿健康探索笔记';
    const finalTitle = trans?.title || fallbackTitle;
    const finalContent = trans?.content || p.content;
    const finalAuthor = trans?.authorName || p.authorName;
    const rawTags = p.tags && p.tags.length > 0 ? p.tags : [category];
    const finalTags = trans?.tags || rawTags.map(t => translateTag(t, language));

    allItems.push({
      id: p.id,
      type: 'post',
      title: finalTitle,
      summary: finalContent,
      coverUrl: p.mediaUrl || p.videoThumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      videoUrl: p.mediaType === 'video' ? p.mediaUrl : undefined,
      mediaType: p.mediaType === 'video' ? 'video' : 'image',
      authorName: finalAuthor,
      authorAvatar: p.authorAvatar,
      authorId: p.authorId,
      category,
      tags: finalTags,
      likesCount: p.likesCount,
      viewsCount: p.viewsCount || (p.likesCount * 9) + 120,
      commentsCount: p.comments.length,
      createdAt: p.createdAt,
      aiScore: 0,
      aiReason: '',
      rawPost: p,
    });
  });

  // Score each item based on XiaoHongShu AI algorithm
  const scored = allItems.map(item => {
    let score = 55; // baseline interest
    let reason = language === 'en' ? 'Featured Longevity Pick' : '热门长寿精选推荐';

    // 1. Category affinity match (0 - 30 points)
    const catWeight = profile.categoryWeights[item.category] || 0;
    if (catWeight > 0) {
      score += catWeight * 25;
      const catLabel = language === 'en' ? translateCategory(item.category, 'en') : item.category;
      reason = language === 'en'
        ? `Based on your interest in [${catLabel}]`
        : `基于您对【${item.category}】的深度观看兴趣`;
    }

    // 2. Tag intersection match (0 - 20 points)
    const matchingTags = item.tags.filter(t => profile.topTags.includes(t) || profile.topTags.some(pt => translateTag(pt, 'en') === t));
    if (matchingTags.length > 0) {
      score += Math.min(20, matchingTags.length * 7);
      const tagLabel = language === 'en' ? translateTag(matchingTags[0], 'en') : matchingTags[0];
      reason = language === 'en'
        ? `Matches keywords like "${tagLabel}" you often watch`
        : `命中您常看的「${matchingTags[0]}」等长寿关键词`;
    }

    // 3. Media format bonus (video vs image preference)
    if (item.mediaType === 'video') {
      score += 4; // Video content engagement weighting
    }

    // 4. Social proof & popularity (0 - 8 points)
    const popBonus = Math.min(8, Math.log10(Math.max(10, item.viewsCount)) * 2);
    score += popBonus;

    // Cap between 68% and 99%
    const finalScore = Math.min(99, Math.max(68, Math.round(score)));

    return {
      ...item,
      aiScore: finalScore,
      aiReason: reason,
    };
  });

  // Filter by user selected category if active
  let result = scored;
  if (selectedCategory && selectedCategory !== '全部' && selectedCategory !== 'All') {
    result = result.filter(item => 
      item.category.includes(selectedCategory) || 
      item.tags.some(t => t.includes(selectedCategory)) ||
      translateCategory(item.category, 'en').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.tags.some(t => translateTag(t, 'en').toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }

  // Sort by AI score descending
  return result.sort((a, b) => b.aiScore - a.aiScore);
}
