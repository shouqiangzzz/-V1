import { 
  ExpertLectureVideo, 
  CommunityPost, 
  MerchantCertification, 
  AttachedProduct 
} from '../types';

export const COMMUNITY_STORAGE_KEYS = {
  EXPERT_VIDEOS: 'life_clock_expert_videos',
  COMMUNITY_POSTS: 'life_clock_community_posts',
  MERCHANT_CERT: 'life_clock_merchant_cert',
  FOLLOWED_USERS: 'life_clock_followed_users',
  ADMIN_ALERT_CONFIG: 'life_clock_admin_alert_config',
};

export interface AdminAlertConfig {
  enableEmailAlert: boolean;
  adminEmail: string;
  enableSmsAlert: boolean;
  adminPhone: string;
  autoEscalateHours: number; // 24
}

export const DEFAULT_ADMIN_ALERT_CONFIG: AdminAlertConfig = {
  enableEmailAlert: true,
  adminEmail: 'shouqiangzzz@gmail.com',
  enableSmsAlert: true,
  adminPhone: '13800008869',
  autoEscalateHours: 24,
};

export const INITIAL_EXPERT_VIDEOS: ExpertLectureVideo[] = [
  {
    id: 'expert_video_1',
    title: '衰老生物学突破：线粒体自噬与细胞端粒延长的科学处方',
    titleEn: 'Mitochondrial Autophagy & Epigenetic Longevity Science',
    speaker: '李铭德 教授',
    speakerTitle: '钟院士团队抗衰医学研究中心主任 · 博士生导师',
    speakerAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    duration: '28:45',
    viewsCount: 14820,
    likesCount: 3260,
    category: 'longevity',
    description: '系统拆解NAD+辅酶衰竭机制、SIRT长寿蛋白家族激活路径以及间歇性热量限制如何促进机体深层自噬，并给出40岁+人群日常抗衰生活方式清单。',
    keyTakeaways: [
      '端粒酶活性与线粒体ATP产能呈正相关，昼夜节律稳定是保护基因组完整性的第一道防线',
      '每周保持150分钟Zone 2有氧运动可使肌肉内线粒体密度显著提升40%',
      '补充优质多酚与十字花科萝卜硫素，辅助激活Nrf2抗氧化防御总开关'
    ],
    uploadedAt: Date.now() - 86400000 * 3,
    isFeatured: true,
  },
  {
    id: 'expert_video_2',
    title: '重塑深睡眠与昼夜节律：表观遗传时钟逆龄的夜间密码',
    titleEn: 'Deep Sleep Architecture & Circadian Clock Rejuvenation',
    speaker: '陈薇薇 博士',
    speakerTitle: '哈佛医学院神经生物学博士 · 国际睡眠医学会会员',
    speakerAvatar: 'https://images.unsplash.com/photo-1594824813587-0b1a03975765?auto=format&fit=crop&w=256&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80',
    duration: '22:15',
    viewsCount: 11450,
    likesCount: 2840,
    category: 'sleep',
    description: '脑脊液在慢波深睡眠阶段对β-淀粉样蛋白的“冲刷洗涤”机制，如何通过光照管理、核心体温控制获得每晚不少于90分钟的深度修复黄金期。',
    keyTakeaways: [
      '晚间22:00后阻断蓝光暴露，可使松果体褪黑素峰值提前且分泌量增加30%',
      '卧室环境维持在18-20℃有助于核心体温适度下降，加速诱发慢波睡眠',
      '规律睡醒锚点比单次补觉更为重要，打破社交时差综合征'
    ],
    uploadedAt: Date.now() - 86400000 * 6,
    isFeatured: false,
  },
  {
    id: 'expert_video_3',
    title: '抗阻运动与微血管重构：中老年防肌少症与心肺强化方案',
    titleEn: 'Resistance Training & Microvascular Remodeling for Longevity',
    speaker: '孙振宇 研究员',
    speakerTitle: '国家体育科学研究所高级体能导师 · 运动处方专家',
    speakerAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    duration: '31:20',
    viewsCount: 9680,
    likesCount: 1950,
    category: 'fitness',
    description: '下肢股四头肌与臀大肌力量被称为人体的“第二心脏”。解析如何零器械利用弹力带与自重激活肌纤维，强化骨密度同时避免关节磨损。',
    keyTakeaways: [
      '骨骼肌是人体最大胰岛素敏感靶器官，维持肌肉量能根本性预防二型糖尿病',
      '大腿围每增加1厘米，全因死亡风险与心血管早逝风险呈现显著负相关',
      '训练前后补充足量亮氨酸与电解质水，预防延迟性肌肉酸痛'
    ],
    uploadedAt: Date.now() - 86400000 * 10,
    isFeatured: false,
  },
];

export const INITIAL_PRODUCTS: AttachedProduct[] = [
  {
    id: 'prod_1',
    title: '深海高纯度 Omega-3 鱼油软胶囊 (IFOS五星认证 EPA+DHA 92%)',
    price: 268,
    originalPrice: 358,
    coverUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    category: 'supplements',
    commissionRate: 18,
    merchantId: 'merchant_longevity_nutri',
    merchantName: '恒健生物科技官方旗舰店',
    isCertifiedMerchant: true,
    depositTier: 'health_food',
    salesCount: 3840,
    biomarkerEndorsement: {
      heartRateReductionBpm: 4.6,
      sleepGoalRatePct: 96.2,
      deepSleepIncreaseMinutes: 44,
      consecutiveDays: 7,
      aiEvaluationText: 'AI已自动抓取达人近7天穿戴流：连续服用此好物期间，静息心率从 58 降至 53.4 bpm，深睡达标率 96.2%，线粒体抗炎实证极优。',
      verifiedAt: '系统实时自动背书',
    },
  },
  {
    id: 'prod_2',
    title: '智能姿态矫正与久坐起立震动提醒手环 (IP68级防水/心率监测)',
    price: 199,
    originalPrice: 299,
    coverUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=400&q=80',
    category: 'sleep_device',
    commissionRate: 20,
    merchantId: 'merchant_cybersports',
    merchantName: '极速先锋健康装备社',
    isCertifiedMerchant: true,
    depositTier: 'general',
    salesCount: 2150,
    biomarkerEndorsement: {
      heartRateReductionBpm: 3.2,
      sleepGoalRatePct: 92.0,
      deepSleepIncreaseMinutes: 32,
      consecutiveDays: 7,
      aiEvaluationText: 'AI已自动抓取达人近7天穿戴流：单日久坐超时阻断 6 次，下肢血液淤滞减少，日均微运动达成率 98%。',
      verifiedAt: '系统实时自动背书',
    },
  },
  {
    id: 'prod_3',
    title: '天然高弹力阻力带多磅数全套装 (附赠全流程防肌少症跟练动作库)',
    price: 69,
    originalPrice: 128,
    coverUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=400&q=80',
    category: 'fitness_gear',
    commissionRate: 25,
    merchantId: 'merchant_fitlife',
    merchantName: '活力工场健身工坊',
    isCertifiedMerchant: true,
    depositTier: 'general',
    salesCount: 5690,
    biomarkerEndorsement: {
      heartRateReductionBpm: 3.8,
      sleepGoalRatePct: 91.5,
      deepSleepIncreaseMinutes: 35,
      consecutiveDays: 7,
      aiEvaluationText: 'AI已自动抓取达人近7天穿戴流：大肌群抗阻激活后，基础代谢率提升 6.4%，肌肉衰减阻断评分 5 星。',
      verifiedAt: '系统实时自动背书',
    },
  },
  {
    id: 'prod_4',
    title: '特级初榨低温冷榨特级橄榄油 (酸度≤0.3% 高多酚抗炎)',
    price: 158,
    originalPrice: 218,
    coverUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    category: 'organic_food',
    commissionRate: 15,
    merchantId: 'merchant_mediterranean',
    merchantName: '地中海绿洲有机庄园',
    isCertifiedMerchant: true,
    depositTier: 'health_food',
    salesCount: 4210,
    biomarkerEndorsement: {
      heartRateReductionBpm: 4.1,
      sleepGoalRatePct: 95.0,
      deepSleepIncreaseMinutes: 40,
      consecutiveDays: 7,
      aiEvaluationText: 'AI已自动抓取达人近7天体测流：地中海生机饮食多酚达标，空腹血糖均值下降 0.4 mmol/L，血管内皮弹性改善。',
      verifiedAt: '系统实时自动背书',
    },
  },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    authorId: 'user_runner_jack',
    authorName: '奔跑的长寿行者',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorBadge: '🏅 活力践行者',
    createdAt: Date.now() - 3600000 * 4,
    content: '【晨光心肺唤醒打卡第18天】今早5:30准时起床慢跑6公里，配速5分40秒，平均心率严格压在136次/分（Zone 2 黄金燃脂与微血管增生区间）。跑完拉伸15分钟，整个人细胞像被重新注水一样通透！坚持连续规律运动，生命时钟今天又为我续命了！🏃‍♂️✨',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    mediaDuration: '00:45',
    videoThumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    moderationStatus: 'approved',
    likesCount: 142,
    likedByMe: true,
    tags: ['晨跑逆龄', '心肺强化', '生命时钟打卡'],
    viewsCount: 1890,
    product: INITIAL_PRODUCTS[1], // 挂载带货商品链接
    comments: [
      {
        id: 'c_1',
        authorId: 'user_fan_1',
        authorName: '李想 (LIFE FANS)',
        authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=fan1',
        createdAt: Date.now() - 3600000 * 2,
        text: '太强了！看你的打卡视频我也开始慢跑了，已经连续跑了5天，睡眠质量直线飙升！已关注成为您的 LIFE FANS！',
        isLifeFan: true,
      },
      {
        id: 'c_2',
        authorId: 'user_fan_2',
        authorName: '生机健康家',
        authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=fan2',
        createdAt: Date.now() - 3600000 * 1,
        text: '压心率跑才是长寿的王道，不盲目冲刺才能保护线粒体！同款手环挂车我刚下单了一个试用。',
      },
    ],
  },
  {
    id: 'post_2',
    authorId: 'user_chef_clara',
    authorName: '克拉拉的抗炎餐盘',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorBadge: '🥗 抗炎控糖先锋',
    createdAt: Date.now() - 3600000 * 12,
    content: '【色彩抗炎生机盘】连续7天遵循低升糖指数(GI)饮食：羽衣甘蓝、烤挪威三文鱼、牛油果切片，淋上特级初榨橄榄油与奇亚籽。不仅餐后血糖峰值从未超过6.2mmol/L，最惊喜的是皮肤暗沉彻底褪去，生理年龄测试年轻了1.8岁！营养就是身体最好的修复材料🥦🥑🐟',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    moderationStatus: 'approved',
    likesCount: 236,
    likedByMe: false,
    tags: ['抗炎饮食', '低GI', '控糖养生'],
    viewsCount: 3420,
    product: INITIAL_PRODUCTS[3], // 挂载带货商品链接
    comments: [
      {
        id: 'c_3',
        authorId: 'user_fan_3',
        authorName: '阳光长寿者 (LIFE FANS)',
        authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=fan3',
        createdAt: Date.now() - 3600000 * 8,
        text: '三文鱼配牛油果的脂肪酸比例真的太绝了，必须成为克拉拉老师的 LIFE FANS，每天抄作业！',
        isLifeFan: true,
      },
    ],
  },
  {
    id: 'post_3',
    authorId: 'user_office_yoga',
    authorName: '职场脊柱救星',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorBadge: '🛡️ 久坐终结者',
    createdAt: Date.now() - 3600000 * 20,
    content: '【工位弹力带拯救久坐僵硬】程序员每天坐着写代码容易骨盆前倾。给大家演示3个坐在办公椅上就能完成的髂腰肌伸展与肩背阻力后缩动作，每天每小时起立3分钟，腰椎压力瞬间释放90%！',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    moderationStatus: 'approved',
    likesCount: 98,
    likedByMe: false,
    tags: ['职场健康', '拒绝久坐', '弹力带拉伸'],
    viewsCount: 1650,
    product: INITIAL_PRODUCTS[2], // 挂载带货商品链接
    comments: [],
  },
];

export const INITIAL_MERCHANT_CERT: MerchantCertification = {
  userId: 'user_default',
  realName: '张守强',
  idCardNumber: '31010419980615****',
  contactPhone: '13800008869',
  merchantType: 'health_food',
  depositAmount: 2000,
  depositStatus: 'paid',
  depositPaidAt: Date.now() - 86400000 * 15,
  monthlyRevenue: 320000,
  hasBusinessLicense: true,
  businessLicenseNumber: '91310115MA1K7890XX',
  businessLicenseName: '长寿之光大健康管理（上海）有限公司',
  isVerified: true,
  certifiedAt: Date.now() - 86400000 * 15,
};

// Storage helper functions
export function loadExpertVideos(): ExpertLectureVideo[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEYS.EXPERT_VIDEOS);
    if (!raw) return INITIAL_EXPERT_VIDEOS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXPERT_VIDEOS;
  }
}

export function saveExpertVideos(videos: ExpertLectureVideo[]): void {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEYS.EXPERT_VIDEOS, JSON.stringify(videos));
  } catch (e) {
    console.warn('Failed to save expert videos:', e);
  }
}

export function loadCommunityPosts(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEYS.COMMUNITY_POSTS);
    if (!raw) return INITIAL_COMMUNITY_POSTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMUNITY_POSTS;
  }
}

export function saveCommunityPosts(posts: CommunityPost[]): void {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
  } catch (e) {
    console.warn('Failed to save community posts:', e);
  }
}

export function loadMerchantCert(): MerchantCertification {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEYS.MERCHANT_CERT);
    if (!raw) return INITIAL_MERCHANT_CERT;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MERCHANT_CERT;
  }
}

export function saveMerchantCert(cert: MerchantCertification): void {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEYS.MERCHANT_CERT, JSON.stringify(cert));
  } catch (e) {
    console.warn('Failed to save merchant cert:', e);
  }
}

export function loadFollowedUserIds(): string[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEYS.FOLLOWED_USERS);
    if (!raw) return ['user_runner_jack']; // follow jack by default as LIFE FANS
    return JSON.parse(raw);
  } catch {
    return ['user_runner_jack'];
  }
}

export function saveFollowedUserIds(ids: string[]): void {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEYS.FOLLOWED_USERS, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to save followed users:', e);
  }
}

export function loadAdminAlertConfig(): AdminAlertConfig {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEYS.ADMIN_ALERT_CONFIG);
    if (!raw) return DEFAULT_ADMIN_ALERT_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ADMIN_ALERT_CONFIG;
  }
}

export function saveAdminAlertConfig(config: AdminAlertConfig): void {
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEYS.ADMIN_ALERT_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save admin alert config:', e);
  }
}
