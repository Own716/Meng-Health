import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalorieRing } from './components/CalorieRing';
import { MacroBars } from './components/MacroBars';
import { AiSmartLogCard } from './components/AiSmartLogCard';
import { MealCards } from './components/MealCards';
import { FloatingNavBar, NavTab } from './components/FloatingNavBar';
import { AddFoodModal } from './components/AddFoodModal';
import { AiLogModal } from './components/AiLogModal';
import { ProfileModal } from './components/ProfileModal';
import { BackupModal } from './components/BackupModal';
import { CalendarModal } from './components/CalendarModal';
import { AiPlanModal } from './components/AiPlanModal';
import { AiConfigModal } from './components/AiConfigModal';
import { SettingsModal } from './components/SettingsModal';
import { JournalView } from './components/JournalView';
import { ProgressView } from './components/ProgressView';
import { CheckCircle2, Settings, Sparkles, User, ChevronRight } from 'lucide-react';
import {
  getTodayString,
  getDayLog,
  getUserProfile,
  saveUserProfile,
  saveDayLog,
  addFoodToMeal,
  removeFoodFromMeal,
} from './services/storageService';
import { DayLog, FoodItem, MealType, UserProfile } from './types/diet';

export function App() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [dayLog, setDayLog] = useState<DayLog>(getDayLog(getTodayString()));
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // 全局 Toast 提示状态
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 弹窗状态
  const [addFoodModalOpen, setAddFoodModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [aiPlanModalOpen, setAiPlanModalOpen] = useState(false);
  const [aiConfigModalOpen, setAiConfigModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // 当切换日期时，加载对应日期的记录
  useEffect(() => {
    setDayLog(getDayLog(currentDate));
  }, [currentDate]);

  // 重新加载所有数据（导入备份或重置后）
  const handleReloadAll = () => {
    const p = getUserProfile();
    setProfile(p);
    setDayLog(getDayLog(currentDate));
    showToast('数据已全面同步刷新！');
  };

  // 添加单项食物
  const handleAddFood = (food: Omit<FoodItem, 'id'>) => {
    const updated = addFoodToMeal(currentDate, activeMealType, food);
    setDayLog({ ...updated });
    showToast(`已成功添加「${food.name}」(${food.calories}大卡)`);
  };

  // 批量添加 AI 识别结果食物
  const handleAddAiFoods = (mealType: MealType, foods: Omit<FoodItem, 'id'>[]) => {
    let latestLog = dayLog;
    for (const food of foods) {
      latestLog = addFoodToMeal(currentDate, mealType, food);
    }
    setDayLog({ ...latestLog });
    showToast(`已成功将 AI 识别的 ${foods.length} 样食物存入今日记录！`);
  };

  // 删除食物
  const handleDeleteFood = (mealType: MealType, foodId: string) => {
    const updated = removeFoodFromMeal(currentDate, mealType, foodId);
    setDayLog({ ...updated });
    showToast('已删除该饮食条目');
  };

  // 更新个人资料并持久化同步今日指标
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);

    // 同步更新并持久化保存当前日期的预算和营养素指标
    const log = getDayLog(currentDate);
    log.budgetCalories = updatedProfile.dailyBudget;
    log.targetProtein = updatedProfile.targetProtein;
    log.targetCarbs = updatedProfile.targetCarbs;
    log.targetFat = updatedProfile.targetFat;
    saveDayLog(log);
    setDayLog({ ...log });

    showToast(`个人目标已保存！每日预算已设定为 ${updatedProfile.dailyBudget} 大卡`);
  };

  // 应用 AI 智能测算出的减脂方案（关键修复：完整持久化存入 localStorage 并立刻生效）
  const handleApplyAiPlan = (updatedProfile: UserProfile) => {
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);

    // 同步更新并持久化保存当前日期的预算和营养素指标
    const log = getDayLog(currentDate);
    log.budgetCalories = updatedProfile.dailyBudget;
    log.targetProtein = updatedProfile.targetProtein;
    log.targetCarbs = updatedProfile.targetCarbs;
    log.targetFat = updatedProfile.targetFat;
    saveDayLog(log);
    setDayLog({ ...log });

    showToast(`✨ AI 减脂计划已生效！每日摄入预算设定为 ${updatedProfile.dailyBudget} 大卡`);
  };

  // 计算今日三大营养素总和
  const calculateTotalMacros = () => {
    let p = 0;
    let c = 0;
    let f = 0;
    const meals = Object.values(dayLog.meals);
    for (const meal of meals) {
      for (const item of meal.items) {
        p += item.protein || 0;
        c += item.carbs || 0;
        f += item.fat || 0;
      }
    }
    return {
      protein: { current: Math.round(p), target: dayLog.targetProtein || profile.targetProtein },
      carbs: { current: Math.round(c), target: dayLog.targetCarbs || profile.targetCarbs },
      fat: { current: Math.round(f), target: dayLog.targetFat || profile.targetFat },
    };
  };

  const macros = calculateTotalMacros();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center selection:bg-blue-100">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-50 relative pb-safe">
        {/* 全局提示 Toast */}
        {toastMessage && (
          <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slideDown">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/20">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 顶部导航栏（支持左右滑动切换日期、上周下周、全月日历） */}
        <Header
          currentDate={currentDate}
          onSelectDate={(d) => {
            setCurrentDate(d);
            setActiveTab('home');
          }}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenCalendar={() => setCalendarModalOpen(true)}
        />

        {/* 页面内容主体：切换日期时带平滑淡入动效 */}
        <main key={currentDate + activeTab} className="flex-1 overflow-y-auto animate-fadeIn transition-opacity duration-300">
          {activeTab === 'home' && (
            <div>
              {/* 核心能量圆环 (已彻底修复文字与线条重叠 Bug) */}
              <CalorieRing
                budget={dayLog.budgetCalories || profile.dailyBudget}
                consumed={dayLog.consumedCalories}
              />

              {/* 三大营养素进度条 */}
              <MacroBars
                protein={macros.protein}
                carbs={macros.carbs}
                fat={macros.fat}
              />

              {/* ✨ AI 智能速记卡片 & 摄入/摄出量计划测算入口 */}
              <AiSmartLogCard
                onOpenAiLog={() => setAiModalOpen(true)}
                onOpenAiPlan={() => setAiPlanModalOpen(true)}
              />

              {/* 四餐记录卡片列表 */}
              <MealCards
                dayLog={dayLog}
                onAddFood={(m) => {
                  setActiveMealType(m);
                  setAddFoodModalOpen(true);
                }}
                onDeleteFood={handleDeleteFood}
                onCameraFood={(m) => {
                  setActiveMealType(m);
                  setAiModalOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === 'meals' && (
            <div className="pt-2 px-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">今日餐次与食物记录</h2>
                <span className="text-xs text-slate-400">已摄入 {dayLog.consumedCalories} 大卡</span>
              </div>
              <MealCards
                dayLog={dayLog}
                onAddFood={(m) => {
                  setActiveMealType(m);
                  setAddFoodModalOpen(true);
                }}
                onDeleteFood={handleDeleteFood}
                onCameraFood={(m) => {
                  setActiveMealType(m);
                  setAiModalOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === 'journal' && (
            <JournalView
              onSelectDate={(d) => {
                setCurrentDate(d);
                setActiveTab('home');
              }}
            />
          )}

          {activeTab === 'progress' && <ProgressView profile={profile} />}

          {activeTab === 'profile' && (
            <div className="px-5 pt-3 pb-28 space-y-3.5">
              {/* 用户信息卡片 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-400/30">
                  {profile.nickname?.substring(0, 1) || '梦'}
                </div>
                <h3 className="font-bold text-base text-slate-900">{profile.nickname || '梦梦'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hi, {profile.nickname || '梦梦'} · 坚持记录，遇见更好的自己</p>
                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div>身高 <span className="font-bold text-slate-800">{profile.height}</span> cm</div>
                  <div>当前 <span className="font-bold text-slate-800">{profile.currentWeight}</span> kg</div>
                  <div>目标 <span className="font-bold text-emerald-600">{profile.targetWeight}</span> kg</div>
                </div>
              </div>

              {/* 选项 (a): AI 智能计算摄入量与摄出量 */}
              <button
                onClick={() => setAiPlanModalOpen(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white text-left flex justify-between items-center shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">AI 智能计算摄入量与摄出量</div>
                    <div className="text-[11px] text-blue-100 font-normal mt-0.5">基于代谢算法与减脂周期智能测算</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 选项 (b): 修改个人身材与基础热量 */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left flex justify-between items-center shadow-sm active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">修改个人身材与基础热量</div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">身高、当前体重、目标体重与基础代谢</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 页面最下方：系统综合设置选项 */}
              <div className="pt-2">
                <button
                  onClick={() => setSettingsModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-left flex justify-between items-center transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings size={17} className="text-slate-500 group-hover:rotate-45 transition-transform duration-300" />
                    <span className="text-xs font-bold text-slate-700">系统综合设置</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[11px]">AI大模型接口 / 备份 / 偏好</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 悬浮毛玻璃底栏 */}
        <FloatingNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* 添加食物弹窗 */}
        <AddFoodModal
          isOpen={addFoodModalOpen}
          mealType={activeMealType}
          onClose={() => setAddFoodModalOpen(false)}
          onAdd={handleAddFood}
          onOpenAiCamera={(m) => {
            setActiveMealType(m);
            setAddFoodModalOpen(false);
            setAiModalOpen(true);
          }}
        />

        {/* ✨ AI 智能拍照速记弹窗 */}
        <AiLogModal
          isOpen={aiModalOpen}
          initialMealType={activeMealType}
          onClose={() => setAiModalOpen(false)}
          onAddAiFood={handleAddAiFoods}
          onOpenAiConfig={() => setAiConfigModalOpen(true)}
        />

        {/* ✨ AI 智能摄入/摄出量测算与计划弹窗 */}
        <AiPlanModal
          isOpen={aiPlanModalOpen}
          profile={profile}
          onClose={() => setAiPlanModalOpen(false)}
          onApplyPlan={handleApplyAiPlan}
        />

        {/* 全月日历挑选弹窗 */}
        <CalendarModal
          isOpen={calendarModalOpen}
          currentDate={currentDate}
          onClose={() => setCalendarModalOpen(false)}
          onSelectDate={(d) => {
            setCurrentDate(d);
            setActiveTab('home');
          }}
        />

        {/* 个人身材目标弹窗 */}
        <ProfileModal
          isOpen={profileModalOpen}
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onUpdateProfile={handleUpdateProfile}
          onOpenAiPlan={() => {
            setProfileModalOpen(false);
            setAiPlanModalOpen(true);
          }}
        />

        {/* 数据备份与换机迁移弹窗 */}
        <BackupModal
          isOpen={backupModalOpen}
          onClose={() => setBackupModalOpen(false)}
          onDataRestored={handleReloadAll}
          onOpenAiConfig={() => setAiConfigModalOpen(true)}
        />

        {/* 🤖 AI 模型与 API Key 配置弹窗 */}
        <AiConfigModal
          isOpen={aiConfigModalOpen}
          onClose={() => setAiConfigModalOpen(false)}
          onConfigSaved={() => showToast('AI 接口配置已成功保存生效！')}
        />

        {/* ⚙️ 系统综合设置弹窗 */}
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          onOpenAiConfig={() => {
            setSettingsModalOpen(false);
            setAiConfigModalOpen(true);
          }}
          onOpenBackup={() => {
            setSettingsModalOpen(false);
            setBackupModalOpen(true);
          }}
          onClearCache={() => showToast('本地临时缓存已成功清理！')}
        />
      </div>
    </div>
  );
}

export default App;
