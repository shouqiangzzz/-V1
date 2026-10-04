import React, { useState, useEffect } from 'react';
import { 
  Armchair, 
  Flame, 
  Activity, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Footprints, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  Bell, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SedentaryMonitorState, UserProfile, TimeAdjustment } from '../types';
import { useLanguage } from '../services/i18n';

interface SedentaryMonitorProps {
  state: SedentaryMonitorState;
  profile: UserProfile;
  onUpdateState: (state: SedentaryMonitorState) => void;
  onAddAdjustment: (adj: TimeAdjustment) => void;
}

export const SedentaryMonitor: React.FC<SedentaryMonitorProps> = ({
  state,
  profile,
  onUpdateState,
  onAddAdjustment,
}) => {
  const { language } = useLanguage();
  const [localSittingSecs, setLocalSittingSecs] = useState(state.currentSittingSeconds);
  const [isRunning, setIsRunning] = useState(state.isActive);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Background/live simulated sedentary timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setLocalSittingSecs(prev => {
          const next = prev + 1;
          // Check alert at 50 mins (3000s) and 60 mins (3600s)
          if (next === 50 * 60) {
            setAlertMessage('⏰ 久坐提示：您已连续坐姿工作50分钟，请稍作站立拉伸！');
          } else if (next === 60 * 60) {
            setAlertMessage('🚨 久坐预警：已连续坐姿达1小时！下肢深静脉回流受限，建议起身喝水活动！');
          }
          return next;
        });

        // Also increment today's cumulative sitting
        onUpdateState({
          ...state,
          isActive: true,
          currentSittingSeconds: localSittingSecs + 1,
          todaySittingSeconds: state.todaySittingSeconds + 1,
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, localSittingSecs]);

  const sittingMinutes = Math.floor(localSittingSecs / 60);
  const sittingRemainderSecs = localSittingSecs % 60;

  const todaySittingHours = Number((state.todaySittingSeconds / 3600).toFixed(1));
  const todayExerciseHours = Number((state.todayExerciseSeconds / 3600).toFixed(1));
  const exerciseProgressPercent = Math.min(100, (todayExerciseHours / profile.dailyActivityTargetHours) * 100);

  // Stand up & walk action: Resets sitting timer, adds 5 min exercise
  const handleStandUpAndWalk = () => {
    const addedExerciseSecs = 5 * 60;
    const newExerciseSecs = state.todayExerciseSeconds + addedExerciseSecs;
    const newSittingSecs = 0;

    setLocalSittingSecs(0);
    setAlertMessage('🎉 太棒了！已完成站立活动，久坐计时已归零，并为今日健康运动增加了5分钟！');

    // Check if daily exercise target is achieved (> 1 hour)
    if (newExerciseSecs >= 3600 && state.todayExerciseSeconds < 3600) {
      onAddAdjustment({
        id: `adj_exercise_daily_${Date.now()}`,
        timestamp: Date.now(),
        category: 'exercise',
        type: 'gain',
        seconds: 3600, // +1 hour immediate life vitality bonus
        reason: '运动达标激励：今日活跃运动累计突破1小时！有效对抗久坐代谢迟滞',
      });
    }

    onUpdateState({
      ...state,
      currentSittingSeconds: 0,
      todayExerciseSeconds: newExerciseSecs,
      lastStandTimestamp: Date.now(),
    });

    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Simulate excess sitting penalty check (if cumulative sitting > 4 hours)
  const handleLogExcessSedentaryDay = () => {
    const nextDays = state.dailySedentaryExcessDays + 1;
    if (nextDays >= 10) {
      // Trigger user requirement: 一天久坐超过4小时，持续10天，减去1小时寿命 (-3600s)
      onAddAdjustment({
        id: `adj_sedentary_penalty_${Date.now()}`,
        timestamp: Date.now(),
        category: 'sedentary',
        type: 'loss',
        seconds: 3600,
        reason: '⚠️ 久坐超标惩罚：累计10天单日久坐超4小时，依照科学规则减去1小时寿命 (-3,600秒)',
        streakTriggered: 10,
      });

      setAlertMessage('⚠️ 触发规则：累计10天单日久坐超4小时，生命时钟已自动扣减1小时 (3,600秒)！请注意日常起立走动。');
      onUpdateState({
        ...state,
        dailySedentaryExcessDays: 0,
      });
    } else {
      setAlertMessage(`⚠️ 已记录1天久坐超标（当前进度：${nextDays}/10天，满10天将扣除1小时寿命）`);
      onUpdateState({
        ...state,
        dailySedentaryExcessDays: nextDays,
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Banner */}
      {alertMessage && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-500/50 text-amber-200 text-sm flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <span>{alertMessage}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Sedentary Live Dial & Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Sitting Meter */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Armchair className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{language === 'zh' ? '智能久坐后台自动检测' : 'Smart Sedentary Auto-Detection'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isRunning 
                      ? (language === 'zh' ? '● 后台实时检测中' : '● Live Monitoring') 
                      : (language === 'zh' ? '○ 已暂停' : '○ Paused')}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'zh' 
                    ? '监测连续静态坐姿与活动状态，守护心血管与胰岛素敏感度' 
                    : 'Monitors continuous sitting posture & activity, protecting cardiovascular and metabolic health'}
                </p>
              </div>
            </div>

            {/* Toggle Timer isRunning */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isRunning 
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                    : 'bg-emerald-600 text-black hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>
                  {isRunning 
                    ? (language === 'zh' ? '暂停检测' : 'Pause') 
                    : (language === 'zh' ? '开启自动检测' : 'Start Monitor')}
                </span>
              </button>
              <button
                onClick={() => setLocalSittingSecs(0)}
                title={language === 'zh' ? "重置当前坐姿计时" : "Reset Timer"}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Live Ticking Display */}
          <div className="my-8 text-center">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-mono">
              {language === 'zh' ? '当前单次连续坐姿时长' : 'Current Continuous Sitting Time'}
            </div>
            
            <div className={`font-mono-num font-extrabold text-5xl sm:text-6xl tracking-tight transition-colors ${
              sittingMinutes >= 60 
                ? 'text-rose-400' 
                : sittingMinutes >= 45 
                ? 'text-amber-300' 
                : 'text-white'
            }`}>
              <span>{String(sittingMinutes).padStart(2, '0')}</span>
              <span className="text-slate-500 text-3xl mx-1">:</span>
              <span>{String(sittingRemainderSecs).padStart(2, '0')}</span>
              <span className="text-sm font-normal text-slate-400 ml-2">
                {language === 'zh' ? '分:秒' : 'm:s'}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-center space-x-2 text-xs">
              {sittingMinutes < 45 ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '状态优良：尚未进入有害静态区间（<45分钟）' : 'Optimal: Safe static zone (<45 mins)'}</span>
                </span>
              ) : sittingMinutes < 60 ? (
                <span className="text-amber-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '警戒提示：已坐姿超过45分钟，建议预备站立活动' : 'Warning: Sitting >45 mins, prepare to stand & stretch'}</span>
                </span>
              ) : (
                <span className="text-rose-400 flex items-center space-x-1 font-bold animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '严重风险：连续久坐超1小时！下肢代谢迟滞，请立刻起立' : 'Hazard: Sitting >1h! Vascular stasis, stand up now'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Core Action: Stand Up & Move */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {language === 'zh' 
                ? '起身站立走动 5 分钟可将连续计时清零，并累加今日健康运动时间' 
                : 'Walking or stretching for 5 mins resets timer and adds to today\'s active time'}
            </div>

            <button
              onClick={handleStandUpAndWalk}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <Footprints className="w-4 h-4" />
              <span>{language === 'zh' ? '我已起立活动 5分钟 (重置并加运动)' : 'I Stood & Walked 5 Mins (Reset & Earn Exercise)'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Today's Summary & Penalty Rules */}
        <div className="space-y-4">
          
          {/* Today Cumulative Sitting Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">{language === 'zh' ? '今日累计久坐时间' : 'Today\'s Cumulative Sitting'}</span>
              <span className="text-xs text-slate-500 font-mono">{language === 'zh' ? '上限 4.0小时' : 'Max 4.0h'}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono-num font-bold text-2xl text-white">
                {todaySittingHours}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'zh' ? '小时 / 4.0 小时上限' : 'Hours / 4.0h limit'}
              </span>
            </div>
            
            {/* Progress */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all ${
                  todaySittingHours > 4 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (todaySittingHours / 4) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {todaySittingHours > 4 
                ? (language === 'zh' ? '⚠️ 今日已超过4小时久坐红线！' : '⚠️ Exceeded 4-hour daily sitting limit!') 
                : (language === 'zh' ? `还可坐 ${(4 - todaySittingHours).toFixed(1)} 小时达到红线` : `${(4 - todaySittingHours).toFixed(1)}h remaining before limit`)}
            </p>
          </div>

          {/* Today Cumulative Exercise Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">{language === 'zh' ? '今日健康活动量' : 'Today\'s Healthy Activity'}</span>
              <span className="text-xs text-emerald-400 font-mono">{language === 'zh' ? '目标 > 1小时' : 'Target > 1.0h'}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono-num font-bold text-2xl text-emerald-400">
                {todayExerciseHours}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'zh' ? '小时 / 1.0小时目标' : 'Hours / 1.0h goal'}
              </span>
            </div>

            {/* Progress */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${exerciseProgressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-400 mt-2">
              {todayExerciseHours >= 1 
                ? (language === 'zh' ? '✓ 今日已达成1小时健康运动，计入20天周期！' : '✓ Reached 1h daily activity, counted toward streak!') 
                : (language === 'zh' ? `还需 ${(1 - todayExerciseHours).toFixed(1)} 小时达成今日增寿标准` : `${(1 - todayExerciseHours).toFixed(1)}h needed for daily bonus standard`)}
            </p>
          </div>

          {/* 10-Day Sedentary Hazard Tracker (User requirement: 一天久坐超过4小时，持续10天，减去1小时寿命) */}
          <div className="bg-slate-950/90 border border-rose-900/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'zh' ? '久坐惩罚规则预警' : 'Sedentary Penalty Warning'}</span>
              </span>
              <span className="text-xs font-mono text-rose-400">
                {state.dailySedentaryExcessDays} / 10 {language === 'zh' ? '天' : 'Days'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {language === 'zh' 
                ? <>规则：若单日久坐超4小时持续10天，将扣减寿命 <strong>1小时 (-3,600秒)</strong>。</>
                : <>Rule: Exceeding 4h sitting for 10 consecutive days deducts <strong>1 Hour (-3,600s)</strong> of life.</>}
            </p>
            <div className="grid grid-cols-10 gap-1 mb-3">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-xs ${
                    idx < state.dailySedentaryExcessDays
                      ? 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleLogExcessSedentaryDay}
              className="w-full py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/70 text-rose-300 text-xs font-medium cursor-pointer transition-colors"
            >
              {language === 'zh' ? '模拟测试：记录今日久坐超标' : 'Simulate: Log Daily Sitting Excess'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
