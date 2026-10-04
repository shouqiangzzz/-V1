import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  FileText,
  BadgeCheck,
  Lock
} from 'lucide-react';
import { MerchantCertification } from '../../types';
import { useLanguage } from '../../services/i18n';

interface MerchantCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cert: MerchantCertification;
  onSaveCert: (updatedCert: MerchantCertification) => void;
}

export const MerchantCertificationModal: React.FC<MerchantCertificationModalProps> = ({
  isOpen,
  onClose,
  cert,
  onSaveCert,
}) => {
  const { language } = useLanguage();
  const [realName, setRealName] = useState(cert.realName || '');
  const [idCardNumber, setIdCardNumber] = useState(cert.idCardNumber || '');
  const [contactPhone, setContactPhone] = useState(cert.contactPhone || '');
  const [merchantType, setMerchantType] = useState<'general' | 'health_food'>(cert.merchantType || 'general');
  const [monthlyRevenue, setMonthlyRevenue] = useState(cert.monthlyRevenue || 120000);
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(cert.businessLicenseNumber || '');
  const [businessLicenseName, setBusinessLicenseName] = useState(cert.businessLicenseName || '');
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const depositRequired = merchantType === 'health_food' ? 2000 : 500;
  const isHighRevenue = monthlyRevenue >= 1000000; // >= 100万必须营业执照

  const handleCompleteCertification = () => {
    setErrorMessage(null);

    if (!realName.trim()) {
      setErrorMessage(language === 'zh' ? '请填写真实姓名（用于公安身份实名认证）' : 'Please enter your legal real name');
      return;
    }
    if (!idCardNumber.trim() || idCardNumber.length < 15) {
      setErrorMessage(language === 'zh' ? '请填写有效的二代身份证件号码（严格实名加密）' : 'Please enter a valid National ID Number');
      return;
    }
    if (isHighRevenue && (!businessLicenseNumber.trim() || !businessLicenseName.trim())) {
      setErrorMessage(
        language === 'zh' 
          ? '合规提示：月营收超过 100 万元人民币，根据国家法规必须填写注册营业执照资质！' 
          : 'Compliance notice: Monthly revenue > 1M RMB requires verified enterprise business license!'
      );
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      const updated: MerchantCertification = {
        ...cert,
        realName: realName.trim(),
        idCardNumber: idCardNumber.trim(),
        contactPhone: contactPhone.trim(),
        merchantType,
        depositAmount: depositRequired,
        depositStatus: 'paid',
        depositPaidAt: Date.now(),
        monthlyRevenue: Number(monthlyRevenue),
        hasBusinessLicense: isHighRevenue,
        businessLicenseNumber: isHighRevenue ? businessLicenseNumber.trim() : undefined,
        businessLicenseName: isHighRevenue ? businessLicenseName.trim() : undefined,
        isVerified: true,
        certifiedAt: Date.now(),
      };
      onSaveCert(updated);
      setIsPaying(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {language === 'zh' ? '创作者挂车带货 · 商家实名认证与保证金规范' : 'Merchant Real-Name Certification & Deposit'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'zh' 
                ? '严格电商平台合规规范：实名准入、专款保证金存管与食品安全资质' 
                : 'Verified seller onboarding, security deposit escrow & compliance'}
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          
          {/* Real-name identity inputs */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'zh' ? '1. 商家法定实名认证（权威资质认证机制）' : '1. Real-Name ID Authentication'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">{language === 'zh' ? '真实姓名' : 'Full Name'}</label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="如：张守强"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'zh' ? '居民身份证号' : 'National ID Number'}</label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="18位身份证号（安全加密）"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono-num"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{language === 'zh' ? '实名手机号' : 'Verified Contact Phone'}</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="13800008869"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono-num"
              />
            </div>
          </div>

          {/* Deposit Category selection */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>{language === 'zh' ? '2. 选择带货品类及法定保证金缴纳' : '2. Category & Deposit Escrow'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setMerchantType('general')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  merchantType === 'general'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{language === 'zh' ? '普通健康用品/器械' : 'General Fitness & Goods'}</span>
                  <span className="text-amber-400 font-bold font-mono-num">¥500</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'zh' ? '阻力带、智能手环、健康拉伸器等，保证金不低于 500 元人民币。' : 'Fitness bands, trackers, accessories. Min ¥500 deposit.'}
                </p>
              </div>

              <div 
                onClick={() => setMerchantType('health_food')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  merchantType === 'health_food'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{language === 'zh' ? '保健食品与特殊膳食类' : 'Health Food & Supplements'}</span>
                  <span className="text-amber-400 font-bold font-mono-num">¥2,000</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'zh' ? '深海鱼油、益生菌、有机橄榄油等，根据国家食品安全法缴纳不低于 2,000 元保证金。' : 'Vitamins, fish oil, organic nutrition. Min ¥2,000 deposit.'}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue & Business License Policy (>100万元必须注册营销执照) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>{language === 'zh' ? '3. 营收规模与营业执照合规核验' : '3. Revenue & Business License'}</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isHighRevenue ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {isHighRevenue ? (language === 'zh' ? '月销≥100万 · 强制执照' : 'Monthly ≥ 1M RMB: License Required') : (language === 'zh' ? '个人创作者带货' : 'Individual Creator')}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>{language === 'zh' ? '预估月带货营收 (RMB)' : 'Estimated Monthly Revenue (RMB)'}</span>
                <span className="font-bold text-white font-mono-num">¥{Number(monthlyRevenue).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="3000000"
                step="50000"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>¥10,000</span>
                <span>¥1,000,000 (阈值线)</span>
                <span>¥3,000,000+</span>
              </div>
            </div>

            {isHighRevenue && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5 animate-fade-in">
                <div className="text-[11px] text-amber-300 font-semibold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'zh' ? '根据法规，月营收突破100万元必须注册并上传营销执照/营业执照' : 'Mandatory Business License required for revenue exceeding 1M RMB'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={businessLicenseName}
                    onChange={(e) => setBusinessLicenseName(e.target.value)}
                    placeholder={language === 'zh' ? '企业/个体工商户名称' : 'Registered Business Name'}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={businessLicenseNumber}
                    onChange={(e) => setBusinessLicenseNumber(e.target.value)}
                    placeholder={language === 'zh' ? '统一社会信用代码 (18位)' : 'Unified Social Credit Code'}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none font-mono-num"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer / Action */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>{language === 'zh' ? '应缴纳合规保证金：' : 'Deposit Total:'}</span>
            <span className="text-base font-bold text-amber-400 font-mono-num ml-1">¥{depositRequired}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={handleCompleteCertification}
              disabled={isPaying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-amber-500/20 cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isPaying ? (language === 'zh' ? '正在实名存管中...' : 'Processing...') : (language === 'zh' ? `确认实名并存管 ¥${depositRequired} 保证金` : `Verify & Escrow Deposit`)}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
