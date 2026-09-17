import React from 'react';

interface MacroBarsProps {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export const MacroBars: React.FC<MacroBarsProps> = ({
  protein,
  carbs,
  fat,
}) => {
  const calcPercent = (cur: number, target: number) => {
    if (!target) return 0;
    return Math.min(100, Math.round((cur / target) * 100));
  };

  const pPct = calcPercent(protein.current, protein.target);
  const cPct = calcPercent(carbs.current, carbs.target);
  const fPct = calcPercent(fat.current, fat.target);

  return (
    <div className="grid grid-cols-3 gap-3 px-5 my-3 select-none">
      {/* 蛋白质 */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-800">蛋白质</span>
          <span className="text-[11px] font-semibold text-slate-400">{pPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pPct}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">
          {protein.current}g / {protein.target}g
        </div>
      </div>

      {/* 碳水化合物 */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-800">碳水</span>
          <span className="text-[11px] font-semibold text-slate-400">{cPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${cPct}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">
          {carbs.current}g / {carbs.target}g
        </div>
      </div>

      {/* 脂肪 */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-800">脂肪</span>
          <span className="text-[11px] font-semibold text-slate-400">{fPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${fPct}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">
          {fat.current}g / {fat.target}g
        </div>
      </div>
    </div>
  );
};
