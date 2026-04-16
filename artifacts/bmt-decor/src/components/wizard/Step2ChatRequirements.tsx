import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, ChevronRight } from "lucide-react";
import {
  buildWelcomeMessage,
  buildCalculationMessage,
  buildFollowupIntroMessage,
  buildCompletionMessage,
  buildRequirementsText,
  FOLLOWUP_QUESTIONS,
} from "./chatFlow";
import {
  calcConstruction,
  parseSetbackInput,
  formatBudgetLabel,
  UNIT_COST_MILLION_PER_M2,
} from "./calculation";
import type {
  BasicInfoFormValues,
  ChatMessage,
  ChatStage,
  ExtractedFacts,
  TechnicalSummary,
  Step2ChatOutput,
  SetbackMode,
} from "./types";

interface Props {
  basicInfo:  BasicInfoFormValues;
  onComplete: (data: Step2ChatOutput) => void;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function makeBotMsg(content: string, chips?: string[]): ChatMessage {
  return { id: uid(), role: "assistant", content, timestamp: Date.now(), chips };
}

function makeUserMsg(content: string): ChatMessage {
  return { id: uid(), role: "user", content, timestamp: Date.now() };
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={{ color: "rgba(255,255,255,0.92)" }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-1">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{
          background: "rgba(255,123,0,0.18)",
          color: "#ff9500",
          border: "1px solid rgba(255,123,0,0.25)",
        }}
      >
        AI
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.35)" }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
        <span className="text-[10px] ml-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          AI đang phân tích thông số kỹ thuật...
        </span>
      </div>
    </div>
  );
}

function TechnicalSummaryCard({ summary }: { summary: TechnicalSummary }) {
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    {
      label: "Diện tích đất",
      value: `${summary.landWidth}×${summary.landLength}m = ${(summary.landWidth * summary.landLength).toFixed(0)}m²`,
    },
    {
      label: "Khoảng chừa sân",
      value: summary.setback === 0 ? "Không chừa (xây hết đất)" : `${summary.setback}m`,
    },
    { label: "Chiều dài xây dựng",     value: `${summary.buildLength.toFixed(1)}m` },
    { label: "Diện tích sàn 1 tầng",   value: `${summary.groundBuildArea.toFixed(1)}m²` },
    { label: "Móng (50% diện tích)",    value: `${summary.foundationArea.toFixed(1)}m²` },
    {
      label: `Thân (${summary.floors} tầng × 100%)`,
      value: `${summary.bodyArea.toFixed(1)}m²`,
    },
    { label: "Mái (50% diện tích)",     value: `${summary.roofArea.toFixed(1)}m²` },
    { label: "Tổng DTXD",              value: `${summary.totalConstructionArea.toFixed(1)}m²`, highlight: true },
    { label: "Đơn giá tạm tính",       value: `${summary.estimatedUnitCostMillionPerM2} triệu/m²` },
    { label: "Ngân sách AI đề xuất",   value: formatBudgetLabel(summary.updatedBudgetMillion), highlight: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden mt-2"
      style={{
        background: "rgba(255,123,0,0.05)",
        border: "1px solid rgba(255,123,0,0.18)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: "1px solid rgba(255,123,0,0.12)" }}
      >
        <span className="text-sm font-bold" style={{ color: "#ff9500" }}>
          📋 Thông số kỹ thuật
        </span>
        <span className="text-[10px] ml-auto" style={{ color: "rgba(255,255,255,0.28)" }}>
          Móng 50% + Thân {summary.floors}×100% + Mái 50%
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
              {r.label}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: r.highlight ? "#ff9500" : "rgba(255,255,255,0.75)" }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Step2ChatRequirements({ basicInfo, onComplete }: Props) {
  const { lotWidth, lotLength, floors } = basicInfo;

  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [stage,          setStage]          = useState<ChatStage>("ask_setback_mode");
  const [isTyping,       setIsTyping]       = useState(false);
  const [inputValue,     setInputValue]     = useState("");
  const [inputError,     setInputError]     = useState<string | null>(null);
  const [facts,          setFacts]          = useState<ExtractedFacts>({
    wantsFullBuild:     null,
    setbackMode:        null,
    setback:            null,
    userAcceptedBudget: null,
    followupAnswers:    {},
  });
  const [summary,        setSummary]        = useState<TechnicalSummary | null>(null);
  const [followupIndex,  setFollowupIndex]  = useState(0);
  const [currentChips,   setCurrentChips]   = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 80);
  }, []);

  function addBot(content: string, chips?: string[], delay = 600) {
    setIsTyping(true);
    setCurrentChips([]);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, makeBotMsg(content, chips)]);
      if (chips) setCurrentChips(chips);
      scrollToBottom();
    }, delay);
  }

  useEffect(() => {
    addBot(buildWelcomeMessage(lotWidth, lotLength, floors), ["Xây hết đất 🏗️", "Có chừa sân 🌿"], 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChip(chip: string) {
    setCurrentChips([]);
    setMessages((prev) => [...prev, makeUserMsg(chip)]);
    scrollToBottom();
    processChip(chip);
  }

  function processChip(chip: string) {
    // ── Stage: ask_setback_mode ──────────────────────────────────────────────
    if (stage === "ask_setback_mode") {
      const fullBuild = chip.startsWith("Xây hết đất");
      const updatedFacts: ExtractedFacts = {
        ...facts,
        wantsFullBuild: fullBuild,
        setback:        fullBuild ? 0 : null,
        setbackMode:    (fullBuild ? "none" : "total") as SetbackMode,
      };
      setFacts(updatedFacts);
      if (fullBuild) {
        startCalculating(updatedFacts, 0);
      } else {
        setStage("ask_setback_value");
        addBot(
          "Bạn muốn chừa bao nhiêu mét? _(Nhập số mét hoặc chọn nhanh bên dưới)_",
          ["1m", "2m", "3m", "4m", "5m"]
        );
        setTimeout(() => inputRef.current?.focus(), 800);
      }
      return;
    }

    // ── Stage: ask_setback_value (quick chip) ────────────────────────────────
    if (stage === "ask_setback_value") {
      const meters = parseSetbackInput(chip.replace("m", ""));
      if (meters !== null) handleSetbackConfirm(meters);
      return;
    }

    // ── Stage: confirm_budget ────────────────────────────────────────────────
    if (stage === "confirm_budget") {
      const accepted = chip.startsWith("✅") || chip.includes("Ổn");
      setFacts((f) => ({ ...f, userAcceptedBudget: accepted }));
      if (accepted) {
        startFollowup({ ...facts, userAcceptedBudget: accepted });
      } else {
        addBot(
          "Không sao! Tôi vẫn tiếp tục phác thảo theo thông số hiện tại. Bạn có thể điều chỉnh ngân sách ở bước trước. Tiếp tục nhé?",
          ["Tiếp tục với thông số này", "Quay lại điều chỉnh"]
        );
      }
      return;
    }

    if (chip === "Tiếp tục với thông số này") {
      startFollowup(facts);
      return;
    }

    // ── Stage: followup_requirements ─────────────────────────────────────────
    if (stage === "followup_requirements") {
      const question   = FOLLOWUP_QUESTIONS[followupIndex];
      const isPositive = chip === question.positiveChip;
      const newFollowup = { ...facts.followupAnswers, [question.key]: isPositive };
      const newFacts    = { ...facts, followupAnswers: newFollowup };
      setFacts(newFacts);

      const nextIndex = followupIndex + 1;
      if (nextIndex < FOLLOWUP_QUESTIONS.length) {
        setFollowupIndex(nextIndex);
        const next = FOLLOWUP_QUESTIONS[nextIndex];
        addBot(next.text, next.chips);
      } else {
        setCurrentChips([]);
        setStage("completed");
        addBot(buildCompletionMessage(newFollowup), undefined, 700);
      }
    }
  }

  function handleSetbackConfirm(meters: number) {
    if (meters < 0) {
      setInputError("Khoảng chừa không được âm.");
      return;
    }
    if (meters >= lotLength) {
      setInputError(`Khoảng chừa phải nhỏ hơn chiều dài đất (${lotLength}m).`);
      return;
    }
    if (lotLength - meters <= 0) {
      setInputError("Chiều dài xây dựng phải lớn hơn 0.");
      return;
    }
    setInputError(null);
    setFacts((f) => ({ ...f, setback: meters }));
    startCalculating({ ...facts, setback: meters }, meters);
  }

  function startCalculating(updatedFacts: ExtractedFacts, setback: number) {
    setStage("calculating");
    setIsTyping(true);
    setCurrentChips([]);

    setTimeout(() => {
      const calc       = calcConstruction(lotWidth, lotLength, floors, setback);
      const newSummary: TechnicalSummary = {
        landWidth:  lotWidth,
        landLength: lotLength,
        floors,
        setback,
        ...calc,
      };
      setSummary(newSummary);
      setIsTyping(false);

      const budgetChips = ["✅ Ổn với tôi", "💸 Hơi cao", "✏️ Tôi muốn điều chỉnh"];
      setMessages((prev) => [...prev, makeBotMsg(buildCalculationMessage(newSummary), budgetChips)]);
      setCurrentChips(budgetChips);
      setStage("confirm_budget");
      scrollToBottom();
    }, 1800);
  }

  function startFollowup(updatedFacts: ExtractedFacts) {
    setFacts(updatedFacts);
    setStage("followup_requirements");
    setFollowupIndex(0);
    addBot(buildFollowupIntroMessage(), undefined, 500);
    setTimeout(() => {
      const first = FOLLOWUP_QUESTIONS[0];
      addBot(first.text, first.chips, 1000);
    }, 600);
  }

  function handleSendText() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (stage !== "ask_setback_value") return;

    const meters = parseSetbackInput(trimmed);
    if (meters === null) {
      setInputError("Vui lòng nhập số mét hợp lệ (ví dụ: 2 hoặc 1.5).");
      return;
    }
    setInputError(null);
    setCurrentChips([]);
    setMessages((prev) => [...prev, makeUserMsg(`Chừa ${meters}m`)]);
    setInputValue("");
    scrollToBottom();
    handleSetbackConfirm(meters);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }

  function handleComplete() {
    if (!summary) return;
    const followup = facts.followupAnswers;
    const output: Step2ChatOutput = {
      requirementsText: buildRequirementsText(summary, followup),
      extractedData: {
        setback:               facts.setback,
        setbackMode:           facts.setbackMode,
        buildLength:           summary.buildLength,
        groundBuildArea:       summary.groundBuildArea,
        foundationArea:        summary.foundationArea,
        bodyArea:              summary.bodyArea,
        roofArea:              summary.roofArea,
        totalConstructionArea: summary.totalConstructionArea,
        updatedBudget:         summary.updatedBudgetMillion,
        userAcceptedBudget:    facts.userAcceptedBudget,
        wantsFullBuild:        facts.wantsFullBuild,
      },
      technicalSummary: summary,
      followupAnswers:  followup,
    };
    onComplete(output);
  }

  const showInput =
    stage === "ask_setback_value" && !isTyping;

  const inputDisabled = isTyping || stage === "calculating";

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Chat scroll area */}
      <div
        ref={scrollRef}
        className="overflow-y-auto space-y-4 pr-1"
        style={{
          maxHeight: "calc(100dvh - 340px)",
          minHeight: 260,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mb-0.5"
                  style={{
                    background: "rgba(255,123,0,0.18)",
                    color: "#ff9500",
                    border: "1px solid rgba(255,123,0,0.25)",
                  }}
                >
                  AI
                </div>
              )}
              <div
                className="max-w-[82%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #ff7b00, #ff4800)",
                        borderRadius: "18px 18px 4px 18px",
                        color: "#fff",
                        boxShadow: "0 2px 14px rgba(255,100,0,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "4px 18px 18px 18px",
                        color: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(8px)",
                      }
                }
              >
                {renderContent(msg.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        {stage === "completed" && summary && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <TechnicalSummaryCard summary={summary} />
          </motion.div>
        )}
      </div>

      {/* Quick-reply chips */}
      <AnimatePresence>
        {currentChips.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="mt-3 overflow-x-auto pb-1 flex gap-2"
            style={{ scrollbarWidth: "none" }}
          >
            {currentChips.map((chip) => (
              <motion.button
                key={chip}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => handleChip(chip)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: "rgba(255,123,0,0.08)",
                  border: "1px solid rgba(255,123,0,0.28)",
                  color: "#ff9a40",
                }}
              >
                {chip}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text input (only shown when setback value needed) */}
      <div className="mt-3 space-y-2">
        <AnimatePresence>
          {inputError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs px-1"
              style={{ color: "#ff6b6b" }}
            >
              ⚠️ {inputError}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: inputDisabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${inputDisabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
                transition: "all 0.2s",
              }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={inputDisabled}
                placeholder="Nhập số mét chừa (VD: 2 hoặc 1.5)..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
                style={{ color: "rgba(255,255,255,0.8)" }}
              />
              <motion.button
                type="button"
                onClick={handleSendText}
                disabled={inputDisabled || !inputValue.trim()}
                whileTap={!inputDisabled && inputValue.trim() ? { scale: 0.9 } : {}}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background:
                    !inputDisabled && inputValue.trim()
                      ? "linear-gradient(135deg, #ff7b00, #ff4800)"
                      : "rgba(255,255,255,0.04)",
                  opacity: !inputDisabled && inputValue.trim() ? 1 : 0.35,
                }}
              >
                <Send size={13} style={{ color: "#fff" }} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete button */}
        <AnimatePresence>
          {stage === "completed" && (
            <motion.button
              type="button"
              onClick={handleComplete}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 28px rgba(255,100,0,0.45)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #ff7b00, #ff4800)",
                boxShadow: "0 4px 20px rgba(255,100,0,0.3)",
                color: "#fff",
              }}
            >
              <CheckCircle2 size={16} />
              Hoàn thành — chuyển sang phân tích AI
              <ChevronRight size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
