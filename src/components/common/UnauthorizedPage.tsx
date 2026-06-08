// components/UnauthorizedDialog.tsx
import { ShieldOff, ArrowLeft, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnauthorizedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnauthorizedDialog: React.FC<UnauthorizedDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Indicator */}
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldOff className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Status Code */}
        <div className="mb-3">
          <h1 className="text-5xl font-bold text-slate-800">403</h1>
          <p className="text-slate-500 mt-1">Access Denied</p>
        </div>

        {/* Friendly Message */}
        <h2 className="text-lg font-semibold text-slate-700 mb-2">
          Oops! This area is off-limits
        </h2>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          You need to be logged in with the right permissions to view this content.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => {
              window.location.href = 'mailto:support@company.com';
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
};