import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const HeartIcon = (props: IconProps) => (
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
      d="M16.5 3c-1.74 0-3.41.81-4.5 2.09A6.364 6.364 0 0 0 7.5 3 6.5 6.5 0 0 0 3 9.5c0 4.74 6.09 9.05 9 11.2 2.91-2.15 9-6.46 9-11.2A6.5 6.5 0 0 0 16.5 3z"
    />
  </svg>
);

export default HeartIcon;
export const HeartIconComponent = React.memo(HeartIcon);
