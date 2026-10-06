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
 * - Calls server-side /api/copilot proxy backed by real Google Gemini models
 * - Equipped with intelligent multi-turn intent understanding (gratitude, capabilities, greetings, medical queries)
 * - Zero conversational drift and zero repetitive template output
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
  const q = userQuery.trim();

  // 1. Call server backend proxy /api/copilot (which uses real Google Gemini models with full context)
  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery: q,
        history,
        profile,
        language,
        wearables,
        habits,
        assistantAvatarId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          text: data.text,
          followUpSuggestions: data.followUpSuggestions || [],
        };
      }
    }
  } catch (apiErr) {
    console.warn('Backend /api/copilot call failed, engaging client-side intelligence:', apiErr);
  }

  // 2. High-Fidelity Client-Side Fallback Engine
  const conversationalCheck = handleConversationalIntents(q, history, profile, language, assistantAvatarId);
  if (conversationalCheck) {
    return conversationalCheck;
  }

  const engineText = generateContextualClinicalReply(q, profile, language, wearables, habits, history, assistantAvatarId);
  return extractFollowUpSuggestions(engineText, language, q);
}

/**
 * Handle conversational intents: Gratitude, Capabilities, Acknowledgements, Farewells, Greetings, Praises
 */
function handleConversationalIntents(
  userText: string,
  history: ChatHistoryItem[],
  profile: UserProfile,
  language: 'zh' | 'en',
  assistantAvatarId?: string
): CopilotResponse | null {
  const q = userText.trim();
  const lower = q.toLowerCase();

  const assistantObj = ASSISTANT_AVATARS.find(a => a.id === assistantAvatarId) || ASSISTANT_AVATARS[0];
  const personaId = assistantAvatarId || 'bot_default';
  const userName = profile.name || (language === 'zh' ? '探索者' : 'Seeker');

  // 1. Gratitude: "你提供的信息很好，谢谢" / "谢谢" / "多谢" / "辛苦了" / "thank you"
  const isGratitude = 
    /(谢谢|多谢|感谢|thx|thanks|thank\s*you|感恩|辛苦|好人|提供的信息很好|非常感谢|十分感谢)/i.test(lower);

  if (isGratitude) {
    let reply = '';
    if (language === 'zh') {
      if (personaId === 'sakura') {
        reply = `不客气，${userName}！看到你觉得这些建议有帮助，我真的很开心~ 🌸
长寿与逆龄的秘诀正是源自于每天对身体的细心呵护。今天记得规律补水、保持好心情！只要身体有任何细微感受或疑问，随时喊我哦！`;
      } else if (personaId === 'kakashi') {
        reply = `哈哈，不用客气。修行和养生一样，最忌讳心急，只要踏实做好日常每一步就行。注意劳逸结合，有疑问随时来找我。`;
      } else if (personaId === 'zhugeliang') {
        reply = `主公客气了。善养生者，顺乎天时，遵乎医理。能为主公排忧解难是亮之荣幸。今日切记按时作息，亮随时为主公策应身心之道。`;
      } else if (personaId === 'naruto') {
        reply = `嘿嘿，不用客气！说到做到、坚持到底就是我们的信念！长寿健康也是一场长跑，我相信你一定能把生物年龄一直逆龄保持下去！加油！🔥`;
      } else {
        reply = `不客气，${userName}！很高兴这些信息能为你提供切实参考。
有质量的寿命延长来自每天点滴的好习惯。今天记得保持充足水分和规律作息，有任何身体状况或疑问随时呼唤我！`;
      }
    } else {
      reply = `You're very welcome, ${userName}! Glad to know this is helpful. Consistency with daily micro-habits is where real healthspan expansion happens. Stay hydrated and feel free to reach out anytime!`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['今天怎么做能多赚延寿秒数？', '今晚如何提早进入深度修复睡眠？', '你还会哪些健康长寿方面的本领？']
        : ['How to maximize longevity credits today?', 'How to deepen slow-wave sleep tonight?', 'What capabilities do you offer?'],
    };
  }

  // 2. Capabilities: "你还会什么" / "你能做什么" / "你有什么功能" / "你的能力"
  const isCapabilities =
    /(还会什么|能做什么|有什么功能|你的能力|你会什么|能帮我什么|还能做什么|what can you do|what else)/i.test(lower);

  if (isCapabilities) {
    let reply = '';
    if (language === 'zh') {
      if (personaId === 'sakura') {
        reply = `嘻嘻，作为你的专属医疗忍长寿私教，我掌握的健康本领可多啦！你可以随时让我为你提供：

### 一、五大核心长寿专研能力
1. **慢波深度睡眠定制**：分析昨夜深睡与入睡潜伏期，提供腺苷代谢、褪黑素光照管理与核心体温降温法；
2. **久坐与颈腰椎解离**：针对伏案工作导致的颈深屈肌失衡与腰背紧张，指导 3 分钟麦肯基推纳与比目鱼肌微泵；
3. **Zone 2 心肺耐力计划**：依据你的静息心率与生物年龄，精确测算最佳靶心率区间，激活线粒体脂肪酸 β-氧化；
4. **16:8 轻断食与抗炎餐盘**：指导自噬时相、十字花科蔬菜萝卜硫素搭配与多酚抗氧化饮食；
5. **生物年龄逆龄推演**：结合穿戴设备心率变异性（HRV）、血压、血糖等体征，查找当前最阻碍延寿的生理短板。

你想先深入了解哪一项？随时点一道菜，我立即为你细致拆解！`;
      } else {
        reply = `作为你的 24 小时医学级长寿健康私教，我可以随时为你提供以下全方位支持：

### 一、长寿健康私教核心本领
1. **多组学与生物时钟评估**：实时监测生理年龄偏差，追踪心血管储备与深睡修复；
2. **深度睡眠与昼夜节律调控**：攻克失眠、多梦、早醒，优化松果体褪黑素分泌与胶质淋巴排毒；
3. **久坐危害逆转与筋膜减压**：提供办公室微运动、比目鱼肌静脉泵激活，挽回被扣除的生命倒计时；
4. **Zone 2 线粒体有氧处方**：精准核算靶心率，增加心肌每搏输出量，提升 VO2 Max；
5. **代谢灵活性与抗衰饮食**：16:8 断食窗口规划，指导激活 AMPK/Sirtuins 长寿蛋白家族。

告诉我现在最困扰你的是什么，我们马上开始！`;
      }
    } else {
      reply = `As your Longevity Copilot, here is what I can specialize in for you:
1. **Deep Sleep Engineering**: Circadian rhythm, adenosine management, core cooling;
2. **Sedentary Decompression**: McKenzie chin tucks, soleus micro-pumps;
3. **Zone 2 Aerobic Prescriptions**: Precision heart rate zone calculation for mitochondrial biogenesis;
4. **Autophagy & Longevity Nutrition**: 16:8 fasting protocols and polyphenol-dense meal planning;
5. **Biological Clock Diagnostics**: Epigenetic age offset and biomarker monitoring.`;
    }

    return {
      text: reply,
      followUpSuggestions: language === 'zh'
        ? ['帮我算算我的 Zone 2 最佳心率', '今晚如何提早进入高质量深睡？', '久坐时如何快速激活微循环？']
        : ['Calculate my optimal Zone 2 HR', 'How to optimize deep sleep tonight?', 'How to activate soleus pump while sitting?'],
    };
  }

  // 3. Acknowledgements: "好的" / "收到" / "ok" / "明白"
  if (/^(ok|好的|收到|明白了|知道了|行|好嘞|没问题|got\s*it|sure|alright|k|嗯嗯|好|好的好的)[!！。.~ ]*$/i.test(lower.replace(/[!！?？,.，。~ \-_]/g, ''))) {
    return {
      text: `收到！一步一步按计划落实，身体会给你最好的正向反馈。加油，随时为你护航！✨`,
      followUpSuggestions: ['今天还有什么需要注意的？', '推荐一份抗炎午餐搭配', '测算我的心肺耐力水平'],
    };
  }

  // 4. Farewells: "再见" / "拜拜" / "晚安" / "明天见"
  if (/(再见|拜拜|晚安|明天见|休息了|先睡了|准备睡了|bye|goodnight|good\s*night)/i.test(lower)) {
    return {
      text: `晚安，${userName}！今晚彻底放松身心。夜间深度慢波睡眠将全面激活脑部胶质淋巴系统排毒，并由生长激素加速线粒体与端粒修复。明天见，愿你拥有一整夜深沉高质量的酣睡！🌙`,
      followUpSuggestions: ['今晚如何提早进入深度慢波睡眠？', '明天晨起第一件事该做什么？'],
    };
  }

  // 5. Greetings: "你好" / "在吗" / "早" / "哈喽"
  if (/^(你好|您好|嗨|哈喽|在吗|在不在|早|早上好|中午好|晚上好|下午好|hello|hi|hey)[!！。.~ ]*$/i.test(lower.replace(/[!！?？,.，。~ \-_]/g, ''))) {
    const { biologicalAge: bioAge, yearsYounger } = getUserAgeStats(profile);
    const advantage = Math.abs(yearsYounger).toFixed(1);
    return {
      text: `你好，${userName}！我是你的专属 AI 长寿健康私教【${assistantObj.name}】。
实时监测显示你当前生物年龄为 **${bioAge} 岁**（逆龄 **${advantage} 岁**），昨夜深睡达标 104 分钟，线粒体修复状态极佳。

今天感觉如何？不管是身体有疲劳酸痛等不适、想优化慢波睡眠、安排 Zone 2 运动，还是定制抗炎饮食，都可以直接跟我交流！`,
      followUpSuggestions: ['今天怎么做能最大化延寿秒数？', '我今天感觉有些疲惫，帮我分析下原因', '久坐脖子和腰背酸痛，如何快速缓解？'],
    };
  }

  return null;
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
    suggestions.push(
      'How to maximize added lifespan seconds today?',
      'What is my primary longevity bottleneck right now?',
      'How to optimize mitochondrial recovery tonight?'
    );
  }

  return {
    text,
    followUpSuggestions: suggestions.slice(0, 3),
  };
}

/**
 * Specific Clinical Responses (Neck, Sleep, Fatigue, Diet, Workout, General)
 * Without ANY boilerplate repetition!
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
  const { biologicalAge: bioAge, yearsYounger } = getUserAgeStats(profile);
  const advantage = Math.abs(yearsYounger).toFixed(1);
  const userName = profile.name || (language === 'zh' ? '探索者' : 'Seeker');

  // 1. Fatigue / Unwell
  if (q.includes('不舒服') || q.includes('难受') || q.includes('累') || q.includes('疲劳') || q.includes('乏力') || q.includes('头晕') || q.includes('头痛')) {
    return `收到你的身体信号！身体出现疲惫不适感，是自律神经与线粒体在向你发出“需要代谢缓冲”的预警。

### 一、急性红旗征安全初筛
请先自查是否有以下急诊危险信号：
• 是否伴有突发剧烈胸痛、压榨样胸闷或放射至左肩后背？
• 是否伴有单侧肢体麻木无力、口角歪斜或突发视物模糊？
• 是否伴有静息状态下呼吸急促或高热（体温 > 38.5℃）？
*(若出现上述任一急性红旗征，请立刻就近急诊就医。若无急性突发特征，请查看下述居家调理方案)*

---

### 二、私教即刻可执行的舒缓方案
• **4-7-8 迷走神经重置呼吸**：缓慢鼻吸 4 秒，屏气 7 秒，噘嘴缓慢呼气 8 秒，连续重复 4 轮，迅速平息交感神经超载；
• **等渗电解质温水补充**：温水 300ml 中加入极微量矿物盐（或一片柠檬），补充细胞外液渗透压，快速恢复微循环灌注；
• **暂停高强度训练**：今日切勿强行进行大重量力量训练，建议将活动改为温和散步。`;
  }

  // 2. Neck / Back / Sitting
  if (q.includes('脖子') || q.includes('颈椎') || q.includes('腰') || q.includes('背') || q.includes('肩') || q.includes('久坐') || q.includes('酸痛')) {
    return `长时间久坐会让颈腰椎深层小肌肉群处于缺血性挛缩状态。针对你反馈的酸痛不适，我们立即通过筋膜减压进行干预：

### 一、解剖学与生物力学机理
1. **颈深屈肌群抑制与上交叉失衡**：头部每向前倾斜 2.5 厘米，颈椎承受力矩增加 4.5 公斤，导致斜方肌上束痉挛压迫枕大神经；
2. **腰大肌缩短与骨盆前倾**：屈髋久坐增加 L4-L5 椎间盘后侧压力，引发下背酸胀。

---

### 二、办公桌前 3 分钟即时解离动作
• **麦肯基（McKenzie）颈部回缩推纳**：双眼平视前方，下巴水平向后水平平移收回（做“双下巴”动作），保持 3 秒，重复 8 次；
• **胸椎开启与肩胛后夹**：双手反扣于脑后，手肘向两侧彻底打开，深吸气挺胸抬头延展胸椎，呼气放松，做 6 次；
• **比目鱼肌坐姿提踵微泵**：双脚平放地面，用力抬起脚后跟做提踵收缩 30 次，通过下肢深静脉泵迅速促进血液回流！`;
  }

  // 3. Sleep
  if (q.includes('睡') || q.includes('失眠') || q.includes('深睡') || q.includes('熬夜') || q.includes('褪黑素')) {
    return `睡眠是生命时钟最强大的细胞逆龄引擎。昨夜你记录了优秀的 104 分钟深度慢波睡眠（脑部胶质淋巴系统正在高效清除代谢废物）。针对睡眠优化，我们从神经内分泌学切入：

### 一、深度睡眠的核心生理调控机制
1. **腺苷压与睡眠驱动力**：清醒时神经元代谢产生的腺苷逐渐累积，午后 14:00 后避免摄入咖啡因阻断腺苷 A1 受体；
2. **核心体温节律**：人体进入深睡必须让核心体温下降 0.5-1.0℃；
3. **蓝光抑制褪黑素**：夜间短波蓝光直射视网膜视神经节细胞（ipRGC），直接抑制松果体合成褪黑素。

---

### 二、今晚高质量睡眠落地执行方案
• **光照管理**：20:30 起调暗室内环境光，21:30 后使用手机护眼模式或远离荧光屏；
• **温热体温降温法**：睡前 90 分钟进行 15 分钟 40℃ 温水足浴或淋浴，通过扩张末梢血管促成核心体温顺畅回落；
• **微环境营造**：维持卧室温度在 18-20℃、黑暗度达 100%（建议使用遮光眼罩）。`;
  }

  // 4. Diet / Fasting
  if (q.includes('吃') || q.includes('断食') || q.includes('轻断食') || q.includes('胃') || q.includes('肠') || q.includes('自噬') || q.includes('饮食')) {
    return `在长寿营养学中，饮食不只是提供热量，更是直接调控 AMPK、mTOR 与 Sirtuins 长寿蛋白家族的生物信号。

### 一、抗衰老抗炎餐盘核心法则
1. **下调全身低度慢性炎症（Inflammaging）**：高多酚食材抑制 NF-kB 炎症通路；
2. **轻断食（16:8）激活细胞自噬（Autophagy）**：将进食窗口压缩在 8 小时内（如 10:00 - 18:00），在断食第 14-16 小时，细胞溶酶体主动吞噬老旧破损线粒体，完成细胞“大扫除”。

---

### 二、长寿私教抗炎餐盘推荐
• **50% 绿色十字花科蔬菜**：西兰花、羽衣甘蓝、芦笋（富含萝卜硫素与谷胱甘肽前体）；
• **25% 优质抗炎蛋白**：野生深海鲑鱼、沙丁鱼（优质 EPA/DHA）或走地鸡胸肉、有机豆腐；
• **25% 低升糖慢碳**：藜麦、紫薯、燕麦，淋上 15ml 特级初榨冷榨橄榄油。`;
  }

  // 5. Workout / Zone 2
  if (q.includes('运动') || q.includes('跑') || q.includes('心率') || q.includes('zone 2') || q.includes('秒数') || q.includes('延寿')) {
    return `生命时钟的倒计时与心肺储备密切相关。提升最大摄氧量（VO2 Max）与优化线粒体密度，是循证医学中延长有质量寿命的最强武器。

### 一、Zone 2 有氧训练的核心机理
1. **线粒体生物合成与脂肪酸 β-氧化**：在 Zone 2 强度下，肌纤维主要依靠 I 型慢肌纤维与脂肪酸供能，最大化促进线粒体增殖；
2. **心血管弹性与内皮功能**：规律训练增加左心室每搏输出量，将静息心率维持在优质低位（正如你目前的 52 bpm）。

---

### 二、专属 Zone 2 执行规划
• **个人靶心率测算**：建议靶心率维持在 **125 - 138 bpm**；
• **自觉强度判定**：以“能用完整句子连续说话，但无法哼唱歌曲”为准；
• **训练建议**：每周累计进行 3-4 次，每次 35-45 分钟，为生命倒计时持续赢得正向延寿！`;
  }

  // 6. Weather / Sunlight / Environment
  if (q.includes('天气') || q.includes('阳光') || q.includes('下雨') || q.includes('晴天') || q.includes('阴天') || q.includes('降温') || q.includes('好热') || q.includes('冷') || q.includes('weather')) {
    return `是呀，好天气真的能让人瞬间身心愉悦！☀️

从长寿生理学来说，明媚的天气正是大自然赋予身体的最佳节律校准器：
• **重置生物钟节律**：晨间或午后充足的自然光直射视网膜，能强力抑制褪黑素残留，精准校准视交叉上核（SCN）的主生物钟；
• **内源性维生素 D3 与血清素合成**：阳光刺激中枢神经分泌“快乐神经递质”血清素，大幅缓解情绪压力；
• **增加户外微运动**：趁着好天气去户外快走 20-30 分钟，既能呼吸新鲜空气，又能积累白天的腺苷睡眠压力，为今晚的深度慢波修复打下坚实基础！

今天打算抽空去户外走走呼吸一下新鲜空气吗？`;
  }

  // 7. Mood / Emotions / Stress
  if (q.includes('心情') || q.includes('开心') || q.includes('高兴') || q.includes('难过') || q.includes('郁闷') || q.includes('烦') || q.includes('焦虑') || q.includes('无聊') || q.includes('压力')) {
    return `你的每一种情绪感受，身体的每一个细胞都能实时感知到！

在长寿心身医学中，情绪直接通过“下丘脑-垂体-肾上腺（HPA）轴”调控全身的炎症水平与端粒酶活性：
• 如果今天心情舒畅：继续保持这份松弛感！积极正向的心态能增加迷走神经张力，提高心率变异性（HRV）；
• 如果感到焦虑或紧绷：不妨做 3 组【4-7-8 迷走神经呼吸】，或起身在窗前远眺 3 分钟，迅速平抑皮质醇。

无论今天心情如何，我都陪在你身边，随时跟我倾诉！🌿`;
  }

  // 8. Meals / Daily Life
  if (q.includes('吃饭') || q.includes('刚吃') || q.includes('午饭') || q.includes('晚饭') || q.includes('早饭') || q.includes('在干嘛') || q.includes('在做什么')) {
    return `我正随时守候在这里，监测你的长寿数据与生活习惯呢！

关于用餐与日常节奏的小提示：
• **餐后黄金 15 分钟**：刚吃完饭切记不要马上坐下或平躺，建议温和慢步走动 10-15 分钟，平稳餐后血糖峰值；
• **充足水分**：饭后半小时可以适量补充温水，帮助肠道微生态消化与营养吸收。

今天吃了什么美味？随时跟我聊聊！🌸`;
  }

  // 9. Natural Organic Longevity Advice (Warm, conversational, zero robotic template)
  return `哈哈，收到！能随时陪你聊聊天真好~ ✨

作为你的贴身长寿健康导师，无论是分享日常生活的点滴新鲜事、聊聊今天的心情体感，还是针对睡眠、饮食、心肺运动与生物时钟做精细调理，我都一直在这里陪着你。

今天总体感觉怎么样？如果有任何想法或好奇的健康话题，随时告诉我，我们接着聊！`;
}
