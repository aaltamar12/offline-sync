import Dexie from "dexie";
interface QueuedOp { id?: number; url: string; method: string; body: string; attempts: number; createdAt: Date }
const db = new Dexie("retry_queue");
db.version(1).stores({ ops: "++id,createdAt" });
const ops = (db as any).ops as Dexie.Table<QueuedOp>;
export async function enqueue(url: string, method: string, body: unknown) {
  await ops.add({ url, method, body: JSON.stringify(body), attempts: 0, createdAt: new Date() });
}
export async function flushQueue() {
  const pending = await ops.toArray();
  for (const op of pending) {
    try {
      await fetch(op.url, { method: op.method, body: op.body, headers: { "Content-Type": "application/json" } });
      await ops.delete(op.id!);
    } catch {
      await ops.update(op.id!, { attempts: op.attempts + 1 });
    }
  }
}
