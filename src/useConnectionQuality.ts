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

const CACHE_DURATION = 60 * 1000; // 1 minute

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
    rendition: Rendition.HD720,
    isLoading: true,
    mbps: null,
    timestamp: null,
  });

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

  const detectConnectionSpeed = useCallback(async () => {
    // Automatically set highest quality for desktop
    if (!isMobileOnly) {
      const newState = {
        rendition: Rendition.HD1080,
        isLoading: false,
        mbps: null,
        timestamp: Date.now(),
      };
      setConnState(newState);
      store.set(connectionQualityAtom, newState);
      return;
    }

    // REST IS FOR MOBILE ONLY

    // Skip if we have a recent measurement
    if (
      connState.timestamp &&
      Date.now() - connState.timestamp < CACHE_DURATION &&
      !connState.isLoading
    ) {
      return;
    }

    setConnState((prev) => ({ ...prev, isLoading: true }));

    // Check Network Information API
    if (navigator.connection && isNetworkInformation(navigator.connection)) {
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
    } else {
      const newState = {
        rendition: Rendition.SD360,
        isLoading: false,
        mbps: null,
        timestamp: Date.now(),
      };
      setConnState(newState);
      store.set(connectionQualityAtom, newState);
    }
  }, [getRenditionFromConnectionType]);

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
