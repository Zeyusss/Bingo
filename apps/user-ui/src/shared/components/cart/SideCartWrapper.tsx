"use client";

import { useStore } from "../../../store";
import SideCart from "./SideCart";
import FloatingCartButton from "./FloatingCartButton";

export default function SideCartWrapper() {
  const { showSideCart, closeSideCart, toggleSideCart } = useStore();

  return (
    <>
      <SideCart 
        isOpen={showSideCart} 
        onClose={closeSideCart} 
      />
      <FloatingCartButton onClick={toggleSideCart} />
    </>
  );
}
