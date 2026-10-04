import React, { useState } from 'react';
import { 
  Users, 
  Flame, 
  Coins, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Plus, 
  CheckCircle2, 
  Trophy,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { HealthContract, LifeCoinWallet } from '../../types/innovations';
import { useLanguage } from '../../services/i18n';

interface HealthContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: HealthContract[];
  onUpdateContracts: (newContracts: HealthContract[]) => void;
  wallet: LifeCoinWallet;
  onUpdateWallet: (newWallet: LifeCoinWallet) => void;
}

export const HealthContractModal: React.FC<HealthContractModalProps> = ({
  isOpen,
  onClose,
  contracts,
  onUpdateContracts,
  wallet,
  onUpdateWallet,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'my' | 'all' | 'create'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New contract form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'sleep' | 'exercise' | 'diet' | 'fasting'>('sleep');
  const [newDays, setNewDays] = useState(20);
  const [newDailyStake, setNewDailyStake] = useState(20);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleJoinContract = (contractId: string) => {
    const target = contracts.find(c => c.id === contractId);
    if (!target) return;

    if (wallet.balance < target.dailyStakeCoins * 3) {
      alert(language === 'zh' ? '生命币余额不足以支付初始押注，请先完成日常习惯打卡赚取生命币！' : 'Insufficient Life-Coins for initial stake!');
      return;
    }

    const updatedWallet: LifeCoinWallet = {
      ...wallet,
      balance: wallet.balance - target.dailyStakeCoins,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          timestamp: Date.now(),
          type: 'spend',
          amount: target.dailyStakeCoins,
          title: `押注加入契约：${target.title}`,
          category: 'contract_stake',
        },
        ...wallet.transactions,
      ],
    };
    onUpdateWallet(updatedWallet);

    const updatedContracts = contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          isUserJoined: true,
          totalPrizePool: c.totalPrizePool + c.dailyStakeCoins * c.targetDays,
          members: [
            {
              id: `user-${Date.now()}`,
              name: '探索者 (您)',
              avatar: '🧬',
              streakDays: 1,
              checkedToday: true,
              status: 'active' as const,
            },
            ...c.members,
          ],
        };
      }
      return c;
    });

    onUpdateContracts(updatedContracts);
    showToast(language === 'zh' ? '成功加入抗衰对赌契约！押注已注入公共奖池。' : 'Successfully joined contract!');
  };

  const handleCheckInToday = (contractId: string) => {
    const updatedContracts = contracts.map(c => {
      if (c.id === contractId) {
        const updatedMembers = c.members.map(m => {
          if (m.name.includes('您')) {
            return {
              ...m,
              streakDays: m.streakDays + 1,
              checkedToday: true,
            };
          }
          return m;
        });
        return {
          ...c,
          members: updatedMembers,
        };
      }
      return c;
    });

    onUpdateContracts(updatedContracts);
    showToast(language === 'zh' ? '今日契约打卡成功！连续天数 +1，继续守住奖池！' : 'Daily contract checked!');
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (wallet.balance < newDailyStake * 2) {
      alert(language === 'zh' ? '生命币不足以发起契约押注！' : 'Insufficient Life-Coins!');
      return;
    }

    const newContract: HealthContract = {
      id: `contract-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      targetDays: newDays,
      currentDay: 1,
      dailyStakeCoins: newDailyStake,
      totalPrizePool: newDailyStake * newDays * 2,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + newDays * 86400000).toISOString().split('T')[0],
      status: 'recruiting',
      penaltyRuleDescription: `全员连续 ${newDays} 天达标。若当日未达标，当日押注划入奖池，全员达标者均分！`,
      isUserJoined: true,
      members: [
        {
          id: `owner-${Date.now()}`,
          name: '探索者 (您·队长)',
          avatar: '🧬',
          streakDays: 1,
          checkedToday: true,
          status: 'active',
        },
      ],
    };

    onUpdateContracts([newContract, ...contracts]);
    setActiveTab('my');
    setNewTitle('');
    showToast(language === 'zh' ? '契约创建成功！已向社区抗衰搭子公开发布招募！' : 'Contract created!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {language === 'zh' ? '健康搭子 · 契约对赌机制' : 'Health Buddy & Contract Bet'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  抗衰共赢模式
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'zh' 
                  ? '双人/小组抗衰对赌：押注生命币，全员自律通关平分奖池，违约惩罚激发极致留存' 
                  : 'Buddy longevity contract: Stake Life-Coins, conquer habits together!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Wallet Quick Balance */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-mono-num font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>可用: {wallet.balance} 生命币</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Sub-nav */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-3 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'all' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '社区招募中契约' : 'Active Contracts'}
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'my' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span>{language === 'zh' ? '我参与的对赌' : 'My Contracts'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-amber-300">
              {contracts.filter(c => c.isUserJoined).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 flex items-center space-x-1 ${
              activeTab === 'create' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '发起新对赌' : 'Create Contract'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: ALL CONTRACTS */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {contracts.map(contract => (
                <div 
                  key={contract.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{contract.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          contract.status === 'in_progress' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {contract.status === 'in_progress' ? `第 ${contract.currentDay}/${contract.targetDays} 天对决` : '火热招募中'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{contract.penaltyRuleDescription}</p>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">公共瓜分奖池</div>
                        <div className="text-base font-black text-amber-400 font-mono-num flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-amber-400 inline" />
                          <span>{contract.totalPrizePool} 币</span>
                        </div>
                      </div>

                      {contract.isUserJoined ? (
                        <button
                          onClick={() => handleCheckInToday(contract.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer transition-all flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>今日已对赌打卡</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinContract(contract.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center space-x-1"
                        >
                          <span>押注 {contract.dailyStakeCoins}币·加入</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Member Streaks Grid */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                      <span>契约小组成员 ({contract.members.length} 人)</span>
                      <span className="text-slate-500 text-[10px]">违约成员押注将自动归入奖池由胜者均分</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {contract.members.map(member => (
                        <div 
                          key={member.id}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center space-x-2 text-xs"
                        >
                          <span className="text-lg">{member.avatar}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-medium truncate text-[11px]">{member.name}</div>
                            <div className="text-[10px] text-amber-300 font-mono-num flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-amber-400 fill-current" />
                              <span>{member.streakDays} 天连续</span>
                            </div>
                          </div>
                          {member.checkedToday ? (
                            <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">达标</span>
                          ) : (
                            <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">待打卡</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MY CONTRACTS */}
          {activeTab === 'my' && (
            <div className="space-y-4">
              {contracts.filter(c => c.isUserJoined).map(contract => (
                <div 
                  key={contract.id}
                  className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{contract.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{contract.penaltyRuleDescription}</p>
                    </div>
                    <button
                      onClick={() => handleCheckInToday(contract.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>今日打卡保住契约</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">进行天数: <strong className="text-white font-mono-num">{contract.currentDay}/{contract.targetDays} 天</strong></span>
                    <span className="text-slate-400">瓜分奖池: <strong className="text-amber-400 font-mono-num">+{contract.totalPrizePool} 生命币</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CREATE CONTRACT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateContract} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>发起新的健康搭子复利对赌契约</span>
              </h4>

              <div>
                <label className="block text-xs text-slate-400 mb-1">契约目标标题</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：21天早起晨跑心肺搭子组（违规扣币）"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">挑战习惯支柱</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  >
                    <option value="sleep">🌙 深度睡眠</option>
                    <option value="exercise">⚡ 晨光心肺运动</option>
                    <option value="diet">🥑 地中海饮食</option>
                    <option value="fasting">🌿 间歇轻断食</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">对赌周期天数</label>
                  <select
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  >
                    <option value={7}>7天 启动冲刺</option>
                    <option value={14}>14天 稳固习惯</option>
                    <option value={20}>20天 神经回路重塑</option>
                    <option value={30}>30天 表观遗传学逆龄</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">每日押注生命币</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newDailyStake}
                    onChange={(e) => setNewDailyStake(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>发起者自动成为队长，契约将推送到全网健康视界，吸引搭子共同组队！</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer transition-all hover:scale-102"
                >
                  确认发起并押注发布
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
