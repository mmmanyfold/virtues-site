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
  type: string | undefined;
  effectiveType: EffectiveConnectionType | undefined;
  rendition: Rendition;
  isLoading: boolean;
  timestamp: number | null;
}

interface NetworkInformation extends EventTarget {
  type?: string | undefined;
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
    type: undefined,
    effectiveType: undefined,
    rendition: Rendition.HD720,
    isLoading: true,
    timestamp: null,
  });

  const getRenditionForConnection = useCallback(
    (connection: NetworkInformation): Rendition => {
      const { type, effectiveType } = connection;
      // type only supported in chrome
      switch (effectiveType) {
        case "4g":
          return type === "wifi" ? Rendition.HD720 : Rendition.SD540;
        case "3g":
          return type === "wifi" ? Rendition.SD540 : Rendition.SD360;
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
        type: undefined,
        effectiveType: undefined,
        rendition: Rendition.HD1080,
        isLoading: false,
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
    const connection = navigator.connection;
    if (connection && isNetworkInformation(connection)) {
      const newState = {
        type: connection.type,
        effectiveType: connection.effectiveType,
        rendition: getRenditionForConnection(connection),
        isLoading: false,
        timestamp: Date.now(),
      };
      setConnState(newState);
      store.set(connectionQualityAtom, newState);
    } else {
      const newState = {
        type: undefined,
        effectiveType: undefined,
        rendition: Rendition.SD540,
        isLoading: false,
        timestamp: Date.now(),
      };
      setConnState(newState);
      store.set(connectionQualityAtom, newState);
    }
  }, [getRenditionForConnection]);

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
        setConnState((prev) => ({
          ...prev,
          type: connection.type,
          effectiveType: connection.effectiveType,
          rendition: getRenditionForConnection(connection),
          timestamp: Date.now(),
        }));
      };

      connection.addEventListener("change", handleConnectionChange);
      return () => {
        connection.removeEventListener("change", handleConnectionChange);
      };
    }
  }, [detectConnectionSpeed, getRenditionForConnection]);

  return connState;
};
