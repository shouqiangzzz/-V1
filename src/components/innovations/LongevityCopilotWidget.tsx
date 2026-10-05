import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Heart, 
  Moon, 
  Activity, 
  ChevronDown, 
  Zap, 
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { UserProfile, HabitTrackerItem } from '../../types';
import { WearableDevice } from '../../types/innovations';
import { useLanguage } from '../../services/i18n';
import { ASSISTANT_AVATARS, ASSISTANT_AVATAR_KEY } from '../../services/themeHelper';

interface LongevityCopilotWidgetProps {
  profile: UserProfile;
  habits?: HabitTrackerItem[];
  wearables?: WearableDevice[];
  onOpenConsultation?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const LongevityCopilotWidget: React.FC<LongevityCopilotWidgetProps> = ({
  profile,
  habits = [],
  wearables = [],
  onOpenConsultation,
}) => {
  const { language } = useLanguage();
  const assistantAvatar = ASSISTANT_AVATARS.find(a => a.id === (typeof localStorage !== 'undefined' ? localStorage.getItem(ASSISTANT_AVATAR_KEY) : null)) || ASSISTANT_AVATARS[0];
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `您好，${profile.name || '探索者'}！我是您的 24 小时长寿健康专属私人教练（Longevity Copilot）。实时监测显示您当前生理年龄为 24.71 岁（逆龄 3.6 岁）。昨夜 Apple Watch 记录深睡达标 104 分钟，线粒体修复极优！今天建议保持 16:8 轻断食与晨光心肺慢跑。`,
      timestamp: '08:00',
    },
  ]);

  const quickPrompts = [
    '今天怎么做能最大化延寿秒数？',
    '昨晚深睡良好，今天饮食如何搭配？',
    '久坐4小时后如何快速激活微循环？',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // AI Copilot response generator
    setTimeout(() => {
      let reply = '';
      if (text.includes('延寿') || text.includes('秒数')) {
        reply = `【今日长寿优化方案】基于您当天的身体节律：1. 建议在 17:00 前完成 30 分钟 Zone2 心肺慢跑（心率保持 130-140 bpm），可净延寿 +1.2 小时；2. 晚餐多补充橄榄油多酚与深色浆果；3. 22:30 前入睡，预计可获得连续打卡双倍生命币奖励！`;
      } else if (text.includes('深睡') || text.includes('饮食')) {
        reply = `深睡 104 分钟已彻底排空脑部代谢废物。今日饮食建议首选抗炎高纤维食材：野生三文鱼、西兰花芽苗菜（富含萝卜硫素激活 Nrf2 通路）与特级初榨橄榄油，巩固线粒体能量代谢！`;
      } else if (text.includes('久坐') || text.includes('循环')) {
        reply = `久坐会让下肢深静脉微血流淤滞与胰岛素敏感性骤降。请立刻起立进行 3 分钟「小腿比目鱼肌提踵」或靠墙静蹲，能迅速促进 GLUT4 葡萄糖转运蛋白转位，挽回被暂扣的生命倒计时！`;
      } else {
        reply = `收到！针对您关于「${text}」的健康长寿关切：建议坚持规律深睡与抗炎饮食。若您需要深入评估多组学生化报告，可点击专家咨询专栏预约协和医学专家 1 对 1 方案定制。`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-teal-400 text-slate-950 font-bold shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center space-x-2 border border-emerald-300/40"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <span className="text-xs font-black tracking-tight text-slate-950 hidden sm:inline">
            AI 长寿私教
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-mono-num font-bold">
            24h
          </span>
        </button>
      )}

      {/* Expanded Copilot Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden animate-fade-in backdrop-blur-xl">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 overflow-hidden shrink-0">
                {assistantAvatar.url ? (
                  <img src={assistantAvatar.url} alt={assistantAvatar.name} className="w-full h-full object-cover rounded-[10px]" />
                ) : (
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-bold text-white">Longevity Copilot</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    AI 医疗级私教
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>实时联通穿戴设备与长寿算法流</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Vitals Summary Strip */}
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <span>推算生物年龄: <strong className="text-emerald-400 font-mono-num">24.71岁</strong></span>
            <span>静息心率: <strong className="text-rose-400 font-mono-num">52bpm</strong></span>
            <span>深睡: <strong className="text-cyan-400 font-mono-num">104分</strong></span>
          </div>

          {/* Messages scroll area */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-medium'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick suggestions - No horizontal scrollbar, multiline allowed, max 2 lines with ellipsis */}
          <div className="px-3.5 py-2 bg-slate-950/70 border-t border-slate-800/80 flex flex-wrap gap-1.5 shrink-0 no-scrollbar">
            {quickPrompts.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                title={p}
                className="text-left px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-[11px] leading-snug cursor-pointer transition-colors max-w-full"
              >
                <span className="line-clamp-2">{p}</span>
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center space-x-2 shrink-0">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="向长寿私教咨询睡眠、断食、运动或体检..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
