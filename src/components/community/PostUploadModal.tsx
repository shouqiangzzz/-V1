import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ShoppingBag, 
  Globe, 
  Users, 
  Lock, 
  Tag, 
  Plus, 
  DollarSign, 
  Send,
  HelpCircle,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { 
  CommunityPost, 
  PostVisibility, 
  AttachedProduct, 
  MerchantCertification, 
  UserProfile 
} from '../../types';
import { auditContentWithAI, AuditResult } from '../../services/aiModerator';
import { INITIAL_PRODUCTS } from '../../services/communityStorage';
import { ComplianceGuideModal } from './ComplianceGuideModal';
import { useLanguage } from '../../services/i18n';

interface PostUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  merchantCert: MerchantCertification;
  onOpenMerchantCert: () => void;
  onAddPost: (post: CommunityPost) => void;
  onInitiateAppealForPost?: (post: CommunityPost) => void;
}

export const PostUploadModal: React.FC<PostUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  merchantCert,
  onOpenMerchantCert,
  onAddPost,
  onInitiateAppealForPost,
}) => {
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'text'>('image');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaFileName, setMediaFileName] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [selectedTag, setSelectedTag] = useState<string>('健康锻炼');
  const [attachedProduct, setAttachedProduct] = useState<AttachedProduct | null>(null);
  
  // Auditing & Review States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [rejectedPostDraft, setRejectedPostDraft] = useState<CommunityPost | null>(null);
  const [showComplianceGuide, setShowComplianceGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file selection (video or image)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFileName(file.name);
    const isVideo = file.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sample media quick presets for testing
  const handleSelectSample = (type: 'video' | 'image') => {
    if (type === 'video') {
      setMediaType('video');
      setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4');
      setMediaFileName('2026_晨跑有氧核心跟练_Zone2.mp4');
    } else {
      setMediaType('image');
      setMediaUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
      setMediaFileName('低GI抗炎生机能量碗_控糖打卡.jpg');
    }
  };

  const handleProductSelect = (prod: AttachedProduct) => {
    if (!merchantCert.isVerified || merchantCert.depositStatus !== 'paid') {
      onOpenMerchantCert();
      return;
    }
    setAttachedProduct(prod.id === attachedProduct?.id ? null : prod);
  };

  // Main Submit Handler with AI Moderation
  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl) return;

    setIsAuditing(true);
    setAuditResult(null);

    const result = await auditContentWithAI(content, mediaType, mediaFileName || undefined);
    setIsAuditing(false);
    setAuditResult(result);

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id || 'current_user',
      authorName: currentUser.name || (language === 'zh' ? '探索者' : 'Seeker'),
      authorAvatar: currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=LifeSeeker88',
      authorBadge: '🏅 生命行者',
      createdAt: Date.now(),
      content: content.trim(),
      mediaType,
      mediaUrl: mediaUrl || undefined,
      videoThumbnail: mediaType === 'video' ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' : undefined,
      mediaDuration: mediaType === 'video' ? '00:35' : undefined,
      visibility,
      moderationStatus: result.status,
      moderationReason: result.reason,
      pendingAdminDeadline: result.status === 'pending_admin' ? Date.now() + 86400000 : undefined,
      product: attachedProduct || undefined,
      likesCount: 1,
      likedByMe: true,
      comments: [],
      tags: [selectedTag],
      viewsCount: 1,
    };

    if (result.status === 'approved') {
      // Directly approve and publish
      onAddPost(newPost);
      setTimeout(() => {
        onClose();
      }, 700);
    } else if (result.status === 'pending_admin') {
      // Ambiguous -> with held, goes to admin queue with 24h timer
      onAddPost(newPost);
    } else {
      // Rejected -> keep draft for appeal
      setRejectedPostDraft(newPost);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {language === 'zh' ? '发布健康锻炼动态 · 视频 / 图文' : 'Share Health & Fitness Post'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'zh' ? '分享锻炼日常、抗炎食谱与好物链接，AI 智能实时审核安全上架' : 'Upload workout videos, healthy recipes and earn product commissions'}
            </p>
          </div>
        </div>

        {/* AI Audit Feedback Result Banner */}
        {auditResult && (
          <div className="mb-5 animate-fade-in">
            {auditResult.status === 'approved' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block font-bold">{language === 'zh' ? '✓ AI 安全审核已通过，直接上架！' : '✓ AI Moderation Approved & Published!'}</strong>
                  <span className="text-[11px] text-emerald-300/80">
                    {language === 'zh' ? '内容合规科学，已按照您设定的公开范围向全网/粉丝分发。' : 'Content is verified safe and distributed per your visibility settings.'}
                  </span>
                </div>
              </div>
            )}

            {auditResult.status === 'pending_admin' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{language === 'zh' ? '⚠️ AI 判定为边缘/存疑内容，已转交管理员人工审核' : '⚠️ Borderline Ambiguous: Escalated to Admin for Review'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-300/90">
                  {auditResult.reason}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-[11px] text-slate-400">
                  <span>⏱️ 承诺审核时效：<strong>≤ 24 小时</strong></span>
                  <span>📩 已向管理员短信/邮箱发送紧急审核推送</span>
                </div>
              </div>
            )}

            {auditResult.status === 'rejected' && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-rose-300">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{language === 'zh' ? '🚫 AI 审核未通过 · 拒绝上架系统' : '🚫 Rejected by AI Safety Moderation'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-200/90 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20">
                  <strong>{language === 'zh' ? '驳回原因：' : 'Reason: '}</strong>{auditResult.reason}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-500/20">
                  <button
                    type="button"
                    onClick={() => setShowComplianceGuide(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{language === 'zh' ? '📖 查看详细合规修改指南与违规示例' : 'View Compliance Guide & Examples'}</span>
                  </button>

                  {rejectedPostDraft && onInitiateAppealForPost && (
                    <button
                      type="button"
                      onClick={() => {
                        onInitiateAppealForPost(rejectedPostDraft);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center space-x-1"
                    >
                      <span>{language === 'zh' ? '发起人工申诉通道 →' : 'Submit Appeal →'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Body Editor */}
        <div className="space-y-4">
          
          {/* Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'zh' ? '文案内容与健康心得' : 'Workout Copy & Notes'}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'zh' ? '分享你的健身锻炼细节、心率表现、低GI生机餐食或自律打卡感悟... (AI将自动进行合规审核)' : 'Share your workout, heart rate, nutrition or health routine...'}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400 placeholder:text-slate-500 leading-relaxed"
            />
          </div>

          {/* Local Video / Image Upload Interface */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'zh' ? '上传本地锻炼视频 / 图片' : 'Upload Local Workout Video / Image'}
              </label>
              <div className="flex items-center space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSelectSample('video')}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  {language === 'zh' ? '+ 示例视频' : '+ Sample Video'}
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleSelectSample('image')}
                  className="text-teal-400 hover:underline cursor-pointer"
                >
                  {language === 'zh' ? '+ 示例图片' : '+ Sample Photo'}
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*,image/*"
              className="hidden"
            />

            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 p-2">
                {mediaType === 'video' ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    className="w-full max-h-56 object-contain rounded-xl bg-black"
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    alt="Upload Preview" 
                    className="w-full max-h-56 object-cover rounded-xl"
                  />
                )}
                <div className="flex items-center justify-between mt-2 px-2 text-xs text-slate-400">
                  <span className="truncate max-w-xs font-mono">{mediaFileName || 'upload_file'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl(null);
                      setMediaFileName(null);
                    }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    {language === 'zh' ? '移除' : 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 bg-slate-900/50 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {language === 'zh' ? '点击上传本地视频或照片' : 'Click to upload video or photos'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {language === 'zh' ? '支持 MP4, MOV, WebM 视频或 JPG, PNG 图片' : 'Supports MP4, MOV, WebM or JPG, PNG'}
                </div>
              </div>
            )}
          </div>

          {/* Visibility Scope Settings (用户自行设置公开范围) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'zh' ? '公开传播范围设置' : 'Visibility Scope'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'public', label: language === 'zh' ? '公开全网' : 'Public', icon: Globe },
                  { id: 'fans', label: language === 'zh' ? '仅 LIFE FANS' : 'Fans Only', icon: Users },
                  { id: 'private', label: language === 'zh' ? '仅自己' : 'Private', icon: Lock },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVisibility(item.id as PostVisibility)}
                      className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        visibility === item.id
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'zh' ? '所属分类标签' : 'Category Tag'}
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              >
                <option value="健康锻炼">🏃‍♂️ 健康锻炼 (Exercise)</option>
                <option value="抗炎生机餐">🥗 抗炎生机餐 (Nutrition)</option>
                <option value="拒绝久坐">🛡️ 拒绝久坐 (Posture)</option>
                <option value="深度睡眠">🌙 深度睡眠 (Sleep)</option>
                <option value="长寿生活志">🧬 长寿生活志 (Longevity)</option>
              </select>
            </div>
          </div>

          {/* E-Commerce Product Linking (小红书/抖音同款挂车带货赚取佣金) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  {language === 'zh' ? '挂载商品链接 · 创作者带货收益通道' : 'Attach Product Link (Earn Commission)'}
                </span>
              </div>

              {merchantCert.isVerified ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'zh' ? '已实名并缴存保证金' : 'Merchant Certified'}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMerchantCert}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer shadow-xs"
                >
                  {language === 'zh' ? '去实名认证 & 缴纳保证金' : 'Verify & Pay Deposit'}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {language === 'zh' 
                ? '挂车需完成法定实名认证并缴纳保证金（普通类≥500元，保健食品类≥2000元，月销超100万强制营业执照）。' 
                : 'Merchants must complete real-name verification and deposit escrow (≥500 RMB / ≥2000 RMB for health food).'}
            </p>

            {/* Selectable Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {INITIAL_PRODUCTS.map((prod) => {
                const isSelected = attachedProduct?.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleProductSelect(prod)}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-sm'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <img 
                      src={prod.coverUrl} 
                      alt={prod.title} 
                      className="w-10 h-10 object-cover rounded-lg shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{prod.title}</div>
                      <div className="flex items-center space-x-2 text-[10px] mt-0.5">
                        <span className="text-amber-400 font-bold font-mono-num">¥{prod.price}</span>
                        <span className="text-emerald-400 font-medium">佣金 {prod.commissionRate}%</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'zh' ? '提交后将触发 AI 智能合规预检' : 'Instant AI Safety Audit on Submit'}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isAuditing || (!content.trim() && !mediaUrl)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{language === 'zh' ? 'AI 正在智能安全审核中...' : 'AI Auditing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{language === 'zh' ? '提交发布' : 'Publish Post'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Compliance Guidelines & Revision Examples Modal */}
      <ComplianceGuideModal
        isOpen={showComplianceGuide}
        onClose={() => setShowComplianceGuide(false)}
        guide={auditResult?.complianceGuide}
        onGoToAppeal={() => {
          setShowComplianceGuide(false);
          if (rejectedPostDraft && onInitiateAppealForPost) {
            onInitiateAppealForPost(rejectedPostDraft);
            onClose();
          }
        }}
      />

    </div>
  );
};
