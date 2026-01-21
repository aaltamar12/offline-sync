export interface StorageEstimateResult {
  supported: boolean;
  usageBytes: number;
  quotaBytes: number;
  usagePercent: number;
  nearingLimit: boolean;
}

export async function getStorageEstimate(): Promise<StorageEstimateResult> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) {
    return { supported: false, usageBytes: 0, quotaBytes: 0, usagePercent: 0, nearingLimit: false };
  }

  const estimate = await navigator.storage.estimate();
  const usageBytes = estimate.usage ?? 0;
  const quotaBytes = estimate.quota ?? 0;
  const usagePercent = quotaBytes > 0 ? (usageBytes / quotaBytes) * 100 : 0;

  return {
    supported: true,
    usageBytes,
    quotaBytes,
    usagePercent,
    nearingLimit: usagePercent > 80,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) return false;
  return navigator.storage.persist();
}
