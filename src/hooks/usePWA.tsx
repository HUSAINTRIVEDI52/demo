import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const {
    offlineReady: [isOfflineReady, setIsOfflineReady],
    needRefresh: [isNeedRefresh, setIsNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("SW Registered:", swUrl);
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  useEffect(() => {
    setOfflineReady(isOfflineReady);
    if (isOfflineReady) {
      toast.success("App ready for offline use", {
        description: "You can now use the app without internet connection",
        duration: 3000,
      });
    }
  }, [isOfflineReady]);

  useEffect(() => {
    setNeedRefresh(isNeedRefresh);
    if (isNeedRefresh) {
      toast("Update available", {
        description: "A new version is available. Click to update.",
        action: {
          label: "Update",
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [isNeedRefresh, updateServiceWorker]);

  const close = () => {
    setIsOfflineReady(false);
    setIsNeedRefresh(false);
  };

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    close,
  };
}
