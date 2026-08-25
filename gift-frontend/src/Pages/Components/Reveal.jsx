import { motion } from 'framer-motion';

/**
 * Fades + slides a section into view the first time it scrolls into the
 * viewport. Wrap any section/card with this instead of hand-rolling
 * IntersectionObserver logic per page.
 */
export default function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
