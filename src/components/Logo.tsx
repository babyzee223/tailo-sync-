import React from 'react';
import logo from '../assets/logo.png';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
};

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  return (
    <img
      src={logo}
      alt="Logo"
      className={`object-contain ${sizeMap[size]}`}
    />
  );
};

export default Logo;
