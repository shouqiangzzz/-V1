import React, { useState } from 'react';
import { Video, Upload, X, Plus, Sparkles, CheckCircle2, FileText, User } from 'lucide-react';
import { ExpertLectureVideo } from '../../types';
import { useLanguage } from '../../services/i18n';

interface AdminVideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: ExpertLectureVideo) => void;
}

export const AdminVideoUploadModal: React.FC<AdminVideoUploadModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
}) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [category, setCategory] = useState<'longevity' | 'sleep' | 'nutrition' | 'fitness' | 'cardio'>('longevity');
  const [duration, setDuration] = useState('25:30');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80');
  const [description, setDescription] = useState('');
  const [takeaway1, setTakeaway1] = useState('保持规律昼夜节律与间歇自噬，能系统性延缓细胞端粒缩短速度');
  const [takeaway2, setTakeaway2] = useState('结合抗阻运动与Zone 2有氧训练，稳固心血管内皮顺应性与代谢稳态');

  if (!isOpen) return null;

  const handleUpload = () => {
    if (!title.trim() || !speaker.trim()) return;

    const newVideo: ExpertLectureVideo = {
      id: `expert_video_${Date.now()}`,
      title: title.trim(),
      speaker: speaker.trim(),
      speakerTitle: speakerTitle.trim() || '特邀长寿医学专家',
      speakerAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80',
      videoUrl: videoUrl.trim(),
      coverUrl: coverUrl.trim(),
      duration: duration.trim(),
      viewsCount: 1,
      likesCount: 1,
      category,
      description: description.trim() || '权威专家深度剖析前沿生物学机理与长寿健康生活方案。',
      keyTakeaways: [takeaway1, takeaway2].filter(Boolean),
      uploadedAt: Date.now(),
      isFeatured: true,
    };

    onAddVideo(newVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Video className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {language === 'zh' ? '管理员发布 · 专家视频与健康讲座' : 'Upload Expert Lecture Video (Admin)'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'zh' ? '发布权威院士/医学专家的大视频课程，置顶于社区大视频界面展示' : 'Feature authoritative expert lectures on the main stage player'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'zh' ? '讲座视频标题' : 'Lecture Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：表观遗传学逆龄新突破：端粒维持与线粒体自噬"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'zh' ? '主讲专家姓名' : 'Speaker Name'}
              </label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="例如：林思哲 教授"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'zh' ? '专家权威头衔 / 机构' : 'Speaker Title / Institution'}
              </label>
              <input
                type="text"
                value={speakerTitle}
                onChange={(e) => setSpeakerTitle(e.target.value)}
                placeholder="例如：国家重点实验室首席科学家"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'zh' ? '所属领域' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none"
              >
                <option value="longevity">长寿抗衰 (Longevity)</option>
                <option value="sleep">睡眠医学 (Sleep)</option>
                <option value="nutrition">临床营养 (Nutrition)</option>
                <option value="fitness">运动康复 (Fitness)</option>
                <option value="cardio">心血管内科 (Cardio)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'zh' ? '讲座时长' : 'Duration'}
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="例如：28:45"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none font-mono-num"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'zh' ? '视频核心讲义要点 (Key Takeaways)' : 'Lecture Key Takeaways'}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={takeaway1}
                onChange={(e) => setTakeaway1(e.target.value)}
                placeholder="要点 1"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              />
              <input
                type="text"
                value={takeaway2}
                onChange={(e) => setTakeaway2(e.target.value)}
                placeholder="要点 2"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'zh' ? '讲座详情简介' : 'Lecture Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="概括该讲座对于观众日常生活与延展寿命的实践价值..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            {language === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={handleUpload}
            disabled={!title.trim() || !speaker.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-amber-500/20 cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'zh' ? '确认发布并置顶' : 'Publish Lecture'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
