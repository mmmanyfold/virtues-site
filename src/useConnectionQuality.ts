import { useState, useEffect, useCallback } from "react";
import { isMobileOnly } from "react-device-detect";
import { store, connectionQualityAtom } from "./store";

export enum Rendition {
  HD1080 = "1080p",
  HD720 = "720p",
  SD540 = "540p",
  SD360 = "360p",
}

type EffectiveConnectionType = "4g" | "3g" | "2g" | "slow-2g";

export interface ConnectionQualityState {
  rendition: Rendition;
  isLoading: boolean;
  mbps: number | null;
  timestamp: number | null;
}

interface NetworkInformation extends EventTarget {
  effectiveType: EffectiveConnectionType;
  addEventListener: (type: "change", callback: EventListener) => void;
  removeEventListener: (type: "change", callback: EventListener) => void;
}

declare global {
  interface Navigator {
    connection?: unknown;
  }
}

const SPEED_THRESHOLDS = {
  HD1080: 5, // 1080p typically needs 5-8 Mbps
  HD720: 2.5, // 720p typically needs 2.5-4 Mbps
  SD540: 1.5, // 540p typically needs 1.5-2 Mbps
  SD360: 0.5, // 360p typically needs 0.7-1 Mbps
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function isNetworkInformation(
  connection: unknown
): connection is NetworkInformation {
  return (
    !!connection &&
    typeof connection === "object" &&
    "effectiveType" in connection &&
    "addEventListener" in connection &&
    "removeEventListener" in connection
  );
}

export const useConnectionQuality = () => {
  const [connState, setConnState] = useState<ConnectionQualityState>({
    rendition: Rendition.SD360,
    isLoading: true,
    mbps: null,
    timestamp: null,
  });

  const getRenditionFromSpeed = useCallback((speedMbps: number): Rendition => {
    if (speedMbps >= SPEED_THRESHOLDS.HD1080) return Rendition.HD1080;
    if (speedMbps >= SPEED_THRESHOLDS.HD720) return Rendition.HD720;
    if (speedMbps >= SPEED_THRESHOLDS.SD540) return Rendition.SD540;
    return Rendition.SD360;
  }, []);

  const getRenditionFromConnectionType = useCallback(
    (type: EffectiveConnectionType): Rendition => {
      switch (type) {
        case "4g":
          return Rendition.HD720;
        case "3g":
          return Rendition.SD540;
        case "2g":
        case "slow-2g":
        default:
          return Rendition.SD360;
      }
    },
    []
  );

  const runSpeedTest = useCallback(async (retryCount = 0): Promise<number> => {
    try {
      const startTime = performance.now();
      const response = await fetch("/test-file.txt", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fileSizeInBits = blob.size * 8;
      const speedMbps = ((fileSizeInBits / duration) * 1000) / (1024 * 1024);
      return speedMbps;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return runSpeedTest(retryCount + 1);
      }
      throw error;
    }
  }, []);

  const detectConnectionSpeed = useCallback(async () => {
    // Skip if we have a recent measurement
    if (
      connState.timestamp &&
      Date.now() - connState.timestamp < CACHE_DURATION &&
      !connState.isLoading
    ) {
      return;
    }

    setConnState((prev) => ({ ...prev, isLoading: true }));

    try {
      // On mobile, check Network Information API first
      if (
        isMobileOnly &&
        navigator.connection &&
        isNetworkInformation(navigator.connection)
      ) {
        const rendition = getRenditionFromConnectionType(
          navigator.connection.effectiveType
        );
        const newState = {
          rendition,
          isLoading: false,
          mbps: null,
          timestamp: Date.now(),
        };
        setConnState(newState);
        store.set(connectionQualityAtom, newState);
        return;
      }

      // Fallback: Speed test
      const speedMbps = await runSpeedTest();
      const newState = {
        rendition: getRenditionFromSpeed(speedMbps),
        isLoading: false,
        mbps: Number(speedMbps.toFixed(2)),
        timestamp: Date.now(),
      };
      setConnState(newState);
      store.set(connectionQualityAtom, newState);
    } catch (error) {
      console.warn(
        "Speed test failed, defaulting to low quality rendition:",
        error
      );
      const newState = {
        rendition: Rendition.SD360,
        isLoading: false,
        mbps: null,
        timestamp: Date.now(),
      };
      setConnState(newState);
      store.set(connectionQualityAtom, newState);
    }
  }, [getRenditionFromSpeed, getRenditionFromConnectionType, runSpeedTest]);

  useEffect(() => {
    // Run initial detection
    detectConnectionSpeed();

    // Set up connection change listener for mobile devices
    if (
      isMobileOnly &&
      navigator.connection &&
      isNetworkInformation(navigator.connection)
    ) {
      const connection = navigator.connection;
      const handleConnectionChange = () => {
        const rendition = getRenditionFromConnectionType(
          connection.effectiveType
        );
        setConnState((prev) => ({
          ...prev,
          rendition,
          timestamp: Date.now(),
        }));
      };

      connection.addEventListener("change", handleConnectionChange);
      return () => {
        connection.removeEventListener("change", handleConnectionChange);
      };
    }
  }, [detectConnectionSpeed, getRenditionFromConnectionType]);

  return connState;
};
