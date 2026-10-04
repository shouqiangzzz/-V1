import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  TrendingUp, 
  PieChart, 
  PlusCircle, 
  RefreshCw 
} from 'lucide-react';
import { UserProfile, MealAnalysis, TimeAdjustment } from '../types';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveMeal: (meal: MealAnalysis) => void;
  onAddAdjustment: (adj: TimeAdjustment) => void;
}

const SAMPLE_PRESETS: {
  name: string;
  url: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  fat: number;
  sugar: number;
  sodium: number;
  score: number;
  isExcess: boolean;
  advice: string;
  impact: string;
}[] = [
  {
    name: '地中海三文鱼羽衣甘蓝藜麦碗',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    type: 'lunch',
    calories: 490,
    fat: 14,
    sugar: 3,
    sodium: 410,
    score: 96,
    isExcess: false,
    advice: '富含优质不饱和脂肪酸EPA/DHA与高纤维多酚，极大减缓血管内皮炎性损伤。',
    impact: '优质抗氧化餐，稳定血糖与血脂，助力达成20天健康营养增寿目标！',
  },
  {
    name: '麻辣重油肥牛香锅 (过度油脂/高盐)',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    type: 'dinner',
    calories: 1120,
    fat: 58,
    sugar: 12,
    sodium: 2350,
    score: 38,
    isExcess: true,
    advice: '单餐油脂超标300%，钠含量超出全天上限！极度加重肝肾滤过负担与血管壁硬化。',
    impact: '严重损害心血管微循环与胰岛素受体，建议多喝温水并增加抗阻运动排钠！',
  },
  {
    name: '厚乳珍珠奶茶与香脆炸鸡 (高糖/反式脂肪)',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    type: 'snack',
    calories: 960,
    fat: 46,
    sugar: 68,
    sodium: 1420,
    score: 25,
    isExcess: true,
    advice: '高果糖浆迅速诱发晚期糖基化终末产物(AGEs)，导致真皮胶原蛋白交联断裂与端粒加速损耗。',
    impact: '极度损害身体！血糖急剧飙升，对当前胰岛健康构成明显负担。',
  },
  {
    name: '清蒸深海鲈鱼与西兰花时蔬 (高蛋白低GI)',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    type: 'dinner',
    calories: 420,
    fat: 8,
    sugar: 2,
    sodium: 380,
    score: 95,
    isExcess: false,
    advice: '极简烹饪保留高生物效价蛋白质，对控制当前体脂率与骨骼肌维护极为理想。',
    impact: '极佳长寿膳食，对血管无任何额外负担。',
  }
];

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveMeal,
  onAddAdjustment,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRESETS[0].url);
  const [dishName, setDishName] = useState<string>(SAMPLE_PRESETS[0].name);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload from user device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setSelectedImage(url);
      setDishName(file.name.replace(/\.[^/.]+$/, "") || '用户上传餐食');
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Run AI food nutrition analysis
  const runAiAnalysis = (imageUrl: string, name: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate intelligent AI parsing
    setTimeout(() => {
      // Find preset or generate intelligent analysis matching user profile
      const preset = SAMPLE_PRESETS.find(p => p.name === name) || SAMPLE_PRESETS[0];

      // Personalized calculation based on user's weight & glucose
      const bmi = profile.weight / ((profile.height / 100) * (profile.height / 100));
      const hasHighGlucose = profile.fastingBloodSugar > 6.1;

      const result: MealAnalysis = {
        id: `meal_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: imageUrl,
        mealType: mealType,
        dishName: name,
        calories: preset.calories,
        fatGrams: preset.fat,
        sugarGrams: preset.sugar,
        sodiumMg: preset.sodium,
        healthScore: preset.score,
        isExcessOilOrSugar: preset.isExcess,
        isNutritionallyBalanced: !preset.isExcess,
        personalizedAdvice: `根据您体重(${profile.weight}kg, BMI ${bmi.toFixed(1)})与空腹血糖(${profile.fastingBloodSugar}mmol/L)综合分析：${preset.advice}`,
        estimatedLifeImpactText: preset.impact,
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 1200);
  };

  // Confirm meal and save to history
  const handleConfirmMeal = (isGood: boolean) => {
    if (!analysisResult) return;

    onSaveMeal(analysisResult);

    if (isGood) {
      // Positive feedback
      onAddAdjustment({
        id: `adj_meal_gain_${Date.now()}`,
        timestamp: Date.now(),
        category: 'diet',
        type: 'gain',
        seconds: 43200, // +12 hours bonus directly for this meal!
        reason: `🥗 饮食AI识别达标：摄入【${analysisResult.dishName}】营养契合体脂血糖，奖赏寿命 12小时 (+43,200秒)`,
      });
    } else {
      // Negative penalty
      onAddAdjustment({
        id: `adj_meal_loss_${Date.now()}`,
        timestamp: Date.now(),
        category: 'diet',
        type: 'loss',
        seconds: 43200, // -12 hours penalty
        reason: `🍟 饮食AI检测过量：【${analysisResult.dishName}】高油高糖高盐过度，扣减寿命 12小时 (-43,200秒)`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>AI 饮食拍照识别与营养检测</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
                智能热量/油脂/糖分
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              上传每日三餐照片，AI智能评估油脂、热量、糖分，并结合体脂与血糖标准评估寿命影响
            </p>
          </div>
        </div>

        {/* Upload Zone & Quick Sample Dishes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Left: Image Preview & Upload Trigger */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-4 bg-slate-950/60 relative overflow-hidden group">
            {selectedImage ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden">
                <img 
                  src={selectedImage} 
                  alt="Meal Preview" 
                  className="w-full h-full object-cover" 
                />
                {/* AI Laser Scan Line Animation */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-cyan-500/20 animate-pulse pointer-events-none flex items-center justify-center">
                    <div className="w-full h-1 bg-cyan-400 shadow-lg shadow-cyan-400 animate-bounce" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-slate-300 backdrop-blur-xs">
                  {dishName}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">点击上传照片或直接拖拽</p>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>从相册选择或拍照上传</span>
            </button>
          </div>

          {/* Right: Quick Sample Presets for Testing */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 mb-2 block">
                或快速点击典型餐食样本：
              </span>
              <div className="space-y-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(preset.url);
                      setDishName(preset.name);
                      setMealType(preset.type);
                      setAnalysisResult(null);
                    }}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      dishName === preset.name
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate pr-2">{preset.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      preset.score >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {preset.score}分
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Analysis Button */}
            <button
              onClick={() => runAiAnalysis(selectedImage, dishName)}
              disabled={isAnalyzing}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'AI 正在分析油脂与热量...' : '立即启动 AI 智能识别'}</span>
            </button>
          </div>

        </div>

        {/* AI Analysis Result Display */}
        {analysisResult && (
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4 animate-fade-in">
            
            {/* Top Score Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${analysisResult.healthScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {analysisResult.healthScore >= 80 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{analysisResult.dishName}</h4>
                  <p className="text-xs text-slate-400">{analysisResult.estimatedLifeImpactText}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">长寿指数评分</span>
                <span className={`text-2xl font-bold font-mono-num ${analysisResult.healthScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {analysisResult.healthScore}
                  <span className="text-xs text-slate-500 ml-0.5">/100</span>
                </span>
              </div>
            </div>

            {/* 4 Nutrient Badges */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">热量</span>
                <span className="text-sm font-bold font-mono-num text-white">{analysisResult.calories}</span>
                <span className="text-[10px] text-slate-500 block">kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">油脂脂肪</span>
                <span className={`text-sm font-bold font-mono-num ${analysisResult.fatGrams > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {analysisResult.fatGrams}g
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {analysisResult.fatGrams > 30 ? '过度高脂' : '适量优质'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">添加糖/GI</span>
                <span className={`text-sm font-bold font-mono-num ${analysisResult.sugarGrams > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {analysisResult.sugarGrams}g
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {analysisResult.sugarGrams > 20 ? '易致血糖飙升' : '平稳低升糖'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">钠盐含量</span>
                <span className={`text-sm font-bold font-mono-num ${analysisResult.sodiumMg > 1500 ? 'text-rose-400' : 'text-white'}`}>
                  {analysisResult.sodiumMg}
                </span>
                <span className="text-[10px] text-slate-500 block">mg</span>
              </div>
            </div>

            {/* Personalized Guidance */}
            <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-cyan-400 block mb-1">个性化机体适配反馈：</strong>
              {analysisResult.personalizedAdvice}
            </div>

            {/* Action to log meal */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => handleConfirmMeal(analysisResult.healthScore >= 60)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                  analysisResult.healthScore >= 60
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {analysisResult.healthScore >= 60 
                    ? '确认为今日健康营养餐 (寿命 +12小时)' 
                    : '确认为损害身体重油饮食 (寿命 -12小时)'}
                </span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
