import HalfStar from "apps/user-ui/src/assets/svgs/halfstar";
import StarFilled from "apps/user-ui/src/assets/svgs/starfilled";
import StarOutline from "apps/user-ui/src/assets/svgs/staroutline";
import React, { FC } from "react";

type Props = {
  rating: number;
  size?: number;
  className?: string;
};

const Ratings: FC<Props> = ({ rating, size = 24, className = "" }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarFilled key={`star-${i}`} size={size} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<HalfStar key={`star-${i}`} size={size} className="text-yellow-400" />);
    } else {
      stars.push(<StarOutline key={`star-${i}`} size={size} className="text-gray-300" />);
    }
  }
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Rating: ${rating} out of 5`}>
      {stars}
    </div>
  );
};

export default Ratings;