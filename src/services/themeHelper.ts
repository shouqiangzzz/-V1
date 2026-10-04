import { ThemeConfig, BackgroundStyle } from '../types';

export const THEME_PRESETS: Record<BackgroundStyle, {
  name: string;
  desc: string;
  config: ThemeConfig;
  previewGradient: string;
}> = {
  space: {
    name: '深空极夜 (Deep Space)',
    desc: '浩瀚宇宙星河，深沉夜空与极光星云光晕',
    previewGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    config: {
      style: 'space',
      customBgColor: '#030712',
      customSecondaryColor: '#0b1329',
      customAccentColor: '#10b981',
      backgroundPattern: 'stars',
      blurOpacity: 0.85,
    },
  },
  cyber: {
    name: '赛博矩阵 (Cyber Emerald)',
    desc: '高科技脉冲与自律矩阵网格，生命能量律动',
    previewGradient: 'from-black via-emerald-950/70 to-slate-950',
    config: {
      style: 'cyber',
      customBgColor: '#020b07',
      customSecondaryColor: '#062d1d',
      customAccentColor: '#00f59b',
      backgroundPattern: 'grid',
      blurOpacity: 0.8,
    },
  },
  aurora: {
    name: '极光幻境 (Northern Aurora)',
    desc: '绚烂北极光辉，靛蓝、紫罗兰与青碧流光交织',
    previewGradient: 'from-slate-950 via-purple-950/50 to-teal-950',
    config: {
      style: 'aurora',
      customBgColor: '#090514',
      customSecondaryColor: '#1e0c3a',
      customAccentColor: '#a855f7',
      backgroundPattern: 'mesh',
      blurOpacity: 0.9,
    },
  },
  sunset: {
    name: '禅境暮色 (Zen Twilight)',
    desc: '温暖夕阳余晖，古铜木质与暮色晚霞的平静沉思',
    previewGradient: 'from-stone-950 via-amber-950/40 to-stone-900',
    config: {
      style: 'sunset',
      customBgColor: '#0c0a09',
      customSecondaryColor: '#291809',
      customAccentColor: '#f59e0b',
      backgroundPattern: 'mesh',
      blurOpacity: 0.85,
    },
  },
  obsidian: {
    name: '纯粹曜石 (Obsidian Dark)',
    desc: '极致纯粹深黑极简，专注时间与自律流转',
    previewGradient: 'from-black via-zinc-950 to-black',
    config: {
      style: 'obsidian',
      customBgColor: '#000000',
      customSecondaryColor: '#09090b',
      customAccentColor: '#10b981',
      backgroundPattern: 'none',
      blurOpacity: 1.0,
    },
  },
  ocean: {
    name: '深海微光 (Abyssal Ocean)',
    desc: '千米深海沉浸感，伴随青蓝生物荧光律动',
    previewGradient: 'from-slate-950 via-cyan-950/50 to-blue-950',
    config: {
      style: 'ocean',
      customBgColor: '#020d18',
      customSecondaryColor: '#04273b',
      customAccentColor: '#06b6d4',
      backgroundPattern: 'mesh',
      blurOpacity: 0.85,
    },
  },
  custom: {
    name: '完全自定义面板 (Custom Palette)',
    desc: '自由定义主底色、副渐变与高光发光色',
    previewGradient: 'from-slate-900 via-slate-800 to-slate-950',
    config: {
      style: 'custom',
      customBgColor: '#080d1a',
      customSecondaryColor: '#151d36',
      customAccentColor: '#10b981',
      backgroundPattern: 'mesh',
      blurOpacity: 0.85,
    },
  },
};

// Curated Cartoon & Persona Avatars
export interface CartoonAvatar {
  id: string;
  name: string;
  category: 'cartoon' | 'cyber' | 'animal' | 'nature';
  url: string;
  badge: string;
}

export const CARTOON_AVATARS: CartoonAvatar[] = [
  {
    id: 'bot_mecha',
    name: '寿命机甲',
    category: 'cyber',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=LifeMecha99&backgroundColor=0284c7',
    badge: '赛博',
  },
  {
    id: 'zen_cat',
    name: '禅修猫咪',
    category: 'animal',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ZenKittyCat&backgroundColor=10b981',
    badge: '萌愈',
  },
  {
    id: 'fox_biohacker',
    name: '极客灵狐',
    category: 'animal',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BiohackFox&backgroundColor=f59e0b',
    badge: '机敏',
  },
  {
    id: 'panda_master',
    name: '养生大侠',
    category: 'animal',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DisciplinedPanda&backgroundColor=059669',
    badge: '长寿',
  },
  {
    id: 'astro_traveler',
    name: '深空领航员',
    category: 'cyber',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=StarNavigator&backgroundColor=6366f1',
    badge: '探索',
  },
  {
    id: 'silver_sage',
    name: '未来仙者',
    category: 'cartoon',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SilverSageLongevity&backgroundColor=8b5cf6',
    badge: '睿智',
  },
  {
    id: 'sun_seed',
    name: '向阳萌芽',
    category: 'nature',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SunSprout&backgroundColor=84cc16',
    badge: '生机',
  },
  {
    id: 'aqua_dolphin',
    name: '深潜海豚',
    category: 'animal',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DeepAquaDolphin&backgroundColor=06b6d4',
    badge: '活力',
  },
  {
    id: 'fire_lion',
    name: '能量战狮',
    category: 'animal',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FlameHeartLion&backgroundColor=f43f5e',
    badge: '力量',
  },
  {
    id: 'owl_scholar',
    name: '明昼之鸮',
    category: 'cartoon',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MindfulOwl&backgroundColor=d97706',
    badge: '专注',
  },
  {
    id: 'neon_pulse',
    name: '电光行者',
    category: 'cyber',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonRunnerPulse&backgroundColor=14b8a6',
    badge: '敏捷',
  },
  {
    id: 'sprout_guardian',
    name: '生命守护精灵',
    category: 'nature',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=LifeTreeGuardian&backgroundColor=10b981',
    badge: '自律',
  },
];
