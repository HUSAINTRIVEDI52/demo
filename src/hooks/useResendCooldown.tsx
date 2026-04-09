import { useState, useEffect, useCallback } from 'react';

const COOLDOWN_SECONDS = 60;

export function useResendCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
  }, []);

  const resetCooldown = useCallback(() => {
    setCooldown(0);
  }, []);

  return {
    cooldown,
    isOnCooldown: cooldown > 0,
    startCooldown,
    resetCooldown,
  };
}
