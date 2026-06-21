import React from "react";

const AppLoader: React.FC = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#eef2ff_100%)] px-6">
      {/* Animated background orbs */}
      <div className="app-loader-orb app-loader-orb-left" />
      <div className="app-loader-orb app-loader-orb-right" />

      {/* Main loader container */}
      <div className="relative flex flex-col items-center justify-center rounded-[32px] border border-white/70 bg-white/80 p-12 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl min-w-[280px]">
  

    

        {/* Custom BeatLoader */}
        <div className="flex items-center gap-3">
          <span className="beat-loader-dot" style={{ animationDelay: "0s" }} />
          <span className="beat-loader-dot" style={{ animationDelay: "0.2s" }} />
          <span className="beat-loader-dot" style={{ animationDelay: "0.4s" }} />
        </div>

    
      </div>


      <style>{`
        .app-loader-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
        }

        .app-loader-orb-left {
          top: -5%;
          left: -5%;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, #60a5fa, transparent 70%);
        }

        .app-loader-orb-right {
          bottom: -5%;
          right: -5%;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, #818cf8, transparent 70%);
        }

        /* BeatLoader animation */
        .beat-loader-dot {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          animation: beat-loader 0.7s ease-in-out infinite;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        @keyframes beat-loader {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.3);
            opacity: 0.3;
          }
        }

        /* Progress bar animation */
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-loading {
          animation: loading 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AppLoader;