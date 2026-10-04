import React, { useState } from 'react';
import { 
  Watch, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Battery, 
  Zap, 
  Heart, 
  Moon, 
  Flame, 
  Compass, 
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { WearableDevice } from '../../types/innovations';
import { TimeAdjustment } from '../../types';
import { useLanguage } from '../../services/i18n';

interface WearableSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: WearableDevice[];
  onUpdateDevices: (newDevices: WearableDevice[]) => void;
  onAddAdjustment: (adj: TimeAdjustment) => void;
}

export const WearableSyncModal: React.FC<WearableSyncModalProps> = ({
  isOpen,
  onClose,
  devices,
  onUpdateDevices,
  onAddAdjustment,
}) => {
  const { language } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleConnect = (devId: string) => {
    const updated = devices.map(d => {
      if (d.id === devId) {
        return {
          ...d,
          isConnected: !d.isConnected,
          lastSyncTime: !d.isConnected ? '刚刚' : d.lastSyncTime,
        };
      }
      return d;
    });
    onUpdateDevices(updated);
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);

    setTimeout(() => {
      setIsSyncing(false);
      const earnedSeconds = 7200; // +2 hours

      // Record adjustment automatically
      onAddAdjustment({
        id: `adj-wearable-${Date.now()}`,
        timestamp: Date.now(),
        category: 'exercise',
        type: 'gain',
        seconds: earnedSeconds,
        reason: 'Apple Watch & Whoop 自动无感同步：深睡104分 + VO2Max 48.5 达标',
      });

      const updated = devices.map(d => d.isConnected ? { ...d, lastSyncTime: '刚刚 08:30' } : d);
      onUpdateDevices(updated);
      setSyncSuccessMsg(language === 'zh' ? '无感同步完成！已自动将深睡与心肺达标折算入库：生命倒计时自动延长 +2.0 小时！' : 'Wearables synced! +2.0 hours auto-added to your Life Clock.');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {language === 'zh' ? '智能穿戴设备开放生态 · 自动无感同步' : 'Wearable Device Sync Hub'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  全自动闭环
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'zh' 
                  ? '打通 Apple Watch、Garmin、WHOOP、华为健康，自动抓取深睡、HRV、VO2Max 并实时折算生命时钟' 
                  : 'Sync deep sleep, HRV, and VO2 Max from Apple Watch, WHOOP, and Garmin'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-102 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '立即无感拉取'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Success Feedback */}
        {syncSuccessMsg && (
          <div className="m-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Real-time Health Stream Dashboard */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>实时抓取的生理机能指标流 (已与长寿算法绑定)</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>今日自动增益: +1.9 ~ 2.0 小时</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>静息心率 (RHR)</span>
                </div>
                <div className="text-xl font-black text-rose-300 font-mono-num mt-1">52 <span className="text-xs font-normal">bpm</span></div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">极优 · 心肌能耗低</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>心率变异性 (HRV)</span>
                </div>
                <div className="text-xl font-black text-amber-300 font-mono-num mt-1">68 <span className="text-xs font-normal">ms</span></div>
                <div className="text-[10px] text-amber-400 font-semibold mt-0.5">副交感神经张力充沛</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  <span>最大摄氧量 (VO2Max)</span>
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono-num mt-1">48.5</div>
                <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">超越 91% 同龄人</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>昨夜深度睡眠</span>
                </div>
                <div className="text-xl font-black text-indigo-300 font-mono-num mt-1">104 <span className="text-xs font-normal">min</span></div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">大脑类淋巴排毒充沛</div>
              </div>
            </div>
          </div>

          {/* Connected Devices List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {language === 'zh' ? '支持的智能穿戴设备与连接状态' : 'Supported Wearable Devices'}
            </h4>

            <div className="space-y-2.5">
              {devices.map(dev => (
                <div 
                  key={dev.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      dev.isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {dev.brand === 'apple' ? <Watch className="w-5 h-5" /> : dev.brand === 'garmin' ? <Compass className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{dev.name}</span>
                        {dev.isConnected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            <span>实时已连</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            未连接
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span>上次同步: {dev.lastSyncTime}</span>
                        <span>·</span>
                        <span className="flex items-center space-x-1">
                          <Battery className="w-3 h-3 text-emerald-400" />
                          <span>电量 {dev.batteryLevel}%</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleConnect(dev.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      dev.isConnected
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                    }`}
                  >
                    {dev.isConnected ? '断开配对' : '授权同步'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Transparency Info */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>生命时钟无感加减算法规则透明性说明</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              系统每天凌晨 04:00 与午间 12:00 自动抓取穿戴设备的 HRV、静息心率与深度睡眠数据。若深睡连续达标 90 分钟，自动增加 <strong>1.5 小时</strong>生命倒计时；若监测到连续久坐超时超过 4 小时，将以柔性温和方式提醒并暂扣扣减，起立活动 3 分钟即可全额返还。
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
