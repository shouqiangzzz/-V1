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

// ====== 10 New UI Style Presets (CSS-variable driven, full light & dark palettes) ======
export interface UiStyleVars {
  bg: string;          // --bd-bg         page background
  bgSoft: string;      // --bd-bg-soft    ambient gradient
  card: string;        // --bd-card       card background
  border: string;      // --bd-border     card border
  text: string;        // --bd-text       primary text
  sub: string;         // --bd-sub        secondary text
  muted: string;       // --bd-muted      weak text
  accent: string;      // --bd-accent     accent color
  accentStrong: string;// --bd-accent-strong
  accentSoft: string;  // --bd-accent-soft
  nav: string;         // --bd-nav        navbar bg
  navBorder: string;   // --bd-nav-border
  chip: string;        // --bd-chip       chip / soft bg
}

export interface UiStylePreset {
  id: string;
  name: string;
  desc: string;
  preview: string;     // css gradient for preview chip
  vars: UiStyleVars;
}

export const UI_STYLES: UiStylePreset[] = [
  { id:'moonlight', name:'月光银辉', desc:'浅灰白 · 极简专注', preview:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', vars:{ bg:'#f1f5f9', bgSoft:'#e2e8f0', card:'#ffffff', border:'#e2e8f0', text:'#1e293b', sub:'#64748b', muted:'#94a3b8', accent:'#10b981', accentStrong:'#059669', accentSoft:'#d1fae5', nav:'#ffffff', navBorder:'#e2e8f0', chip:'#f1f5f9' } },
  { id:'mint', name:'薄荷苏打', desc:'浅薄荷绿 · 清新活力', preview:'linear-gradient(135deg,#e6f7f0,#d1efe4)', vars:{ bg:'#e6f7f0', bgSoft:'#d1efe4', card:'#ffffff', border:'#cfe8de', text:'#0f3d2e', sub:'#3d7a66', muted:'#6aa693', accent:'#10b981', accentStrong:'#0d9e6e', accentSoft:'#d1fae5', nav:'#ffffff', navBorder:'#cfe8de', chip:'#eefaf5' } },
  { id:'sea', name:'海盐气泡', desc:'浅海蓝 · 澄澈清爽', preview:'linear-gradient(135deg,#e8f4fb,#d3e9f7)', vars:{ bg:'#e8f4fb', bgSoft:'#d3e9f7', card:'#ffffff', border:'#cfe2f2', text:'#123a52', sub:'#3d6b87', muted:'#6f97b0', accent:'#0ea5e9', accentStrong:'#0284c7', accentSoft:'#e0f2fe', nav:'#ffffff', navBorder:'#cfe2f2', chip:'#eff8fd' } },
  { id:'cream', name:'奶油杏暖', desc:'暖米杏 · 温柔治愈', preview:'linear-gradient(135deg,#faf5ec,#f3e9d7)', vars:{ bg:'#faf5ec', bgSoft:'#f3e9d7', card:'#ffffff', border:'#ecdfc8', text:'#4a3520', sub:'#8a6d4f', muted:'#b59b7d', accent:'#f59e0b', accentStrong:'#d97706', accentSoft:'#fef3c7', nav:'#ffffff', navBorder:'#ecdfc8', chip:'#fdf8ef' } },
  { id:'sakura', name:'樱花薄雾', desc:'浅樱粉 · 柔美浪漫', preview:'linear-gradient(135deg,#fdf0f4,#f8dce6)', vars:{ bg:'#fdf0f4', bgSoft:'#f8dce6', card:'#ffffff', border:'#f2d3df', text:'#4a1f31', sub:'#9c5570', muted:'#c08ea4', accent:'#ec4899', accentStrong:'#db2777', accentSoft:'#fce7f3', nav:'#ffffff', navBorder:'#f2d3df', chip:'#fef4f8' } },
  { id:'lavender', name:'薰衣草梦', desc:'浅薰衣草紫 · 静谧优雅', preview:'linear-gradient(135deg,#e9d5ff,#ddd6fe)', vars:{ bg:'#e9d5ff', bgSoft:'#ddd6fe', card:'#ffffff', border:'#ddd6fe', text:'#3b2f5e', sub:'#7c6f9e', muted:'#a89cc2', accent:'#8b5cf6', accentStrong:'#7c3aed', accentSoft:'#ede9fe', nav:'#ffffff', navBorder:'#ddd6fe', chip:'#f5f3ff' } },
  { id:'misty', name:'雾蓝夜幕', desc:'深蓝夜幕 · 沉静深邃', preview:'linear-gradient(135deg,#0b1220,#16233a)', vars:{ bg:'#0b1220', bgSoft:'#16233a', card:'#1e293b', border:'#334155', text:'#f1f5f9', sub:'#94a3b8', muted:'#64748b', accent:'#38bdf8', accentStrong:'#0ea5e9', accentSoft:'#0c4a6e', nav:'#0f172a', navBorder:'#1e293b', chip:'#1e293b' } },
  { id:'jade', name:'墨玉森屿', desc:'深墨绿 · 原始生命力', preview:'linear-gradient(135deg,#07130d,#0c2419)', vars:{ bg:'#07130d', bgSoft:'#0c2419', card:'#0f2a1f', border:'#1e4a38', text:'#e7f5ef', sub:'#7fb89e', muted:'#4d8069', accent:'#34d399', accentStrong:'#10b981', accentSoft:'#064e3b', nav:'#0a1f16', navBorder:'#1e4a38', chip:'#0f2a1f' } },
  { id:'obsidian', name:'曜石金律', desc:'纯粹黑金 · 极致奢华', preview:'linear-gradient(135deg,#000000,#111111)', vars:{ bg:'#000000', bgSoft:'#111111', card:'#18181b', border:'#3f3f46', text:'#fafafa', sub:'#a1a1aa', muted:'#71717a', accent:'#f59e0b', accentStrong:'#d97706', accentSoft:'#3f2d06', nav:'#09090b', navBorder:'#27272a', chip:'#18181b' } },
  { id:'aurora', name:'极光幻境', desc:'紫罗兰流光 · 梦幻迷离', preview:'linear-gradient(135deg,#0a0718,#1e0c3a)', vars:{ bg:'#0a0718', bgSoft:'#1e0c3a', card:'#221240', border:'#3b2a63', text:'#f3efff', sub:'#a99ac8', muted:'#7d6fa0', accent:'#a855f7', accentStrong:'#8b5cf6', accentSoft:'#3b0764', nav:'#150a2e', navBorder:'#3b2a63', chip:'#221240' } },
];
