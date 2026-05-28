

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const defaultVariants = {
  initial: { opacity: 0, scale: 0.98 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

type PageTransitionProps = {
  children: ReactNode;
  variants?: typeof defaultVariants;
  [key: string]: any;
};

export default function PageTransition({
  children,
  variants = defaultVariants,
  ...rest
}: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...rest}
    >
      {children}
    </motion.div>
  );
}
