import React, { useState } from 'react';
import { 
  Hourglass, 
  Lock, 
  Unlock, 
  Sparkles, 
  X, 
  Plus, 
  Send, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { TimeCapsule } from '../../types/innovations';
import { UserProfile } from '../../types';
import { useLanguage } from '../../services/i18n';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsules: TimeCapsule[];
  onUpdateCapsules: (newCapsules: TimeCapsule[]) => void;
  profile: UserProfile;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({
  isOpen,
  onClose,
  capsules,
  onUpdateCapsules,
  profile,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'list' | 'write'>('list');
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);

  // New capsule form
  const [newTitle, setNewTitle] = useState('');
  const [newYears, setNewYears] = useState(5);
  const [newLetter, setNewLetter] = useState('');

  if (!isOpen) return null;

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLetter.trim()) return;

    const unlock = new Date();
    unlock.setFullYear(unlock.getFullYear() + newYears);

    const newCap: TimeCapsule = {
      id: `cap-${Date.now()}`,
      title: newTitle,
      createdDate: new Date().toISOString().split('T')[0],
      unlockDate: unlock.toISOString().split('T')[0],
      yearsAhead: newYears,
      letterContent: newLetter,
      lockedData: {
        chronologicalAge: 28.31,
        biologicalAge: 24.71,
        healthScore: 92,
        targetAge: profile.targetAge || 85,
        unlockedMedals: 9,
      },
      isUnlocked: false,
      requiredStreakDays: newYears * 30,
    };

    onUpdateCapsules([newCap, ...capsules]);
    setActiveTab('list');
    setNewTitle('');
    setNewLetter('');
    alert(language === 'zh' ? '时光胶囊已完成封存！各项体测数据与健康信已永久加密上锁。' : 'Time capsule sealed!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {language === 'zh' ? '时光胶囊 · 写给未来自己的健康信' : 'Longevity Time Capsule'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  加密封存
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'zh' 
                  ? '锁定当前生理年龄与指标，向 5 年或 10 年后的自己寄出一封信，到达节点方可启封' 
                  : 'Lock current biomarkers and send a sealed letter to yourself 5 or 10 years ahead'}
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

        {/* Sub-nav */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-3 text-xs shrink-0">
          <button
            onClick={() => { setActiveTab('list'); setSelectedCapsule(null); }}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'list' 
                ? 'text-indigo-400 border-indigo-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '我的时光胶囊展柜' : 'My Capsules'}
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 flex items-center space-x-1 ${
              activeTab === 'write' 
                ? 'text-indigo-400 border-indigo-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '封存一封新信' : 'Seal New Capsule'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {selectedCapsule ? (
                <div className="p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCapsule(null)}
                      className="text-xs text-indigo-400 hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>← 返回列表</span>
                    </button>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      启封日期: {selectedCapsule.unlockDate}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{selectedCapsule.title}</h4>

                  {/* Locked Biomarkers Snapshot */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">封存时实际年龄</div>
                      <div className="text-sm font-bold text-white font-mono-num">{selectedCapsule.lockedData.chronologicalAge} 岁</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">封存时推算生理年龄</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono-num">{selectedCapsule.lockedData.biologicalAge} 岁</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">封存时综合健康分</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono-num">{selectedCapsule.lockedData.healthScore} 分</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">封存生命目标</div>
                      <div className="text-sm font-bold text-amber-400 font-mono-num">{selectedCapsule.lockedData.targetAge} 岁</div>
                    </div>
                  </div>

                  {/* Letter Body */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-serif">
                    {selectedCapsule.letterContent}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                    <span>封存于: {selectedCapsule.createdDate}</span>
                    <span className="text-indigo-400 font-semibold">🔒 契约锁机制生效中</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {capsules.map(cap => (
                    <div 
                      key={cap.id}
                      onClick={() => setSelectedCapsule(cap)}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-md"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                          <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {cap.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono-num">
                              {cap.yearsAhead} 年期胶囊
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                            <span>锁定生理年龄: <strong className="text-emerald-400 font-mono-num">{cap.lockedData.biologicalAge} 岁</strong></span>
                            <span>·</span>
                            <span>预计启封: <strong className="text-indigo-300 font-mono-num">{cap.unlockDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold shrink-0">
                        <span>拆阅信件</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: WRITE */}
          {activeTab === 'write' && (
            <form onSubmit={handleCreateCapsule} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">胶囊标题 / 信件主题</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：写给 5 年后的自己：愿你依旧保有 24 岁的线粒体活力"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">封存跨度年限</label>
                <select
                  value={newYears}
                  onChange={(e) => setNewYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value={1}>1 年后启封 (快速检验习惯复利)</option>
                  <option value={3}>3 年后启封 (细胞表观遗传学检验)</option>
                  <option value={5}>5 年后启封 (推荐：重塑生理生物钟)</option>
                  <option value={10}>10 年后启封 (跨越年代的生命对话)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">给未来自己的信文内容</label>
                <textarea
                  rows={5}
                  value={newLetter}
                  onChange={(e) => setNewLetter(e.target.value)}
                  placeholder="写下你当下对生活的热忱、对健康长寿的坚守，以及希望未来的自己依旧具备哪些体魄与品质..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-400 resize-none font-serif"
                  required
                />
              </div>

              {/* Automatic Snapshot preview */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>系统将自动把您今日的推算生理年龄 24.71 岁、体脂率、静息心率与勋章成就永久打包封存在胶囊底部。</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer transition-all hover:scale-102 flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>加密封存并寄向未来</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
