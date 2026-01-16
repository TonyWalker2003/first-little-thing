import { useState, useEffect } from 'react';
import './App.css';
import { getSettings, saveSetting, addPhoto, getPhotosByDate, deletePhoto, getAllPhotos, saveAllSettings } from './db';

function App() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('dashboard');
  const [driveError, setDriveError] = useState(null);
  // We don't need explicit signedIn state for Google anymore, but we might want to check PHP session status?
  // For now, let's assume if API fails (401), we handle it.
  // We can keep 'signedIn' as true since we are likely already logged in to PHP session to view this page.
  const [signedIn] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);


  const loadSettings = async () => {
    try {
      const data = await getSettings();
      if (data) {
        if (data.username) setUsername(data.username);

        if (data.startDate) {
          setSettings(data);
        }
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSettings = {
      startDate: formData.get('startDate'),
      cycleDuration: parseInt(formData.get('cycleDuration')),
      currentCycle: parseInt(formData.get('currentCycle')),
      nextAppointment: formData.get('nextAppointment'),
    };

    await saveAllSettings(newSettings);
    setSettings(newSettings);
  };

  if (loading) return <div className="loading">Loading...</div>;


  if (!settings) {
    return (
      <div className="card">
        <div className="header">
          <h1>歡迎使用牙套日記{username ? `，${username}` : ''}</h1>
          <p>請先設定您的矯正資訊</p>
        </div>
        <form onSubmit={handleSetup}>
          <div className="form-group">
            <label>開始矯正日期</label>
            <input type="date" name="startDate" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label>每副牙套配戴天數</label>
            <input type="number" name="cycleDuration" required defaultValue="7" min="1" />
          </div>
          <div className="form-group">
            <label>目前配戴第幾副</label>
            <input type="number" name="currentCycle" required defaultValue="1" min="1" />
          </div>
          <div className="form-group">
            <label>下次複診日期</label>
            <input type="date" name="nextAppointment" required />
          </div>
          <button type="submit" className="btn">開始紀錄</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {view === 'dashboard' && <Dashboard settings={settings} signedIn={signedIn} />}
      {view === 'history' && <HistoryView />}
      {view === 'settings' && <SettingsView settings={settings} />}



      <nav className="nav">
        <a href="#" className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>主頁</a>
        <a href="#" className={`nav-item ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>歷史</a>
        <a href="#" className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}>設定</a>
      </nav>
    </div>
  );
}

function Dashboard({ settings, signedIn }) {
  const [photos, setPhotos] = useState([]);
  const [selectedFile, setSelectedFile] = useState({ type: null, file: null });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const data = await getPhotosByDate(todayStr);
    setPhotos(data);
  };

  const today = new Date();
  const nextAppt = new Date(settings.nextAppointment);
  const diffTime = nextAppt - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ type, file });
    }
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile.file || !selectedFile.type) return;

    // Simulate checking session user_id (checking signedIn state)
    if (!signedIn) {
      alert('無法上傳：尚未登入 Google 帳號 (Session Valid Check Failed)');
      return;
    }

    try {
      console.log('Starting upload...');
      const photoData = {
        date: todayStr,
        type: selectedFile.type,
        blob: selectedFile.file,
        timestamp: Date.now()
      };

      await addPhoto(photoData);
      console.log('Upload complete, reloading photos...');
      await loadPhotos();
      setSelectedFile({ type: null, file: null }); // Clear selection
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`上傳失敗: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setSelectedFile({ type: null, file: null });
  };

  const handleDelete = async (id) => {
    if (confirm('確定要刪除這張照片嗎？')) {
      await deletePhoto(id);
      await loadPhotos();
    }
  };

  const wearingPhoto = photos.find(p => p.type === 'wearing');
  const notWearingPhoto = photos.find(p => p.type === 'not-wearing');

  return (
    <div>
      <div className="header">
        <h1>牙套日記</h1>
      </div>

      <div className="card">
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">目前進度</div>
            <div className="status-value">第 {settings.currentCycle} 副</div>
          </div>
          <div className="status-item">
            <div className="status-label">距離複診</div>
            <div className="status-value">{diffDays > 0 ? `${diffDays} 天` : '今天/已過期'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>今日紀錄 ({todayStr})</h3>

        {/* Upload Preview Section */}
        {selectedFile.file && (
          <div style={{ padding: '10px', background: '#eef', borderRadius: '8px', marginBottom: '15px' }}>
            <h4>準備上傳: {selectedFile.type === 'wearing' ? '配戴中' : '未配戴'}</h4>
            <p>{selectedFile.file.name}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn" onClick={handleUploadConfirm}>確認上傳</button>
              <button className="btn btn-secondary" onClick={handleCancel}>取消</button>
            </div>
          </div>
        )}

        <div className="photo-section">
          {['wearing', 'not-wearing'].map(type => {
            const photo = photos.find(p => p.type === type);
            const labelText = type === 'wearing' ? '配戴中' : '未配戴';

            return (
              <div key={type} className="photo-entry">
                <h4>{labelText}</h4>
                {photo ? (
                  <div>
                    <img src={photo.url} className="photo-preview" alt={type} />
                    <button className="btn btn-danger" style={{ marginTop: '10px' }} onClick={() => handleDelete(photo.id)}>刪除</button>
                  </div>
                ) : (
                  (!selectedFile.file || selectedFile.type !== type) && (
                    <label className="photo-placeholder">
                      <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, type)} />
                      選擇「{labelText}」照片
                    </label>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const allPhotos = await getAllPhotos();
    // Group by date
    const groups = {};
    allPhotos.forEach(p => {
      if (!groups[p.date]) groups[p.date] = [];
      groups[p.date].push(p);
    });

    // Sort dates desc
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    const historyData = sortedDates.map(date => ({
      date,
      photos: groups[date]
    }));
    setHistory(historyData);
  };

  return (
    <div>
      <div className="header">
        <h1>歷史紀錄</h1>
      </div>
      {history.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center' }}>尚無歷史紀錄</p>
        </div>
      ) : (
        history.map(item => (
          <div key={item.date} className="card">
            <h3>{item.date}</h3>
            <div className="status-grid">
              {item.photos.map(p => (
                <div key={p.id} className="status-item">
                  <div className="status-label">{p.type === 'wearing' ? '配戴中' : '未配戴'}</div>
                  <img src={p.url} style={{ width: '100%', borderRadius: '8px', height: '100px', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
function SettingsView({ settings }) {
  const handleExport = async () => {
    // Export Settings + Photos
    const allPhotos = await getAllPhotos();

    // No need to convert blobs anymore as we use URLs
    const backup = {
      settings: settings,
      photos: allPhotos,
      version: 2,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aligner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.settings) {
          // Restore settings
          for (const [key, value] of Object.entries(backup.settings)) {
            await saveSetting(key, value);
          }
        }
        if (backup.photos) {
          // Restore photos
          for (const p of backup.photos) {
            // Check if exists
            const existing = await getPhotosByDate(p.date);
            const alreadyExists = existing.find(e => e.type === p.type);
            if (!alreadyExists) {
              await addPhoto({
                date: p.date,
                type: p.type,
                url: p.url || p.blob, // Support older backups if p.blob was actually a base64 string acting as data URL? No, old backups had p.blob as base64. New structure has p.url.
                // If it's an old backup (v1), p.blob is base64. 
                // We should probably handle migration v1 -> v2 but for now let's assume v2 or just simple restore
                // Actually if it's v1 backup, p.blob is base64 string.
                // If we pass that as `url`, it might work as data URI!
                // So `url: p.url || p.blob` might just work for backward compatibility if `addPhoto` treats it as URL.
                storagePath: p.storagePath,
                timestamp: p.timestamp
              });
            }
          }
        }
        alert('還原成功！請重新整理頁面。');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('還原失敗，檔案格式可能錯誤');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="header">
        <h1>設定與備份</h1>
      </div>
      <div className="card">
        <h3>資料備份</h3>
        <p>將所有紀錄匯出成檔案，以便更換裝置或備份使用。</p>
        <button className="btn" onClick={handleExport}>匯出備份 (JSON)</button>
      </div>

      <div className="card">
        <h3>資料還原</h3>
        <p>從備份檔案還原紀錄。</p>
        <label className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
          選擇備份檔案
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </label>
        <p style={{ fontSize: '0.8rem', color: 'red', marginTop: '10px' }}>注意：還原後可能需要重新整理頁面。</p>
      </div>
    </div>
  );
}

export default App;
