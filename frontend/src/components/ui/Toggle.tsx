import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  label,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const sizeClasses = {
    sm: {
      switch: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: 'translate-x-3',
    },
    md: {
      switch: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4',
    },
    lg: {
      switch: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5',
    },
  };

  const currentSize = sizeClasses[size];

  const switchClasses = `
    relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
    ${currentSize.switch}
    ${checked
      ? 'bg-primary-600'
      : 'bg-gray-200'
    }
    ${disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const thumbClasses = `
    inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
    ${currentSize.thumb}
    ${checked ? currentSize.translate : 'translate-x-0.5'}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={switchClasses}
        onClick={handleToggle}
      >
        <span className={thumbClasses} />
      </button>
      {label && (
        <span className={`ml-3 text-sm ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {label}
        </span>
      )}
    </div>
  );
};