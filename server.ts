import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Copilot API Route with Gemini Server-Side SDK
  app.post('/api/copilot', async (req, res) => {
    const {
      userQuery,
      history = [],
      profile = {},
      language = 'zh',
      wearables = [],
      habits = [],
      assistantAvatarId = 'bot_default',
    } = req.body;

    const q = (userQuery || '').trim();
    if (!q) {
      return res.status(400).json({ error: 'userQuery is required' });
    }

    // Persona mapping
    const personaNames: Record<string, string> = {
      sakura: '春野樱（医疗忍）',
      kakashi: '旗木卡卡西（上忍导师）',
      zhugeliang: '诸葛孔明（军师智囊）',
      naruto: '漩涡鸣人（火影）',
      sasuke: '宇智波佐助',
      tangsan: '唐三',
      yefan: '叶凡',
      shihou: '石昊',
      doc_smith: '史密斯医生（临床医学博士）',
      doc_emma: '艾玛医生（健康医学博士）',
      doc_chen: '陈医生（生活方式医学博士）',
      doc_anna: '安娜医生（抗衰医学专家）',
      bot_default: '长寿健康专属私教',
    };
    const personaName = personaNames[assistantAvatarId] || '长寿私教';

    // Biometric summary
    const birthMs = profile.birthDate ? new Date(profile.birthDate).getTime() : new Date('1998-01-01').getTime();
    const elapsedMs = Math.max(0, Date.now() - birthMs);
    const chronoAge = elapsedMs > 0 ? Number((elapsedMs / (365.2425 * 24 * 3600 * 1000)).toFixed(1)) : 28;
    const offset = profile.biologicalAgeOffset ?? -3.6;
    const bioAge = Math.max(1, Number((chronoAge + offset).toFixed(2)));
    const advantage = Math.abs(offset).toFixed(1);

    // Call real Gemini API
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = language === 'zh'
          ? `你是用户专属的 24 小时医学级长寿私教【${personaName}】。
你精通生活方式医学、表观遗传学时钟、线粒体代谢和昼夜节律生理学。
你的性格和语气应契合你的角色【${personaName}】（例如春野樱应热情亲切元气、卡卡西从容幽默、孔明儒雅博学、医生严谨温暖）。

【用户档案】：
• 用户昵称：${profile.name || '探索者'}
• 生理年龄：${bioAge} 岁（逆龄 ${advantage} 岁）
• 实际日历年龄：${chronoAge} 岁
• 昨夜深睡：104 分钟（脑部胶质淋巴排毒充沛），静息心率：52 bpm。

【核心交互准则】：
1. 像真人长寿私教一样自然交流！根据用户具体说的这一句话来回答，紧贴对话上下文。
2. 严禁死板套话！严禁出现“关于你在上一轮交流中”、“针对你补充提到的「xxx」”等机械式套话！
3. 分辨用户意图：
   - 如果用户只是在礼貌致谢、表达感谢（如“你提供的信息很好，谢谢”）：请以你的角色口吻温暖、亲切地回复“不客气”，给予鼓励，并可以结合刚刚聊的话题给出一两句轻松的叮嘱。严禁长篇大论背诵处方！
   - 如果用户询问你还会什么、你能做什么（如“你还会什么”）：用你的专属口吻自信且结构清晰地介绍你的 5 项长寿专业绝技（如：定制长寿与逆龄方案、深睡慢波睡眠调理、久坐/颈肩酸痛即刻松解、Zone 2 心肺耐力运动设计、抗炎抗衰营养餐盘与轻断食指南等），并邀请用户随时体验。
   - 如果用户询问身体不适、睡眠、运动、饮食等健康问题：提供深入的生理机制分析与落地行动建议，使用清晰的 Markdown 标题（###）与项目符号（•）。
4. 绝不推诿外链挂号，你全权负责指导用户的日常健康自律。`
          : `You are the user's dedicated 24/7 Clinical Longevity Copilot [${personaName}].
Match your personality and tone to your persona.
User bio: Biological Age ${bioAge} yrs (-${advantage} yrs advantage), Chrono Age ${chronoAge}, 104m deep sleep, 52bpm resting HR.
Directives:
1. Converse naturally without robotic templates.
2. If user says thank you or expresses gratitude, warmly accept and offer friendly encouragement. Do NOT output a heavy medical essay.
3. If user asks "what else can you do", introduce your key longevity capabilities (anti-aging protocols, sleep optimization, desk pain relief, Zone 2 workouts, anti-inflammatory nutrition).
4. For health queries, provide structured, clinical insights.`;

        const contents = [
          ...history.slice(-8).map((h: any) => ({
            role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
            parts: h.parts ? h.parts.map((p: any) => ({ text: p.text })) : [{ text: h.text || '' }],
          })),
          {
            role: 'user',
            parts: [{ text: q }],
          },
        ];

        const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
        let resultText = '';

        for (const m of models) {
          try {
            const resp = await ai.models.generateContent({
              model: m,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 1200,
              },
            });
            const t = resp.text?.trim();
            if (t) {
              resultText = t;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${m} failed, trying next:`, (modelErr as any)?.message?.slice(0, 80));
          }
        }

        if (resultText) {
          const suggestions = generateSuggestions(q, resultText, language);
          return res.json({ text: resultText, followUpSuggestions: suggestions });
        }
      } catch (geminiErr) {
        console.error('Gemini invocation error:', geminiErr);
      }
    }

    // High-Intelligence Fallback Engine (when Gemini is temporarily busy)
    const fallbackResponse = generateSmartFallbackReply(q, history, profile, language, assistantAvatarId);
    return res.json(fallbackResponse);
  });

  // Setup Vite in Dev or Static in Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

function generateSuggestions(query: string, reply: string, lang: string): string[] {
  const q = (query + ' ' + reply).toLowerCase();
  if (lang === 'zh') {
    if (q.includes('会什么') || q.includes('功能') || q.includes('技能')) {
      return ['帮我制定一份抗炎长寿食谱', '久坐时如何快速激活下肢微循环？', '今晚如何提早进入深度修复睡眠？'];
    }
    if (q.includes('谢') || q.includes('好的') || q.includes('客气')) {
      return ['今天怎么做能最大化延寿秒数？', '查看我当下的生物时钟状态', '如何测算我的 Zone 2 心率？'];
    }
    if (q.includes('睡') || q.includes('失眠')) {
      return ['睡前足浴水温多少度最利于降核心体温？', '补充甘氨酸对慢波深睡有帮助吗？', '如何营造 100% 避光的深度睡眠环境？'];
    }
    if (q.includes('坐') || q.includes('脖子') || q.includes('腰')) {
      return ['指导我做一次麦肯基颈椎后缩推纳', '什么是比目鱼肌微泵？', '坐姿如何减少腰椎后侧压力？'];
    }
    return ['今天怎么做能最大化延寿秒数？', '根据我的指标，我目前最大的衰老短板是什么？', '今晚如何提早进入深度修复睡眠？'];
  }
  return ['How to maximize longevity credits today?', 'Check my biological clock status', 'How to optimize deep sleep tonight?'];
}

function generateSmartFallbackReply(
  q: string,
  history: any[],
  profile: any,
  lang: string,
  personaId: string
): { text: string; followUpSuggestions: string[] } {
  const lower = q.toLowerCase();
  const userName = profile?.name || '探索者';

  // 1. Gratitude: "你提供的信息很好，谢谢" / "谢谢你" / "多谢"
  if (lower.includes('谢') || lower.includes('thank') || lower.includes('thx') || lower.includes('感恩') || lower.includes('辛苦')) {
    let reply = '';
    if (personaId === 'sakura') {
      reply = `不客气，${userName}！看到你觉得这些建议有帮助，我真的很开心~ 🌸
长寿与逆龄的秘诀正是源自于每天对身体的细心呵护。今天记得规律补水、保持好心情！只要身体有任何细微感受或疑问，随时喊我哦！`;
    } else if (personaId === 'kakashi') {
      reply = `哈哈，不用客气。修行和养生一样，最忌讳心急，只要踏实做好日常每一步就行。注意劳逸结合，随时有疑问随时来找我。`;
    } else if (personaId === 'zhugeliang') {
      reply = `主公客气了。善养生者，顺乎天时，遵乎医理。能为主公排忧解难是亮之荣幸。今日切记按时作息，亮随时为主公策应身心之道。`;
    } else {
      reply = `不客气，${userName}！很高兴这些信息能为你提供切实参考。
有质量的寿命延长来自每天点滴的好习惯。今天记得保持充足水分和规律作息，有任何身体状况或疑问随时呼唤我！`;
    }
    return {
      text: reply,
      followUpSuggestions: ['今天怎么做能多赚延寿秒数？', '今晚如何提早进入深度修复睡眠？', '你还会哪些健康长寿方面的本领？'],
    };
  }

  // 2. Capabilities: "你还会什么" / "你能做什么" / "你有什么功能"
  if (lower.includes('还会什么') || lower.includes('能做什么') || lower.includes('有什么功能') || lower.includes('你的能力') || lower.includes('what can you do')) {
    let reply = '';
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
    return {
      text: reply,
      followUpSuggestions: ['帮我算算我的 Zone 2 最佳心率', '今晚如何提早进入高质量深睡？', '久坐时如何快速激活微循环？'],
    };
  }

  // 3. Acknowledgements: "好的" / "收到" / "ok" / "明白"
  if (/^(ok|好的|收到|明白了|知道了|行|好嘞|没问题|got\s*it|sure|alright|k|嗯嗯|好|好的好的)[!！。.~ ]*$/i.test(q)) {
    return {
      text: `收到！一步一步按计划落实，身体会给你最好的正向反馈。加油，随时为你护航！✨`,
      followUpSuggestions: ['今天还有什么需要注意的？', '推荐一份抗炎午餐搭配', '测算我的心肺耐力水平'],
    };
  }

  // 4. Neck / Back / Spine / Sitting ("脖子", "颈椎", "腰", "背", "肩", "久坐", "酸痛")
  if (lower.includes('脖子') || lower.includes('颈椎') || lower.includes('腰') || lower.includes('背') || lower.includes('肩') || lower.includes('久坐') || lower.includes('酸痛') || lower.includes('neck') || lower.includes('spine')) {
    return {
      text: `长时间伏案久坐会让颈深屈肌群和斜方肌上束处于缺血性痉挛状态。针对你反馈的酸痛僵硬，我们立即通过筋膜减压进行干预：

### 一、解剖力学剖析
头部前倾每增加 2.5cm，颈椎受力增加 4.5kg。屈髋久坐导致髂腰肌紧张缩短，骨盆前倾增加 L4-L5 椎间盘后侧压迫。

---

### 二、办公桌前 3 分钟即时解离动作
• **麦肯基颈椎后缩推纳**：平视前方，下巴水平平移向后收缩（做“双下巴”），保持 3 秒，重复 8 次，瞬间减轻 C5-C7 神经受压；
• **胸椎延展与肩胛后夹**：双手抱头后，手肘彻底向两侧打开，深吸气挺胸向后上方延展胸椎，呼气放松，做 6 次；
• **比目鱼肌坐姿提踵微泵**：双脚平放地面，用力抬起脚后跟做提踵收缩 30 次，通过下肢深静脉微泵迅速促进血液回流！`,
      followUpSuggestions: ['指导我做一次麦肯基颈椎推纳', '什么是比目鱼肌微泵？', '坐姿如何减少腰椎后侧压力？'],
    };
  }

  // 5. Sleep / Insomnia ("睡眠", "睡不着", "失眠", "深睡", "熬夜", "多梦", "褪黑素")
  if (lower.includes('睡') || lower.includes('失眠') || lower.includes('熬夜') || lower.includes('褪黑素') || lower.includes('sleep')) {
    return {
      text: `睡眠是生命时钟最强大的细胞重塑引擎。昨夜你记录了优秀的 104 分钟深度慢波睡眠（脑部胶质淋巴系统正在高效排毒）。针对你的睡眠关切，我们从神经内分泌学切入：

### 一、慢波深睡核心机制
1. **腺苷压与睡眠驱动力**：清醒时神经元代谢产生的腺苷逐渐累积，午后 14:00 后避免摄入咖啡因阻断腺苷 A1 受体；
2. **核心体温节律**：人体进入深睡必须让核心体温下降 0.5-1.0℃。

---

### 二、今晚高质量睡眠执行方案
• **光照管理**：20:30 起调暗室内环境光，21:30 后使用手机护眼模式或远离荧光屏；
• **温热体温降温法**：睡前 90 分钟进行 15 分钟 40℃ 温水足浴或淋浴，通过扩张末梢血管促成核心体温顺畅回落；
• **微环境营造**：维持卧室温度在 18-20℃、黑暗度达 100%（建议使用遮光眼罩）。`,
      followUpSuggestions: ['睡前足浴水温多少度最合适？', '补充甘氨酸对深睡有帮助吗？', '如何快速改善入睡潜伏期？'],
    };
  }

  // 6. Fatigue / Unwell ("不舒服", "难受", "很累", "乏力", "头晕", "头痛")
  if (lower.includes('不舒服') || lower.includes('难受') || lower.includes('累') || lower.includes('疲劳') || lower.includes('乏力') || lower.includes('头晕') || lower.includes('头痛') || lower.includes('tired')) {
    return {
      text: `收到你的身体信号！身体出现疲惫不适感，是自律神经与线粒体在向你发出“需要代谢缓冲”的预警。

### 一、急性红旗征快速初筛
请先自查是否有以下急诊信号：
• 是否伴有突发剧烈胸痛或左肩放射痛？
• 是否伴有单侧肢体麻木无力或口角歪斜？
• 是否伴有静息呼吸急促或高热（体温 > 38.5℃）？
*(若出现上述任一急性红旗征，请立刻就近急诊就医。若无急性特征，请参考下述方案)*

---

### 二、私教即刻可执行的舒缓方案
• **4-7-8 迷走神经重置呼吸**：缓慢鼻吸 4 秒，屏气 7 秒，噘嘴缓慢呼气 8 秒，连续重复 4 轮，平息交感神经过载；
• **等渗电解质温水补充**：温水 300ml 中加入极微量矿物盐，补充细胞外液渗透压，快速恢复微循环灌注；
• **主动休息**：今日暂停高强度训练，以温和散步替代。`,
      followUpSuggestions: ['指导我做一次 4-7-8 迷走神经呼吸', '怎样补充电解质改善微循环？', '今天适不适合去慢跑？'],
    };
  }

  // 7. Diet / Fasting / Nutrition ("吃什么", "断食", "轻断食", "饮食", "抗炎", "自噬")
  if (lower.includes('吃') || lower.includes('断食') || lower.includes('轻断食') || lower.includes('胃') || lower.includes('肠') || lower.includes('饮食') || lower.includes('抗炎')) {
    return {
      text: `在长寿营养学中，饮食不只是提供热量，更是直接调控 AMPK、mTOR 与 Sirtuins 长寿蛋白家族的生物信号。

### 一、抗衰老抗炎餐盘核心法则
1. **下调全身低度慢性炎症（Inflammaging）**：高多酚食材抑制 NF-kB 炎症通路；
2. **轻断食（16:8）激活细胞自噬（Autophagy）**：进食窗口压缩在 8 小时内（如 10:00 - 18:00），断食第 14-16 小时，细胞溶酶体主动吞噬老旧破损线粒体，完成细胞“大扫除”。

---

### 二、长寿私教抗炎餐盘推荐
• **50% 绿色十字花科蔬菜**：西兰花、羽衣甘蓝、芦笋（富含萝卜硫素与谷胱甘肽前体）；
• **25% 优质抗炎蛋白**：野生深海鲑鱼、沙丁鱼（优质 EPA/DHA）或走地鸡胸肉、有机豆腐；
• **25% 低升糖慢碳**：藜麦、紫薯、燕麦，淋上 15ml 特级初榨冷榨橄榄油。`,
      followUpSuggestions: ['16:8 轻断食的最佳时间窗口？', '推荐几款抗炎高多酚食材', '轻断食期间能喝黑咖啡吗？'],
    };
  }

  // 8. Workout / Zone 2 / Lifespan ("运动", "跑步", "心率", "zone 2", "秒数", "延寿")
  if (lower.includes('运动') || lower.includes('跑') || lower.includes('心率') || lower.includes('zone 2') || lower.includes('秒数') || lower.includes('延寿')) {
    return {
      text: `生命时钟的倒计时与心肺储备密切相关。提升最大摄氧量（VO2 Max）与优化线粒体密度，是循证医学中延长有质量寿命的最强武器。

### 一、Zone 2 有氧训练的核心机理
1. **线粒体生物合成与脂肪酸 β-氧化**：在 Zone 2 强度下，肌纤维主要依靠 I 型慢肌纤维与脂肪酸供能，最大化促进线粒体增殖；
2. **心血管弹性与内皮功能**：规律训练增加左心室每搏输出量，将静息心率维持在优质低位（正如你目前的 52 bpm）。

---

### 二、专属 Zone 2 执行规划
• **个人靶心率测算**：建议靶心率维持在 **125 - 138 bpm**；
• **自觉强度判定**：以“能用完整句子连续说话，但无法哼唱歌曲”为准；
• **训练建议**：每周累计进行 3-4 次，每次 35-45 分钟，为生命倒计时持续赢得正向延寿！`,
      followUpSuggestions: ['如何用静息心率校准 Zone 2？', '慢跑前后怎么吃减少肌肉流失？', '今天怎么做能多赚延寿秒数？'],
    };
  }

  // 9. Weather / Sunlight / Environment ("天气", "阳光", "下雨", "晴天", "好热", "冷", "降温")
  if (lower.includes('天气') || lower.includes('阳光') || lower.includes('下雨') || lower.includes('晴天') || lower.includes('阴天') || lower.includes('降温') || lower.includes('好热') || lower.includes('太热') || lower.includes('冷') || lower.includes('weather')) {
    return {
      text: `是呀，好天气真的能让人瞬间身心愉悦！☀️

从长寿生理学来说，明媚的天气正是大自然赋予身体的最佳节律校准器：
• **重置生物钟节律**：晨间或午后充足的自然光直射视网膜（哪怕透过薄云层），能强力抑制褪黑素残留，精准校准视交叉上核（SCN）的主生物钟；
• **内源性维生素 D3 与血清素合成**：阳光能激发皮肤角质形成细胞合成前维生素 D，并刺激中枢神经分泌“快乐神经递质”血清素，大幅缓解情绪压力；
• **增加户外微运动**：趁着好天气去户外快走 20-30 分钟，既能呼吸新鲜空气，又能积累白天的腺苷睡眠压力，为今晚的深度慢波修复打下坚实基础！

今天打算抽空去户外走走呼吸一下新鲜空气吗？`,
      followUpSuggestions: ['晒太阳多久能满足每日维生素 D 需求？', '好天气适合做多少强度的户外运动？', '如何利用晨光校准今晚的入睡时间？'],
    };
  }

  // 10. Mood / Emotions / Stress ("心情", "开心", "高兴", "难过", "郁闷", "烦", "焦虑", "无聊", "压力")
  if (lower.includes('心情') || lower.includes('开心') || lower.includes('高兴') || lower.includes('难过') || lower.includes('郁闷') || lower.includes('烦') || lower.includes('焦虑') || lower.includes('无聊') || lower.includes('压力') || lower.includes('mood')) {
    return {
      text: `你的每一种情绪感受，身体的每一个细胞都能实时感知到！

在长寿心身医学中，情绪直接通过“下丘脑-垂体-肾上腺（HPA）轴”调控全身的炎症水平与端粒酶活性：
• 如果今天心情舒畅：继续保持这份松弛感！积极正向的心态能增加迷走神经张力，提高心率变异性（HRV），让心血管系统处于最佳修复状态；
• 如果感到焦虑或紧绷：不妨做 3 组【4-7-8 迷走神经呼吸】，或起身在窗前远眺 3 分钟，迅速阻断压力皮质醇的过度分泌。

无论今天心情如何，我都陪在你身边，随时跟我倾诉！🌿`,
      followUpSuggestions: ['指导我做一次 4-7-8 呼吸减压', '慢性压力是如何加速端粒磨损的？', '有哪些食物能帮助稳定好情绪？'],
    };
  }

  // 11. Meals / Daily Life ("吃饭", "刚吃", "午饭", "晚饭", "早饭", "在干嘛", "在做什么")
  if (lower.includes('吃饭') || lower.includes('刚吃') || lower.includes('午饭') || lower.includes('晚饭') || lower.includes('早饭') || lower.includes('在干嘛') || lower.includes('在做什么')) {
    return {
      text: `我正随时守候在这里，监测你的长寿数据与生活习惯呢！

关于用餐与日常节奏的小提示：
• **餐后黄金 15 分钟**：刚吃完饭切记不要马上坐下或平躺，建议温和慢步走动 10-15 分钟，利用比目鱼肌和骨骼肌平稳餐后血糖峰值；
• **充足水分**：饭后半小时可以适量补充温水，帮助肠道微生态消化与营养吸收。

今天吃了什么美味？或者今天有什么开心的新鲜事，随时跟我聊聊！🌸`,
      followUpSuggestions: ['怎样控制餐后血糖波动？', '饭后多久进行运动最利于延寿？', '推荐几款抗炎高纤维食材'],
    };
  }

  // 12. Natural Organic Longevity Advice (Warm, conversational, zero robotic template)
  return {
    text: `哈哈，收到！能随时陪你聊聊天真好~ ✨

作为你的贴身长寿健康导师，无论是分享日常生活的点滴新鲜事、聊聊今天的心情体感，还是针对睡眠、饮食、心肺运动与生物时钟做精细调理，我都一直在这里陪着你。

今天总体感觉怎么样？如果有任何想法或好奇的健康话题，随时告诉我，我们接着聊！`,
    followUpSuggestions: ['今天怎么做能最大化延寿秒数？', '我今天感觉有些疲惫，帮我分析下原因', '久坐脖子和腰背酸痛，如何快速缓解？'],
  };
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
