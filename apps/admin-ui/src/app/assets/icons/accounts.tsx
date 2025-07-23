import * as React from "react";

interface AccountsIconProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
}

const AccountsIcon = ({ fill = "currentColor", ...props }: AccountsIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="none"
    {...props}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20c0-2.5 4-4 6-4s6 1.5 6 4" />
  </svg>
);

export default AccountsIcon;
export const AccountsIconComponent = React.memo(AccountsIcon);
