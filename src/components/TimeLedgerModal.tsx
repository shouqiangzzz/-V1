import React, { useState } from 'react';
import { 
  History, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Clock, 
  Sparkles, 
  Calendar, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { TimeAdjustment } from '../types';
import { formatGainLossBadge } from '../services/longevityCalculator';

interface TimeLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: TimeAdjustment[];
  netGainSeconds: number;
  onAddManualAdjustment: (adj: TimeAdjustment) => void;
}

export const TimeLedgerModal: React.FC<TimeLedgerModalProps> = ({
  isOpen,
  onClose,
  adjustments,
  netGainSeconds,
  onAddManualAdjustment,
}) => {
  const [filter, setFilter] = useState<'all' | 'gain' | 'loss'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [customDays, setCustomDays] = useState(1);
  const [customType, setCustomType] = useState<'gain' | 'loss'>('gain');

  if (!isOpen) return null;

  const badgeInfo = formatGainLossBadge(netGainSeconds);

  const filteredAdjustments = adjustments
    .slice()
    .reverse()
    .filter(adj => {
      if (filter === 'gain') return adj.type === 'gain';
      if (filter === 'loss') return adj.type === 'loss';
      return true;
    });

  const totalGainSeconds = adjustments
    .filter(a => a.type === 'gain')
    .reduce((sum, a) => sum + a.seconds, 0);

  const totalLossSeconds = adjustments
    .filter(a => a.type === 'loss')
    .reduce((sum, a) => sum + a.seconds, 0);

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason) return;

    const seconds = customDays * 86400;
    onAddManualAdjustment({
      id: `adj_custom_${Date.now()}`,
      timestamp: Date.now(),
      category: 'custom',
      type: customType,
      seconds,
      reason: customReason,
    });

    setCustomReason('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>生命时间得失账本</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-num font-bold">
                {badgeInfo.text}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              记录由于规律睡眠、健康活动、控糖饮食及久坐超标所产生的所有寿命秒数增减记录
            </p>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">净寿命增益</span>
            <span className={`text-xl font-bold font-mono-num ${netGainSeconds >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {badgeInfo.text}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">累计所赚得寿命</span>
            <span className="text-xl font-bold font-mono-num text-emerald-400">
              +{(totalGainSeconds / 86400).toFixed(1)} 天
            </span>
            <span className="text-[10px] text-slate-500 block">
              (+{totalGainSeconds.toLocaleString()}秒)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">因不良习惯扣除</span>
            <span className="text-xl font-bold font-mono-num text-rose-400">
              -{(totalLossSeconds / 86400).toFixed(1)} 天
            </span>
            <span className="text-[10px] text-slate-500 block">
              (-{totalLossSeconds.toLocaleString()}秒)
            </span>
          </div>
        </div>

        {/* Filter and Add Action */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              全部明细 ({adjustments.length})
            </button>
            <button
              onClick={() => setFilter('gain')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'gain' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              增寿记录
            </button>
            <button
              onClick={() => setFilter('loss')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'loss' ? 'bg-rose-500/20 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              扣减记录
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加特殊事项</span>
          </button>
        </div>

        {/* Add custom adjustment form */}
        {showAddForm && (
          <form onSubmit={handleCreateCustom} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4 animate-fade-in text-xs space-y-3">
            <h4 className="font-bold text-white">记录个性化特殊健康事件</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="事件说明（如：完成半程马拉松）"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                required
              />
              <div className="flex items-center space-x-2">
                <select
                  value={customType}
                  onChange={e => setCustomType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white"
                >
                  <option value="gain">+ 增加寿命</option>
                  <option value="loss">- 扣减寿命</option>
                </select>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={customDays}
                  onChange={e => setCustomDays(Number(e.target.value))}
                  placeholder="天数"
                  className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-center"
                />
                <span className="text-slate-400">天</span>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold"
              >
                确认记录
              </button>
            </div>
          </form>
        )}

        {/* Timeline list */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredAdjustments.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              暂无匹配的寿命得失记录
            </div>
          ) : (
            filteredAdjustments.map((adj) => {
              const isGain = adj.type === 'gain';
              const days = Number((adj.seconds / 86400).toFixed(2));
              const hours = Number((adj.seconds / 3600).toFixed(1));
              const dateStr = new Date(adj.timestamp).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={adj.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl shrink-0 ${isGain ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isGain ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {adj.reason}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span>{dateStr}</span>
                        <span className="mx-1">·</span>
                        <span className="capitalize">{adj.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono-num">
                    <span className={`font-bold text-sm ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isGain ? '+' : '-'}{days >= 1 ? `${days}天` : `${hours}小时`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {isGain ? '+' : '-'}{adj.seconds.toLocaleString()}秒
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
