import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { basicInfoSchema } from "./schemas";
import type { BasicInfoFormValues } from "./types";
import { FLOOR_OPTIONS, BUDGET_SLIDER_MIN, BUDGET_SLIDER_MAX, BUDGET_SLIDER_STEP } from "./constants";
import { calcSite, formatBudget } from "./calculation";

interface Props {
  defaultValues?: BasicInfoFormValues | null;
  onNext: (data: BasicInfoFormValues) => void;
}

const INPUT =
  "w-full h-11 px-4 rounded-xl text-white text-sm placeholder:text-white/20 outline-none " +
  "transition-all duration-200 bg-white/[0.04] border border-white/[0.08] " +
  "hover:border-white/[0.14] hover:bg-white/[0.05] " +
  "focus:border-orange-500/50 focus:bg-white/[0.06] " +
  "focus:[box-shadow:0_0_0_2px_rgba(255,123,0,0.18),0_0_24px_rgba(255,123,0,0.07)]";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
      {children}
    </label>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-red-400 text-[11px] mt-0.5"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function Step1Sub1BasicInfo({ defaultValues, onNext }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: defaultValues ?? {
      projectName: "",
      lotWidth: 5,
      lotLength: 20,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2,
      budget: 1500,
    },
  });

  const [budgetLocked, setBudgetLocked] = useState(!!defaultValues?.budget);
  const autoCalcRef = useRef(0);

  const lotWidth = watch("lotWidth");
  const lotLength = watch("lotLength");
  const floors = watch("floors");
  const budget = watch("budget") ?? 0;

  const calc = calcSite({ lotWidth, lotLength, floors });

  useEffect(() => {
    if (budgetLocked) return;
    const auto = calc.nganSachTrieu;
    if (auto > 0) {
      autoCalcRef.current = auto;
      setValue("budget", auto, { shouldValidate: false });
    }
  }, [calc.nganSachTrieu, budgetLocked, setValue]);

  const sliderVal = Math.min(Math.max(Number(budget) || 0, BUDGET_SLIDER_MIN), BUDGET_SLIDER_MAX);

  function handleBudgetManual(value: number) {
    setBudgetLocked(true);
    setValue("budget", value, { shouldValidate: true });
  }

  function resetAutoCalc() {
    setBudgetLocked(false);
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Tên dự án</Label>
        <input
          {...register("projectName")}
          placeholder="VD: Biệt thự gia đình Nguyễn Văn A"
          className={INPUT}
          autoComplete="off"
        />
        <FieldErr msg={errors.projectName?.message} />
      </div>

      <div className="space-y-1.5">
        <Label>Kích thước lô đất</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="relative">
              <input
                {...register("lotWidth")}
                type="number"
                step="0.5"
                placeholder="5"
                className={INPUT + " pr-10"}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none">
                m
              </span>
            </div>
            <p className="text-[11px] text-white/25">Chiều rộng (3–20m)</p>
            <FieldErr msg={errors.lotWidth?.message} />
          </div>
          <div className="space-y-1">
            <div className="relative">
              <input
                {...register("lotLength")}
                type="number"
                step="0.5"
                placeholder="20"
                className={INPUT + " pr-10"}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none">
                m
              </span>
            </div>
            <p className="text-[11px] text-white/25">Chiều dài (5–60m)</p>
            <FieldErr msg={errors.lotLength?.message} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {calc.dienTichDat > 0 && (
            <motion.div
              key={`${calc.dienTichDat}-${calc.tongDienTich}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 pt-1 flex-wrap"
            >
              <span className="text-[11px] text-white/30 flex items-center gap-1">
                <span>📐</span>
                <span>DT đất:</span>
                <motion.span
                  key={calc.dienTichDat}
                  initial={{ color: "#ff9500" }}
                  animate={{ color: "#ffffff99" }}
                  transition={{ duration: 0.8 }}
                  className="font-semibold"
                  style={{ color: "rgba(255,149,0,0.75)" }}
                >
                  {calc.dienTichDat.toFixed(0)}m²
                </motion.span>
              </span>
              <span className="text-white/10">|</span>
              <span className="text-[11px] text-white/30 flex items-center gap-1">
                <span>🏗️</span>
                <span>Tổng DTXD:</span>
                <motion.span
                  key={calc.tongDienTich}
                  initial={{ color: "#ff9500" }}
                  animate={{ color: "#ffffff99" }}
                  transition={{ duration: 0.8 }}
                  className="font-semibold"
                  style={{ color: "rgba(255,149,0,0.75)" }}
                >
                  {calc.tongDienTich.toFixed(0)}m²
                </motion.span>
              </span>
              <span className="text-white/10">|</span>
              <span className="text-[11px] text-white/30 flex items-center gap-1">
                <span>💰</span>
                <span>Ước tính:</span>
                <motion.span
                  key={calc.nganSachTrieu}
                  initial={{ color: "#ff9500" }}
                  animate={{ color: "#ffffff99" }}
                  transition={{ duration: 0.8 }}
                  style={{ color: "rgba(255,149,0,0.75)" }}
                  className="font-semibold"
                >
                  {formatBudget(calc.nganSachTrieu)}
                </motion.span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Số tầng</Label>
          <select
            {...register("floors")}
            className={INPUT + " cursor-pointer appearance-none"}
            style={{ colorScheme: "dark" }}
          >
            {FLOOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#0f131c" }}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldErr msg={errors.floors?.message} />
        </div>
        <div className="space-y-1.5">
          <Label>Phòng ngủ</Label>
          <input
            {...register("bedrooms")}
            type="number"
            min={0}
            max={20}
            placeholder="3"
            className={INPUT}
          />
          <FieldErr msg={errors.bedrooms?.message} />
        </div>
        <div className="space-y-1.5">
          <Label>Phòng tắm</Label>
          <input
            {...register("bathrooms")}
            type="number"
            min={1}
            max={20}
            placeholder="2"
            className={INPUT}
          />
          <FieldErr msg={errors.bathrooms?.message} />
        </div>
      </div>

      <div
        className="space-y-3 rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Label>Ngân sách dự kiến</Label>
            <AnimatePresence>
              {budgetLocked && (
                <motion.button
                  type="button"
                  onClick={resetAutoCalc}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  title="Tính lại tự động"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ background: "rgba(255,149,0,0.12)", color: "rgba(255,149,0,0.7)" }}
                >
                  <RotateCcw size={10} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            {budgetLocked && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-white/25"
              >
                Đã chỉnh tay
              </motion.span>
            )}
            <motion.span
              key={budget}
              initial={{ opacity: 0.6, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-base font-bold"
              style={{ color: "#ff9500" }}
            >
              {formatBudget(Number(budget) || 0)}
            </motion.span>
          </div>
        </div>

        <input
          type="range"
          min={BUDGET_SLIDER_MIN}
          max={BUDGET_SLIDER_MAX}
          step={BUDGET_SLIDER_STEP}
          value={sliderVal}
          onChange={(e) => handleBudgetManual(Number(e.target.value))}
          className="w-full h-1.5 rounded-full cursor-pointer appearance-none"
          style={{ accentColor: "#ff7b00" }}
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              {...register("budget")}
              type="number"
              min={100}
              max={50000}
              step={50}
              className={INPUT + " pr-16 text-center"}
              onChange={(e) => handleBudgetManual(Number(e.target.value))}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none">
              triệu
            </span>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-white/20 -mt-1">
          <span>100 triệu</span>
          <span>5 tỷ (dùng ô nhập cho ngân sách lớn hơn)</span>
        </div>
        <FieldErr msg={errors.budget?.message} />
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02, boxShadow: "0 6px 28px rgba(255,100,0,0.45)" }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm"
        style={{
          background: "linear-gradient(135deg, #ff7b00, #ff4800)",
          boxShadow: "0 4px 20px rgba(255,100,0,0.3)",
        }}
      >
        Tiếp tục
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </form>
  );
}
