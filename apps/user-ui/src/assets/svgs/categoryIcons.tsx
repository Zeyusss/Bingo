import React from "react";
import {
  Gem,
  Shirt,
  Home,
  Brush,
  ToyBrick,
  ShoppingBag,
  Briefcase,
  Square,
  Hammer,
  Scissors
} from "lucide-react";

const categoryIcons: Record<string, React.FC> = {
  Jewelry: () => <Gem size={16} />,
  Clothing: () => <Shirt size={16} />,
  "Home Decor": () => <Home size={16} />,
  Art: () => <Brush size={16} />,
  Toys: () => <ToyBrick size={16} />,
  Accessories: () => <ShoppingBag size={16} />,
  Bags: () => <Briefcase size={16} />,
  Ceramics: () => <Square size={16} />,
  Woodwork: () => <Hammer size={16} />,
  Knitting: () => <Scissors size={16} />
};

export default categoryIcons;
