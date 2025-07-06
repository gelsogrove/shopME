import logo from '@/assets/logo.svg';
import React from 'react';

const AuthLogo: React.FC = () => {
  return (
    <div className="flex justify-center items-center mb-4">
      <img src={logo} alt="ShopMe Logo" className="w-24 h-24" />
    </div>
  );
};

export { AuthLogo };
export default AuthLogo;
