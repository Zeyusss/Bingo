import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const CartBagIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    width={24}
    height={24}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 7h10l1.2 12H5.8L7 7z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 7V5a3 3 0 0 1 6 0v2"
    />
  </svg>
);

export default CartBagIcon;
export const CartBagIconComponent = React.memo(CartBagIcon);
