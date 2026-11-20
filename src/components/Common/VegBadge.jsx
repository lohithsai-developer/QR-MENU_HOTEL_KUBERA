import React from 'react';

export const VegBadge = ({ isVeg, size = 'sm', className = '' }) => {
  const isSmall = size === 'sm';

  if (isVeg) {
    return (
      <span
        title="Vegetarian"
        className={`inline-flex items-center justify-center border-2 border-emerald-600 rounded bg-white shadow-xs ${
          isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${className}`}
      >
        <span
          className={`rounded-full bg-emerald-600 ${
            isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5'
          }`}
        />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center border-2 border-rose-600 rounded bg-white shadow-xs ${
        isSmall ? 'w-4 h-4' : 'w-5 h-5'
      } ${className}`}
    >
      <span
        className={`rounded-full bg-rose-600 ${
          isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5'
        }`}
      />
    </span>
  );
};
