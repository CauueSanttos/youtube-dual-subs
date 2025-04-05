import { useState, useEffect } from 'react'
import './App.css'

interface Settings {
  enabled: boolean;
  sourceLang: string;
  targetLang: string;
}

function App() {
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    sourceLang: 'en',
    targetLang: 'pt',
  });

  // Load settings on component mount
  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  // Save settings when they change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    const newSettings = {
      ...settings,
      [name]: newValue,
    };
    
    setSettings(newSettings);
    chrome.storage.sync.set({ settings: newSettings });
  };

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  return (
    <div className="app">
      <h1>YouTube Dual Subtitles</h1>
      
      <div className="toggle-container">
        <label className="toggle-switch">
          <input
            type="checkbox"
            name="enabled"
            checked={settings.enabled}
            onChange={handleChange}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">{settings.enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
      
      <div className="settings-container">
        <div className="setting-group">
          <label htmlFor="sourceLang">Learning Language:</label>
          <select
            id="sourceLang"
            name="sourceLang"
            value={settings.sourceLang}
            onChange={handleChange}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="setting-group">
          <label htmlFor="targetLang">Your Language:</label>
          <select
            id="targetLang"
            name="targetLang"
            value={settings.targetLang}
            onChange={handleChange}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="instructions">
        <h2>How to use:</h2>
        <ol>
          <li>Go to any YouTube video that has captions available</li>
          <li>Enable the original video captions (CC button)</li>
          <li>The translated captions will appear automatically</li>
          <li>Use the DS button in the YouTube player to toggle dual subtitles</li>
        </ol>
      </div>
      
      <footer>
        <p>YouTube Dual Subtitles v1.0</p>
      </footer>
    </div>
  )
}

export default App
