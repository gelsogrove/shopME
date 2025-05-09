import React from 'react';

interface WhatsAppIconProps {
  className?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Logo WhatsApp semplificato - solo contorno */}
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      {/* Telefono stilizzato - versione semplice */}
      <path d="M9.5 12.5a4.5 4.5 0 0 0 5 0" strokeWidth="1.5" />
      <path d="M9 10L9 8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 10L15 8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};