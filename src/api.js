export const API_BASE = '/api';

export const uploadPhoto = async (blob, date, type) => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('date', date);
    formData.append('type', type);

    const response = await fetch(`${API_BASE}/upload_photo.php`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }
    return await response.json();
};

export const getPhotos = async (date) => {
    let url = `${API_BASE}/get_photos.php`;
    if (date) {
        url += `?date=${date}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch photos');
    }
    return await response.json();
};

export const deletePhoto = async (id) => {
    const response = await fetch(`${API_BASE}/delete_photo.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
    }
    return await response.json();
};

export const fetchSettings = async () => {
    const response = await fetch(`${API_BASE}/get_settings.php`);
    if (response.status === 401) return null; // Not logged in
    if (!response.ok) {
        throw new Error('Failed to fetch settings');
    }
    const data = await response.json();
    if (Object.keys(data).length === 0) return null;
    return data;
};

export const updateSettings = async (settings) => {
    const response = await fetch(`${API_BASE}/save_settings.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Save settings failed');
    }
    return await response.json();
};
