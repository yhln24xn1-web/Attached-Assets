import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewProjectWizard() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0a0e16" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-6"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(255,123,0,0.15), rgba(255,72,0,0.1))",
            border: "1px solid rgba(255,123,0,0.25)",
            boxShadow: "0 0 40px rgba(255,100,0,0.15)",
          }}
        >
          <Sparkles className="w-9 h-9" style={{ color: "#ff7b00" }} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Tạo dự án mới</h1>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Tính năng wizard đang được phát triển
        </p>
        <button
          onClick={() => setLocation("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Dashboard
        </button>
      </motion.div>
    </div>
  );
}
