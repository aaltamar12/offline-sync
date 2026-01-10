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
