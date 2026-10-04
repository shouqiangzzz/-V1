import React, { useState } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Heart, 
  Activity, 
  MapPin, 
  Clock, 
  Sparkles, 
  Flame, 
  Camera, 
  RotateCcw
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useLanguage } from '../../services/i18n';

interface ARShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  netGainSeconds?: number;
}

export const ARShareCardModal: React.FC<ARShareCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  netGainSeconds = 7200,
}) => {
  const { language } = useLanguage();
  const [template, setTemplate] = useState<'run' | 'meal' | 'clock' | 'streak'>('run');
  const [customQuote, setCustomQuote] = useState('把时间投资给身体，岁月自会给线粒体答案。');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const gainHours = (netGainSeconds / 3600).toFixed(1);

  const handleCopyText = () => {
    const text = `【生命时钟 · 长寿自律打卡】\n🏃 今日心肺耐力跑 5.20 KM · 平均心率 138 bpm\n⏳ 净延长生命倒计时：+${gainHours} 小时\n🧬 当前推算生物年龄：24.71 岁（比实际年轻 3.6 岁）\n💬 每日心得：“${customQuote}”\n#生命时钟 #抗衰自律 #线粒体复壮`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'zh' ? '运动轨迹与生机餐 · AR 长寿合影卡' : 'AR Activity & Longevity Share Card'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'zh' ? '自动集成心率、GPS轨迹与延寿秒数，生成炫酷高规格朋友圈卡片' : 'Generate stylish social cards with heart rate, trajectory & life gains'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Template Selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTemplate('run')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                template === 'run'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🏃 晨跑心肺轨迹
            </button>
            <button
              onClick={() => setTemplate('meal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                template === 'meal'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🥑 地中海生机餐
            </button>
            <button
              onClick={() => setTemplate('clock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                template === 'clock'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ⏳ 生命倒计时暴击
            </button>
            <button
              onClick={() => setTemplate('streak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                template === 'streak'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🔥 24天连击勋章
            </button>
          </div>

          {/* AR CARD PREVIEW CONTAINER */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-5 shadow-2xl relative overflow-hidden text-white space-y-4">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sm">
                      {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full rounded-[10px] object-cover" /> : '🧬'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold">{profile.name || '探索者'}</div>
                    <div className="text-[10px] text-emerald-400 font-mono-num">LIFE CLOCK · CERTIFIED</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    逆龄 -3.6 岁
                  </span>
                </div>
              </div>

              {/* Card Dynamic Body */}
              {template === 'run' && (
                <div className="space-y-3 relative z-10">
                  {/* Simulated GPS Track SVG */}
                  <div className="h-32 w-full rounded-2xl bg-slate-950/80 border border-slate-800 relative flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full p-3" viewBox="0 0 300 120">
                      <path 
                        d="M 20 80 Q 70 20 120 70 T 200 40 T 280 90" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="3.5" 
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                      <circle cx="20" cy="80" r="5" fill="#06b6d4" />
                      <circle cx="280" cy="90" r="6" fill="#10b981" />
                    </svg>
                    <div className="absolute top-2 left-3 text-[10px] text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>国家奥林匹克森林公园 · 晨光心肺跑</span>
                    </div>
                    <div className="absolute bottom-2 right-3 text-[10px] text-emerald-400 font-bold font-mono-num">
                      5.20 KM · 配速 5'32"
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                        <Heart className="w-3 h-3 text-rose-400 animate-ping" />
                        <span>平均运动心率</span>
                      </div>
                      <div className="text-base font-black text-rose-300 font-mono-num mt-0.5">138 bpm</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>今日长寿时间延展</span>
                      </div>
                      <div className="text-base font-black text-emerald-400 font-mono-num mt-0.5">+{gainHours} 小时</div>
                    </div>
                  </div>
                </div>
              )}

              {template === 'meal' && (
                <div className="space-y-3 relative z-10">
                  <div className="h-32 w-full rounded-2xl overflow-hidden relative border border-slate-800">
                    <img 
                      src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=300&fit=crop" 
                      className="w-full h-full object-cover" 
                      alt="Mediterranean Salad" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="font-bold">野生三文鱼特级初榨橄榄油沙拉</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                        AI评分 96分
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    🥗 丰富 Omega-3 脂肪酸与花青素多酚，显著下调全身低度慢性炎症，延缓端粒磨损。
                  </div>
                </div>
              )}

              {template === 'clock' && (
                <div className="py-4 text-center space-y-2 relative z-10">
                  <div className="text-xs text-slate-400">当前生理生命倒计时剩余</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono-num tracking-tight">
                    20,705 天 14 时
                  </div>
                  <div className="text-xs text-amber-300 font-semibold">
                    🔥 累计逆龄减龄 +3.60 年 · 跑赢同龄基准
                  </div>
                </div>
              )}

              {template === 'streak' && (
                <div className="py-3 text-center space-y-2 relative z-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                      🏆
                    </div>
                  </div>
                  <div className="text-lg font-black text-white font-mono-num">
                    连续 24 天复利达成
                  </div>
                  <div className="text-xs text-slate-400">
                    深度睡眠 7.5h · 晨光运动 · 地中海饮食
                  </div>
                </div>
              )}

              {/* Quote & Footer */}
              <div className="relative z-10 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                “{customQuote}”
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>扫码加入生命时钟社区</span>
                <span className="font-mono-num font-bold text-emerald-400">Life-Clock AR Engine</span>
              </div>

            </div>
          </div>

          {/* Custom Quote Input */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">自定义分享心得感言</label>
            <input 
              type="text"
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-emerald-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopyText}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '文案已复制！' : '复制朋友圈配套文案'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess ? '高清海报已保存！' : '保存高清 AR 海报'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
