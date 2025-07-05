import * as React from "react";

const StripeSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    viewBox="0 0 64 64"
    fill="none"
    {...props}
  >
    <rect width="64" height="64" rx="12" fill="#635BFF" />
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="Arial, sans-serif"
      fontSize="36"
      fill="#FFFFFF"
      fontWeight="bold"
    >
      S
    </text>
  </svg>
);

export default StripeSIcon;
export const StripeSIconComponent = React.memo(StripeSIcon);
