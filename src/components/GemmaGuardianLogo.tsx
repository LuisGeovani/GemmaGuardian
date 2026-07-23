import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
}

export const GemmaGuardianLogo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'color',
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-sm' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-10 h-10', text: 'text-xl' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl' },
  };

  const textColor = variant === 'light' ? 'text-white' : variant === 'dark' ? 'text-slate-900' : 'text-emerald-900';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`${sizeMap[size].icon} relative shrink-0 flex items-center justify-center`}>
        <img
          src="/gemma_guardian_full_logo.svg"
          alt="GemmaGuardian Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.svg';
          }}
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-black tracking-tight ${sizeMap[size].text} ${textColor} flex items-center gap-0.5`}>
            Gemma<span className="text-emerald-500">Guardian</span>
          </span>
        </div>
      )}
    </div>
  );
};
