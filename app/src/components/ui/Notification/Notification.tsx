"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const removalQueue = useRef<NodeJS.Timeout[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      removalQueue.current.forEach(clearTimeout);
    };
  }, []);

  const notify = (message: string, type: NotificationType = "info") => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);

    const timeoutId = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      removalQueue.current = removalQueue.current.filter(
        (t) => t !== timeoutId
      );
    }, 4000 + notifications.length * 300);

    removalQueue.current.push(timeoutId);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const iconMap: Record<NotificationType, React.ReactElement> = {
    success: (
      <CheckCircle className="text-emerald-400 drop-shadow-lg" size={24} />
    ),
    error: <AlertCircle className="text-rose-400 drop-shadow-lg" size={24} />,
    info: <Info className="text-sky-400 drop-shadow-lg" size={24} />,
    warning: (
      <AlertTriangle className="text-yellow-400 drop-shadow-lg" size={24} />
    ),
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {mounted && (
        <motion.div
          className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-50 flex flex-col-reverse gap-2 sm:gap-4 w-[95vw] max-w-[380px] sm:w-96"
          initial={false}
          animate="animate"
          exit="exit"
          layout
        >
          <AnimatePresence initial={false}>
            {notifications.map((n, index) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.08,
                }}
                className={clsx(
                  "relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 rounded-xl w-full shadow-2xl h-auto bg-[rgba(24,24,27,0.65)] backdrop-blur border border-white/10",
                  {
                    "border-emerald-400/40": n.type === "success",
                    "border-rose-400/40": n.type === "error",
                    "border-sky-400/40": n.type === "info",
                    "border-yellow-400/40": n.type === "warning",
                  }
                )}
              >
                <div className="pt-0.5 flex-shrink-0">{iconMap[n.type]}</div>
                <span className="flex-1 text-sm sm:text-base font-semibold text-[var(--foreground)] drop-shadow-sm">
                  {n.message}
                </span>
                <button
                  onClick={() => removeNotification(n.id)}
                  title="Close notification"
                  aria-label="Close notification"
                  className="ml-1 sm:ml-2 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[var(--text-link-color)] hover:bg-[var(--background)]/30 hover:scale-110 transition-all"
                >
                  <X className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </NotificationContext.Provider>
  );
};

export default useNotification;
