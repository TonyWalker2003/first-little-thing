
const CLIENT_ID = '864471925571-aaadvcbehaeuecaigg261p8olc5oj2eb.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBnLfCfHVSx8s5tGv05UOyHqfpFT2NNNBM';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Robust initialization that waits for window.gapi and window.google
export const initGoogleClient = (onInitComplete) => {
    const checkScripts = setInterval(() => {
        if (window.gapi && window.google) {
            clearInterval(checkScripts);
            initializeGapi(onInitComplete);
        }
    }, 100);
};

const initializeGapi = (onInitComplete) => {
    window.gapi.load('client', async () => {
        try {
            await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;

            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: '', // defined dynamically in signIn
            });
            gisInited = true;

            console.log('Google Drive API initialized successfully');
            if (onInitComplete) onInitComplete();
        } catch (err) {
            console.error('Error initializing Google API:', err);
        }
    });
};

export const signIn = () => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            return reject(new Error('Google API not initialized yet. Please wait.'));
        }

        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                reject(resp);
            }
            // CRITICAL: Set the token for gapi.client to use for future requests
            const token = window.gapi.client.getToken();
            if (!token) {
                window.gapi.client.setToken(resp);
            }
            resolve(resp);
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};

export const ensureAuth = async () => {
    // Debugging: If flags are false but window objects exist, trust window objects
    if (!gapiInited && window.gapi && window.gapi.client) {
        console.warn('gapiInited was false, but window.gapi.client exists. Proceeding.');
        gapiInited = true;
    }
    if (!gisInited && tokenClient) {
        console.warn('gisInited was false, but tokenClient exists. Proceeding.');
        gisInited = true;
    }

    if (!gapiInited || !gisInited) {
        throw new Error(`Google API not initialized (gapi:${gapiInited}, gis:${gisInited}). Please refresh page.`);
    }

    const token = window.gapi.client.getToken();
    if (token !== null) return; // Already signed in
    await signIn();
};

export const uploadFile = async (blob, filename) => {
    await ensureAuth();

    const metadata = {
        name: filename,
        mimeType: blob.type,
        parents: ['root'] // Save to root for visibility
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const accessToken = window.gapi.client.getToken().access_token;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form,
    });

    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
};

export const getFileUrl = async (fileId) => {
    // Check if we have token
    const token = window.gapi.client.getToken();
    if (!token) return null;

    const accessToken = token.access_token;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
    });
    if (!res.ok) throw new Error('Failed to fetch file content');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
};

export const deleteFile = async (fileId) => {
    await ensureAuth();
    return window.gapi.client.drive.files.delete({
        fileId: fileId
    });
};
