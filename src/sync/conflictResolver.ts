import type { LocalTransaction } from "../db/localDb";

export type ConflictStrategy = "server-wins" | "client-wins" | "last-write-wins" | "merge";

export function resolveConflict(
  local: LocalTransaction,
  remote: LocalTransaction,
  strategy: ConflictStrategy = "last-write-wins"
): LocalTransaction {
  switch (strategy) {
    case "server-wins":
      return { ...remote, syncStatus: "synced" };
    case "client-wins":
      return { ...local, syncStatus: "pending" };
    case "last-write-wins":
      return new Date(local.updatedAt) > new Date(remote.updatedAt)
        ? { ...local, syncStatus: "pending" }
        : { ...remote, syncStatus: "synced" };
    case "merge":
      return {
        ...remote,
        description: local.updatedAt > remote.updatedAt ? local.description : remote.description,
        syncStatus: "pending",
        updatedAt: new Date().toISOString(),
      };
  }
}
