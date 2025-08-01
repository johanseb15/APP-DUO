import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

export default LoadingSpinner;
