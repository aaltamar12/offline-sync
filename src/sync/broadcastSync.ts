export type SyncEvent =
  | { type: "sync_complete"; table: string; ids: string[] }
  | { type: "conflict_resolved"; table: string; id: string; strategy: string }
  | { type: "queue_drained" };

const CHANNEL_NAME = "offline-sync";

export class BroadcastSyncChannel {
  private channel: BroadcastChannel | null;

  constructor() {
    this.channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(CHANNEL_NAME)
        : null;
  }

  post(event: SyncEvent): void {
    this.channel?.postMessage(event);
  }

  onMessage(handler: (event: SyncEvent) => void): () => void {
    if (!this.channel) return () => {};
    const listener = (e: MessageEvent<SyncEvent>) => handler(e.data);
    this.channel.addEventListener("message", listener);
    return () => this.channel?.removeEventListener("message", listener);
  }

  close(): void {
    this.channel?.close();
  }
}

export const broadcastSyncChannel = new BroadcastSyncChannel();
