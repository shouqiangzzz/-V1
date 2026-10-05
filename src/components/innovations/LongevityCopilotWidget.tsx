import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Heart, 
  Moon, 
  Activity, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Zap, 
  ShieldCheck,
  Minimize2,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  Check,
  ArrowRight,
  MessageSquare,
  Copy,
  RotateCcw,
  Loader2,
  Hourglass,
  Gauge,
  Square,
  UserCheck
} from 'lucide-react';
import { UserProfile, HabitTrackerItem } from '../../types';
import { WearableDevice } from '../../types/innovations';
import { useLanguage } from '../../services/i18n';
import { sendCopilotMessage, ChatHistoryItem, getUserAgeStats } from '../../services/geminiCopilotService';
import { ASSISTANT_AVATARS, ASSISTANT_AVATAR_KEY, AssistantAvatar } from '../../services/themeHelper';

// Exactly 3 speed options: 0.5x, 1x, 2x
export type StreamingSpeed = '0.5' | '1' | '2';

export interface SpeedOption {
  key: StreamingSpeed;
  labelZh: string;
  labelEn: string;
  tag: string;
  charDelayMs: number;
  descZh: string;
  descEn: string;
}

export const SPEED_OPTIONS: SpeedOption[] = [
  { 
    key: '0.5', 
    labelZh: '0.5x 极慢逐字', 
    labelEn: '0.5x Ultra Slow', 
    tag: '0.5x', 
    charDelayMs: 140, // 0.5倍速再减半 (140ms/字，从容沉浸深读)
    descZh: '一个字一个字顺序退出，速度再减半，从容深读', 
    descEn: 'Halved speed, single-char sequential typewriter' 
  },
  { 
    key: '1', 
    labelZh: '1.0x 标准逐字', 
    labelEn: '1.0x Standard', 
    tag: '1.0x', 
    charDelayMs: 40, // 标准逐字节奏 (40ms/字)
    descZh: '经典打字机流，平稳逐字顺序吐出', 
    descEn: 'Classic character typewriter pace' 
  },
  { 
    key: '2', 
    labelZh: '2.0x 快速逐字', 
    labelEn: '2.0x Fast', 
    tag: '2.0x', 
    charDelayMs: 20, // 快速逐字 (20ms/字)
    descZh: '快速逐字吐出，兼顾流畅与即时浏览', 
    descEn: 'Brisk character-by-character output' 
  },
];

interface LongevityCopilotWidgetProps {
  profile: UserProfile;
  habits?: HabitTrackerItem[];
  wearables?: WearableDevice[];
  onOpenConsultation?: (expertId?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  feedback?: 'helpful' | 'unhelpful';
  followUpSuggestions?: string[];
  isStreaming?: boolean;
}

/**
 * Enhanced Clean Markdown Renderer for Clinical Copilot Messages
 */
const FormattedMessage: React.FC<{ text: string; isStreaming?: boolean }> = ({ text, isStreaming }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed === '---') {
          return <hr key={idx} className="my-2 border-slate-800/80" />;
        }

        if (trimmed.startsWith('### ')) {
          const headerText = trimmed.replace('### ', '');
          return (
            <div key={idx} className="pt-1.5 pb-0.5">
              <h5 className="font-bold text-emerald-400 text-xs flex items-center space-x-1.5 tracking-tight">
                <span className="w-1.5 h-3 rounded-full bg-emerald-400 inline-block" />
                <span>{renderInlineMarkdown(headerText)}</span>
              </h5>
            </div>
          );
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5">
              <span className="text-emerald-400 text-sm leading-none mt-0.5">•</span>
              <div className="flex-1 text-slate-200">
                {renderInlineMarkdown(bulletText)}
              </div>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5">
              <span className="text-cyan-400 font-mono-num font-bold text-[11px] leading-tight shrink-0 mt-0.5">
                {numberedMatch[1]}.
              </span>
              <div className="flex-1 text-slate-200">
                {renderInlineMarkdown(numberedMatch[2])}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-200">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-emerald-400 rounded-xs animate-pulse ml-0.5 align-middle shadow-xs" />
      )}
    </div>
  );
};

function renderInlineMarkdown(text: string): React.ReactNode {
  // Gracefully handle unclosed ** while characters are streaming
  let normalized = text;
  const matchCount = (text.match(/\*\*/g) || []).length;
  if (matchCount % 2 === 1) {
    normalized = text + '**';
  }

  const parts = normalized.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-white tracking-wide">
          {inner}
        </strong>
      );
    }
    return part;
  });
}

export const LongevityCopilotWidget: React.FC<LongevityCopilotWidgetProps> = ({
  profile,
  habits = [],
  wearables = [],
  onOpenConsultation,
}) => {
  const { language } = useLanguage();

  // Assistant avatar state: synced in real-time across components via custom event and storage
  const [assistantAvatarId, setAssistantAvatarId] = useState<string>(() => {
    try {
      return localStorage.getItem(ASSISTANT_AVATAR_KEY) || 'bot_default';
    } catch {
      return 'bot_default';
    }
  });

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  useEffect(() => {
    const handleAvatarChange = () => {
      try {
        const saved = localStorage.getItem(ASSISTANT_AVATAR_KEY);
        if (saved) setAssistantAvatarId(saved);
      } catch {}
    };
    window.addEventListener('storage', handleAvatarChange);
    window.addEventListener('bd_assistant_avatar_changed', handleAvatarChange);
    return () => {
      window.removeEventListener('storage', handleAvatarChange);
      window.removeEventListener('bd_assistant_avatar_changed', handleAvatarChange);
    };
  }, []);

  const assistantAvatar: AssistantAvatar = 
    ASSISTANT_AVATARS.find(a => a.id === assistantAvatarId) || ASSISTANT_AVATARS[0];

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Speed configuration - strictly 3 options ('0.5', '1', '2')
  const [streamingSpeed, setStreamingSpeed] = useState<StreamingSpeed>(() => {
    try {
      const saved = localStorage.getItem('copilot_output_speed') as string;
      if (saved === '0.5' || saved === '1' || saved === '2') return saved as StreamingSpeed;
      if (saved === 'slow') return '0.5';
      if (saved === 'fast' || saved === 'lightning') return '2';
      return '1';
    } catch (e) {
      return '1';
    }
  });

  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const streamingIntervalRef = useRef<any>(null);
  const fullResponseMapRef = useRef<Record<string, string>>({});
  const isCancelledRef = useRef(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentSpeedOpt = SPEED_OPTIONS.find(o => o.key === streamingSpeed) || SPEED_OPTIONS[1];

  const handleSetSpeed = (speed: StreamingSpeed) => {
    setStreamingSpeed(speed);
    try {
      localStorage.setItem('copilot_output_speed', speed);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    if (isSpeedMenuOpen || isAvatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSpeedMenuOpen, isAvatarMenuOpen]);

  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearTimeout(streamingIntervalRef.current);
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const { biologicalAge: bioAge, yearsYounger } = getUserAgeStats(profile);
  const youthBonus = Math.abs(yearsYounger).toFixed(1);

  const welcomeTextZh = `您好，${profile.name || '探索者'}！我是您的专属长寿健康私人教练（Longevity Copilot · ${assistantAvatar.name}）。

实时体征流已就绪：当前生理年龄计算为 **${bioAge} 岁**（逆龄 **${youthBonus} 岁**）。昨夜 Apple Watch 监测记录深睡达标 **104 分钟**，线粒体修复极为优异！

无论是身体不适排查、断食代谢、Zone 2 心肺计划，还是体检指标分析，请随时向我咨询，我将为您提供医学级深度生理机制与可落地的行动方案。`;

  const welcomeTextEn = `Hello, ${profile.name || 'Seeker'}! I am your 24/7 Longevity Copilot (${assistantAvatar.name}).

Real-time biometrics connected: Biological age calculated at **${bioAge} yrs** (a **${youthBonus}-year** youth advantage). Apple Watch logged **104 mins** of deep restorative sleep with optimal mitochondrial recovery!

Whether analyzing physical discomfort, fasting protocols, Zone 2 cardio, or biomarker lab reports, ask me anything for structured clinical reasoning and actionable home guidance.`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: language === 'zh' ? welcomeTextZh : welcomeTextEn,
      timestamp: '08:00',
    },
  ]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'msg-1') {
        return [{
          ...prev[0],
          text: language === 'zh' ? welcomeTextZh : welcomeTextEn,
        }];
      }
      return prev;
    });
  }, [language, profile.name, profile.biologicalAgeOffset, profile.birthDate, assistantAvatar.name]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isStreaming, isOpen]);

  const quickPrompts = React.useMemo(() => {
    if (language === 'en') {
      return [
        'I feel tired and a bit unwell today, what could it be?',
        'How to maximize added lifespan seconds today?',
        'How to relieve neck and lower back sitting stiffness?',
        'What should I eat to enhance autophagy during 16:8 fasting?',
        'How to deepen slow-wave sleep tonight?',
        'How to calculate my optimal Zone 2 cardio HR zone?'
      ];
    }
    return [
      '我今天感觉有些疲惫不舒服，帮我查查原因',
      '今天怎么做能最大化延寿秒数？',
      '久坐脖子和腰背酸痛，如何快速缓解？',
      '16:8 轻断食期间吃什么能最大化自噬？',
      '今晚如何提早进入高质量深度慢波睡眠？',
      'Zone 2 心肺耐力训练的最佳心率区间如何计算？'
    ];
  }, [language]);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (!isOpen || isCarouselPaused) return;

    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % quickPrompts.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isOpen, isCarouselPaused, quickPrompts.length]);

  const handleNextSuggestion = () => {
    setCarouselIndex(prev => (prev + 1) % quickPrompts.length);
  };

  const handlePrevSuggestion = () => {
    setCarouselIndex(prev => (prev - 1 + quickPrompts.length) % quickPrompts.length);
  };

  const handleFeedback = (messageId: string, rating: 'helpful' | 'unhelpful') => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, feedback: rating } : m))
    );
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (streamingIntervalRef.current) {
      clearTimeout(streamingIntervalRef.current);
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: language === 'zh' ? welcomeTextZh : welcomeTextEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSkipStreaming = (msgId: string) => {
    if (streamingIntervalRef.current) {
      clearTimeout(streamingIntervalRef.current);
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    const fullText = fullResponseMapRef.current[msgId];
    if (fullText) {
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, text: fullText, isStreaming: false } : m))
      );
    } else {
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, isStreaming: false } : m))
      );
    }
    setIsStreaming(false);
  };

  const handleStopChat = () => {
    isCancelledRef.current = true;

    if (isThinking) {
      setIsThinking(false);
      const stoppedNote: ChatMessage = {
        id: `ai-stopped-${Date.now()}`,
        sender: 'ai',
        text: language === 'zh' ? '（已停止本次输出）' : '(Generation stopped by user)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: false,
      };
      setMessages(prev => [...prev, stoppedNote]);
    }

    if (isStreaming || streamingIntervalRef.current) {
      if (streamingIntervalRef.current) {
        clearTimeout(streamingIntervalRef.current);
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
      setIsStreaming(false);
      setMessages(prev =>
        prev.map(m => (m.isStreaming ? { ...m, isStreaming: false } : m))
      );
    }
  };

  // Character-by-character sequential typewriter output ("一个字一个字顺序退出")
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking || isStreaming) return;

    isCancelledRef.current = false;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    try {
      const history: ChatHistoryItem[] = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const copilotResponse = await sendCopilotMessage(
        text,
        history,
        profile,
        language,
        wearables,
        habits
      );

      if (isCancelledRef.current) return;

      const fullText = copilotResponse.text;
      const aiMsgId = `ai-${Date.now()}`;
      fullResponseMapRef.current[aiMsgId] = fullText;

      setIsThinking(false);

      // Single-character sequential output (一个字一个字顺序吐出)
      const baseDelay = currentSpeedOpt.charDelayMs;

      const initialMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: fullText.slice(0, 1),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: fullText.length > 1,
      };
      setMessages(prev => [...prev, initialMsg]);

      if (fullText.length > 1) {
        setIsStreaming(true);
        let currentCharIndex = 1;

        if (streamingIntervalRef.current) {
          clearTimeout(streamingIntervalRef.current);
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }

        const streamNextChar = () => {
          if (isCancelledRef.current) return;

          currentCharIndex++;
          const isDone = currentCharIndex >= fullText.length;
          const revealedText = fullText.slice(0, currentCharIndex);

          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: isDone ? fullText : revealedText,
                    isStreaming: !isDone,
                  }
                : m
            )
          );

          if (isDone) {
            if (streamingIntervalRef.current) {
              clearTimeout(streamingIntervalRef.current);
              streamingIntervalRef.current = null;
            }
            setIsStreaming(false);
          } else {
            // Natural typewriter pacing: punctuation gets slight breathing space
            const prevChar = fullText[currentCharIndex - 1] || '';
            let stepDelay = baseDelay;
            if (prevChar === '\n') {
              stepDelay = baseDelay * 1.5;
            } else if (prevChar === '。' || prevChar === '！' || prevChar === '？' || prevChar === '.' || prevChar === '!' || prevChar === '?') {
              stepDelay = baseDelay * 1.8;
            } else if (prevChar === '，' || prevChar === '、' || prevChar === ',' || prevChar === '；' || prevChar === ';') {
              stepDelay = baseDelay * 1.3;
            }

            streamingIntervalRef.current = setTimeout(streamNextChar, stepDelay);
          }
        };

        streamingIntervalRef.current = setTimeout(streamNextChar, baseDelay);
      }
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error('Error generating AI copilot response:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: language === 'zh'
          ? '长寿私教系统正在微调生理算法通道，请稍后再次发送，我将持续为您分析。'
          : 'Longevity Copilot is recalibrating biomarker streams, please retry shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: false,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      if (!isCancelledRef.current) {
        setIsThinking(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-teal-400 text-slate-950 font-bold shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center space-x-2.5 border border-emerald-300/40"
        >
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-950 border border-emerald-400/40 shrink-0">
            {assistantAvatar.url ? (
              <img src={assistantAvatar.url} alt={assistantAvatar.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-emerald-400">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
            )}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-black tracking-tight text-slate-950 block leading-tight">
              {assistantAvatar.name}
            </span>
            <span className="text-[10px] text-slate-900 font-medium block">
              AI 长寿私教
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-mono-num font-bold">
            24h
          </span>
        </button>
      )}

      {/* Expanded Copilot Chat Drawer */}
      {isOpen && (
        <div 
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          className={`rounded-3xl bg-slate-900/80 border border-slate-700/60 hover:border-emerald-500/40 shadow-2xl shadow-slate-950/80 flex flex-col overflow-hidden animate-fade-in backdrop-blur-[12px] ring-1 ring-white/10 transition-all duration-300 relative ${
            isExpanded 
              ? 'w-[92vw] sm:w-[680px] h-[85vh] max-h-[820px]' 
              : 'w-[360px] sm:w-[420px] h-[580px]'
          }`}
        >
          
          {/* Header */}
          <div 
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            className="px-5 py-3.5 border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-[12px] flex items-center justify-between shrink-0 relative z-30"
          >
            <div className="flex items-center space-x-2.5" ref={avatarMenuRef}>
              <div 
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 overflow-hidden shrink-0 cursor-pointer relative group"
                title={language === 'zh' ? '点击快速切换 AI 私教形象' : 'Click to change AI persona'}
              >
                {assistantAvatar.url ? (
                  <img src={assistantAvatar.url} alt={assistantAvatar.name} className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[10px]">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">{assistantAvatar.name}</h4>
                  <button
                    type="button"
                    onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-0.5 cursor-pointer transition-colors"
                    title={language === 'zh' ? '点击切换 AI 私教形象' : 'Switch persona'}
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    <span>{assistantAvatar.badge} · 换形象</span>
                    <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>{language === 'zh' ? '实时联通穿戴体征与生物时钟算法' : 'Live Wearable & Bioclock Algorithms'}</span>
                </div>
              </div>

              {/* Avatar Fast Picker Dropdown */}
              {isAvatarMenuOpen && (
                <div 
                  style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                  className="absolute left-4 top-14 w-72 bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in backdrop-blur-xl ring-1 ring-white/10"
                >
                  <div className="px-1.5 py-1 text-[11px] font-bold text-white border-b border-slate-800/80 mb-2 flex items-center justify-between">
                    <span>{language === 'zh' ? '切换 AI 私教导师形象' : 'Select AI Coach Persona'}</span>
                    <button onClick={() => setIsAvatarMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {ASSISTANT_AVATARS.map(a => {
                      const isCur = assistantAvatarId === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setAssistantAvatarId(a.id);
                            localStorage.setItem(ASSISTANT_AVATAR_KEY, a.id);
                            window.dispatchEvent(new Event('bd_assistant_avatar_changed'));
                            setIsAvatarMenuOpen(false);
                          }}
                          className={`p-1 rounded-xl border text-center transition-all cursor-pointer ${
                            isCur ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                          }`}
                        >
                          <div className="w-9 h-9 mx-auto rounded-lg overflow-hidden mb-1 bg-slate-800">
                            {a.url ? (
                              <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-emerald-400 text-xs">🤖</div>
                            )}
                          </div>
                          <span className="text-[9px] block truncate font-medium text-slate-300">{a.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-1.5 text-slate-400">
              {/* Output Speed Control Button & Dropdown in Top-Right (3 tiers: 0.5, 1, 2) */}
              <div className="relative z-40" ref={speedMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                  title={language === 'zh' ? `输出速度: ${currentSpeedOpt.labelZh} (${currentSpeedOpt.tag})` : `Output speed: ${currentSpeedOpt.labelEn} (${currentSpeedOpt.tag})`}
                  className={`px-2 py-1 rounded-xl flex items-center space-x-1 text-[11px] font-medium transition-all cursor-pointer border ${
                    isSpeedMenuOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-[10px] font-mono-num">{currentSpeedOpt.tag}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSpeedMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {isSpeedMenuOpen && (
                  <div 
                    style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                    className="absolute right-0 top-full mt-2 w-56 bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-fade-in backdrop-blur-xl ring-1 ring-white/10"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                      <span>{language === 'zh' ? '逐字顺序吐出速度 (3档)' : 'Sequential Output Speed'}</span>
                      <span className="text-emerald-400 text-[9px] font-mono-num font-bold">{currentSpeedOpt.tag}</span>
                    </div>
                    <div className="space-y-0.5">
                      {SPEED_OPTIONS.map(opt => {
                        const isSelected = opt.key === streamingSpeed;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              handleSetSpeed(opt.key);
                              setIsSpeedMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="flex items-center space-x-1.5">
                                <span className="text-[11px] font-bold">{language === 'zh' ? opt.labelZh : opt.labelEn}</span>
                                <span className="text-[10px] text-slate-400 font-mono-num font-normal">({opt.tag})</span>
                              </span>
                              <span className="text-[9px] text-slate-400 leading-tight mt-0.5">
                                {language === 'zh' ? opt.descZh : opt.descEn}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                title={language === 'zh' ? '重新开始对话' : 'Reset conversation'}
                className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? (language === 'zh' ? '缩小窗口' : 'Restore size') : (language === 'zh' ? '展开大屏' : 'Expand window')}
                className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={language === 'zh' ? '关闭' : 'Close'}
                className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vitals Summary Strip */}
          <div 
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/50 backdrop-blur-[12px] flex items-center justify-between text-[10px] text-slate-400 shrink-0 relative z-10"
          >
            <span>
              {language === 'zh' ? '生物年龄:' : 'Biological Age:'}{' '}
              <strong className="text-emerald-400 font-mono-num font-bold">
                {bioAge}{language === 'zh' ? '岁' : ' yrs'}
              </strong>
            </span>
            <span>
              {language === 'zh' ? '静息心率:' : 'Resting HR:'}{' '}
              <strong className="text-rose-400 font-mono-num font-bold">52 bpm</strong>
            </span>
            <span>
              {language === 'zh' ? '昨夜深睡:' : 'Deep Sleep:'}{' '}
              <strong className="text-cyan-400 font-mono-num font-bold">
                104 {language === 'zh' ? '分钟' : 'mins'}
              </strong>
            </span>
          </div>

          {/* Messages scroll area */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs bg-slate-950/20">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start max-w-[92%] space-x-2">
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-emerald-500/40 mt-0.5">
                      {assistantAvatar.url ? (
                        <img src={assistantAvatar.url} alt={assistantAvatar.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950">
                          <Bot className="w-4 h-4 text-slate-950" />
                        </div>
                      )}
                    </div>
                  )}

                  <div 
                    className={`p-3.5 rounded-2xl flex-1 leading-relaxed group relative transition-all ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-medium shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/75 border border-slate-800/80 text-slate-200 shadow-lg backdrop-blur-md'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="whitespace-pre-line text-xs font-semibold">{msg.text}</div>
                    ) : (
                      <>
                        <FormattedMessage text={msg.text} isStreaming={msg.isStreaming} />

                        {msg.isStreaming && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between animate-fade-in">
                            <span className="text-[10px] text-emerald-400 font-mono-num flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                              <span>{language === 'zh' ? '正在一个字一个字顺序吐出...' : 'Streaming char-by-char...'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSkipStreaming(msg.id)}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium transition-all cursor-pointer flex items-center space-x-1 active:scale-95 shadow-xs"
                              title={language === 'zh' ? '直接呈现全部文字' : 'Show full text immediately'}
                            >
                              <Zap className="w-2.5 h-2.5" />
                              <span>{language === 'zh' ? '即时全显' : 'Show full'}</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {msg.sender === 'ai' && !msg.isStreaming && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-slate-700/50"
                        title={language === 'zh' ? '复制内容' : 'Copy'}
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'ai' && !msg.isStreaming && (
                  <div className="mt-1.5 ml-9 flex items-center space-x-2 px-1 py-0.5 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {language === 'zh' ? '处方评价：' : 'Feedback:'}
                    </span>
                    <div className="inline-flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          msg.feedback === 'helpful'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                            : 'bg-slate-800/80 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border border-slate-700/60'
                        }`}
                        title={language === 'zh' ? "标记为有用：AI私教将强化此类长寿优化建议" : "Helpful advice"}
                      >
                        <ThumbsUp className={`w-3 h-3 ${msg.feedback === 'helpful' ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
                        <span>{language === 'zh' ? '实用' : 'Helpful'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, 'unhelpful')}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          msg.feedback === 'unhelpful'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                            : 'bg-slate-800/80 text-slate-400 hover:text-rose-300 hover:bg-slate-800 border border-slate-700/60'
                        }`}
                        title={language === 'zh' ? "标记为不适用：私教将调整推演逻辑" : "Not applicable"}
                      >
                        <ThumbsDown className={`w-3 h-3 ${msg.feedback === 'unhelpful' ? 'text-rose-400 fill-rose-400/20' : ''}`} />
                        <span>{language === 'zh' ? '不适用' : 'Not helpful'}</span>
                      </button>
                    </div>

                    {msg.feedback && (
                      <span className="text-[9px] text-emerald-400 font-medium animate-fade-in flex items-center space-x-0.5 ml-1">
                        <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span>
                          {msg.feedback === 'helpful'
                            ? (language === 'zh' ? '已记录，持续强化此类医学干预' : 'Logged, prioritizing this protocol')
                            : (language === 'zh' ? '已收录，正在微调临床逻辑' : 'Logged, tuning clinical logic')}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                <span className="text-[9px] text-slate-500 mt-1 px-1 ml-9">{msg.timestamp}</span>
              </div>
            ))}

            {isThinking && (
              <div className="flex flex-col items-start animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-emerald-500/40">
                    {assistantAvatar.url ? (
                      <img src={assistantAvatar.url} alt={assistantAvatar.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950">
                        <Bot className="w-4 h-4 text-slate-950" />
                      </div>
                    )}
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-emerald-400 shadow-md flex items-center space-x-2">
                    <Hourglass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span className="flex space-x-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions - AI Suggestions Auto-Carousel Bar */}
          <div 
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/60 backdrop-blur-[12px] flex items-center justify-between gap-2 shrink-0 select-none"
          >
            <div className="flex items-center space-x-1.5 shrink-0 text-emerald-400">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-emerald-300 hidden sm:inline">
                {language === 'zh' ? '私教建议轮播' : 'Suggestions'}
              </span>
            </div>

            <div className="flex-1 overflow-hidden relative h-7 flex items-center min-w-0">
              <button
                key={carouselIndex}
                onClick={() => handleSend(quickPrompts[carouselIndex])}
                disabled={isThinking || isStreaming}
                title={language === 'zh' ? '点击向AI私教咨询此建议' : 'Click to send this prompt'}
                className="w-full text-left flex items-center justify-between space-x-2 px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/80 text-slate-300 hover:text-emerald-300 text-[11px] cursor-pointer transition-all animate-fade-in group shadow-xs active:scale-98 disabled:opacity-50"
              >
                <span className="truncate flex-1 font-medium group-hover:text-emerald-300">
                  {quickPrompts[carouselIndex]}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold group-hover:bg-emerald-500/30 shrink-0 flex items-center space-x-0.5">
                  <Send className="w-2.5 h-2.5 mr-0.5" />
                  <span>{language === 'zh' ? '问私教' : 'Ask'}</span>
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0 text-slate-400">
              <button
                type="button"
                onClick={handlePrevSuggestion}
                className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
                title={language === 'zh' ? '上一条建议' : 'Previous suggestion'}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono-num text-slate-400 min-w-[28px] text-center">
                {carouselIndex + 1}/{quickPrompts.length}
              </span>
              <button
                type="button"
                onClick={handleNextSuggestion}
                className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
                title={language === 'zh' ? '下一条建议' : 'Next suggestion'}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Input bar */}
          <div 
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            className="p-3 border-t border-slate-800/60 bg-slate-900/70 backdrop-blur-[12px] flex items-center space-x-2 shrink-0"
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              disabled={isThinking || isStreaming}
              placeholder={
                language === 'zh'
                  ? '告诉私教你的不适感、睡眠状态、断食或运动困惑...'
                  : 'Tell Copilot about symptoms, sleep, fasting, or workouts...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 disabled:opacity-50"
            />
            {isThinking || isStreaming ? (
              <button
                type="button"
                onClick={handleStopChat}
                title={language === 'zh' ? '点击停止生成' : 'Stop generating'}
                className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold transition-all cursor-pointer shadow-md shadow-rose-500/30 active:scale-95 flex items-center justify-center group animate-pulse"
              >
                <Square className="w-4 h-4 fill-white text-white group-hover:scale-90 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                title={language === 'zh' ? '发送' : 'Send'}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-bold disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Send className="w-4 h-4 text-slate-950" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default LongevityCopilotWidget;
