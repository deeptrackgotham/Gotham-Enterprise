import verifyMedia, { RDResult } from "./realityDefender";

export interface BulkMedia {
  url?: string;
  fileBuffer?: Buffer;
  fileType?: "image" | "video" | "audio";
  fileName?: string; // optional, for mapping results
}

export async function verifyMediaBulk(
  items: BulkMedia[],
  parallel = 3 // number of concurrent requests
): Promise<{ media: BulkMedia; result?: RDResult; error?: string }[]> {
  const results: { media: BulkMedia; result?: RDResult; error?: string }[] = [];
  
  const queue = [...items]; // copy of items
  const workers: Promise<void>[] = [];

  const runWorker = async () => {
    while (queue.length > 0) {
      const media = queue.shift()!;
      try {
        const res = await verifyMedia({
          url: media.url,
          fileBuffer: media.fileBuffer,
          fileType: media.fileType,
        });
        results.push({ media, result: res });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ media, error: message || "Verification failed" });
      }
    }
  };

  // start workers in parallel
  for (let i = 0; i < parallel; i++) {
    workers.push(runWorker());
  }

  await Promise.all(workers);
  return results;
}

export default verifyMediaBulk;