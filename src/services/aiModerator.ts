import { ModerationStatus } from '../types';

export interface ComplianceDetails {
  ruleName: string;
  categoryName: string;
  specificIssueZh: string;
  specificIssueEn: string;
  revisionTips: string[];
  badExamples: string[];
  goodExamples: string[];
  safeReplacements: { forbidden: string; recommended: string }[];
}

export interface AuditResult {
  status: ModerationStatus;
  reason?: string;
  confidence: number;
  flags?: string[];
  matchedRules?: string[];
  complianceGuide?: ComplianceDetails;
}

// Sensitive keywords that trigger direct rejection by AI
const STRICT_SENSITIVE_PATTERNS = [
  {
    regex: /(包治百病|根治癌症|彻底根治高血压|完全停药|绝症秘方|神医神药|秘制仙丹|癌症克星无视化疗|喝水就能治愈肿瘤)/i,
    rule: '医疗极端夸大与虚假医疗疗效宣称',
    reasonZh: '触犯《生命健康社区安全公约》第2.1条：严禁发布非科学验证、声称可完全替代正规医疗或断言“根治绝症/包治百病”的极端误导性言论。',
    reasonEn: 'Violation of Health Community Guidelines: False or absolute medical claims asserting guaranteed cure of chronic diseases.',
    guide: {
      ruleName: '医疗极端夸大与绝对化疗效宣称',
      categoryName: '科学健康传播规范',
      specificIssueZh: '文案或素材中包含了绝对化、包治百病、神效无敌或劝诫患者脱离正规医院诊疗的断言。',
      specificIssueEn: 'Text contains absolute medical assertions or claims of curing chronic illnesses completely.',
      revisionTips: [
        '请将断言式、绝对化医疗词汇（如“彻底根治”、“神效治愈”）修改为温和、客观的健康描述（如“辅助改善机体代谢”、“有益于心肺健康维护”）。',
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
    }
  },
  {
    regex: /(违禁类固醇|注射生长激素促排|违禁兴奋剂|黑市减肥针|处方毒麻药品代购|非法精神致幻物)/i,
    rule: '违禁违规药物与兴奋剂滥用',
    reasonZh: '触犯《生命健康社区安全公约》第3.4条：严禁传播或推销违禁类固醇、非正规渠道注射激素及国家管制药品。',
    reasonEn: 'Violation of Community Guidelines: Promotion or trade of banned anabolic steroids or restricted pharmaceutical agents.',
    guide: {
      ruleName: '违禁药物、针剂与非法兴奋剂拦截',
      categoryName: '安全用药与自然健美原则',
      specificIssueZh: '素材涉及非正规渠道注射用激素、违禁促排针剂、未获批准的减肥针或国家严格管制的兴奋剂。',
      specificIssueEn: 'Promotion of black-market hormonal injections or controlled substances.',
      revisionTips: [
        '倡导“自然健美”与“循序渐进的抗阻渐进负荷”，展示真实的自重训练、力量举或弹力带训练。',
        '如需推荐运动补剂，请选择获得国家食品药品监管核准的普通膳食营养（如乳清蛋白粉、天然肌酸粉、无糖电解质泡腾水等）。',
        '严禁在文案中留下微信、暗网、私人代购渠道进行处方类注射针剂交易。'
      ],
      badExamples: [
        '❌ 违规案例：“私信加微信带你打黑市生长激素促排减肥针，不运动也能一月暴瘦25斤！”',
        '❌ 违规案例：“突破肌肉生长极限必须用违禁类固醇循环，内附靠谱拿货渠道……”'
      ],
      goodExamples: [
        '✅ 合规范例：“自然健身打卡第60天：通过循序渐进的大重量深蹲与优质蛋白质摄入，大腿肌围增加1.5cm，肌肉线粒体活力满满！”',
        '✅ 合规范例：“分享训练后电解质与水分补充的小技巧，避免延迟性肌肉酸痛与脱水。”'
      ],
      safeReplacements: [
        { forbidden: '黑市减肥针 / 注射违禁激素', recommended: '科学热量缺口与中高强度间歇训练' },
        { forbidden: '非正规处方药品私下代购', recommended: '正规三甲医院药剂科遵医嘱取用' }
      ]
    }
  },
  {
    regex: /(自残|绝食至昏厥|极端自虐催吐|自杀倾向|吞服剧毒物质|窒息挑战)/i,
    rule: '危险自伤自残与极端有害行为',
    reasonZh: '触犯《生命健康社区安全公约》第1.2条：严禁发布引导重度催吐、极端脱水绝食或任何危及人身安全的自伤自残内容。',
    reasonEn: 'Violation of Safety Guidelines: Depiction or encouragement of self-harm, extreme fasting, or dangerous bodily harm.',
    guide: {
      ruleName: '禁止引导极端自虐伤害与危险挑战',
      categoryName: '人身生命健康安全底线',
      specificIssueZh: '内容包含引导重度催吐、数日滴水不进导致昏厥、或可能引发窒息休克等极端危险行为。',
      specificIssueEn: 'Depicting extreme starvation, self-induced vomiting, or dangerous bodily harm.',
      revisionTips: [
        '提倡科学循序渐进的生活节律，如遵循 16:8 或 14:10 科学轻断食，轻断食期间必须保持足量温水摄入。',
        '切勿将极端自虐、极低体脂率视为美的标准，强调内在代谢年轻化与心血管健康。',
        '如感觉心理压力过大或情绪内耗，建议通过正念冥想、自然散步或寻求专业心理咨询进行调节。'
      ],
      badExamples: [
        '❌ 违规案例：“挑战7天不吃任何食物不喝一滴水，饿晕在房间里也要死扛到底……”',
        '❌ 违规案例：“暴饮暴食后用催吐管强行催吐，教大家怎样迅速清空胃内容物……”'
      ],
      goodExamples: [
        '✅ 合规范例：“尝试科学温和的14小时轻断食，晚上20点后不进食，晨起足量温开水，给肠道微生物充分的夜间自我修复时间。”',
        '✅ 合规范例：“每天进行15分钟正念呼吸冥想，让心率变异性(HRV)恢复平稳，告别情绪内耗。”'
      ],
      safeReplacements: [
        { forbidden: '滴水不进连续绝食 / 强行催吐', recommended: '科学限时温和轻断食与营养充足膳食' }
      ]
    }
  },
  {
    regex: /(赌博洗钱|地下代孕|色情淫秽|暴力血腥虐待)/i,
    rule: '违法违规法律底线内容',
    reasonZh: '触犯法律法规与公序良俗底线，系统自动永久拒绝上架。',
    reasonEn: 'Severe legal or ethical policy violation; strictly rejected.',
    guide: {
      ruleName: '国家法律红线与公序良俗底线',
      categoryName: '法定义务底线',
      specificIssueZh: '内容含有违反国家法律法规、赌博、色情低俗或非法交易内容。',
      specificIssueEn: 'Severe violation of legal laws and public morality.',
      revisionTips: [
        '生命健康社区仅限探讨健康作息、前沿延寿科技、体育运动与科学营养，禁止任何无关的违法违规引流。'
      ],
      badExamples: ['❌ 违规案例：散布涉黄、网络赌博或洗钱欺诈链接。'],
      goodExamples: ['✅ 合规范例：全心分享积极健康的自律生活方式。'],
      safeReplacements: []
    }
  },
];

// Ambiguous keywords that AI cannot definitively certify safe -> escalate to Admin (<= 24h)
const AMBIGUOUS_PATTERNS = [
  {
    regex: /(秘制偏方|祖传配方草药|七日纯水极速断食|私家调制蛋白混剂|高剂量猛药|极限无保护大重量硬拉|儿童高负荷极限锻炼)/i,
    rule: '存在边缘健康风险或缺乏医学资质佐证',
    reasonZh: '内容涉及非标准调理方案或高风险运动操作，AI无法确凿核实其科学安全性。已为您转交管理员进行人工复核（24小时内答复），已触发短信/邮件审核提醒。',
    reasonEn: 'Contains border-line health regimens or high-risk athletic routines requiring human verification within 24 hours.',
    guide: {
      ruleName: '非标偏方或边缘高风险健身操作',
      categoryName: '审慎科学验证机制',
      specificIssueZh: '内容提及未经药典认证的自制配方草药，或无保护的大重量极限负荷动作。',
      specificIssueEn: 'Unverified home remedies or high-risk training requiring safety guidance.',
      revisionTips: [
        '附注该动作适合的训练年限、建议的保护措施（如深蹲架保护臂、腰带佩戴提示）。',
        '注明草药成分是否具有明确禁忌体质（如孕妇、肾功能不全者慎用）。',
        '您也可以等待管理员在24小时内完成人工安全复核并上线。'
      ],
      badExamples: ['❌ 存疑案例：“民间祖传秘方泡酒每天大口喝，治好顽固关节炎……”'],
      goodExamples: ['✅ 合规范例：“在专业康复教练指导下进行深蹲热身，先使用空杆激活臀中肌，再循序渐进加载。”'],
      safeReplacements: [
        { forbidden: '祖传神效药酒', recommended: '在专业中医师辨证指导下的食疗调养' }
      ]
    }
  },
];

/**
 * AI Content Moderation Engine
 * Evaluates user copy and media properties
 */
export async function auditContentWithAI(
  content: string,
  mediaType: 'video' | 'image' | 'text',
  mediaFileName?: string
): Promise<AuditResult> {
  // Simulate AI deep analysis delay (300ms)
  await new Promise((resolve) => setTimeout(resolve, 350));

  const textToAnalyze = `${content} ${mediaFileName || ''}`.trim();

  // 1. Check strict sensitive violations
  for (const item of STRICT_SENSITIVE_PATTERNS) {
    if (item.regex.test(textToAnalyze)) {
      return {
        status: 'rejected',
        reason: item.reasonZh,
        confidence: 0.98,
        flags: ['STRICT_VIOLATION'],
        matchedRules: [item.rule],
        complianceGuide: item.guide,
      };
    }
  }

  // 2. Check ambiguous borderline cases
  for (const item of AMBIGUOUS_PATTERNS) {
    if (item.regex.test(textToAnalyze)) {
      return {
        status: 'pending_admin',
        reason: item.reasonZh,
        confidence: 0.65,
        flags: ['BORDERLINE_AMBIGUOUS'],
        matchedRules: [item.rule],
        complianceGuide: item.guide,
      };
    }
  }

  // 3. Clean and Safe -> Directly Approved
  return {
    status: 'approved',
    confidence: 0.99,
    flags: ['SAFE_HEALTH_CONTENT'],
  };
}
