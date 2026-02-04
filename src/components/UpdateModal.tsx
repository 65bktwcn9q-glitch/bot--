import { motion } from "framer-motion";
import { UpdateState } from "../store/launcherStore";

interface UpdateModalProps {
  state: UpdateState;
  onClose: () => void;
}

export default function UpdateModal({ state, onClose }: UpdateModalProps) {
  if (!state.active) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        className="glass-panel rounded-2xl w-full max-w-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-[0.2em]">Updater</p>
            <h3 className="text-xl font-display font-semibold">{state.title}</h3>
          </div>
          {!state.required && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition text-sm"
            >
              Close
            </button>
          )}
        </div>
        <div className="mt-6 space-y-4">
          <div className="bg-panel/70 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-text-muted">{state.currentFile || "Preparing files..."}</p>
            <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
              <span>{state.progress.toFixed(1)}%</span>
              <span>{state.speed}</span>
              <span>{state.eta}</span>
            </div>
          </div>
          {state.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
