import { openDB } from 'idb';
import { uploadPhoto, getPhotos, deletePhoto as apiDeletePhoto, fetchSettings, updateSettings } from './api';

const DB_NAME = 'aligner-tracker-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for app settings (current cycle, start date, appointment, etc.)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      // Store for daily photos
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      // Photos are now stored in MySQL, so we don't need 'photos' store in IDB.
      // Keeping this comment for context.
    },
  });
};

// export const initDB ... (keeping for reference or cleaning up?)
// Since we might remove IDB entirely if photos are also gone, 
// strictly speaking we don't need initDB for settings anymore.

export const getSettings = async () => {
  return await fetchSettings();
};

export const saveSetting = async (key, value) => {
  // The current app calls saveSetting(key, value) in a loop.
  // This is inefficient for API calls.
  // We should prefer a bulk update, but to minimize refactor impact:
  // We can fetch current settings, update the key, and save back.
  // OR, we can trust the App.jsx to call this.

  // NOTE: App.jsx calls saveSetting inside a loop:
  // for (const [key, value] of Object.entries(newSettings)) { await saveSetting(key, value); }

  // This triggers 4 API calls! Ideally, we refactor App.jsx.
  // BUT, to follow the interface:

  // Fetch existing first to merge (since API expects full object or partial?)
  // Our API `INSERT ON DUPLICATE UPDATE` allows updating individual fields if we passed them?
  // Actually our API overwrites all fields passed, defaulting missing ones to null if it's a new row.
  // If it's an update, `VALUES(col)` logic might overwrite with NULL if we don't pass it?
  // Let's check `save_settings.php`. 
  // $start_date = $data['startDate'] ?? null;
  // ... current_cycle = VALUES(current_cycle)
  // If we only pass one key, others might be set to NULL if it's an insert?
  // If it's an UPDATE, `VALUES(x)` refers to the value passed in the INSERT part.
  // If we pass NULL in INSERT, `VALUES(x)` is NULL.
  // So yes, we need to pass ALL settings to avoid overwriting others with NULL.

  // Strategy: Get current settings, merge, save.
  const current = (await getSettings()) || {};
  current[key] = value;
  await updateSettings(current);
};

// Start Helper: New function for bulk save if we modify App.jsx later
export const saveAllSettings = async (settings) => {
  await updateSettings(settings);
};

export const addPhoto = async (photoData) => {
  // photoData: { date: 'YYYY-MM-DD', type: 'wearing' | 'not-wearing', blob: Blob }

  // Upload to MySQL via PHP API
  return await uploadPhoto(photoData.blob, photoData.date, photoData.type);
};

export const getPhotosByDate = async (date) => {
  // Fetch from MySQL via PHP API
  return await getPhotos(date);
};

export const getAllPhotos = async () => {
  // Fetch all from MySQL via PHP API (no date filter)
  return await getPhotos();
};

export const deletePhoto = async (id) => {
  return await apiDeletePhoto(id);
};
