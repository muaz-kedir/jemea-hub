import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

export const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, isOnline, installPWA, isUpdateAvailable, updateServiceWorker } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show install prompt after a delay (don't annoy users immediately)
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  // Show offline toast
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineToast(true);
    } else {
      const timer = setTimeout(() => setShowOfflineToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Will show again on next visit
  };

  return (
    <>
      {/* Install Prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-300 sm:left-auto sm:right-4 sm:max-w-sm">
          <Card className="p-4 border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A9BA8] to-[#0d7377] flex items-center justify-center shadow-lg shadow-[#1A9BA8]/30">
                <Smartphone className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">Install HUMSJ App</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Add to your home screen for quick access and offline support
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#1A9BA8] to-[#0d7377] hover:opacity-90 text-white gap-1.5"
                    onClick={handleInstall}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                    onClick={handleRemindLater}
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Offline Toast */}
      {showOfflineToast && (
        <div className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300",
          isOnline && "animate-out slide-out-to-top-4"
        )}>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg",
            isOnline 
              ? "bg-green-500/20 border border-green-500/30 text-green-400"
              : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
          )}>
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Back online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">You're offline</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Update Available Toast */}
      {isUpdateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-300 sm:left-auto sm:right-4 sm:max-w-sm">
          <Card className="p-4 border-0 shadow-2xl bg-gradient-to-br from-blue-900/90 to-slate-900 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Update available</p>
                <p className="text-xs text-slate-400">Refresh to get the latest version</p>
              </div>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={updateServiceWorker}
              >
                Update
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
