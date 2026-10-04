import React, { useState } from 'react';
import { Sparkles, Calendar, Heart, Info, ArrowUpRight } from 'lucide-react';
import { LifeCountdown, UserProfile } from '../types';
import { useLanguage } from '../services/i18n';

interface LifeGridViewProps {
  countdown: LifeCountdown;
  profile: UserProfile;
}

export const LifeGridView: React.FC<LifeGridViewProps> = ({
  countdown,
  profile,
}) => {
  const { language } = useLanguage();
  const [hoveredWeek, setHoveredWeek] = useState<{ age: number; week: number } | null>(null);

  const totalYears = profile.targetAge;
  const weeksPerYear = 52;
  const totalWeeks = totalYears * weeksPerYear;
  const livedWeeks = Math.floor(countdown.chronologicalAge * weeksPerYear);
  const bonusWeeks = Math.max(0, Math.floor(countdown.netGainSeconds / (7 * 86400)));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>{language === 'zh' ? '人生周格图 (Weeks of Life)' : 'Life Grid Map (Weeks of Life)'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Memento Mori
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'zh' 
              ? `假定预期寿命为 ${profile.targetAge} 岁，每一方格代表生命中独立且无法重来的 1 周（7天）`
              : `Assuming designed lifespan target of ${profile.targetAge} years, each block represents 1 irreplaceable week (7 days).`}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-600 inline-block" />
            <span className="text-slate-400">
              {language === 'zh' ? `已度过 (${livedWeeks}周)` : `Life Lived (${livedWeeks} wks)`}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block shadow-xs shadow-emerald-400" />
            <span className="text-emerald-300 font-semibold">
              {language === 'zh' ? `自律赚得 (+${bonusWeeks}周)` : `Discipline Earned (+${bonusWeeks} wks)`}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 border border-slate-700 inline-block" />
            <span className="text-slate-500">
              {language === 'zh' ? `剩余待生活 (${Math.max(0, countdown.remainingWeeks)}周)` : `Remaining Journey (${Math.max(0, countdown.remainingWeeks)} wks)`}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Info tooltip */}
      <div className="h-6 flex items-center text-xs text-slate-300 font-mono">
        {hoveredWeek ? (
          <span>
            {language === 'zh' ? (
              <>👉 选中点：大约 <strong className="text-emerald-400">{hoveredWeek.age} 岁</strong>（第 {hoveredWeek.week} 周）</>
            ) : (
              <>👉 Selected: Approx. Age <strong className="text-emerald-400">{hoveredWeek.age}</strong> (Week {hoveredWeek.week})</>
            )}
          </span>
        ) : (
          <span className="text-slate-500 text-[11px]">
            {language === 'zh' ? '鼠标悬停在方格上可查看对应年龄阶段' : 'Hover over any square to inspect age and life milestone'}
          </span>
        )}
      </div>

      {/* The Visual Grid: 52 columns wide (weeks in year), rows = years */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[680px] space-y-1">
          {Array.from({ length: totalYears }).map((_, yearIdx) => {
            const age = yearIdx;
            return (
              <div key={yearIdx} className="flex items-center space-x-1">
                {/* Year Label */}
                <span className="w-7 text-[9px] font-mono text-slate-600 text-right pr-1">
                  {age % 5 === 0 ? (language === 'zh' ? `${age}岁` : `Age ${age}`) : ''}
                </span>

                {/* 52 Weeks */}
                <div className="flex items-center space-x-0.5">
                  {Array.from({ length: weeksPerYear }).map((_, weekIdx) => {
                    const globalWeek = yearIdx * weeksPerYear + weekIdx;
                    const isLived = globalWeek < livedWeeks;
                    const isBonus = globalWeek >= livedWeeks && globalWeek < livedWeeks + bonusWeeks;

                    return (
                      <div
                        key={weekIdx}
                        onMouseEnter={() => setHoveredWeek({ age, week: globalWeek + 1 })}
                        onMouseLeave={() => setHoveredWeek(null)}
                        className={`w-2.5 h-2 rounded-[1.5px] transition-all cursor-crosshair ${
                          isBonus
                            ? 'bg-emerald-400 hover:scale-125 hover:z-10 shadow-xs'
                            : isLived
                            ? 'bg-slate-700/80 hover:bg-slate-500'
                            : 'bg-slate-800/40 hover:bg-slate-700 border border-slate-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Philosophical bottom note */}
      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
        “我们并非拥有很少的时间，而是挥霍了太多。” —— 塞涅卡 · 保持规律自律，为人生点亮更多绿格
      </div>

    </div>
  );
};
