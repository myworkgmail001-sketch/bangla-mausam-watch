import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionCardProps {
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}

export default function AccordionCard({ title, summary, children, defaultOpen = false, accentColor = '#0EA5E9' }: AccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      className="glass-card overflow-hidden"
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          <span className="text-sm font-semibold text-heading truncate">{title}</span>
          {summary && (
            <span className="text-xs text-body/60 truncate flex-shrink-0 ml-auto">{summary}</span>
          )}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-body/40 flex-shrink-0 ml-2" />
        </motion.div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '600px' : '0px' }}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
