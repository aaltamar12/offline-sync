import Dexie, { type Table } from "dexie";

export interface LocalTransaction {
  id: string;
  workspaceId: string;
  amountCents: number;
  description: string;
  occurredAt: string;
  syncStatus: "pending" | "syncing" | "synced" | "error";
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncLog {
  id: string;
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete";
  payload: unknown;
  attemptCount: number;
  createdAt: string;
}

class TreasuryDb extends Dexie {
  transactions!: Table<LocalTransaction>;
  syncLog!: Table<SyncLog>;

  constructor() {
    super("treasury-offline");
    this.version(1).stores({
      transactions: "id, workspaceId, syncStatus, occurredAt",
      syncLog: "id, entityType, entityId, createdAt",
    });
  }
}

export const db = new TreasuryDb();


/**
 * Safari Private Mode fix: IndexedDB quota is 0 in Private Browsing on older
 * Safari (<= 13). Probe with a small write; callers should degrade to in-memory
 * Map when this returns false.
 */
export async function isIndexedDbWritable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open("__idb_probe__", 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("probe");
      };
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction("probe", "readwrite");
          tx.objectStore("probe").put("1", "k");
          tx.oncomplete = () => {
            db.close();
            indexedDB.deleteDatabase("__idb_probe__");
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            resolve(false);
          };
        } catch {
          db.close();
          resolve(false);
        }
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
