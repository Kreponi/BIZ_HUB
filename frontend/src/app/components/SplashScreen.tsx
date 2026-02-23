import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-500 flex flex-col items-center justify-center z-50 overflow-hidden">
      <style>{`
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashLogoPop {
          0% { opacity: 0; transform: scale(0.85) rotate(-4deg); }
          70% { opacity: 1; transform: scale(1.04) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .splash-logo {
          animation: splashLogoPop 900ms ease-out both;
        }
        .splash-title {
          animation: splashFadeUp 700ms ease-out 250ms both;
        }
        .splash-subtitle {
          animation: splashFadeUp 700ms ease-out 420ms both;
        }
        .splash-dots {
          animation: splashFadeUp 700ms ease-out 560ms both;
        }
      `}</style>
      <div className="text-center">
        <img
          src="/bizhub_logo.jpeg"
          alt="BIZ HUB Logo"
          className="max-w-xs max-h-xs drop-shadow-2xl mb-6 splash-logo rounded-xl brightness-0 invert"
        />
        <h1 className="text-4xl font-bold text-white mb-2 splash-title">
          Welcome to BIZ HUB
        </h1>
        <p className="text-lg text-white/80 splash-subtitle">
          Your gateway to amazing products
        </p>
        <div className="mt-4 flex justify-center space-x-2 splash-dots">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
