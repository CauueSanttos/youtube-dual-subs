// Background script for handling communication and API calls

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Background script received message:", message);
  
  if (message.type === 'TRANSLATE') {
    translateText(message.text, message.from, message.to)
      .then(translation => {
        sendResponse({ success: true, translation });
      })
      .catch(error => {
        console.error('Translation error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
  
  // For any other message types
  return false;
});

// Handle translation
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
      throw new Error('Invalid response format from translation API');
    }

    return data[0][0][0];
  } catch (error) {
    console.error('Translation error in background script:', error);
    // Return original text if translation fails
    return text;
  }
}

// Initialize extension settings if they don't exist
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      const defaultSettings = {
        enabled: true,
        sourceLang: 'en',
        targetLang: 'pt'
      };
      
      chrome.storage.sync.set({ settings: defaultSettings }, () => {
        console.log('Default settings initialized:', defaultSettings);
      });
    }
  });
}); 