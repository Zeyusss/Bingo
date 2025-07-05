import * as React from "react";

interface PaymentIconProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
}

const PaymentIcon = ({ fill = "currentColor", ...props }: PaymentIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={fill}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 14h.01M10 14h4" />
  </svg>
);

export default PaymentIcon;
export const PaymentIconComponent = React.memo(PaymentIcon);
