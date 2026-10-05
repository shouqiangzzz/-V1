import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Video, 
  Star, 
  CheckCircle2, 
  X, 
  Coins, 
  ShieldCheck, 
  FileText,
  UserCheck
} from 'lucide-react';
import { ExpertConsultationProfile, LifeCoinWallet } from '../../types/innovations';
import { EXPERT_CONSULTATION_LIST } from '../../services/innovationsStorage';
import { useLanguage } from '../../services/i18n';

interface ExpertConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: LifeCoinWallet;
  onUpdateWallet: (newWallet: LifeCoinWallet) => void;
  initialExpertId?: string;
}

export const ExpertConsultationModal: React.FC<ExpertConsultationModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onUpdateWallet,
  initialExpertId,
}) => {
  const { language } = useLanguage();
  const [selectedExpert, setSelectedExpert] = useState<ExpertConsultationProfile | null>(() => {
    if (initialExpertId) {
      return EXPERT_CONSULTATION_LIST.find(e => e.id === initialExpertId) || null;
    }
    return null;
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultType, setConsultType] = useState<'video' | 'voice' | 'report_audit'>('video');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  React.useEffect(() => {
    if (initialExpertId && isOpen) {
      const match = EXPERT_CONSULTATION_LIST.find(e => e.id === initialExpertId);
      if (match) setSelectedExpert(match);
    }
  }, [initialExpertId, isOpen]);

  if (!isOpen) return null;

  const handleBook = () => {
    if (!selectedExpert) return;

    if (wallet.balance < selectedExpert.priceCoins) {
      alert(language === 'zh' ? '生命币余额不足，可前往生命时间银行通过习惯打卡或充值获取！' : 'Insufficient Life-Coins!');
      return;
    }

    const updatedWallet: LifeCoinWallet = {
      ...wallet,
      balance: wallet.balance - selectedExpert.priceCoins,
      transactions: [
        {
          id: `tx-consult-${Date.now()}`,
          timestamp: Date.now(),
          type: 'spend',
          amount: selectedExpert.priceCoins,
          title: `预约专家 1对1 咨询：${selectedExpert.name}`,
          category: 'consultation',
        },
        ...wallet.transactions,
      ],
    };
    onUpdateWallet(updatedWallet);
    setBookingConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {language === 'zh' ? '长寿健康专家 1 对 1 线上咨询' : '1-on-1 Longevity Expert Consultation'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  三甲与抗衰院士领衔
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'zh' 
                  ? '针对个人生化报告与体测数据，定制 1 对 1 细胞抗衰与生命时钟延展方案' 
                  : 'Personalized longevity plan and deep lab audit by medical experts'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-mono-num font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>可用生命币: {wallet.balance}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {bookingConfirmed ? (
            <div className="p-8 rounded-3xl bg-slate-950/80 border border-teal-500/40 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-3xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">预约成功 · 已为您锁定专家日程</h4>
                <p className="text-xs text-slate-400 mt-1">
                  专家：{selectedExpert?.name} · 预约时段：{selectedSlot || '今日 19:30-20:00'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-xs text-slate-300 space-y-2 text-left">
                <div className="flex items-center space-x-2 text-teal-400 font-bold">
                  <Video className="w-4 h-4" />
                  <span>加密高清视频会议室接入码已生成</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  会议室将于问诊前 10 分钟自动短信与应用内推送提醒。系统已自动挂载您最新的表观遗传推算生理年龄与体检报告。
                </p>
              </div>
              <button
                onClick={() => { setBookingConfirmed(false); setSelectedExpert(null); }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                返回专家列表
              </button>
            </div>
          ) : selectedExpert ? (
            /* Booking detail step */
            <div className="space-y-5 animate-fade-in">
              <button
                onClick={() => setSelectedExpert(null)}
                className="text-xs text-teal-400 hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>← 返回选择其他专家</span>
              </button>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedExpert.avatar} 
                    alt={selectedExpert.name} 
                    className="w-16 h-16 rounded-2xl object-cover border border-teal-500/30"
                  />
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedExpert.name}</h4>
                    <div className="text-xs text-teal-300 mt-0.5">{selectedExpert.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{selectedExpert.hospital}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-400 font-mono-num">
                    {selectedExpert.priceCoins} 生命币 或 ¥{selectedExpert.priceRmb}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">30分钟 1对1 专属深度问诊</div>
                </div>
              </div>

              {/* Slot picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">选择预约连线时间档期</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedExpert.availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border text-left flex items-center justify-between ${
                        selectedSlot === slot || (!selectedSlot && slot === selectedExpert.availableSlots[0])
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-xs'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{slot}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">选择问诊沟通形式</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConsultType('video')}
                    className={`p-3 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                      consultType === 'video'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Video className="w-4 h-4 mx-auto mb-1 text-teal-400" />
                    <span>高清加密视频连线</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('voice')}
                    className={`p-3 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                      consultType === 'voice'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1 text-teal-400" />
                    <span>即时语音深度问答</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('report_audit')}
                    className={`p-3 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                      consultType === 'report_audit'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4 mx-auto mb-1 text-teal-400" />
                    <span>体测报告图文精审方案</span>
                  </button>
                </div>
              </div>

              {/* Confirm bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  已选择：<strong className="text-white">{selectedSlot || selectedExpert.availableSlots[0]}</strong>
                </div>
                <button
                  onClick={handleBook}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 cursor-pointer transition-all hover:scale-102 flex items-center space-x-1.5"
                >
                  <Coins className="w-4 h-4" />
                  <span>使用 {selectedExpert.priceCoins} 生命币支付预约</span>
                </button>
              </div>

            </div>
          ) : (
            /* Expert List */
            <div className="space-y-4">
              {EXPERT_CONSULTATION_LIST.map(expert => (
                <div 
                  key={expert.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-start space-x-4">
                    <img 
                      src={expert.avatar} 
                      alt={expert.name} 
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0" 
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{expert.name}</h4>
                        <div className="flex items-center space-x-1 text-amber-400 text-xs">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-mono-num font-bold">{expert.rating}</span>
                          <span className="text-slate-500 text-[10px]">({expert.reviewCount}人评)</span>
                        </div>
                      </div>

                      <div className="text-xs text-teal-300 mt-0.5">{expert.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{expert.hospital}</div>

                      {/* Specialties tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {expert.specialtyTags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-amber-400 font-mono-num">
                        {expert.priceCoins} 生命币
                      </div>
                      <div className="text-[10px] text-slate-500">或 ¥{expert.priceRmb} / 30分钟</div>
                    </div>

                    <button
                      onClick={() => { setSelectedExpert(expert); setSelectedSlot(expert.availableSlots[0]); }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer hover:scale-102 transition-all"
                    >
                      预约 1对1 咨询
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
