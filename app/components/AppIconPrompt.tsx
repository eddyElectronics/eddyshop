'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'appIconPromptDismissed';
const APP_ICON_PATH = '/images/logo.svg';

interface AppIconPromptProps {
  onCreateIcon?: () => void;
}

export default function AppIconPrompt({ onCreateIcon }: AppIconPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAppIcon();
  }, []);

  const checkAppIcon = async () => {
    setIsChecking(true);
    
    // Check if user has dismissed the prompt before
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    
    if (isDismissed) {
      setIsChecking(false);
      setShowPrompt(false);
      return;
    }

    // Check if app icon exists
    try {
      const response = await fetch(APP_ICON_PATH, { method: 'HEAD' });
      
      // Show prompt only if icon doesn't exist
      setShowPrompt(!response.ok);
    } catch {
      // If fetch fails, assume icon doesn't exist
      setShowPrompt(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateIcon = () => {
    // Navigate to admin or trigger icon creation flow
    if (onCreateIcon) {
      onCreateIcon();
    } else {
      // Default: open admin page in new tab or navigate
      window.location.href = '/admin';
    }
    setShowPrompt(false);
  };

  const handleSkip = () => {
    // Persist user's choice to skip
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowPrompt(false);
  };

  // Don't render anything while checking or if prompt shouldn't show
  if (isChecking || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Banner Style Prompt - Non-blocking */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Icon & Message */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">App Icon ยังไม่ได้ตั้งค่า</p>
                <p className="text-sm text-white/80">เพิ่ม App Icon เพื่อให้ร้านดูเป็นมืออาชีพมากขึ้น</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateIcon}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                สร้าง App Icon
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
              >
                ข้ามไปก่อน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden under the banner */}
      <div className="h-16"></div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

// Hook for checking app icon status
export function useAppIconStatus() {
  const [status, setStatus] = useState<{
    exists: boolean;
    checked: boolean;
    dismissed: boolean;
  }>({
    exists: false,
    checked: false,
    dismissed: false,
  });

  useEffect(() => {
    const checkStatus = async () => {
      const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
      
      try {
        const response = await fetch(APP_ICON_PATH, { method: 'HEAD' });
        setStatus({
          exists: response.ok,
          checked: true,
          dismissed: isDismissed,
        });
      } catch {
        setStatus({
          exists: false,
          checked: true,
          dismissed: isDismissed,
        });
      }
    };

    checkStatus();
  }, []);

  const resetDismissed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStatus(prev => ({ ...prev, dismissed: false }));
  };

  return { ...status, resetDismissed };
}
