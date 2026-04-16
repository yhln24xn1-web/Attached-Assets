import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import Step1Sub1BasicInfo from "@/components/wizard/Step1Sub1BasicInfo";
import Step1Sub2Architecture from "@/components/wizard/Step1Sub2Architecture";
import type { BasicInfoFormValues, ArchitectureFormValues, WizardData } from "@/components/wizard/types";

type Step = 1 | 2;

const STEPS = [
  { id: 1, label: "Thông tin cơ bản" },
  { id: 2, label: "Kiến trúc & Nội thất" },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                style={{
                  background: done
                    ? "rgba(34,197,94,0.15)"
                    : active
                    ? "linear-gradient(135deg, #ff7b00, #ff4800)"
                    : "rgba(255,255,255,0.06)",
                  border: done
                    ? "1px solid rgba(34,197,94,0.4)"
                    : active
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: active ? "0 0 14px rgba(255,100,0,0.4)" : "none",
                  color: done ? "#22c55e" : active ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              >
                {done ? <CheckCircle2 size={13} /> : s.id}
              </div>
              <span
                className="text-xs font-medium hidden sm:block transition-colors duration-300"
                style={{ color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="mx-3 transition-all duration-500"
                style={{
                  width: 28,
                  height: 1,
                  background: done ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -30 }),
};

export default function NewProjectWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    basicInfo: null,
    architecture: null,
  });

  function goTo(next: Step, dir: number) {
    setDirection(dir);
    setStep(next);
  }

  function handleBasicInfoNext(data: BasicInfoFormValues) {
    setWizardData((prev) => ({ ...prev, basicInfo: data }));
    goTo(2, 1);
  }

  function handleArchBack() {
    goTo(1, -1);
  }

  function handleArchNext(data: ArchitectureFormValues) {
    const final: WizardData = { ...wizardData, architecture: data };
    setWizardData(final);
    console.log("✅ Wizard complete:", final);
    setLocation("/dashboard");
  }

  const subtitle =
    step === 1
      ? "Nhập thông tin cơ bản để bắt đầu hành trình"
      : "Chọn phong cách kiến trúc phù hợp với không gian của bạn";

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0e16" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,100,0,0.06) 0%, transparent 70%)",
        }}
      />

      <header
        className="sticky top-0 z-40 px-4 sm:px-6"
        style={{
          background: "rgba(10,14,22,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-1.5 text-sm transition-colors duration-200 hover:text-white/70 flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </button>

          <StepIndicator current={step} />

          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #ff7b00, #ff4500)",
              boxShadow: "0 0 14px rgba(255,100,0,0.4)",
            }}
          >
            B
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255,123,0,0.1)",
              border: "1px solid rgba(255,123,0,0.2)",
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "#ff7b00" }} />
          </div>
          <div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={step}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {step === 1 ? "Thông tin dự án" : "Kiến trúc & Nội thất"}
              </motion.h1>
            </AnimatePresence>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.32)" }}>
              {subtitle}
            </p>
          </div>
        </motion.div>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(15,19,28,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: "easeInOut" }}
              >
                <Step1Sub1BasicInfo
                  defaultValues={wizardData.basicInfo}
                  onNext={handleBasicInfoNext}
                />
              </motion.div>
            )}

            {step === 2 && wizardData.basicInfo && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: "easeInOut" }}
              >
                <Step1Sub2Architecture
                  floors={wizardData.basicInfo.floors}
                  defaultValues={wizardData.architecture}
                  onBack={handleArchBack}
                  onNext={handleArchNext}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p
          className="text-center text-[11px] mt-5"
          style={{ color: "rgba(255,255,255,0.14)" }}
        >
          Bước {step} / {STEPS.length} — dữ liệu được lưu khi quay lại
        </p>
      </main>
    </div>
  );
}
