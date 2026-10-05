// Bilingual content translations for Community Hub and Longevity Discovery
export interface TranslatedContent {
  title?: string;
  speaker?: string;
  speakerTitle?: string;
  description?: string;
  keyTakeaways?: string[];
  authorName?: string;
  authorBadge?: string;
  content?: string;
  comments?: Array<{ authorName: string; text: string }>;
  productTitle?: string;
  merchantName?: string;
  endorsementText?: string;
  tags?: string[];
}

export const COMMUNITY_EN_TRANSLATIONS: Record<string, TranslatedContent> = {
  // Expert Lecture Videos
  'expert_video_1': {
    title: 'Aging Biology Breakthrough: Mitophagy & Telomere Extension Science',
    speaker: 'Prof. Mingde Li',
    speakerTitle: 'Director of Longevity Medicine Research Center · Ph.D. Advisor',
    description: 'Systematically breaking down the mechanisms of NAD+ depletion, SIRT longevity protein activation pathways, and how intermittent caloric restriction promotes deep cellular autophagy, with an anti-aging lifestyle protocol for 40+.',
    keyTakeaways: [
      'Telomerase activity positively correlates with mitochondrial ATP output; circadian stability is the first defense for genomic integrity',
      '150 mins of weekly Zone 2 aerobic exercise significantly boosts skeletal muscle mitochondrial density by 40%',
      'Supplement high-quality polyphenols and cruciferous sulforaphane to activate the master Nrf2 antioxidant defense'
    ],
    tags: ['Cellular Anti-aging', 'Frontier Longevity', 'Expert Lecture', 'Rejuvenation Science']
  },
  'expert_video_2': {
    title: 'Deep Sleep Architecture & Circadian Clock Rejuvenation',
    speaker: 'Dr. Weiwei Chen',
    speakerTitle: 'Ph.D. in Neurobiology, Harvard Medical School · Member of Sleep Research Society',
    description: 'The glymphatic clearing mechanism of beta-amyloid during slow-wave deep sleep, and how to achieve at least 90 mins of deep restorative sleep each night via light management and core temperature modulation.',
    keyTakeaways: [
      'Blocking blue light exposure after 22:00 advances pineal melatonin peak and increases secretion by 30%',
      'Maintaining bedroom temperature at 18-20°C facilitates core body cooling, accelerating slow-wave sleep induction',
      'A regular sleep-wake anchor is more impactful than catching up on sleep, defeating social jetlag'
    ],
    tags: ['Deep Sleep', 'Frontier Longevity', 'Expert Lecture', 'Rejuvenation Science']
  },
  'expert_video_3': {
    title: 'Resistance Training & Microvascular Remodeling for Longevity',
    speaker: 'Researcher Zhenyu Sun',
    speakerTitle: 'Senior Strength Coach, National Institute of Sports Science · Exercise Prescription Specialist',
    description: 'Lower body quadriceps and glutes are known as the body\'s "second heart". Learn how to activate muscle fibers with resistance bands and bodyweight to enhance bone density while preventing joint wear.',
    keyTakeaways: [
      'Skeletal muscle is the body\'s largest insulin-sensitive organ; preserving muscle mass fundamentally prevents type 2 diabetes',
      'Every 1 cm increase in thigh circumference is significantly inversely correlated with all-cause mortality risk',
      'Supplement adequate leucine and electrolyte water pre- and post-workout to minimize delayed-onset muscle soreness'
    ],
    tags: ['Cardio Fitness', 'Frontier Longevity', 'Expert Lecture', 'Rejuvenation Science']
  },

  // Community Posts
  'post_1': {
    title: '[Morning Cardio Rejuvenation Day 18] 6km Jog at 5:30 AM',
    authorName: 'Running Longevity Seeker',
    authorBadge: '🏅 Vitality Practitioner',
    content: '[Morning Cardio Rejuvenation Day 18] Woke up at 5:30 AM for a 6km jog at a 5\'40" pace, average HR strictly at 136 bpm (Zone 2 golden fat oxidation and microvascular remodeling zone). 15 mins of post-run stretching left my cells completely refreshed! Consistent exercise adds precious seconds to my life clock every day! 🏃‍♂️✨',
    tags: ['Morning Run', 'Cardio Boost', 'Life Clock Log'],
    comments: [
      {
        authorName: 'Xiang Li (LIFE FANS)',
        text: 'Incredible! Watching your check-ins inspired me to start jogging too. Day 5 and my sleep quality has skyrocketed! Followed you as a proud LIFE FAN!'
      },
      {
        authorName: 'Vitality Wellness',
        text: 'Low-heart-rate running is the true key to longevity—protecting mitochondria without reckless sprinting! Just ordered the smart tracker you recommended.'
      }
    ]
  },
  'post_2': {
    title: '[Color Anti-inflammatory Plate] 7-Day Low-GI Diet Experience',
    authorName: 'Clara\'s Anti-inflammatory Plate',
    authorBadge: '🥗 Glucose & Anti-inflammation Pioneer',
    content: '[Color Anti-inflammatory Plate] 7 consecutive days following a low-glycemic index (GI) diet: kale, roasted Norwegian salmon, sliced avocado, drizzled with cold-pressed extra virgin olive oil and chia seeds. Post-meal glucose peak never exceeded 6.2 mmol/L, skin dullness completely vanished, and biological age tested 1.8 years younger! Nutrition is the body\'s ultimate repair tool 🥦🥑🐟',
    tags: ['Anti-inflammatory Diet', 'Low-GI', 'Glucose Control'],
    comments: [
      {
        authorName: 'Sunny Longevity (LIFE FANS)',
        text: 'The fatty acid ratio of salmon and avocado is phenomenal! Becoming Clara\'s LIFE FAN to follow these daily recipes!'
      }
    ]
  },
  'post_3': {
    title: '[Desk Resistance Band Stretches for Sedentary Relief]',
    authorName: 'Workplace Spine Saver',
    authorBadge: '🛡️ Anti-Sedentary Crusader',
    content: '[Desk Resistance Band Stretches for Sedentary Relief] Programmers sitting all day easily develop anterior pelvic tilt. Here are 3 psoas stretches and scapular retraction exercises you can do right from your office chair. Standing up for 3 minutes every hour relieves 90% of lumbar pressure!',
    tags: ['Workplace Wellness', 'Anti-Sedentary', 'Resistance Band Stretches'],
    comments: []
  },

  // Attached Products
  'prod_1': {
    productTitle: 'Deep Sea Pure Omega-3 Fish Oil (IFOS 5-Star EPA+DHA 92%)',
    merchantName: 'Hengjian Biotech Official Store',
    endorsementText: 'AI 7-day wearable stream: Resting HR dropped from 58 to 53.4 bpm, deep sleep rate 96.2%, proven mitochondrial anti-inflammatory efficacy.'
  },
  'prod_2': {
    productTitle: 'Smart Posture & Sedentary Vibration Reminder Band (IP68 / HR Monitor)',
    merchantName: 'Speed Pioneer Health Gear',
    endorsementText: 'AI 7-day wearable stream: Blocked sedentary timeouts 6 times/day, reduced venous stagnation, 98% daily micro-exercise completion.'
  },
  'prod_3': {
    productTitle: 'Natural High-Elasticity Resistance Band Full Set with Workout Guide',
    merchantName: 'Vitality Works Fitness Lab',
    endorsementText: 'AI 7-day wearable stream: Basal metabolic rate increased by 6.4% after large muscle group activation, 5-star muscle preservation score.'
  },
  'prod_4': {
    productTitle: 'Cold-Pressed Extra Virgin Olive Oil (Acidity ≤0.3% High Polyphenol)',
    merchantName: 'Mediterranean Oasis Organic Farm',
    endorsementText: 'AI 7-day biomarker stream: Fasting glucose decreased by 0.4 mmol/L with rich dietary polyphenols, improved vascular endothelial elasticity.'
  }
};

export const TAG_MAP_ZH_TO_EN: Record<string, string> = {
  '全部': 'All',
  '细胞抗衰': 'Cellular Anti-aging',
  '深度睡眠': 'Deep Sleep',
  '抗炎饮食': 'Anti-inflammatory Diet',
  '心肺运动': 'Cardio Fitness',
  '久坐改善': 'Sedentary Relief',
  '间歇断食': 'Intermittent Fasting',
  '晨跑逆龄': 'Morning Run',
  '心肺强化': 'Cardio Boost',
  '生命时钟打卡': 'Life Clock Log',
  '低GI': 'Low-GI',
  '控糖养生': 'Glucose Control',
  '职场健康': 'Workplace Wellness',
  '拒绝久坐': 'Anti-Sedentary',
  '弹力带拉伸': 'Resistance Stretches',
  '前沿长寿医学': 'Frontier Longevity',
  '权威讲座': 'Expert Lecture',
  '逆龄研究': 'Rejuvenation Science',
  '长寿日常': 'Daily Longevity',
  '地中海饮食': 'Mediterranean Diet',
  '多酚': 'Polyphenols',
  '特级初榨橄榄油': 'Extra Virgin Olive Oil',
  'Omega-3': 'Omega-3',
  '深睡排毒': 'Deep Sleep Detox',
  '昼夜节律': 'Circadian Rhythm',
  '腺苷': 'Adenosine',
  '褪黑素': 'Melatonin',
  '脑健康': 'Brain Health',
  '间歇性断食': 'Intermittent Fasting',
  '线粒体': 'Mitochondria',
  '自噬': 'Autophagy',
  '长寿基因SIRT1': 'SIRT1 Longevity Gene',
  'NMN': 'NMN',
  '细胞自噬': 'Autophagy',
  'NAD+': 'NAD+',
  '表观遗传': 'Epigenetics',
  '抗衰医学': 'Anti-aging Medicine'
};

export function translateTag(tag: string, language: 'zh' | 'en'): string {
  if (language === 'zh') return tag;
  return TAG_MAP_ZH_TO_EN[tag] || tag;
}

export function translateCategory(cat: string, language: 'zh' | 'en'): string {
  if (language === 'zh') return cat;
  return TAG_MAP_ZH_TO_EN[cat] || cat;
}
