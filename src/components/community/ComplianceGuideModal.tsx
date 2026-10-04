import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  FileText,
  ShieldCheck,
  Send
} from 'lucide-react';
import { ComplianceDetails } from '../../services/aiModerator';
import { useLanguage } from '../../services/i18n';

interface ComplianceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide?: ComplianceDetails;
  onApplySampleText?: (sampleText: string) => void;
  onGoToAppeal?: () => void;
}

export const ComplianceGuideModal: React.FC<ComplianceGuideModalProps> = ({
  isOpen,
  onClose,
  guide,
  onApplySampleText,
  onGoToAppeal,
}) => {
  const { language } = useLanguage();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Default fallback guide if none passed
  const activeGuide: ComplianceDetails = guide || {
    ruleName: '医疗极端夸大与绝对化疗效宣称',
    categoryName: '科学健康传播规范',
    specificIssueZh: '文案或素材中包含了绝对化、包治百病、神效无敌或劝诫患者脱离正规医院诊疗的断言。',
    specificIssueEn: 'Text contains absolute medical assertions or claims of curing chronic illnesses completely.',
    revisionTips: [
      '将断言式词汇（如“彻底根治”、“神效治愈”）修改为温和、客观的健康描述（如“辅助改善机体代谢”、“有益于心肺健康维护”）。',
      '严禁引导用户“完全停药”、“断药”或替代正规三甲医院治疗，建议注明“本内容为个人自律打卡心得，不能替代专业医师临床处方”。',
      '聚焦于您的真实运动感受、膳食配比、睡眠数据等客观生活习惯记录，避免做出医疗保障性承诺。'
    ],
    badExamples: [
      '❌ 违规案例：“秘制偏方包治百病，按这个方子调理30天彻底根治晚期高血压糖尿病，不用再去医院吃降压药了！”',
      '❌ 违规案例：“不用化疗的神奇仙丹，每天喝一碗就能彻底消灭体内所有肿瘤细胞！”'
    ],
    goodExamples: [
      '✅ 合规范例：“坚持连续18天低GI彩虹生机饮食配合慢跑，体检显示空腹血糖和血脂处于健康稳定区间，整个人精神充沛！遵医嘱继续保持健康生活方式。”',
      '✅ 合规范例：“分享三甲医院医生推荐的工位抗坐拉伸操，帮助舒缓颈肩紧绷，改善下肢微循环。”'
    ],
    safeReplacements: [
      { forbidden: '彻底根治 / 包治百病 / 永不复发', recommended: '辅助促进代谢平衡 / 有益于日常机能维护' },
      { forbidden: '完全停药 / 告别医院处方', recommended: '在专科医师指导下进行健康生活方式干预' },
      { forbidden: '神药仙丹 / 癌症肿瘤克星', recommended: '富含高多酚抗氧化膳食营养' }
    ]
  };

  const handleCopyReplacement = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {language === 'zh' ? 'AI 审核合规指南 · 避坑与二次创作建议' : 'AI Moderation Compliance & Re-creation Guide'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {language === 'zh' ? '合规手册' : 'Guidelines'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'zh' 
                ? '帮助您快速理解触碰的规则底线，根据具体建议修改后可顺利二次上架或精准申诉' 
                : 'Understand why content was flagged and learn how to rephrase or appeal effectively.'}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs">
          
          {/* Section 1: Detected Problem Diagnosis */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{language === 'zh' ? '触犯的公约规则：' : 'Triggered Policy Rule: '}{activeGuide.ruleName}</span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed pl-6">
              {activeGuide.specificIssueZh}
            </p>
          </div>

          {/* Section 2: Specific Revision Suggestions */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'zh' ? '具体的修改优化建议 (如何改才能通过审核)' : 'Actionable Revision Recommendations'}</span>
            </div>
            <div className="space-y-2">
              {activeGuide.revisionTips.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-[11px] text-slate-300 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Bad Examples vs Good Examples Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Bad Examples Card */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-xs">
                <XCircle className="w-4 h-4" />
                <span>{language === 'zh' ? '常见违规示例 (直接拦截)' : 'Violation Examples (Rejected)'}</span>
              </div>
              <div className="space-y-2">
                {activeGuide.badExamples.map((ex, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/90 border border-rose-500/20 text-[11px] text-rose-200/90 leading-relaxed italic">
                    {ex}
                  </div>
                ))}
              </div>
            </div>

            {/* Good Examples Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'zh' ? '合规创作示范 (直接上架)' : 'Compliant Examples (Approved)'}</span>
              </div>
              <div className="space-y-2">
                {activeGuide.goodExamples.map((ex, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-[11px] text-emerald-200/90 leading-relaxed">
                    {ex}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 4: Safe Word Replacement Table */}
          {activeGuide.safeReplacements && activeGuide.safeReplacements.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-200 font-bold text-xs">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{language === 'zh' ? '敏感词汇替换速查表 (精准避坑词库)' : 'Safe Word Replacement Table'}</span>
                </div>
                <span className="text-[10px] text-slate-500">点击按钮快速复制推荐词</span>
              </div>

              <div className="space-y-2">
                {activeGuide.safeReplacements.map((pair, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 gap-2">
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="line-through text-rose-400 font-medium">{pair.forbidden}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-emerald-300 font-semibold">{pair.recommended}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyReplacement(pair.recommended, idx)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700 flex items-center space-x-1 cursor-pointer self-start sm:self-auto transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>复制推荐词</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400">
            {language === 'zh' 
              ? '修改文案后重新点击发布，AI 将自动重新审核并上架' 
              : 'Re-edit and publish to trigger instant re-audit.'}
          </div>

          <div className="flex items-center space-x-2.5">
            {onGoToAppeal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToAppeal();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '前往申诉通道' : 'Go to Appeal'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs hover:brightness-105 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              {language === 'zh' ? '我已了解，立即去修改文案' : 'Got it, Re-edit now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
