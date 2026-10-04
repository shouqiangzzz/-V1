import React, { useState } from 'react';
import { 
  Award, 
  Moon, 
  Flame, 
  Armchair, 
  Utensils, 
  Droplets, 
  Heart, 
  Shield, 
  Trophy, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Calendar,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { AchievementBadge } from '../types';
import { useLanguage } from '../services/i18n';

interface AchievementMedalsViewProps {
  achievements: AchievementBadge[];
  onSelectMedal?: (medal: AchievementBadge) => void;
  compact?: boolean;
}

export const AchievementMedalsView: React.FC<AchievementMedalsViewProps> = ({
  achievements,
  onSelectMedal,
  compact = false,
}) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedMedal, setSelectedMedal] = useState<AchievementBadge | null>(null);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = achievements.filter((badge) => {
    if (filter === 'unlocked' && !badge.unlocked) return false;
    if (filter === 'locked' && badge.unlocked) return false;
    if (activeCategory !== 'all' && badge.category !== activeCategory) return false;
    return true;
  });

  const getMedalIcon = (iconName: string, unlocked: boolean, className: string = "w-6 h-6") => {
    switch (iconName) {
      case 'Moon':
        return <Moon className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Armchair':
        return <Armchair className={className} />;
      case 'Utensils':
        return <Utensils className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getBadgeStyle = (badge: AchievementBadge) => {
    if (!badge.unlocked) {
      return {
        cardBg: 'bg-slate-950/70 border-slate-800 text-slate-500 opacity-70 hover:opacity-100',
        iconBg: 'bg-slate-900 border-slate-800 text-slate-600',
        glow: '',
        title: 'text-slate-400',
      };
    }

    switch (badge.color) {
      case 'indigo':
        return {
          cardBg: 'bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border-indigo-500/40 shadow-lg shadow-indigo-950/40 hover:border-indigo-400',
          iconBg: 'bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-500/30',
          glow: 'from-indigo-500/20 to-transparent',
          title: 'text-indigo-200',
        };
      case 'emerald':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-950/40 hover:border-emerald-400',
          iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/30',
          glow: 'from-emerald-500/20 to-transparent',
          title: 'text-emerald-200',
        };
      case 'amber':
        return {
          cardBg: 'bg-gradient-to-br from-amber-950/60 via-slate-900/90 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-950/40 hover:border-amber-400',
          iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30 font-bold',
          glow: 'from-amber-500/20 to-transparent',
          title: 'text-amber-200',
        };
      case 'cyan':
        return {
          cardBg: 'bg-gradient-to-br from-cyan-950/60 via-slate-900/90 to-slate-950 border-cyan-500/40 shadow-lg shadow-cyan-950/40 hover:border-cyan-400',
          iconBg: 'bg-gradient-to-tr from-cyan-500 to-teal-300 text-slate-950 shadow-md shadow-cyan-500/30 font-bold',
          glow: 'from-cyan-500/20 to-transparent',
          title: 'text-cyan-200',
        };
      case 'blue':
        return {
          cardBg: 'bg-gradient-to-br from-blue-950/60 via-slate-900/90 to-slate-950 border-blue-500/40 shadow-lg shadow-blue-950/40 hover:border-blue-400',
          iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-500/30',
          glow: 'from-blue-500/20 to-transparent',
          title: 'text-blue-200',
        };
      case 'rose':
        return {
          cardBg: 'bg-gradient-to-br from-rose-950/60 via-slate-900/90 to-slate-950 border-rose-500/40 shadow-lg shadow-rose-950/40 hover:border-rose-400',
          iconBg: 'bg-gradient-to-tr from-rose-600 to-pink-400 text-white shadow-md shadow-rose-500/30',
          glow: 'from-rose-500/20 to-transparent',
          title: 'text-rose-200',
        };
      default: // purple
        return {
          cardBg: 'bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-slate-950 border-purple-500/40 shadow-lg shadow-purple-950/40 hover:border-purple-400',
          iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-400 text-white shadow-md shadow-purple-500/30',
          glow: 'from-purple-500/20 to-transparent',
          title: 'text-purple-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Summary & Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 p-5 sm:p-6 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>{language === 'zh' ? '生命勋章与长寿成就展柜' : 'Life Medals & Longevity Achievements'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  {unlockedCount} / {totalCount} {language === 'zh' ? '已点亮' : 'Unlocked'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {language === 'zh' 
                  ? '自律是延展生命质量的终极杠杆。持续达成健康作息与习惯，即可解锁并展示专属生命勋章！'
                  : 'Discipline expands your quality healthspan. Maintain daily routines to unlock and showcase your Life Medals!'}
              </p>
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="w-full sm:w-56 shrink-0 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">{language === 'zh' ? '勋章点亮进度' : 'Medal Progress'}</span>
              <span className="font-bold text-amber-400 font-mono-num">{unlockPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${unlockPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {language === 'zh' ? `全部 (${totalCount})` : `All (${totalCount})`}
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'unlocked'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {language === 'zh' ? `已解锁 (${unlockedCount})` : `Unlocked (${unlockedCount})`}
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'locked'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {language === 'zh' ? `挑战中 (${totalCount - unlockedCount})` : `In Progress (${totalCount - unlockedCount})`}
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {language === 'zh' ? '💡 达成 7天 或 20天 习惯即可自动点亮' : '💡 Unlocked automatically at 7-day or 20-day streaks'}
          </span>
        </div>
      </div>

      {/* Grid of Medals */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredBadges.map((badge) => {
          const style = getBadgeStyle(badge);
          const isFinished = badge.unlocked;
          const progressPercent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => {
                setSelectedMedal(badge);
                if (onSelectMedal) onSelectMedal(badge);
              }}
              className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden ${style.cardBg}`}
            >
              {/* Card top banner badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${style.iconBg}`}>
                    {getMedalIcon(badge.icon, isFinished, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold tracking-tight ${style.title}`}>
                      {language === 'zh' ? badge.titleZh : badge.titleEn}
                    </h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {language === 'zh' ? badge.requirementZh : badge.requirementEn}
                    </span>
                  </div>
                </div>

                {isFinished ? (
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{language === 'zh' ? '已点亮' : 'Unlocked'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-[10px] shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>{language === 'zh' ? '挑战中' : 'Locked'}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 my-2 line-clamp-2 leading-relaxed">
                {language === 'zh' ? badge.descZh : badge.descEn}
              </p>

              {/* Progress & Reward Footer */}
              <div className="pt-3 border-t border-slate-800/80 mt-2">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">
                    {isFinished 
                      ? (language === 'zh' ? '✓ 目标已达成' : '✓ Goal Accomplished') 
                      : (language === 'zh' ? `连续进度：${badge.progress} / ${badge.maxProgress}` : `Progress: ${badge.progress} / ${badge.maxProgress}`)}
                  </span>
                  <span className={`font-mono-num font-semibold ${isFinished ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFinished ? 'bg-gradient-to-r from-emerald-500 to-teal-300' : 'bg-slate-700'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {badge.rewardLifeBonusTextZh && (
                  <div className="mt-2 text-[10px] text-amber-300/80 flex items-center space-x-1 truncate">
                    <Sparkles className="w-3 h-3 shrink-0 text-amber-400" />
                    <span className="truncate">{language === 'zh' ? badge.rewardLifeBonusTextZh : badge.rewardLifeBonusTextEn}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Inspector for Selected Medal */}
      {selectedMedal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
            <button
              onClick={() => setSelectedMedal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center my-4 animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                {getMedalIcon(selectedMedal.icon, selectedMedal.unlocked, "w-10 h-10 text-amber-400")}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {language === 'zh' ? selectedMedal.titleZh : selectedMedal.titleEn}
            </h3>
            
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold my-2 bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span>{language === 'zh' ? selectedMedal.requirementZh : selectedMedal.requirementEn}</span>
            </div>

            <p className="text-xs text-slate-300 my-3 leading-relaxed px-4">
              {language === 'zh' ? selectedMedal.descZh : selectedMedal.descEn}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left my-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>{language === 'zh' ? '勋章状态' : 'Status'}</span>
                <span className={selectedMedal.unlocked ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {selectedMedal.unlocked ? (language === 'zh' ? '✓ 已点亮荣耀勋章' : '✓ Unlocked') : (language === 'zh' ? `挑战中 (${selectedMedal.progress}/${selectedMedal.maxProgress})` : `In Progress (${selectedMedal.progress}/${selectedMedal.maxProgress})`)}
                </span>
              </div>
              {selectedMedal.unlockedAt && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>{language === 'zh' ? '解锁时间' : 'Unlocked Date'}</span>
                  <span className="font-mono text-slate-300">
                    {new Date(selectedMedal.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedMedal.rewardLifeBonusTextZh && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>{language === 'zh' ? '生命益处' : 'Longevity Bonus'}</span>
                  <span className="text-amber-300 font-medium">
                    {language === 'zh' ? selectedMedal.rewardLifeBonusTextZh : selectedMedal.rewardLifeBonusTextEn}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMedal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
