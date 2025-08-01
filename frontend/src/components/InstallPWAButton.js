import React from 'react';

const InstallPWAButton = ({ deferredPrompt, setDeferredPrompt }) => {
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50">
      <button
        onClick={handleInstallClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
      >
        <span>🚀</span>
        <span>Instalar CordoEats</span>
      </button>
    </div>
  );
};

export default InstallPWAButton;
