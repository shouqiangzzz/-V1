import React from 'react';
import { Trophy, Sparkles, CheckCircle, ArrowRight, Share2 } from 'lucide-react';
import { AchievementBadge } from '../types';
import { useLanguage } from '../services/i18n';

interface AchievementCelebrationModalProps {
  badge: AchievementBadge | null;
  onClose: () => void;
  onViewProfile?: () => void;
}

export const AchievementCelebrationModal: React.FC<AchievementCelebrationModalProps> = ({
  badge,
  onClose,
  onViewProfile,
}) => {
  const { language } = useLanguage();

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Title */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4 shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'zh' ? '🎉 恭喜达成全新健康习惯！' : '🎉 New Achievement Unlocked!'}</span>
        </div>

        {/* 3D Glowing Medal Icon */}
        <div className="relative mx-auto my-3 w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1.5 shadow-2xl shadow-amber-500/40 flex items-center justify-center group">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center border border-amber-400/40">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
            {language === 'zh' ? '生命勋章' : 'Medal'}
          </div>
        </div>

        {/* Medal Title & Description */}
        <h3 className="text-xl font-extrabold text-white tracking-tight mt-5">
          {language === 'zh' ? badge.titleZh : badge.titleEn}
        </h3>
        <p className="text-xs text-amber-300 font-semibold mt-1">
          {language === 'zh' ? badge.requirementZh : badge.requirementEn}
        </p>

        <p className="text-xs text-slate-400 my-4 leading-relaxed px-2">
          {language === 'zh' ? badge.descZh : badge.descEn}
        </p>

        {/* Impact callout */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-center space-x-2 my-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'zh' 
              ? '已成功点亮并展示于您的「个人资料/健康档案」页面！' 
              : 'Showcased in your Personal Health Profile!'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-5">
          {onViewProfile && (
            <button
              onClick={() => {
                onClose();
                onViewProfile();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 cursor-pointer flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>{language === 'zh' ? '在个人资料中查看' : 'View in Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 text-slate-950 font-bold text-xs hover:opacity-90 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
          >
            {language === 'zh' ? '继续保持自律' : 'Keep Up Discipline'}
          </button>
        </div>

      </div>
    </div>
  );
};
