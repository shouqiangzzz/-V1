import React, { useState } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  History, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { LifeCoinWallet, LifeCoinTransaction } from '../../types/innovations';
import { useLanguage } from '../../services/i18n';

interface LifeCoinBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: LifeCoinWallet;
  onUpdateWallet: (newWallet: LifeCoinWallet) => void;
  onOpenConsultation?: () => void;
}

export const LifeCoinBankModal: React.FC<LifeCoinBankModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onUpdateWallet,
  onOpenConsultation,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'mall' | 'lottery'>('overview');
  const [isSpinning, setIsSpinning] = useState(false);
  const [lotteryPrize, setLotteryPrize] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLottery = () => {
    if (wallet.balance < 20) {
      alert(language === 'zh' ? '生命币不足 20 币，无法抽奖！' : 'Need at least 20 Life-Coins!');
      return;
    }

    setIsSpinning(true);
    setLotteryPrize(null);

    setTimeout(() => {
      setIsSpinning(false);
      const prizes = [
        { name: '🎉 恭喜抽中：高纯度南极磷虾油 50 元大额抵扣券！', coins: 0 },
        { name: '⚡ 恭喜抽中：生命币暴击返还 +50 币！', coins: 50 },
        { name: '🌙 恭喜抽中：深度睡眠冥想专栏 30 天无门槛听课卡！', coins: 0 },
        { name: '💎 恭喜抽中：三甲专家 1对1 咨询 100 元减免券！', coins: 0 },
      ];
      const win = prizes[Math.floor(Math.random() * prizes.length)];
      setLotteryPrize(win.name);

      const updated: LifeCoinWallet = {
        ...wallet,
        balance: wallet.balance - 20 + win.coins,
        transactions: [
          {
            id: `tx-lottery-${Date.now()}`,
            timestamp: Date.now(),
            type: win.coins > 20 ? 'earn' : 'spend',
            amount: win.coins > 20 ? win.coins - 20 : 20,
            title: `生命时间银行幸运抽奖：${win.name.split('：')[1]}`,
            category: 'habit_reward',
          },
          ...wallet.transactions,
        ],
      };
      onUpdateWallet(updated);
    }, 1000);
  };

  const handleRedeemItem = (title: string, costCoins: number) => {
    if (wallet.balance < costCoins) {
      alert(language === 'zh' ? '生命币余额不足！请继续保持日常习惯打卡积累。' : 'Insufficient Life-Coins!');
      return;
    }

    const updated: LifeCoinWallet = {
      ...wallet,
      balance: wallet.balance - costCoins,
      transactions: [
        {
          id: `tx-redeem-${Date.now()}`,
          timestamp: Date.now(),
          type: 'spend',
          amount: costCoins,
          title: `长寿商城兑换：${title}`,
          category: 'store_discount',
        },
        ...wallet.transactions,
      ],
    };
    onUpdateWallet(updated);
    alert(language === 'zh' ? `兑换成功！已消耗 ${costCoins} 生命币，卡券已存入您的账户。` : 'Redeemed successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {language === 'zh' ? '生命时间银行 · Life-Coins 资产中心' : 'Life-Coins Time Bank'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  复利计息中 (4.2% 年化)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'zh' 
                  ? '自律延寿秒数自动转化为生命币，支持抗衰商城抵扣、契约押注、专家咨询与打赏' 
                  : 'Convert saved life time into spendable Life-Coins across all services'}
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
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'overview' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '资产总览与结息流水' : 'Wallet & Interest'}
          </button>
          <button
            onClick={() => setActiveTab('mall')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 flex items-center space-x-1 ${
              activeTab === 'mall' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '长寿好物与咨询抵扣' : 'Redeem Mall'}</span>
          </button>
          <button
            onClick={() => setActiveTab('lottery')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 flex items-center space-x-1 ${
              activeTab === 'lottery' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '生命时间幸运抽奖' : 'Daily Spin'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Wallet Hero Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 relative overflow-hidden shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-amber-300 font-semibold flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>生命时间总储蓄结余</span>
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono-num">
                        {wallet.balance}
                      </span>
                      <span className="text-sm font-bold text-amber-300">Life-Coins (生命币)</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                      <span>累计铸币产出: <strong>{wallet.lifetimeEarned} 币</strong></span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">自律年化利息 +4.2%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('mall')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-md cursor-pointer hover:scale-102 transition-all"
                    >
                      去商城抵扣
                    </button>
                    <button
                      onClick={() => setActiveTab('lottery')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      转盘抽大奖
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>{language === 'zh' ? '近期收支与复利流水' : 'Recent Transactions'}</span>
                  <span className="text-slate-500 text-[10px]">实时区块链哈希存证</span>
                </h4>

                <div className="space-y-2">
                  {wallet.transactions.map(tx => (
                    <div 
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'earn' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{tx.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className={`font-mono-num font-black text-sm ${tx.type === 'earn' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} 币
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MALL */}
          {activeTab === 'mall' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">抗衰名医 1对1 问诊抵扣券</span>
                    <span className="text-amber-400 font-mono-num font-bold text-xs">需 200 币</span>
                  </div>
                  <p className="text-[11px] text-slate-400">立减 100 元，可抵扣北京协和或上海华山长寿医学专家 30 分钟视频咨询。</p>
                  <button
                    onClick={() => handleRedeemItem('抗衰名医1对1问诊抵扣券 (100元面值)', 200)}
                    className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    立即兑换
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">高纯度深海高浓度 Omega-3 50元券</span>
                    <span className="text-amber-400 font-mono-num font-bold text-xs">需 100 币</span>
                  </div>
                  <p className="text-[11px] text-slate-400">抗炎生机饮食带货好物专属直减券，下调心血管与细胞低度炎症。</p>
                  <button
                    onClick={() => handleRedeemItem('Omega-3 深海鱼油 50元抵扣券', 100)}
                    className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    立即兑换
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">表观遗传学 DNA 甲基化检测优惠券</span>
                    <span className="text-amber-400 font-mono-num font-bold text-xs">需 300 币</span>
                  </div>
                  <p className="text-[11px] text-slate-400">立减 300 元，三甲医学实验室出具专业细胞生物学真实年龄报告。</p>
                  <button
                    onClick={() => handleRedeemItem('DNA甲基化表观遗传检测 300元立减券', 300)}
                    className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    立即兑换
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">创作者视频专享「长寿锦旗」打赏礼包</span>
                    <span className="text-amber-400 font-mono-num font-bold text-xs">需 50 币</span>
                  </div>
                  <p className="text-[11px] text-slate-400">赠送给社区输出优质科普与深睡视频的作者，支持创作者生态。</p>
                  <button
                    onClick={() => handleRedeemItem('创作者长寿锦旗打赏礼包', 50)}
                    className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    立即兑换
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: LOTTERY */}
          {activeTab === 'lottery' && (
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
                  🎁
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">生命时间幸运复利大转盘</h4>
                <p className="text-xs text-slate-400 mt-1">每次消耗 20 生命币，100% 中奖获得实物优惠券、现金抵扣或币值暴击！</p>
              </div>

              {lotteryPrize && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in">
                  {lotteryPrize}
                </div>
              )}

              <button
                onClick={handleLottery}
                disabled={isSpinning}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSpinning ? '幸运转动中...' : '20 币抽取一次'}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
