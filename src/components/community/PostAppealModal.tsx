import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { CommunityPost, PostAppeal } from '../../types';
import { useLanguage } from '../../services/i18n';

interface PostAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onConfirmAppeal: (postId: string, appeal: PostAppeal) => void;
}

export const PostAppealModal: React.FC<PostAppealModalProps> = ({
  isOpen,
  onClose,
  post,
  onConfirmAppeal,
}) => {
  const { language } = useLanguage();
  const [appealReason, setAppealReason] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'sms'>('email');
  const [contactValue, setContactValue] = useState('shouqiangzzz@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const handleSubmitAppeal = () => {
    if (!appealReason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const appeal: PostAppeal = {
        appealReason: appealReason.trim(),
        appealTimestamp: Date.now(),
        contactMethod,
        contactValue: contactValue.trim(),
        status: 'pending',
      };
      onConfirmAppeal(post.id, appeal);
      setIsSubmitting(false);
      setSuccessNotice(
        language === 'zh'
          ? '申诉工单已成功发送至管理员邮箱与短信！管理员将在24小时内复审并反馈处理结果。'
          : 'Appeal sent to Admin. Review feedback will be dispatched within 24 hours.'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {language === 'zh' ? '内容合规申诉与管理员人工复核通道' : 'Content Appeal & Admin Review Channel'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'zh' ? '针对被 AI 驳回或强制下架的内容发起官方人工仲裁' : 'Appeal AI rejections or post take-down actions'}
            </p>
          </div>
        </div>

        {/* Post info preview */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
          <div className="text-slate-400 text-[11px] mb-1">
            {language === 'zh' ? '原内容摘要：' : 'Original Post Snippet:'}
          </div>
          <p className="text-slate-200 line-clamp-2 italic">
            "{post.content || '视频/图片锻炼动态'}"
          </p>
          {post.moderationReason && (
            <div className="mt-2 text-rose-300 text-[11px] bg-rose-950/40 p-2 rounded-xl border border-rose-500/20">
              <strong>{language === 'zh' ? '原驳回/下架原因：' : 'Take-down Reason: '}</strong>{post.moderationReason}
            </div>
          )}
        </div>

        {successNotice ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2.5 animate-fade-in my-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'zh' ? '申诉理由与证据阐述 (必填)' : 'Appeal Justification & Scientific Evidence'}
              </label>
              <textarea
                rows={3}
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder={language === 'zh' ? '请阐述该内容具备正规医学/锻炼科学依据、不存在恶意误导的理由...' : 'Explain why this post is scientifically compliant and should be approved...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'zh' ? '期望管理员答复方式与接收账号' : 'Preferred Contact Channel for Admin Decision'}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod('email');
                    setContactValue('shouqiangzzz@gmail.com');
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    contactMethod === 'email'
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '电子邮箱 (Email)' : 'Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod('sms');
                    setContactValue('13800008869');
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    contactMethod === 'sms'
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '手机短信 (SMS)' : 'SMS Text'}</span>
                </button>
              </div>

              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={contactMethod === 'email' ? 'your_email@domain.com' : '11位手机号码'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400 font-mono-num"
              />
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '管理员审核后将通过上述途径下发复核结论，结论具有终局效力。' : 'Admin review outcome will be dispatched via chosen channel.'}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmitAppeal}
                disabled={isSubmitting || !appealReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (language === 'zh' ? '提交中...' : 'Submitting...') : (language === 'zh' ? '提交申诉给管理员' : 'Submit Appeal')}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
