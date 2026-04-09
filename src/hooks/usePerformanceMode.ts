import { useMemo } from "react";

type NetworkInformationLike = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

function getConnection(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") return null;
  const anyNav = navigator as any;
  return (anyNav.connection || anyNav.mozConnection || anyNav.webkitConnection || null) as
    | NetworkInformationLike
    | null;
}

/**
 * Returns `true` on devices/conditions where we should avoid continuous animations.
 * This is intentionally conservative to eliminate mobile preview lag.
 */
export function usePerformanceMode() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return true;

    const connection = getConnection();
    const saveData = !!connection?.saveData;
    const effectiveType = connection?.effectiveType ?? "";
    const downlink = typeof connection?.downlink === "number" ? connection!.downlink! : null;
    const rtt = typeof connection?.rtt === "number" ? connection!.rtt! : null;

    const lowNetwork =
      saveData ||
      effectiveType.includes("2g") ||
      (downlink !== null && downlink < 1.5) ||
      (rtt !== null && rtt > 400);

    const anyNav = navigator as any;
    const deviceMemory = typeof anyNav.deviceMemory === "number" ? (anyNav.deviceMemory as number) : null;
    const hardwareConcurrency =
      typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null;

    const lowCpu = (deviceMemory !== null && deviceMemory <= 4) || (hardwareConcurrency !== null && hardwareConcurrency <= 4);

    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

    return lowNetwork || lowCpu || isSmallScreen;
  }, []);
}
