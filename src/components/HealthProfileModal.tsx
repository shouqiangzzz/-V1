import React, { useState } from 'react';
import { 
  UserCheck, 
  FileText, 
  Upload, 
  X, 
  Save, 
  Sparkles, 
  Activity, 
  Heart, 
  ShieldCheck, 
  Scale, 
  Calendar,
  CheckCircle2,
  FileCheck,
  Trophy,
  Award,
  ChevronRight,
  Lock,
  Unlock,
  TrendingUp
} from 'lucide-react';
import { UserProfile, TimeAdjustment, AchievementBadge, HabitTrackerItem } from '../types';
import { calculateBiologicalAgeOffset } from '../services/longevityCalculator';
import { loadAchievements } from '../services/achievements';
import { AchievementMedalsView } from './AchievementMedalsView';
import { LongevityTrendsView } from './LongevityTrendsView';
import { useLanguage } from '../services/i18n';

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onAddAdjustment: (adj: TimeAdjustment) => void;
  achievements?: AchievementBadge[];
  initialSubTab?: 'indicators' | 'report' | 'medals' | 'trends';
  adjustments?: TimeAdjustment[];
  habits?: HabitTrackerItem[];
}

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onAddAdjustment,
  achievements,
  initialSubTab = 'indicators',
  adjustments = [],
  habits = [],
}) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [activeSubTab, setActiveSubTab] = useState<'indicators' | 'report' | 'medals' | 'trends'>(initialSubTab);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(profile.uploadedReportName || null);
  const [isParsingReport, setIsParsingReport] = useState<boolean>(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  const displayBadges = achievements || loadAchievements();
  const unlockedMedalsCount = displayBadges.filter(b => b.unlocked).length;
  const totalMedalsCount = displayBadges.length;

  if (!isOpen) return null;

  // Auto calculate preview BMI and Biological Age
  const heightM = (formData.height || 170) / 100;
  const currentBmi = heightM > 0 ? Number((formData.weight / (heightM * heightM)).toFixed(1)) : 22;
  const previewBioOffset = calculateBiologicalAgeOffset(formData);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...formData,
      biologicalAgeOffset: previewBioOffset,
      hasUploadedReport: !!uploadedFileName,
      uploadedReportName: uploadedFileName || undefined,
    };
    onSaveProfile(updated);
    onClose();
  };

  // Simulate file upload or one-click sample report loading
  const handleLoadSampleReport = (type: 'optimal' | 'moderate') => {
    setIsParsingReport(true);
    setParseSuccessMsg(null);

    setTimeout(() => {
      if (type === 'optimal') {
        const updatedProfile: UserProfile = {
          ...formData,
          height: 176,
          weight: 66,
          bodyFat: 15.5,
          fastingBloodSugar: 4.8,
          systolicBP: 112,
          diastolicBP: 74,
          restingHeartRate: 58,
          hasUploadedReport: true,
          uploadedReportName: '2026年三甲医院全面防癌体检报告_全指标优良.pdf',
          lastReportDate: '2026-04-10',
        };
        setFormData(updatedProfile);
        setUploadedFileName('2026年三甲医院全面防癌体检报告_全指标优良.pdf');
        setParseSuccessMsg('✓ 体检报告成功解析！血糖、血脂、心肺与体脂率皆处于极佳区间，推算生理年龄年轻 2.5 岁！');

        onAddAdjustment({
          id: `adj_report_optimal_${Date.now()}`,
          timestamp: Date.now(),
          category: 'report',
          type: 'gain',
          seconds: 86400 * 3, // +3 days lifespan bonus for excellent report!
          reason: '🏥 体检报告认证：各项关键生物标记物达标优异，奖励寿命 3天 (+259,200秒)',
        });
      } else {
        const updatedProfile: UserProfile = {
          ...formData,
          height: 175,
          weight: 78,
          bodyFat: 26.2,
          fastingBloodSugar: 6.4,
          systolicBP: 135,
          diastolicBP: 88,
          restingHeartRate: 78,
          hasUploadedReport: true,
          uploadedReportName: '2026年企业高管年度亚健康专项体检.pdf',
          lastReportDate: '2026-03-22',
        };
        setFormData(updatedProfile);
        setUploadedFileName('2026年企业高管年度亚健康专项体检.pdf');
        setParseSuccessMsg('⚠️ 体检报告已解析：检测到空腹血糖偏高(6.4)、前驱高血压与轻度体脂过高，生理年龄已偏大。');
      }

      setIsParsingReport(false);
    }, 1000);
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
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>健康档案与体检报告注册端口</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium">
                多指标差异化标准
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              输入实际年龄、预期寿命目标与关键生理参数，或上传专业体检报告推算生理年龄
            </p>
          </div>
        </div>

        {/* Tab switch: Direct Input vs Report Upload vs Medals */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab('indicators')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'indicators'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'zh' ? '指标详情输入与设定' : 'Biomarkers & Targets'}
          </button>
          <button
            onClick={() => setActiveSubTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'report'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '体检报告上传与AI解析端口' : 'Medical Report AI'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'trends'
                ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-emerald-300 border border-emerald-500/40 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'zh' ? '30天习惯与净长寿走势' : '30-Day Trends'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Recharts
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('medals')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'medals'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'zh' 
                ? `生命勋章与成就 (${unlockedMedalsCount}/${totalMedalsCount})` 
                : `Life Medals (${unlockedMedalsCount}/${totalMedalsCount})`}
            </span>
          </button>
        </div>

        {/* Tab 1: Indicators Input */}
        {activeSubTab === 'indicators' && (
          <div className="space-y-5">
            {/* Quick 30-Day Recharts Trends Banner */}
            <div 
              onClick={() => setActiveSubTab('trends')}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>{language === 'zh' ? '近30天习惯打卡与净延寿走势图' : '30-Day Habit & Longevity Trends'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-num font-bold border border-emerald-500/30">
                      Recharts 双轴可视化
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'zh' 
                      ? '已连续打卡 24 天，累计赢得 +58.4 小时净生命增量。点击查看每日打卡连击与收益复利走势' 
                      : 'Active 24-day streak, +58.4 net longevity hours gained. Click to inspect interactive Recharts graph.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform shrink-0">
                <span>{language === 'zh' ? '查看走势' : 'View Trends'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            {/* Quick Achievements Medal Banner in Profile */}
            <div 
              onClick={() => setActiveSubTab('medals')}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>{language === 'zh' ? '已点亮的健康生命勋章' : 'Unlocked Health Life Medals'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono-num font-bold border border-amber-500/30">
                      {unlockedMedalsCount} / {totalMedalsCount} {language === 'zh' ? '已解锁' : 'Earned'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'zh' 
                      ? '坚持健康睡眠、晨光运动与久坐防护，已斩获多枚专属勋章。点击展开荣誉展柜' 
                      : 'Achieved continuous sleep, exercise, and sedentary habits. Click to inspect full showcase.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform shrink-0">
                <span>{language === 'zh' ? '查看全部勋章' : 'View Medals'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            {/* Section 1: Basic Demographics & Target Age */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">姓名 / 称呼</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">出生日期 (实际年龄)</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">生理性别</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="male">男 (平均基准~78岁)</option>
                  <option value="female">女 (平均基准~83岁)</option>
                  <option value="other">多元/其他</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  预期目标寿命 (默认85岁)
                </label>
                <input
                  type="number"
                  min="60"
                  max="120"
                  value={formData.targetAge}
                  onChange={(e) => handleInputChange('targetAge', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-hidden focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Section 2: Clinical Biomarkers */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                关键健康生理指标 (用于推算生理年龄差异与定制标准)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Height */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">身高 (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Weight */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">体重 (kg)</label>
                    <span className="text-[10px] text-slate-500">BMI: {currentBmi}</span>
                  </div>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Body Fat % */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">体脂率 (%)</label>
                    <span className="text-[10px] text-cyan-400">健康参考 12-20%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => handleInputChange('bodyFat', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Fasting Glucose */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">空腹血糖 (mmol/L)</label>
                    <span className="text-[10px] text-teal-400">正常 3.9-6.1</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fastingBloodSugar}
                    onChange={(e) => handleInputChange('fastingBloodSugar', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Blood Pressure (Systolic / Diastolic) */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">血压 (收缩/舒张 mmHg)</label>
                    <span className="text-[10px] text-slate-500">115/75</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      placeholder="高压"
                      value={formData.systolicBP}
                      onChange={(e) => handleInputChange('systolicBP', Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                    <span className="text-slate-500">/</span>
                    <input
                      type="number"
                      placeholder="低压"
                      value={formData.diastolicBP}
                      onChange={(e) => handleInputChange('diastolicBP', Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Resting Heart Rate */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">静息心率 (bpm)</label>
                    <span className="text-[10px] text-emerald-400">理想 55-68</span>
                  </div>
                  <input
                    type="number"
                    value={formData.restingHeartRate}
                    onChange={(e) => handleInputChange('restingHeartRate', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Biological Age Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${previewBioOffset < 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">指标综合推算机体生理年龄偏离度</div>
                  <div className="text-sm font-bold text-white">
                    {previewBioOffset < 0 
                      ? `✨ 比实际年龄年轻 ${Math.abs(previewBioOffset)} 岁 (良好心血管与代谢)` 
                      : `⚠️ 比实际年龄偏大 ${previewBioOffset} 岁 (存在体脂或血糖风险)`}
                  </div>
                </div>
              </div>
              <span className={`font-mono-num font-bold text-lg ${previewBioOffset < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {previewBioOffset > 0 ? `+${previewBioOffset}` : previewBioOffset} 岁
              </span>
            </div>

            {/* Section: Biological Age Privacy & Authorization Setting */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl ${formData.authorizeBioAgeToOthers ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {formData.authorizeBioAgeToOthers ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>生理年龄隐私与查看授权</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        formData.authorizeBioAgeToOthers 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {formData.authorizeBioAgeToOthers ? '已授权其他用户可看' : '仅本人可见 (需本人授权)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      根据个人隐私保护规范，生理年龄默认处于保护状态，仅您本人可见；只有在您本人授权同意后，其他用户方可查看您的生理年龄与逆龄表现。
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={!!formData.authorizeBioAgeToOthers}
                    onChange={(e) => handleInputChange('authorizeBioAgeToOthers', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Report Upload Port */}
        {activeSubTab === 'report' && (
          <div className="space-y-5">
            <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-2xl p-6 bg-slate-950/60 text-center transition-all">
              <Upload className="w-10 h-10 text-teal-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">
                上传体检报告原件 (PDF / 图片 / 检验单)
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                支持三甲医院检验科、爱康国宾、美年大健康等体检报告，自动提取血糖、血脂、心电图、肝肾功能与体脂指标
              </p>

              {uploadedFileName && (
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-300 text-xs mb-3">
                  <FileCheck className="w-4 h-4 text-teal-400" />
                  <span>已挂载报告：{uploadedFileName}</span>
                </div>
              )}

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => handleLoadSampleReport('optimal')}
                  disabled={isParsingReport}
                  className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  一键导入样本：三甲医院优良体检报告
                </button>
                <button
                  onClick={() => handleLoadSampleReport('moderate')}
                  disabled={isParsingReport}
                  className="px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  一键导入样本：企业高压亚健康报告
                </button>
              </div>
            </div>

            {/* Parsing success feedback */}
            {parseSuccessMsg && (
              <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-200 text-xs flex items-center space-x-2.5 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span>{parseSuccessMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab: 30-Day Trends Data Visualization (Recharts) */}
        {activeSubTab === 'trends' && (
          <div className="animate-fade-in py-1">
            <LongevityTrendsView 
              adjustments={adjustments} 
              habits={habits} 
              profile={formData} 
            />
          </div>
        )}

        {/* Tab: Life Medals & Achievements Showcase */}
        {activeSubTab === 'medals' && (
          <div className="animate-fade-in py-1">
            <AchievementMedalsView achievements={displayBadges} />
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>保存并重新校准生命倒计时</span>
          </button>
        </div>

      </div>
    </div>
  );
};
