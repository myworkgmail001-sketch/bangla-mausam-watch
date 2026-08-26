import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionCardProps {
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}

const EASE_PREMIUM = [0.4, 0, 0.2, 1] as const;

export default function AccordionCard({ title, summary, children, defaultOpen = false, accentColor = '#0EA5E9' }: AccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      className="glass-card overflow-hidden"
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Accent bar with scale entrance */}
          <motion.div
            className="w-1 h-5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
            animate={open ? { scaleY: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
          />
          <span className="text-sm font-semibold text-heading truncate">{title}</span>
          {summary && (
            <span className="text-xs text-body/60 truncate flex-shrink-0 ml-auto">{summary}</span>
          )}
        </div>
        {/* Arrow rotate — 150ms per skill */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15, ease: EASE_PREMIUM }}
        >
          <ChevronDown className="w-4 h-4 text-body/40 flex-shrink-0 ml-2" />
        </motion.div>
      </button>

      {/* Content with height + opacity choreography */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: EASE_PREMIUM },
              opacity: { duration: 0.2, delay: 0.05, ease: EASE_PREMIUM },
            }}
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
