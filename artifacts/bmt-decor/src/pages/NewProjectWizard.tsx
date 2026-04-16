import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, CheckCircle2, MessageSquareText } from "lucide-react";
import Step1Sub1BasicInfo from "@/components/wizard/Step1Sub1BasicInfo";
import Step1Sub2Architecture from "@/components/wizard/Step1Sub2Architecture";
import Step1Sub3References from "@/components/wizard/Step1Sub3References";
import Step2ChatRequirements from "@/components/wizard/step2/Step2ChatRequirements";
import type {
  BasicInfoFormValues,
  ArchitectureFormValues,
  ReferencesFormValues,
  WizardData,
} from "@/components/wizard/types";
import type { Step2ChatOutput } from "@/components/wizard/step2/types";

type InternalStep = 1 | 2 | 3 | 4;

const MAJOR_PHASES = [
  { id: 1, label: "Thông tin", internalSteps: [1, 2, 3] as number[] },
  { id: 2, label: "Yêu cầu",   internalSteps: [4] as number[] },
  { id: 3, label: "Phân tích", internalSteps: [] as number[] },
];

const SUB_STEP_LABELS: Record<number, string> = {
  1: "Dữ liệu",
  2: "Kiến trúc",
  3: "Tài liệu",
};

function getMajorPhase(step: InternalStep): number {
  for (const p of MAJOR_PHASES) {
    if (p.internalSteps.includes(step)) return p.id;
  }
  return 3;
}

function StepIndicator({ currentInternal }: { currentInternal: InternalStep }) {
  const currentMajor = getMajorPhase(currentInternal);
  return (
    <div className="flex items-center">
      {MAJOR_PHASES.map((phase, i) => {
        const done = currentMajor > phase.id;
        const active = currentMajor === phase.id;
        return (
          <div key={phase.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
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
                {done ? <CheckCircle2 size={13} /> : phase.id}
              </div>
              <span
                className="text-xs font-medium hidden sm:block transition-colors duration-300"
                style={{ color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)" }}
              >
                {phase.label}
              </span>
            </div>
            {i < MAJOR_PHASES.length - 1 && (
              <div
                className="mx-2 sm:mx-3 flex-shrink-0 transition-all duration-500"
                style={{
                  width: 20,
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

function SubStepDots({ currentInternal }: { currentInternal: InternalStep }) {
  if (currentInternal > 3) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className="flex items-center gap-1 transition-all duration-300"
        >
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width: currentInternal === s ? 16 : 6,
              height: 6,
              background:
                currentInternal > s
                  ? "rgba(34,197,94,0.5)"
                  : currentInternal === s
                  ? "#ff7b00"
                  : "rgba(255,255,255,0.1)",
            }}
          />
          {currentInternal === s && (
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {SUB_STEP_LABELS[s]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const STEP_HEADER: Record<InternalStep, { title: string; sub: string; icon: React.ReactNode }> = {
  1: { title: "Thông tin dự án", sub: "Nhập thông tin cơ bản để bắt đầu hành trình", icon: <Sparkles className="w-5 h-5" style={{ color: "#ff7b00" }} /> },
  2: { title: "Kiến trúc & Nội thất", sub: "Chọn phong cách kiến trúc phù hợp với không gian", icon: <Sparkles className="w-5 h-5" style={{ color: "#ff7b00" }} /> },
  3: { title: "Tài liệu tham khảo", sub: "Tải lên bản vẽ, ảnh hiện trạng và tài liệu", icon: <Sparkles className="w-5 h-5" style={{ color: "#ff7b00" }} /> },
  4: { title: "Yêu cầu chi tiết", sub: "Trò chuyện với AI để xác định thông số xây dựng", icon: <MessageSquareText className="w-5 h-5" style={{ color: "#ff7b00" }} /> },
};

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -30 }),
};

export default function NewProjectWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<InternalStep>(1);
  const [direction, setDirection] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    basicInfo: null,
    architecture: null,
    references: null,
    chatRequirements: null,
  });

  function goTo(next: InternalStep, dir: number) {
    setDirection(dir);
    setStep(next);
  }

  function handleBasicInfoNext(data: BasicInfoFormValues) {
    setWizardData((p) => ({ ...p, basicInfo: data }));
    goTo(2, 1);
  }

  function handleArchBack() { goTo(1, -1); }
  function handleArchNext(data: ArchitectureFormValues) {
    setWizardData((p) => ({ ...p, architecture: data }));
    goTo(3, 1);
  }

  function handleRefsBack() { goTo(2, -1); }
  function handleRefsNext(data: ReferencesFormValues) {
    setWizardData((p) => ({ ...p, references: data }));
    goTo(4, 1);
  }

  function handleChatComplete(data: Step2ChatOutput) {
    const final: WizardData = { ...wizardData, chatRequirements: data };
    setWizardData(final);
    console.log("✅ Wizard complete:", final);
    setLocation("/dashboard");
  }

  const header = STEP_HEADER[step];

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

          <StepIndicator currentInternal={step} />

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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 flex items-start gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: "rgba(255,123,0,0.1)",
              border: "1px solid rgba(255,123,0,0.2)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.18 }}>
                {header.icon}
              </motion.div>
            </AnimatePresence>
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
                {header.title}
              </motion.h1>
            </AnimatePresence>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.32)" }}>
              {header.sub}
            </p>
            <SubStepDots currentInternal={step} />
          </div>
        </motion.div>

        <div
          className="rounded-2xl"
          style={{
            background: "rgba(15,19,28,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
            padding: step === 4 ? "20px 16px" : "24px 24px",
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.26, ease: "easeInOut" }}>
                <Step1Sub1BasicInfo defaultValues={wizardData.basicInfo} onNext={handleBasicInfoNext} />
              </motion.div>
            )}

            {step === 2 && wizardData.basicInfo && (
              <motion.div key="s2" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.26, ease: "easeInOut" }}>
                <Step1Sub2Architecture
                  floors={wizardData.basicInfo.floors}
                  defaultValues={wizardData.architecture}
                  onBack={handleArchBack}
                  onNext={handleArchNext}
                />
              </motion.div>
            )}

            {step === 3 && wizardData.basicInfo && (
              <motion.div key="s3" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.26, ease: "easeInOut" }}>
                <Step1Sub3References
                  totalFloors={wizardData.basicInfo.floors}
                  defaultValues={wizardData.references}
                  onBack={handleRefsBack}
                  onNext={handleRefsNext}
                />
              </motion.div>
            )}

            {step === 4 && wizardData.basicInfo && (
              <motion.div key="s4" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>
                <Step2ChatRequirements
                  basicInfo={wizardData.basicInfo}
                  onComplete={handleChatComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p
          className="text-center text-[11px] mt-4"
          style={{ color: "rgba(255,255,255,0.14)" }}
        >
          {step <= 3
            ? `Bước 1.${step} / 3 — dữ liệu được lưu khi quay lại`
            : `Bước 2.1 — hoàn tất yêu cầu để AI phân tích`}
        </p>
      </main>
    </div>
  );
}
