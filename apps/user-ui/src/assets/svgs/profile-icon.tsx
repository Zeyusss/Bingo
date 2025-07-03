import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const ProfileIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >

    <circle cx="12" cy="7" r="4" />


    <path d="M4 20c0-2.5 3.5-5 8-5s8 2.5 8 5v1H4v-1z" />
  </svg>
);

export default ProfileIcon;
export const ProfileIconComponent = React.memo(ProfileIcon);
