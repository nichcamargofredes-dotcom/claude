import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useShop } from '../lib/shop'

export function Toast() {
  const { toast } = useShop()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.p
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="flex items-center gap-3 rounded-full bg-gray-900 py-3 pl-3 pr-5 text-sm font-medium text-white shadow-2xl"
          >
            <span className="grid size-6 place-items-center rounded-full bg-orange">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {toast.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
