/**
 * IndexedDB Media Storage for Pattern Notes.
 *
 * Persists large binary blobs (screenshots, architecture diagrams, whiteboard photos)
 * directly in browser IndexedDB to prevent localStorage quota exhaustion.
 */

const DB_NAME = "pattern-notes-media";
const DB_VERSION = 1;
const STORE_NAME = "images";

export interface StoredMediaRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  updatedAt: string;
}

class IndexedDbMediaStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not supported in this environment"));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error("Failed to open IndexedDB"));
      };
    });

    return this.dbPromise;
  }

  /**
   * Stores a binary blob under the specified asset ID.
   */
  async storeImage(id: string, blob: Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const record: StoredMediaRecord = {
        id,
        blob,
        mimeType: blob.type || "image/png",
        updatedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error(`Failed to store image ${id}`));
    });
  }

  /**
   * Retrieves a binary blob by asset ID.
   */
  async getImage(id: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result as StoredMediaRecord | undefined;
        resolve(record ? record.blob : null);
      };
      req.onerror = () => reject(req.error || new Error(`Failed to get image ${id}`));
    });
  }

  /**
   * Deletes an image record by asset ID.
   */
  async deleteImage(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error(`Failed to delete image ${id}`));
    });
  }

  /**
   * Reads all stored images and converts them to base64 Data URLs for portable export bundles.
   */
  async getAllImagesAsBase64(): Promise<Record<string, string>> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = async () => {
        const records = (req.result as StoredMediaRecord[]) || [];
        const result: Record<string, string> = {};

        for (const rec of records) {
          result[rec.id] = await this.blobToDataUrl(rec.blob);
        }

        resolve(result);
      };

      req.onerror = () => reject(req.error || new Error("Failed to export images"));
    });
  }

  /**
   * Ingests a dictionary of base64 Data URLs into IndexedDB during bundle import.
   */
  async importImagesFromBase64(media: Record<string, string>): Promise<number> {
    let count = 0;
    for (const [id, dataUrl] of Object.entries(media)) {
      try {
        const blob = await this.dataUrlToBlob(dataUrl);
        await this.storeImage(id, blob);
        count++;
      } catch (err) {
        console.error(`Failed to import image asset ${id}:`, err);
      }
    }
    return count;
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const res = await fetch(dataUrl);
    return res.blob();
  }
}

export const mediaStorage = new IndexedDbMediaStorage();
