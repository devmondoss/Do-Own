// Product Definition F02: evidence photos stay on this device only.
// Stored in IndexedDB, reduced to max 1280 px (JPEG) to save space.
// Nothing here is uploaded to a server or to the blockchain.
const DB = "do-own-evidence";
const STORE = "photos";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function shrink(file: Blob, max = 1280): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82),
    );
  } catch {
    return file;
  }
}

export async function saveEvidence(recordId: string, file: Blob) {
  const blob = await shrink(file);
  await run("readwrite", (s) => s.put(blob, recordId));
}

export async function getEvidence(recordId: string): Promise<Blob | null> {
  try {
    return ((await run("readonly", (s) => s.get(recordId))) as Blob) ?? null;
  } catch {
    return null;
  }
}

export async function deleteEvidence(recordId: string) {
  try {
    await run("readwrite", (s) => s.delete(recordId));
  } catch {
    /* ignore */
  }
}

export function clearAllEvidence() {
  try {
    indexedDB.deleteDatabase(DB);
  } catch {
    /* ignore */
  }
}
