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
    success: <CheckCircle className="text-chart-2 drop-shadow-lg" size={20} />,
    error: (
      <AlertCircle className="text-destructive drop-shadow-lg" size={20} />
    ),
    info: <Info className="text-chart-1 drop-shadow-lg" size={20} />,
    warning: (
      <AlertTriangle className="text-chart-3 drop-shadow-lg" size={20} />
    ),
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {mounted && (
        <motion.div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col-reverse gap-3 w-[95vw] max-w-[400px] sm:w-96"
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
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.05,
                }}
                className={clsx(
                  "relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 w-full h-auto font-['MontserratAlternates-Regular']",
                  "bg-card border border-border rounded-lg shadow-lg",
                  "backdrop-blur-sm",
                  {
                    "border-chart-2 bg-chart-2/10": n.type === "success",
                    "border-destructive bg-destructive/10": n.type === "error",
                    "border-chart-1 bg-chart-1/10": n.type === "info",
                    "border-chart-3 bg-chart-3/10": n.type === "warning",
                  }
                )}
                style={{
                  boxShadow: "4px 4px 0px var(--border)",
                }}
              >
                <div className="flex-shrink-0">{iconMap[n.type]}</div>
                <span className="flex-1 text-sm sm:text-base font-medium text-foreground font-['MontserratAlternates-Regular']">
                  {n.message}
                </span>
                <button
                  onClick={() => removeNotification(n.id)}
                  title="Close notification"
                  aria-label="Close notification"
                  className="ml-1 sm:ml-2 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-ring hover:bg-accent hover:scale-105 transition-all duration-200"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
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
