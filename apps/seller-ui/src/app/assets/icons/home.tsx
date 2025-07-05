import * as React from "react";

interface HomeIconProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
}

const HomeIcon = ({ fill = "currentColor", ...props }: HomeIconProps) => (
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
    <path d="M3 9.5L12 3l9 6.5" />
    <path d="M5 10v10h14V10" />
    <path d="M9 21V13h6v8" />
  </svg>
);

export default HomeIcon;
export const HomeIconComponent = React.memo(HomeIcon);
