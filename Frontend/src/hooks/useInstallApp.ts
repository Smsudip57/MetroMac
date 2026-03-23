import { useEffect, useState, useRef } from "react";

// Global storage for the beforeinstallprompt event
// This persists across component re-mounts
let globalInstallPrompt: any = null;

/**
 * Hook to manage PWA installation
 * Handles the beforeinstallprompt event and provides install functionality
 */
export const useInstallApp = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const listenerAttachedRef = useRef(false);

  useEffect(() => {
    console.log("[PWA-INIT] Hook initializing...");
    console.log("[PWA-INIT] Browser support check:");
    console.log("  - serviceWorker:", "serviceWorker" in navigator);
    console.log("  - PushManager:", "PushManager" in window);
    console.log(
      "  - BeforeInstallPromptEvent:",
      "BeforeInstallPromptEvent" in window,
    );

    // Check if app is already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    console.log(
      "[PWA-INIT] App already installed (standalone mode):",
      isStandalone,
    );

    if (isStandalone) {
      console.log(
        "[PWA-INIT] App is in standalone mode, skipping install prompt",
      );
      setIsInstalled(true);
      return;
    }

    // Check if we already have the event from early HTML listener
    const earlyPrompt = (window as any).__pwaInstallPrompt;
    if (earlyPrompt) {
      console.log(
        "[PWA-INIT] Using beforeinstallprompt event from early HTML listener",
      );
      globalInstallPrompt = earlyPrompt;
      setInstallPrompt(earlyPrompt);
      setIsInstallable(true);
      return;
    }

    // Check if we already have the event from global storage
    if (globalInstallPrompt) {
      console.log(
        "[PWA-INIT] Using cached beforeinstallprompt event from global storage",
      );
      setInstallPrompt(globalInstallPrompt);
      setIsInstallable(true);
      return;
    }

    // Attach listeners only ONCE globally (not on every hook render)
    if (listenerAttachedRef.current) {
      console.log("[PWA-INIT] Listeners already attached, skipping...");
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA-EVENT] beforeinstallprompt event TRIGGERED! 🎉");
      e.preventDefault();

      // Store in global ref so it persists across re-mounts
      globalInstallPrompt = e;
      console.log("[PWA-EVENT] Event stored in global cache");

      // Also update component state
      setInstallPrompt(e);
      setIsInstallable(true);
      console.log("[PWA-EVENT] isInstallable set to TRUE");
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[PWA-EVENT] appinstalled event triggered 🎉");
      globalInstallPrompt = null; // Clear cache
      (window as any).__pwaInstallPrompt = null; // Clear early prompt
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    // Attach listeners IMMEDIATELY
    console.log("[PWA-INIT] Attaching event listeners...");
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    listenerAttachedRef.current = true;
    console.log("[PWA-INIT] Event listeners attached");

    return () => {
      // Don't remove listeners - keep them attached globally
      // This ensures we catch the event even if hook unmounts
      console.log("[PWA-CLEANUP] Hook unmounted but listeners remain active");
    };
  }, []);

  const install = async () => {
    console.log("[PWA-INSTALL] Install button clicked");
    console.log("[PWA-INSTALL] installPrompt state:", installPrompt);
    console.log("[PWA-INSTALL] isInstallable state:", isInstallable);

    // Check for the LATEST event (in case a new one arrived after first dismiss)
    const latestPrompt = (window as any).__pwaInstallPrompt || installPrompt;
    console.log("[PWA-INSTALL] Latest prompt available:", !!latestPrompt);

    // If we have the prompt event, use it
    if (latestPrompt) {
      try {
        console.log("[PWA-INSTALL] Showing install prompt...");
        latestPrompt.prompt();

        const { outcome } = await latestPrompt.userChoice;
        console.log("[PWA-INSTALL] User response:", outcome);

        if (outcome === "accepted") {
          console.log("[PWA-INSTALL] User accepted installation ✅");
          setIsInstalled(true);
          setIsInstallable(false);
        } else {
          console.log("[PWA-INSTALL] User dismissed installation ❌");
        }

        // Clear both the global and local state after using the event
        (window as any).__pwaInstallPrompt = null;
        setInstallPrompt(null);
      } catch (error) {
        console.error("[PWA-INSTALL] Installation error:", error);
      }
      return;
    }

    // Fallback: Show browser-specific installation instructions
    console.log(
      "[PWA-INSTALL] ⚠️ No prompt available, showing fallback instructions",
    );

    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = "";

    if (userAgent.includes("chrome") || userAgent.includes("edge")) {
      instructions =
        `📱 Install MetroMac App\n\n` +
        `1. Click the address bar menu (⋮ or ⋯)\n` +
        `2. Select "Install app" or "Create shortcut"\n` +
        `3. Confirm the installation`;
    } else if (userAgent.includes("firefox")) {
      instructions =
        `📱 Install MetroMac App\n\n` +
        `1. Tap the menu button (⋯)\n` +
        `2. Select "Install"\n` +
        `3. Confirm the installation`;
    } else if (
      userAgent.includes("safari") ||
      userAgent.includes("iphone") ||
      userAgent.includes("ipad")
    ) {
      instructions =
        `📱 Install MetroMac App (iOS)\n\n` +
        `1. Tap the Share button\n` +
        `2. Scroll and select "Add to Home Screen"\n` +
        `3. Tap "Add"`;
    } else if (userAgent.includes("android")) {
      instructions =
        `📱 Install MetroMac App (Android)\n\n` +
        `1. Tap the menu button (⋮)\n` +
        `2. Select "Install app"\n` +
        `3. Confirm the installation`;
    } else {
      instructions =
        `📱 Install MetroMac App\n\n` +
        `Your browser supports web app installation.\n` +
        `Look for an install option in the menu or address bar.`;
    }

    alert(instructions);
  };

  return {
    isInstallable,
    isInstalled,
    install,
  };
};
