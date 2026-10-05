import React, { useState, useRef } from 'react';
import { 
  X, 
  Palette, 
  Smile, 
  Upload, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  RotateCcw, 
  Sliders, 
  Sun, 
  Moon, 
  Layers, 
  ShieldCheck,
  Zap,
  Camera
} from 'lucide-react';
import { UserProfile, ThemeConfig, BackgroundStyle, BackgroundPattern } from '../types';
import { THEME_PRESETS, CARTOON_AVATARS, CartoonAvatar, UI_STYLES, ASSISTANT_AVATARS, ASSISTANT_AVATAR_KEY } from '../services/themeHelper';
import { DEFAULT_THEME_CONFIG } from '../services/storage';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  uiStyleId: string;
  onSelectStyle: (id: string) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  uiStyleId,
  onSelectStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'background'>('avatar');

  // Avatar state
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    profile.avatarUrl || '/avatars/naruto.jpg'
  );
  const [avatarType, setAvatarType] = useState<'preset' | 'custom' | 'cartoon'>(
    profile.avatarType || 'preset'
  );
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'naruto' | 'anime' | 'guofeng' | 'scenery'>('all');
  const [assistantAvatarId, setAssistantAvatarId] = useState<string>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(ASSISTANT_AVATAR_KEY) || 'bot_default' : 'bot_default'
  );
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Theme config state
  const [theme, setTheme] = useState<ThemeConfig>(
    profile.themeConfig || DEFAULT_THEME_CONFIG
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload and compress via Canvas to ~200x200
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('请上传图片格式文件 (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('图片大小不能超过 8MB');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 220;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCurrentAvatar(compressedDataUrl);
          setAvatarType('custom');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Preset styles handler
  const handleSelectPreset = (key: BackgroundStyle) => {
    const preset = THEME_PRESETS[key];
    if (preset) {
      setTheme({
        ...preset.config,
      });
    }
  };

  // Color Swatch quick selectors
  const PRIMARY_SWATCHES = [
    { label: '极夜曜黑', color: '#030712' },
    { label: '星云深蓝', color: '#06101e' },
    { label: '赛博墨绿', color: '#021a12' },
    { label: '紫晶幻夜', color: '#160826' },
    { label: '古铜原木', color: '#1c1917' },
    { label: '纯粹暗黑', color: '#000000' },
  ];

  const SECONDARY_SWATCHES = [
    { label: '藏青渐变', color: '#0c1527' },
    { label: '翡翠暗光', color: '#064e3b' },
    { label: '暗紫流光', color: '#2e1065' },
    { label: '暖暮焦糖', color: '#451a03' },
    { label: '冷灰炭黑', color: '#18181b' },
    { label: '碧海沉渊', color: '#082f49' },
  ];

  const ACCENT_SWATCHES = [
    { label: '翡翠绿', color: '#10b981' },
    { label: '赛博青', color: '#06b6d4' },
    { label: '极光紫', color: '#a855f7' },
    { label: '晨曦金', color: '#f59e0b' },
    { label: '珊瑚粉', color: '#ec4899' },
    { label: '电光绿', color: '#84cc16' },
    { label: '烈焰红', color: '#ef4444' },
  ];

  // Save all customizer settings
  const handleSave = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      avatarUrl: currentAvatar,
      avatarType,
      themeConfig: theme,
    };
    onSaveProfile(updatedProfile);
    onClose();
  };

  // Reset to initial default
  const handleResetToDefault = () => {
    setTheme(DEFAULT_THEME_CONFIG);
    setCurrentAvatar('/avatars/naruto.jpg');
    setAvatarType('preset');
  };

  const filteredCartoons = avatarFilter === 'all' 
    ? CARTOON_AVATARS 
    : CARTOON_AVATARS.filter(a => a.category === avatarFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div 
            className="p-3 rounded-2xl text-slate-950 shadow-lg"
            style={{ backgroundColor: theme.customAccentColor }}
          >
            <Palette className="w-6 h-6 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                界面装扮与头像定制
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                实时即刻生效
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              自定义上传喜爱的图片或卡通形象 · 调校界面背景、自选渐变与高光颜色面板
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'avatar'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smile className="w-4 h-4 text-emerald-400" />
            <span>头像与卡通形象定制</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'background'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>背景风格与颜色面板</span>
          </button>
        </div>

        {/* TAB 1: Avatar & Cartoon Customization */}
        {activeTab === 'avatar' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Current Active Avatar Showcase */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-2xl p-1 shadow-xl flex items-center justify-center overflow-hidden border-2"
                  style={{ borderColor: theme.customAccentColor }}
                >
                  <img
                    src={currentAvatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 p-1 rounded-full text-slate-950"
                  style={{ backgroundColor: theme.customAccentColor }}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {avatarType === 'custom' ? '自定义上传' : avatarType === 'cartoon' ? '卡通萌宠' : '经典预设'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  当前头像将同步显示在主时钟、健康档案、打卡记录及顶部导航栏中。
                </p>
              </div>

              {/* Upload Action Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>上传本地图片/卡通</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl">
                {uploadError}
              </p>
            )}

            {/* Quick URL Input */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                也可以直接粘贴网络图片 / 卡通图像链接 (URL)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-avatar.png"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  disabled={!customUrlInput}
                  onClick={() => {
                    if (customUrlInput) {
                      setCurrentAvatar(customUrlInput);
                      setAvatarType('custom');
                      setCustomUrlInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  应用链接
                </button>
              </div>
            </div>

            {/* Curated Cartoon & Persona Avatar Library */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>精选卡通与极客形象库 (一键更换)</span>
                </span>

                {/* Filter tags */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setAvatarFilter('all')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] ${avatarFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setAvatarFilter('naruto')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] ${avatarFilter === 'naruto' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
                  >
                    火影
                  </button>
                  <button
                    onClick={() => setAvatarFilter('anime')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] ${avatarFilter === 'anime' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
                  >
                    日漫
                  </button>
                  <button
                    onClick={() => setAvatarFilter('guofeng')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] ${avatarFilter === 'guofeng' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}
                  >
                    国风
                  </button>
                  <button
                    onClick={() => setAvatarFilter('scenery')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] ${avatarFilter === 'scenery' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
                  >
                    风景
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {filteredCartoons.map((avatar) => {
                  const isSelected = currentAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        setCurrentAvatar(avatar.url);
                        setAvatarType('cartoon');
                      }}
                      className={`p-2 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10' 
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden mb-1.5 bg-slate-900 p-0.5">
                        <img 
                          src={avatar.url} 
                          alt={avatar.name} 
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 block truncate">
                        {avatar.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-400 font-mono">
                        {avatar.badge}
                      </span>

                      {isSelected && (
                        <div 
                          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-slate-950 flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: theme.customAccentColor }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI 长寿私教头像 DIY */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI 长寿私教形象 · 点击即时生效</span>
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {ASSISTANT_AVATARS.map((a) => {
                  const isSel = assistantAvatarId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setAssistantAvatarId(a.id);
                        localStorage.setItem(ASSISTANT_AVATAR_KEY, a.id);
                        window.dispatchEvent(new Event('bd_assistant_avatar_changed'));
                      }}
                      className={`p-2 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                        isSel ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden mb-1.5 bg-slate-900 p-0.5">
                        {a.url ? (
                          <img src={a.url} alt={a.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center">
                            <span className="text-lg">🤖</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 block truncate">{a.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-400 font-mono">{a.badge}</span>
                      {isSel && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-slate-950 flex items-center justify-center shadow-xs" style={{ backgroundColor: theme.customAccentColor }}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Background Presets & Color Customization Panel */}
        {activeTab === 'background' && (
          <div className="space-y-6 animate-fade-in max-h-[460px] overflow-y-auto pr-1">
            
            {/* 0. 10-Click Whole-UI Style Presets (instant) */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>精选 10 款整体界面风格 · 深浅皆有 · 点击即时预览</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {UI_STYLES.map((st) => {
                  const isSelected = uiStyleId === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onSelectStyle(st.id)}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                      }`}
                    >
                      <div
                        className="h-11 rounded-xl mb-2 flex items-end justify-center pb-1 shadow-inner"
                        style={{
                          background: st.preview,
                          border: `1px solid ${st.vars.accent}55`,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ backgroundColor: st.vars.accent, color: '#fff' }}
                        >
                          {st.id.slice(0, 1).toUpperCase()}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white block truncate">{st.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">{st.desc}</span>
                      {isSelected && (
                        <div
                          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-slate-950 flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: theme.customAccentColor }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6 Curated Preset Theme Cards */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                1. 精选预设主题风格
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(THEME_PRESETS) as BackgroundStyle[])
                  .filter(k => k !== 'custom')
                  .map((styleKey) => {
                    const preset = THEME_PRESETS[styleKey];
                    const isSelected = theme.style === styleKey;
                    return (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => handleSelectPreset(styleKey)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                        }`}
                      >
                        {/* Gradient preview bar */}
                        <div 
                          className="h-10 rounded-xl mb-2 flex items-center justify-center shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${preset.config.customBgColor} 0%, ${preset.config.customSecondaryColor} 100%)`,
                            border: `1px solid ${preset.config.customAccentColor}40`
                          }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: preset.config.customAccentColor }} 
                          />
                        </div>

                        <span className="text-xs font-bold text-white block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                          {preset.desc}
                        </span>

                        {isSelected && (
                          <div 
                            className="absolute top-2 right-2 w-4 h-4 rounded-full text-slate-950 flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: theme.customAccentColor }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Custom Color Palette Panel (界面的背景可以设置颜色面板进行用户自定义设定) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <span>2. 颜色面板自由调色 (主背景 / 渐变 / 高光强调)</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  支持 Hex 色码精确调配
                </span>
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Primary Background Color */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold text-slate-300">
                      主背景底色
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {theme.customBgColor}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="color"
                      value={theme.customBgColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        style: 'custom',
                        customBgColor: e.target.value
                      })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={theme.customBgColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        style: 'custom',
                        customBgColor: e.target.value
                      })}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {PRIMARY_SWATCHES.map(sw => (
                      <button
                        key={sw.color}
                        type="button"
                        title={sw.label}
                        onClick={() => setTheme({ ...theme, style: 'custom', customBgColor: sw.color })}
                        className="w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: sw.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Secondary Gradient Color */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold text-slate-300">
                      副渐变流光色
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {theme.customSecondaryColor}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="color"
                      value={theme.customSecondaryColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        style: 'custom',
                        customSecondaryColor: e.target.value
                      })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={theme.customSecondaryColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        style: 'custom',
                        customSecondaryColor: e.target.value
                      })}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {SECONDARY_SWATCHES.map(sw => (
                      <button
                        key={sw.color}
                        type="button"
                        title={sw.label}
                        onClick={() => setTheme({ ...theme, style: 'custom', customSecondaryColor: sw.color })}
                        className="w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: sw.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Accent & Glow Color */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold text-slate-300">
                      高光与粒子色
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {theme.customAccentColor}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="color"
                      value={theme.customAccentColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        style: 'custom',
                        customAccentColor: e.target.value
                      })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={theme.customAccentColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        style: 'custom',
                        customAccentColor: e.target.value
                      })}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {ACCENT_SWATCHES.map(sw => (
                      <button
                        key={sw.color}
                        type="button"
                        title={sw.label}
                        onClick={() => setTheme({ ...theme, style: 'custom', customAccentColor: sw.color })}
                        className="w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: sw.color }}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Background Pattern Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-2">
                  背景氛围装饰微纹理
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'stars', label: '星空粒子' },
                    { id: 'grid', label: '科技网格' },
                    { id: 'mesh', label: '流光光晕' },
                    { id: 'none', label: '纯粹无纹理' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, backgroundPattern: p.id as BackgroundPattern })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        theme.backgroundPattern === p.id
                          ? 'bg-slate-800 text-white border-emerald-500'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Card Preview Box */}
              <div 
                className="p-4 rounded-xl border relative overflow-hidden transition-all shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${theme.customBgColor} 0%, ${theme.customSecondaryColor} 100%)`,
                  borderColor: `${theme.customAccentColor}60`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-bold"
                      style={{ backgroundColor: theme.customAccentColor }}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Life-Dimensions 实况预览</span>
                      <span className="text-[10px] text-slate-300">当前调色板在卡片与发光框上的渲染效果</span>
                    </div>
                  </div>

                  <span 
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                    style={{ 
                      backgroundColor: `${theme.customAccentColor}25`,
                      color: theme.customAccentColor,
                      border: `1px solid ${theme.customAccentColor}50`
                    }}
                  >
                    +2天 14时 28秒
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复默认</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-lg cursor-pointer transition-all hover:brightness-110"
              style={{ backgroundColor: theme.customAccentColor }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>保存并应用装扮</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
