const DATABASE_NAME = 'life-clock-community-media';
const DATABASE_VERSION = 1;
const MEDIA_STORE = 'videos';
const LOCAL_VIDEO_PREFIX = 'indexeddb-video://';

interface StoredCommunityVideo {
  blob: Blob;
  fileName: string;
  contentType: string;
  savedAt: number;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openMediaDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Persistent browser storage is unavailable.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(MEDIA_STORE)) {
          database.createObjectStore(MEDIA_STORE);
        }
      };

      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => reject(request.error || new Error('Could not open browser media storage.'));
      request.onblocked = () => reject(new Error('Browser media storage is blocked by another tab.'));
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise!;
}

function createMediaId(): string {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${Date.now()}-${randomPart}`;
}

function getVideoContentType(file: File): string {
  if (file.type.startsWith('video/')) return file.type;

  const extension = file.name.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    ogv: 'video/ogg',
    ogg: 'video/ogg',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
  };
  return (extension && types[extension]) || 'application/octet-stream';
}

/** Save an uploaded video as a Blob, keeping large media out of localStorage. */
export async function saveCommunityVideo(file: File): Promise<string> {
  const database = await openMediaDatabase();
  const id = createMediaId();
  const contentType = getVideoContentType(file);
  const storedVideo: StoredCommunityVideo = {
    blob: new Blob([file], { type: contentType }),
    fileName: file.name,
    contentType,
    savedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(MEDIA_STORE, 'readwrite');
    transaction.objectStore(MEDIA_STORE).put(storedVideo, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Could not save the uploaded video.'));
    transaction.onabort = () => reject(transaction.error || new Error('Video saving was interrupted.'));
  });

  return `${LOCAL_VIDEO_PREFIX}${id}`;
}

export function isLocallyStoredVideoUrl(url: string): boolean {
  return url.startsWith(LOCAL_VIDEO_PREFIX);
}

/** Resolve persisted local videos to a temporary URL that a native video element can play. */
export async function resolveCommunityVideoUrl(
  url: string,
): Promise<{ url: string; release?: () => void }> {
  if (!isLocallyStoredVideoUrl(url)) {
    return { url };
  }

  const id = url.slice(LOCAL_VIDEO_PREFIX.length);
  if (!id) throw new Error('The saved video reference is invalid.');

  const database = await openMediaDatabase();
  const record = await new Promise<StoredCommunityVideo | undefined>((resolve, reject) => {
    const transaction = database.transaction(MEDIA_STORE, 'readonly');
    const request = transaction.objectStore(MEDIA_STORE).get(id);
    request.onsuccess = () => resolve(request.result as StoredCommunityVideo | undefined);
    request.onerror = () => reject(request.error || new Error('Could not read the saved video.'));
  });

  if (!record?.blob) {
    throw new Error('The saved video is missing from this browser.');
  }

  const objectUrl = URL.createObjectURL(record.blob);
  return { url: objectUrl, release: () => URL.revokeObjectURL(objectUrl) };
}

/** Migrate videos saved by the old Base64-in-localStorage upload flow. */
export async function migrateLegacyCommunityVideo(dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], `legacy-video-${Date.now()}`, {
    type: blob.type || 'video/mp4',
  });
  return saveCommunityVideo(file);
}
