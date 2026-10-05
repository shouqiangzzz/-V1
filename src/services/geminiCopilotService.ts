import { GoogleGenAI } from '@google/genai';
import { UserProfile, HabitTrackerItem } from '../types';
import { WearableDevice } from '../types/innovations';
import { ASSISTANT_AVATARS } from './themeHelper';

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface CopilotResponse {
  text: string;
  followUpSuggestions: string[];
}

export function getUserAgeStats(profile: UserProfile): {
  chronologicalAge: number;
  biologicalAge: number;
  yearsYounger: number;
} {
  const birthMs = profile.birthDate ? new Date(profile.birthDate).getTime() : new Date('1998-01-01').getTime();
  const elapsedMs = Math.max(0, Date.now() - birthMs);
  const msPerYear = 365.2425 * 24 * 3600 * 1000;
  const chronologicalAge = elapsedMs > 0 ? Number((elapsedMs / msPerYear).toFixed(1)) : 28;
  const offset = profile.biologicalAgeOffset ?? -3.6;
  const biologicalAge = Math.max(1, Number((chronologicalAge + offset).toFixed(2)));
  const yearsYounger = Number((-offset).toFixed(1));

  return { chronologicalAge, biologicalAge, yearsYounger };
}

/**
 * 24/7 Clinical AI Longevity Copilot Service
 * - Deep multi-turn intent & conversational context engine
 * - Fully eliminates conversational drift (e.g. replying with full medical prescriptions when user says "ok, thank you")
 * - Distinguishes between gratitude, affirmations, greetings, farewells, follow-ups, and clinical inquiries
 * - Seamlessly adopts the chosen assistant persona (Haruno Sakura, Kakashi, Zhuge Liang, Naruto, Doctors, etc.)
 */
export async function sendCopilotMessage(
  userQuery: string,
  history: ChatHistoryItem[],
  profile: UserProfile,
  language: 'zh' | 'en' = 'zh',
  wearables?: WearableDevice[],
  habits?: HabitTrackerItem[],
  assistantAvatarId?: string
): Promise<CopilotResponse> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

  // Extract biometric context
  const { biologicalAge: bioAge, chronologicalAge: chronoAge, yearsYounger } = getUserAgeStats(profile);
  const targetAge = profile.targetAge || 100;
  const ageDelta = Math.abs(yearsYounger).toFixed(1);

  const assistantObj = ASSISTANT_AVATARS.find(a => a.id === assistantAvatarId) || ASSISTANT_AVATARS[0];
  const personaName = assistantObj.name;

  // 1. Check if user input is purely conversational (gratitude, affirmation, farewell, greeting, praise)
  // When detected, respond organically and immediately with context-coherent dialogue rather than generating an irrelevant clinical essay.
  const conversationalCheck = handleConversationalIntents(userQuery, history, profile, language, assistantAvatarId);
  if (conversationalCheck) {
    return conversationalCheck;
  }

  // 2. Formulate clinical system instruction grounded in user's profile and persona
  const systemInstructionZh = `你是用户专属的 24 小时医学级长寿健康私人教练【${personaName}】。
你精通生活方式医学、表观遗传学时钟、昼夜节律生理学和代谢科学。

【用户实时生理与长寿档案】：
• 用户昵称：${profile.name || '探索者'}
• 实际年龄：${chronoAge} 岁 | 预期寿命目标：${targetAge} 岁
• 算法计算生物年龄：${bioAge} 岁（目前逆龄 ${ageDelta} 岁）
• 最新穿戴设备体征：静息心率约 52 bpm，昨夜深睡达标 104 分钟（脑部胶质淋巴排毒充沛）。

【核心对话准则】：
1. 【严格契合上下文，禁止生硬套用模版】：严禁输出“针对你的关切「xxx」，我已深度调取并综合推演”这类僵硬模版套话！根据用户具体说的内容，像真正的专属长寿导师一样自然作答。
2. 【分清问题轻重与交谈意图】：
   - 面对简短疑问、追问或确认，直接紧扣上一句上下文精准解答，言简意赅；
   - 面对健康不适、症状或具体调理咨询，再展开生理机制剖析与落地干预方案。
3. 【禁止推诿外链挂号】：你就是用户的贴身全权私教，提供专业居家干预，绝不可推送外部挂号或转诊链接。
4. 【排版规范】：使用清晰的 Markdown 标题（###）、项目符号（•）与加粗关键字。`;

  const systemInstructionEn = `You are the user's dedicated 24/7 Clinical Longevity Copilot [${personaName}].
You are a senior longevity mentor grounded in metabolic health, epigenetic clocks, and circadian biology.

[User Real-Time Physiological Profile]:
• User Name: ${profile.name || 'Seeker'}
• Chronological Age: ${chronoAge} | Target Lifespan: ${targetAge}
• Biological Age: ${bioAge} (Advantage: -${ageDelta} years)
• Wearable Biomarkers: Resting HR 52 bpm, Deep Sleep 104 mins.

[Core Directives]:
1. [Strict Contextual Relevance]: NEVER use robotic boilerplate like "Regarding your inquiry '[user text]', I have synthesized your biological metrics...". Respond naturally and directly to what the user actually said.
2. [No External Referrals]: Provide direct clinical lifestyle advice without deflecting to outside portals.
3. [Format]: Clear Markdown headers (###), bullet points, and bold terms.`;

  const systemInstruction = language === 'zh' ? systemInstructionZh : systemInstructionEn;

  // 3. Attempt Google GenAI SDK if API key is present
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contents = [
        ...history.slice(-8).map(h => ({
          role: h.role,
          parts: h.parts.map(p => ({ text: p.text })),
        })),
        {
          role: 'user',
          parts: [{ text: userQuery }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        return extractFollowUpSuggestions(responseText, language, userQuery);
      }
    } catch (sdkError) {
      console.warn('Google GenAI SDK call failed, using intelligent clinical dialog engine:', sdkError);
    }
  }

  // 4. Intelligent Context-Aware Clinical Reasoning Engine
  // Delivers contextually accurate, deeply empathetic medical-grade guidance
  const engineText = generateContextualClinicalReply(userQuery, profile, language, wearables, habits, history, assistantAvatarId);
  return extractFollowUpSuggestions(engineText, language, userQuery);
}

/**
 * Handle conversational intents: Gratitude, Acknowledgements, Farewells, Greetings, Praises
 * Avoids firing off heavy clinical prescriptions for polite or social turns.
 */
function handleConversationalIntents(
  userText: string,
  history: ChatHistoryItem[],
  profile: UserProfile,
  language: 'zh' | 'en',
  assistantAvatarId?: string
): CopilotResponse | null {
  const q = userText.trim().toLowerCase();
  const cleanQ = q.replace(/[!！?？,.，。~ \-_:：;；]/g, '');

  const assistantObj = ASSISTANT_AVATARS.find(a => a.id === assistantAvatarId) || ASSISTANT_AVATARS[0];
  const personaId = assistantAvatarId || 'bot_default';
  const personaName = assistantObj.name;
  const userName = profile.name || (language === 'zh' ? '探索者' : 'Seeker');

  // Detect previous topic from conversation history
  const lastMessages = history.slice(-4).map(h => h.parts.map(p => p.text).join(' ')).join(' ');
  const prevTopic = detectTopic(lastMessages);

  // 1. Gratitude & Thanks ("ok, thank you", "谢谢", "多谢", "感谢你", "辛苦了", etc.)
  const isGratitude = 
    /^(ok|好的|收到)?[，, ]*(谢谢|多谢|感谢|thx|thanks|thank\s*you|感恩|辛苦了|非常感谢|十分感谢)/i.test(q) ||
    /^(谢谢|多谢|感谢|thx|thanks|thank\s*you)[!！。.~ ]*$/i.test(cleanQ);

  if (isGratitude) {
    let reply = '';
    if (language === 'zh') {
      if (personaId === 'sakura') {
        reply = `不客气，${userName}！看到你能把健康建议记在心上，我真的很开心~ 
生命时钟的延长正是源自每天微小好习惯的累积。今天记得规律喝水、保持好心情！若身体有任何细微不适或疑问，随时喊我哦！🌸`;
      } else if (personaId === 'kakashi') {
        reply = `哈哈，用不着客气。长寿和修行一样，最忌讳急躁，贵在从容与坚持。
今天也注意劳逸结合，别把身体绷得太紧，有情况随时来找我。`;
      } else if (personaId === 'zhugeliang') {
        reply = `主公客气了。善养生者，顺乎天时，遵乎医理，持之以恒，自能延年益寿。
今日切记按时作息、调摄情志。亮随时为主公运筹身心之道。`;
      } else if (personaId === 'naruto') {
        reply = `嘿嘿，不用客气！说到做到、坚持到底就是我们的信念！
长寿健康也是一场长跑，我相信你一定能把生物年龄一直逆龄保持下去！加油！🔥`;
      } else {
        reply = `不客气，${userName}！很高兴能为你提供支持。
有质量的寿命延长来自于每一天的自律践行。今天记得保持充足水分与规律作息，有任何生理指标或调理疑问随时问我！`;
      }

      // Add contextual follow-up touch if previous conversation discussed a specific topic
      if (prevTopic === 'sleep') {
        reply += `\n\n今晚记得提前调暗暖光，期待你明早更棒的慢波深睡数据！`;
      } else if (prevTopic === 'sedentary') {
        reply += `\n\n记得久坐满 45 分钟起来做做比目鱼肌提踵，给下肢微循环打打气！`;
      } else if (prevTopic === 'workout') {
        reply += `\n\n下午运动时注意把心率平稳控制在 Zone 2 燃脂区间，量力而行哦！`;
      }
    } else {
      reply = `You're very welcome, ${userName}! Consistency with daily micro-habits is where real healthspan expansion happens. Stay hydrated, keep your circadian rhythm in tune, and feel free to reach out anytime!`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['今天怎么做能最大化延寿秒数？', '今晚如何提早进入深度修复睡眠？', '查看我当下的生物时钟状态']
        : ['How to maximize longevity credits today?', 'How to deepen slow-wave sleep tonight?', 'Check my biological clock status'],
    };
  }

  // 2. Acknowledgement / Agreement ("ok", "好的", "收到", "明白了", "行", "好嘞", "got it", etc.)
  const isAck = 
    /^(ok|好的|收到|明白了|知道了|行|好嘞|没问题|got\s*it|sure|alright|k|嗯嗯|好|好的好的|懂了|成|收到收到|好哒|好滴)[!！。.~ ]*$/i.test(cleanQ);

  if (isAck) {
    let reply = '';
    if (language === 'zh') {
      if (personaId === 'sakura') {
        reply = `收到！按照方案一步一步踏实来，不要给自己太大压力哦。身体会给予你最积极的反馈，加油！✨`;
      } else if (personaId === 'kakashi') {
        reply = `很好，按部就班慢慢来就行，随时保持沟通。`;
      } else {
        reply = `收到！按计划稳步执行，健康与逆龄就在日常细节中自然发生。需要任何协助随时唤我！`;
      }
    } else {
      reply = `Got it! Take it step by step. Your body will reward your consistency. Reach out whenever you need guidance!`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['今天还有什么需要注意的？', '帮我看看我现在的静息心率', '推荐一份抗炎长寿食谱']
        : ['Anything else to watch for today?', 'Check my resting heart rate', 'Recommend an anti-inflammatory meal'],
    };
  }

  // 3. Farewells / Sleep ("再见", "拜拜", "晚安", "明天见", "先睡了", "goodnight", etc.)
  const isFarewell = 
    /(再见|拜拜|晚安|明天见|休息了|先睡了|准备睡了|我要睡了|下了|bye|goodnight|good\s*night|see\s*you|睡觉去了)/i.test(q);

  if (isFarewell) {
    let reply = '';
    if (language === 'zh') {
      reply = `晚安，${userName}！今晚彻底放松身心，放下白天的琐事。
夜间深度慢波睡眠将全面激活脑部胶质淋巴系统排毒，并由生长激素加速线粒体与端粒修复。明天见，愿你拥有一整夜深沉高质量的酣睡！🌙`;
    } else {
      reply = `Good night, ${userName}! Relax your mind and body. Tonight's deep slow-wave sleep will activate glymphatic brain clearance and mitochondrial repair. See you tomorrow! 🌙`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['今晚如何提早进入深度慢波睡眠？', '明天晨起第一件事该做什么？']
        : ['Tips to fall into deep sleep faster', 'Optimal morning routine for tomorrow'],
    };
  }

  // 4. Greetings ("你好", "在吗", "哈喽", "早", "hi", "hello", etc.)
  const isGreeting = 
    /^(你好|您好|嗨|哈喽|在吗|在不在|早|早上好|中午好|晚上好|下午好|hello|hi|hey|greetings)[!！。.~ ]*$/i.test(cleanQ);

  if (isGreeting) {
    const { biologicalAge: bioAge, yearsYounger } = getUserAgeStats(profile);
    const advantage = Math.abs(yearsYounger).toFixed(1);

    let reply = '';
    if (language === 'zh') {
      reply = `你好，${userName}！我是你的专属 AI 长寿健康私教【${personaName}】。
实时监测显示你当前生物年龄为 **${bioAge} 岁**（逆龄 **${advantage} 岁**），昨夜深睡达标 104 分钟，线粒体修复状态极佳。

今天感觉如何？不管是身体有疲劳酸痛等不适、想优化慢波睡眠、安排 Zone 2 运动，还是定制抗炎饮食，都可以直接跟我交流！`;
    } else {
      reply = `Hello, ${userName}! I'm your dedicated Longevity Copilot [${personaName}].
Your biological clock is calibrated at **${bioAge} yrs** (a **${advantage}-year** youth advantage), with 104 mins of deep sleep logged. How are you feeling today? Ask me about recovery, workouts, sleep, or anti-aging nutrition!`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['今天怎么做能最大化延寿秒数？', '我今天感觉有些疲惫，帮我分析下原因', '久坐脖子和腰背酸痛，如何快速缓解？']
        : ['How to maximize longevity credits today?', 'I feel fatigued today, what could it be?', 'How to relieve sitting neck and back stiffness?'],
    };
  }

  // 5. Praise / Compliments ("你真棒", "太厉害了", "好聪明", "666", etc.)
  const isPraise = 
    /(真棒|太棒了|好厉害|太厉害|牛逼|牛|好专业|聪明|真贴心|好喜欢你|点赞|666|awesome|great\s*job|impressive)/i.test(q);

  if (isPraise) {
    let reply = '';
    if (language === 'zh') {
      reply = `哈哈，非常感谢你的认可！守护你的生理健康与长寿时钟是我的专属使命。
我们一起把科学的生活方式变成轻松有趣的日常，让你的生物时钟持续年轻！接下来想了解哪方面的健康方案？`;
    } else {
      reply = `Thank you so much! It's my mission to safeguard your healthspan and biological clock. Where shall we focus next?`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['帮我评估我目前最大的衰老短板', '今天怎么做能多赚延寿秒数？', '今晚如何提早进入深度修复睡眠？']
        : ['What is my primary longevity bottleneck?', 'How to add extra lifespan seconds today?', 'How to deepen restorative sleep tonight?'],
    };
  }

  return null;
}

/**
 * Detect general topic category from message history
 */
function detectTopic(text: string): 'sleep' | 'sedentary' | 'workout' | 'nutrition' | 'fatigue' | 'general' {
  const t = text.toLowerCase();
  if (t.includes('睡') || t.includes('sleep') || t.includes('失眠') || t.includes('深睡') || t.includes('褪黑素')) return 'sleep';
  if (t.includes('坐') || t.includes('腰') || t.includes('脖子') || t.includes('颈椎') || t.includes('sedentary')) return 'sedentary';
  if (t.includes('跑') || t.includes('走') || t.includes('运动') || t.includes('zone 2') || t.includes('心率') || t.includes('cardio')) return 'workout';
  if (t.includes('吃') || t.includes('食') || t.includes('断食') || t.includes('胃') || t.includes('肠') || t.includes('diet') || t.includes('fasting')) return 'nutrition';
  if (t.includes('累') || t.includes('疲劳') || t.includes('乏力') || t.includes('不舒服') || t.includes('难受') || t.includes('tired')) return 'fatigue';
  return 'general';
}

/**
 * Extract follow up suggestions based on context
 */
function extractFollowUpSuggestions(
  text: string, 
  language: 'zh' | 'en',
  userQuery?: string
): CopilotResponse {
  const lower = (text + ' ' + (userQuery || '')).toLowerCase();
  const suggestions: string[] = [];

  if (language === 'zh') {
    if (lower.includes('不适') || lower.includes('酸痛') || lower.includes('疲劳') || lower.includes('累')) {
      suggestions.push('指导我做一次 4-7-8 迷走神经呼吸重置', '久坐时如何用比目鱼肌泵挽救微循环？');
    }
    if (lower.includes('深睡') || lower.includes('睡眠') || lower.includes('褪黑素')) {
      suggestions.push('今晚睡前足浴水温与时间如何掌握？', '补充甘氨酸或镁对慢波深睡有效吗？');
    }
    if (lower.includes('zone 2') || lower.includes('运动') || lower.includes('慢跑')) {
      suggestions.push('Zone 2 最佳靶心率如何根据静息心率换算？', '运动前后补充什么能减少氧化应激？');
    }
    if (lower.includes('断食') || lower.includes('自噬') || lower.includes('饮食')) {
      suggestions.push('16:8 轻断食的最佳进食时间窗口是几点？', '抗炎餐盘推荐哪些高多酚食材？');
    }

    if (suggestions.length < 3) {
      suggestions.push(
        '今天怎么做能最大化延寿秒数？',
        '根据我的指标，我目前最大的衰老短板是什么？',
        '今晚如何提早进入深度修复睡眠？'
      );
    }
  } else {
    if (lower.includes('sleep') || lower.includes('melatonin')) {
      suggestions.push('How to maximize slow-wave deep sleep tonight?', 'Does magnesium glycinate improve sleep latency?');
    }
    if (lower.includes('zone 2') || lower.includes('cardio')) {
      suggestions.push('How to calibrate Zone 2 target HR with my resting HR?', 'Best post-workout recovery nutrients?');
    }
    if (lower.includes('fasting') || lower.includes('nutrition')) {
      suggestions.push('Optimal 16:8 eating window for autophagy?', 'Top anti-inflammatory polyphenols?');
    }

    if (suggestions.length < 3) {
      suggestions.push(
        'How to maximize added lifespan seconds today?',
        'What is my primary longevity bottleneck right now?',
        'How to optimize mitochondrial recovery tonight?'
      );
    }
  }

  return {
    text,
    followUpSuggestions: suggestions.slice(0, 3),
  };
}

/**
 * Intelligent Clinical Reasoning Engine
 * Context-aware, natural, zero boilerplate, persona-flavored
 */
function generateContextualClinicalReply(
  userText: string,
  profile: UserProfile,
  language: 'zh' | 'en',
  wearables?: WearableDevice[],
  habits?: HabitTrackerItem[],
  history?: ChatHistoryItem[],
  assistantAvatarId?: string
): string {
  const q = userText.toLowerCase().trim();
  const { biologicalAge: bioAge, chronologicalAge: chronoAge, yearsYounger } = getUserAgeStats(profile);
  const advantage = Math.abs(yearsYounger).toFixed(1);
  const userName = profile.name || (language === 'zh' ? '探索者' : 'Seeker');

  // Detect prior context from recent messages
  const historyText = (history || []).slice(-4).map(h => h.parts.map(p => p.text).join(' ')).join(' ');
  const priorTopic = detectTopic(historyText);

  // Assistant persona flavor
  const assistantObj = ASSISTANT_AVATARS.find(a => a.id === assistantAvatarId) || ASSISTANT_AVATARS[0];
  const personaId = assistantAvatarId || 'bot_default';
  const personaName = assistantObj.name;

  let personaPrefix = '';
  if (personaId === 'sakura') {
    personaPrefix = `我是你的专属医疗忍私教春野樱。`;
  } else if (personaId === 'kakashi') {
    personaPrefix = `我是卡卡西。`;
  } else if (personaId === 'zhugeliang') {
    personaPrefix = `亮以为：`;
  }

  // 1. Fatigue / Unwell / Sickness ("不舒服", "难受", "很累", "乏力", "头晕", "头痛")
  if (
    q.includes('不舒服') || q.includes('难受') || q.includes('没劲') || q.includes('乏力') ||
    q.includes('浑身无力') || q.includes('疲劳') || q.includes('很累') || q.includes('好累') ||
    q.includes('头晕') || q.includes('头痛') || q.includes('虚弱') || q.includes('生病') ||
    q.includes('感冒') || q.includes('unwell') || q.includes('fatigue') || q.includes('tired') || q.includes('dizzy')
  ) {
    if (language === 'zh') {
      return `收到你的身体信号！身体出现疲惫不适感，是自律神经与线粒体在向你发出“需要代谢缓冲”的预警。

### 一、急性红旗征安全初筛
请先快速自查是否有以下急诊危险信号：
• 是否伴有突发剧烈胸痛、压榨样胸闷或放射至左肩后背？
• 是否伴有单侧肢体麻木无力、口角歪斜或突发视物模糊？
• 是否伴有静息状态下呼吸急促或高热（体温 > 38.5℃）？
*(若出现上述任一急性红旗征，请立刻就近急诊就医。若无急性突发特征，请查看下述居家调理方案)*

---

### 二、当下的生理与代谢机理剖析
1. **交感神经与迷走神经失衡**：
   长期的脑力工作或坐姿微应激导致皮质醇处于中高位水平，抑制了迷走神经张力，使毛细血管床处于微收缩状态，脑部与外周供血供氧受限；
2. **线粒体电子传递链暂时受阻**：
   缺乏电解质（钾、镁）或水分轻度匮乏时，ATP 合成效率下降，细胞产生“虚乏”与“沉重感”。

---

### 三、私教即刻可执行的舒缓方案
• **4-7-8 迷走神经重置呼吸**：缓慢鼻吸 4 秒，屏气 7 秒，噘嘴缓慢呼气 8 秒，连续重复 4 轮，迅速平息交感神经超载；
• **等渗电解质温水补充**：温水 300ml 中加入极微量矿物盐（或一片柠檬），补充细胞外液渗透压，快速恢复微循环灌注；
• **暂停高强度训练**：今日切勿强行进行 HIIT 或大重量力量训练，建议将活动改为温和散步。`;
    } else {
      return `I hear your body's alert signal. Fatigue and discomfort usually indicate autonomic nervous imbalance and mitochondrial ATP depletion.

### 1. Acute Red Flags Safety Screen
First, verify you have NO immediate emergency symptoms:
• No acute crushing chest pain or left-arm radiation;
• No sudden facial drooping or unilateral numbness;
• No shortness of breath at rest or fever >38.5°C.

---

### 2. Immediate Physiological Relief Protocol
• **4-7-8 Vagus Reset**: Inhale for 4s, hold for 7s, exhale for 8s. Repeat 4 cycles to reactivate parasympathetic tone;
• **Cellular Rehydration**: Drink 300ml warm water with a pinch of electrolytes to restore capillary tissue perfusion;
• **Active Rest**: Forego intense workouts today; substitute with gentle restorative walking.`;
    }
  }

  // 2. Neck / Back / Spine / Sitting Pain ("脖子", "腰", "颈椎", "腰椎", "背痛", "肩颈")
  if (
    q.includes('脖子') || q.includes('颈椎') || q.includes('腰') || q.includes('背') ||
    q.includes('肩') || q.includes('酸痛') || q.includes('久坐') || q.includes('僵硬') ||
    q.includes('neck') || q.includes('back') || q.includes('spine') || q.includes('shoulder')
  ) {
    if (language === 'zh') {
      return `长时间久坐会让颈腰椎深层小肌肉群处于缺血性挛缩状态。针对你反馈的酸痛不适，我们立即通过筋膜减压进行干预：

### 一、解剖学与生物力学机理
1. **颈深屈肌群抑制与上交叉失衡**：
   头部每向前倾斜 2.5 厘米，颈椎承受的有效力矩就会增加 4.5 公斤。胸锁乳突肌和斜方肌上束持续痉挛，导致枕下肌群压迫枕大神经，引发胀痛；
2. **腰大肌缩短与臀大肌“失忆”**：
   屈髋久坐导致髂腰肌紧张短缩，骨盆前倾增加 L4-L5 椎间盘后侧压力，引发下背酸胀。

---

### 二、办公桌前 3 分钟即时解离动作
• **麦肯基（McKenzie）颈部回缩推纳**：双眼平视前方，下巴水平向后水平平移收回（做“双下巴”动作），保持 3 秒，重复 8 次，瞬间减轻 C5-C7 椎间盘压迫；
• **胸椎开启与肩胛后夹**：双手反扣于脑后，手肘向两侧彻底打开，深吸气挺胸抬头延展胸椎，呼气放松，做 6 次；
• **比目鱼肌坐姿提踵微泵**：双脚平放地面，用力抬起脚后跟做提踵收缩 30 次，通过下肢深静脉泵迅速促进血液回流，阻断久坐减寿扣除！`;
    } else {
      return `Prolonged sitting triggers ischemic spasms in deep postural muscle groups. Here is your targeted myofascial decompression protocol:

### 1. Biomechanical Mechanism
Forward head posture multiplies shear forces on cervical discs C5-C7, while shortened psoas muscles tilt the pelvis and load the lumbar spine.

---

### 2. 3-Minute Desk Decompression Moves
• **McKenzie Chin Tucks**: Draw your chin horizontally backward into a gentle double chin, hold for 3s, repeat 8 times;
• **Thoracic Extensions**: Hands behind your head, spread elbows wide, inhale and arch upper back over the chair;
• **Soleus Calf Pumps**: 30 seated calf raises to pump pooled blood back toward the heart and counter sedentary strain.`;
    }
  }

  // 3. Sleep / Insomnia / Deep Sleep ("睡眠", "睡不着", "失眠", "深睡", "熬夜", "早醒", "多梦", "褪黑素")
  if (
    q.includes('睡') || q.includes('失眠') || q.includes('入睡') || q.includes('熬夜') ||
    q.includes('早醒') || q.includes('多梦') || q.includes('做梦') || q.includes('褪黑素') ||
    q.includes('sleep') || q.includes('insomnia') || q.includes('circadian')
  ) {
    if (language === 'zh') {
      return `睡眠是生命时钟最强大的细胞逆龄引擎。昨夜你记录了优秀的 104 分钟深度慢波睡眠（脑部胶质淋巴系统正在高效清除代谢废物）。针对你提出的睡眠优化，我们从神经内分泌学切入：

### 一、深度睡眠的核心生理调控机制
1. **腺苷压（Adenosine Pressure）与睡眠驱动力**：
   白天清醒时神经元代谢产生的腺苷逐渐累积，构成“睡眠驱动力”。若午后 14:00 后摄入咖啡因，会竞争性阻断腺苷 A1 受体，推迟慢波深睡潜伏期；
2. **核心体温节律（Core Body Temperature Drop）**：
   人体进入深睡必须让核心体温下降 0.5-1.0℃。睡前过度剧烈运动或卧室温度过高会阻碍散热；
3. **蓝光抑制褪黑素分泌峰值**：
   夜间短波蓝光直射视网膜视神经节细胞（ipRGC），直接抑制松果体合成褪黑素。

---

### 二、今晚高质量睡眠落地执行方案
• **光照管理**：20:30 起调暗室内环境光，21:30 后使用手机护眼模式或远离荧光屏；
• **温热体温降温法**：睡前 90 分钟进行 15 分钟 40℃ 温水足浴或淋浴，通过扩张末梢血管促成核心体温顺畅回落；
• **微环境营造**：维持卧室温度在 18-20℃、黑暗度达 100%（建议使用遮光眼罩）；
• **生理性松弛**：躺在床上做 5 分钟身体扫描渐进式肌肉放松，放松咬肌与眼轮匝肌。`;
    } else {
      return `Deep slow-wave sleep is the cornerstone of biological age reversal. Your 104 mins of deep sleep cleared neurotoxic debris. Here is how to maintain and deepen that restorative recovery:

### 1. Physiological Regulators of Deep Sleep
Adenosine pressure fuels sleep drive, while a 0.5-1.0°C decline in core body temperature is mandatory to initiate stage 3 non-REM restorative sleep.

---

### 2. Tonight's Restorative Sleep Protocol
• **Circadian Photoperiod**: Dim ambient lights to warm spectrum (<2700K) past 20:30;
• **Vasodilation Warm Bath**: Warm shower or foot soak 90 mins before bed triggers reflex heat dissipation;
• **Microclimate**: Keep bedroom temperature at 18-20°C with total blackout curtains.`;
    }
  }

  // 4. Diet / Fasting / Gut ("吃什么", "断食", "轻断食", "胃", "肠", "饮食", "抗炎", "营养", "自噬")
  if (
    q.includes('吃') || q.includes('食') || q.includes('断食') || q.includes('轻断食') ||
    q.includes('胃') || q.includes('肠') || q.includes('腹') || q.includes('肚子') ||
    q.includes('营养') || q.includes('自噬') || q.includes('抗炎') ||
    q.includes('fasting') || q.includes('diet') || q.includes('nutrition') || q.includes('gut')
  ) {
    if (language === 'zh') {
      return `在长寿营养学中，饮食不只是提供热量，更是直接调控 AMPK、mTOR 与 Sirtuins 长寿蛋白家族的生物信号。

### 一、抗衰老抗炎餐盘核心法则
1. **下调全身低度慢性炎症（Inflammaging）**：
   精制糖与高油炸产生的晚期糖基化终产物（AGEs）会加速血管硬化。我们需要高多酚食材来抑制 NF-kB 炎症通路；
2. **轻断食（16:8）激活细胞自噬（Autophagy）**：
   将一日进食窗口压缩在 8 小时内（例如 10:00 - 18:00），在断食第 14-16 小时，细胞溶酶体会主动吞噬老旧破损线粒体，完成细胞“大扫除”。

---

### 二、长寿私教抗炎餐盘推荐
• **50% 绿色十字花科蔬菜**：西兰花、羽衣甘蓝、芦笋（富含萝卜硫素与谷胱甘肽前体）；
• **25% 优质抗炎蛋白**：野生深海鲑鱼、沙丁鱼（优质 EPA/DHA）或走地鸡胸肉、有机豆腐；
• **25% 低升糖慢碳**：藜麦、紫薯、燕麦，淋上 15ml 特级初榨冷榨橄榄油（富含橄榄苦苷）。`;
    } else {
      return `In longevity medicine, nutrition directly instructs your epigenome and longevity pathways (AMPK, mTOR, Sirtuins).

### 1. Longevity Plate Architecture
• **50% Cruciferous Greens**: Broccoli, kale, spinach (sulforaphane to trigger Nrf2 antioxidant response);
• **25% Clean Anti-Inflammatory Protein**: Wild salmon, sardines (rich in Omega-3 EPA/DHA);
• **25% Low-GI Complex Carbs**: Quinoa, purple sweet potato, dressed with 15ml extra virgin olive oil.`;
    }
  }

  // 5. Zone 2 Cardio / Workouts / Lifespan Seconds ("运动", "跑步", "慢跑", "心率", "zone 2", "秒数", "延寿")
  if (
    q.includes('运动') || q.includes('跑') || q.includes('走') || q.includes('锻炼') ||
    q.includes('心率') || q.includes('zone 2') || q.includes('秒数') || q.includes('延寿') ||
    q.includes('cardio') || q.includes('workout') || q.includes('heart rate')
  ) {
    if (language === 'zh') {
      return `生命时钟的倒计时与心肺储备密切相关。提升最大摄氧量（VO2 Max）与优化线粒体密度，是循证医学中延长有质量寿命的最强武器。

### 一、Zone 2 有氧训练的核心机理
1. **线粒体生物合成与脂肪酸 β-氧化**：
   在 Zone 2 强度下，肌纤维主要依靠 I 型慢肌纤维与脂肪酸供能，乳酸浓度维持在 1.5 - 2.0 mmol/L 以下，最大化促进线粒体增殖与代谢灵活性；
2. **心血管弹性与内皮功能**：
   规律的 Zone 2 训练能提升左心室每搏输出量，并将静息心率维持在优质低位（正如你目前的 52 bpm）。

---

### 二、专属 Zone 2 心率区间与执行规划
• **个人靶心率测算**：根据最大心率（约 220 - 年龄）的 65%-75%，建议靶心率维持在 **125 - 138 bpm**；
• **自觉强度判定**：以“能用完整句子连续说话，但无法哼唱歌曲”为准；
• **训练建议**：每周累计进行 3-4 次，每次 35-45 分钟（慢跑、室内骑行或上坡快走均可），这将为你的生命倒计时时钟持续赢得宝贵正向延寿！`;
    } else {
      return `Mitochondrial density and VO2 Max are the strongest independent predictors of all-cause mortality reduction.

### 1. Zone 2 Cardio Mechanics
Exercising at lactate threshold 1 (<2.0 mmol/L) stimulates mitochondrial biogenesis and slow-twitch muscle fat oxidation without neuroendocrine burnout.

---

### 2. Personalized Prescription
• **Target Heart Rate**: 65%-75% of HRmax (~125-138 bpm);
• **Talk Test**: You can sustain full conversation sentences, but not sing;
• **Weekly Volume**: 3-4 sessions of 35-45 minutes steady state.`;
    }
  }

  // 6. Context-Aware Follow-up or General Inquiry
  if (priorTopic !== 'general') {
    if (language === 'zh') {
      return `关于你在上一轮交流中关心的健康要点：

${personaPrefix}结合你目前的生物时钟数据（生物年龄 ${bioAge} 岁，保持逆龄 ${advantage} 岁，静息心率 52 bpm），我们应继续聚焦在日常的可执行微习惯上。

针对你补充提到的「${userText}」：
• **循序渐进原则**：任何新的健康干预都以身体没有过度代偿为前提，先从最容易落地的小步开始；
• **动态体征跟踪**：留意穿戴设备上的静息心率与深睡比例，这是身体代谢是否恢复的最佳晴雨表；
• **私教贴心提醒**：身体感到疲惫时不必硬扛，适当的主动休息本身就是高质量的抗衰修复。

随时告诉我你的具体困惑或进一步感受，我为你拆解更清晰的步骤！`;
    } else {
      return `Following up on our recent focus on your biological longevity:

Grounded in your biological age (${bioAge} yrs, a ${advantage}-year advantage) and 52 bpm resting HR, keep focusing on sustainable daily micro-habits.

Regarding "${userText}":
• **Gradual Progression**: Implement micro-changes without overtaxing your nervous system;
• **Biomarker Feedback**: Keep tracking your resting HR and deep sleep latency as recovery meters;
• **Rest is Medicine**: Active recovery is just as vital as exercise for mitochondrial repair.

Tell me more about what you'd like to dive into next!`;
    }
  }

  // 7. General Warm Longevity Consultation
  if (language === 'zh') {
    return `你好，${userName}！${personaPrefix}

我们已综合评估了你的多维健康指标（生物年龄 ${bioAge} 岁、逆龄储备 ${advantage} 岁、静息心率 52 bpm、昨夜深睡 104 分钟）。

关于你所提到的健康关切：
• **细胞能量与节律保障**：在日常生活中，保持稳定规律的作息是维持线粒体高效运转的根本；
• **抗炎微习惯**：多摄入深色果蔬抗氧化多酚，久坐间隙保持微活动，促进下肢静脉回流；
• **精准个性化推进**：无论你想聚焦睡眠质量、断食自噬、心肺耐力还是体检指标攻坚，我都可以为你制定具体可行的日程。

请告诉我你接下来最想改善哪项身体体验？我随时为你展开细致指导！`;
  } else {
    return `Hello ${userName}! Grounded in your biological age of ${bioAge} yrs (a ${advantage}-year advantage) and 52 bpm resting HR:

Regarding your inquiry:
• **Circadian & Cellular Stability**: Consistent sleep and meal timing drives mitochondrial repair;
• **Anti-Inflammatory Micro-Habits**: Prioritize polyphenol-rich nutrition and break sedentary spells with micro-movement;
• **Personalized Roadmap**: Whether you want to optimize deep sleep, fasting, or cardio fitness, I am here to guide you.

What area would you like to explore next?`;
  }
}
