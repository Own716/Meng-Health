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
import { JournalView } from './components/JournalView';
import { ProgressView } from './components/ProgressView';
import { CheckCircle2 } from 'lucide-react';
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
    showToast(`已成功添加「${food.name}」(${food.calories}千卡)`);
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

    // 关键修复：同步更新并持久化保存当前日期的预算和营养素指标
    const log = getDayLog(currentDate);
    log.budgetCalories = updatedProfile.dailyBudget;
    log.targetProtein = updatedProfile.targetProtein;
    log.targetCarbs = updatedProfile.targetCarbs;
    log.targetFat = updatedProfile.targetFat;
    saveDayLog(log);
    setDayLog({ ...log });

    showToast(`个人目标已保存！每日预算已设定为 ${updatedProfile.dailyBudget} 千卡`);
  };

  // 应用 AI 智能测算出的减脂方案（关键修复：确保持久化存入 localStorage 并立刻生效）
  const handleApplyAiPlan = (newBudget: number, protein: number, carbs: number, fat: number) => {
    const updated: UserProfile = {
      ...profile,
      dailyBudget: newBudget,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFat: fat,
    };
    saveUserProfile(updated);
    setProfile(updated);

    // 关键修复：调用 saveDayLog 真正写入本地数据库并刷新页面
    const log = getDayLog(currentDate);
    log.budgetCalories = newBudget;
    log.targetProtein = protein;
    log.targetCarbs = carbs;
    log.targetFat = fat;
    saveDayLog(log);
    setDayLog({ ...log });

    showToast(`✨ AI 减脂计划已生效！每日摄入预算设定为 ${newBudget} 千卡`);
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
              />
            </div>
          )}

          {activeTab === 'meals' && (
            <div className="pt-2 px-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">今日餐次与食物记录</h2>
                <span className="text-xs text-slate-400">已摄入 {dayLog.consumedCalories} 千卡</span>
              </div>
              <MealCards
                dayLog={dayLog}
                onAddFood={(m) => {
                  setActiveMealType(m);
                  setAddFoodModalOpen(true);
                }}
                onDeleteFood={handleDeleteFood}
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
            <div className="px-5 pt-3 pb-28 space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-400/30">
                  {profile.nickname.substring(0, 1) || '梦'}
                </div>
                <h3 className="font-bold text-base text-slate-900">梦梦</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hi, 梦梦 · 坚持记录，遇见更好的自己</p>
                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div>身高 <span className="font-bold text-slate-800">{profile.height}</span> cm</div>
                  <div>当前 <span className="font-bold text-slate-800">{profile.currentWeight}</span> kg</div>
                  <div>目标 <span className="font-bold text-emerald-600">{profile.targetWeight}</span> kg</div>
                </div>
              </div>

              {/* AI 智能计划入口 */}
              <button
                onClick={() => setAiPlanModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold text-left flex justify-between items-center shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all"
              >
                <span>✨ AI 智能计算摄入量与摄出量 (生成计划)</span>
                <span>去测算 &gt;</span>
              </button>

              {/* 快捷进入目标修改 */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 text-left flex justify-between items-center shadow-sm"
              >
                <span>修改个人身材与基础热量</span>
                <span className="text-slate-400">&gt;</span>
              </button>

              {/* 快捷进入备份中心 */}
              <button
                onClick={() => setBackupModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold text-left flex justify-between items-center shadow-md shadow-emerald-500/20"
              >
                <span>数据备份与换机导出中心</span>
                <span>立即进入 &gt;</span>
              </button>
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
        />

        {/* ✨ AI 智能拍照速记弹窗 */}
        <AiLogModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onAddAiFood={handleAddAiFoods}
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
          onOpenBackup={() => setBackupModalOpen(true)}
          onOpenAiPlan={() => setAiPlanModalOpen(true)}
        />

        {/* 数据备份与换机迁移弹窗 */}
        <BackupModal
          isOpen={backupModalOpen}
          onClose={() => setBackupModalOpen(false)}
          onDataRestored={handleReloadAll}
        />
      </div>
    </div>
  );
}

export default App;
