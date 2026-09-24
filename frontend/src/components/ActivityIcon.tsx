import React from 'react';
import {
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Beef,
  Circle,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface ActivityIconProps extends LucideProps {
  type: string;
}

export const ActivityIcon: React.FC<ActivityIconProps> = ({ type, ...props }) => {
  switch (type) {
    case 'car':
      return <Car {...props} />;
    case 'bus':
      return <Bus {...props} />;
    case 'flight':
      return <Plane {...props} />;
    case 'electricity':
      return <Zap {...props} />;
    case 'veg_meal':
      return <Salad {...props} />;
    case 'non_veg_meal':
      return <Beef {...props} />;
    default:
      return <Circle {...props} />;
  }
};
