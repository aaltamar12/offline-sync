import { db, LocalTransaction } from "../db/localDb";
import type { SyncLog } from "../db/localDb";

export class SyncEngine {
  private readonly apiBase: string;
  private isSyncing = false;

  constructor(apiBase: string) {
    this.apiBase = apiBase;
  }

  async syncPending(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;

    try {
      const pending = await db.transactions.where("syncStatus").equals("pending").toArray();
      for (const txn of pending) {
        await this.syncTransaction(txn);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncTransaction(txn: LocalTransaction): Promise<void> {
    await db.transactions.update(txn.id, { syncStatus: "syncing" });
    try {
      const res = await fetch(`${this.apiBase}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txn),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await db.transactions.update(txn.id, { syncStatus: "synced" });
    } catch (err) {
      await db.transactions.update(txn.id, {
        syncStatus: "error",
        syncError: (err as Error).message,
      });
    }
  }

  async pullFromServer(workspaceId: string, since?: string): Promise<void> {
    const url = `${this.apiBase}/transactions?workspaceId=${workspaceId}${since ? `&since=${since}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const { data } = await res.json();
    await db.transactions.bulkPut(data.map((t: LocalTransaction) => ({ ...t, syncStatus: "synced" })));
  }
}
