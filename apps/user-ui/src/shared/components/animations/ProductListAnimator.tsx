"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface ProductListAnimatorProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  animationDuration?: number;
  listKey?: string | number; 
  layout?: "grid" | "flex";
}

const ProductListAnimator: React.FC<ProductListAnimatorProps> = ({
  children,
  className = "",
  staggerDelay = 0.08,
  animationDuration = 0.4,
  listKey,
  layout = "grid"
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animationDuration,
        ease: [0.4, 0, 0.2, 1], 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: animationDuration * 0.6,
        ease: [0.4, 0, 1, 1]
      }
    }
  };

  return (
    <motion.div
      className={`${className} ${layout === "grid" ? "grid" : "flex flex-col"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: "fit-content"
      }}
    >
      <AnimatePresence mode="wait">
        {children.map((child, index) => (
          <motion.div
            key={`${listKey}-${index}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
            className="motion-reduce:transform-none motion-reduce:opacity-100"
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductListAnimator;
