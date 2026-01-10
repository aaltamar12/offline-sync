import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/localDb";
import { SyncEngine } from "../sync/syncEngine";
import { useEffect, useCallback } from "react";

const syncEngine = new SyncEngine(process.env.NEXT_PUBLIC_API_URL ?? "");

export function useOfflineTransactions(workspaceId: string) {
  const transactions = useLiveQuery(
    () => db.transactions.where("workspaceId").equals(workspaceId).sortBy("occurredAt"),
    [workspaceId]
  );

  const pendingCount = useLiveQuery(
    () => db.transactions.where("syncStatus").equals("pending").count(),
    []
  ) ?? 0;

  useEffect(() => {
    const handleOnline = () => syncEngine.syncPending();
    window.addEventListener("online", handleOnline);
    syncEngine.syncPending(); // try on mount
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const createTransaction = useCallback(async (data: { amountCents: number; description: string; occurredAt: string }) => {
    await db.transactions.add({
      id: crypto.randomUUID(),
      workspaceId,
      ...data,
      syncStatus: navigator.onLine ? "pending" : "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (navigator.onLine) syncEngine.syncPending();
  }, [workspaceId]);

  return { transactions: transactions ?? [], pendingCount, createTransaction };
}
