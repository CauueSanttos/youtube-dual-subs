// import { translateText } from './api/translation';

interface Settings {
  enabled: boolean;
  sourceLang: string;
  targetLang: string;
}

class DualSubtitlesManager {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private settings: Settings = {
    enabled: true,
    sourceLang: 'en',
    targetLang: 'pt',
  };
  private observer: MutationObserver | null = null;
  private initialized = false;
  private retryCount = 0;
  private maxRetries = 50; // Increased max retries
  private initTimeout: number | null = null;
  private debounceTimeout: number | null = null;
  private lastSubtitleText = '';
  private navigationInterval: number | null = null;

  constructor() {
    this.loadSettings();
    // Initial setup
    this.initialize();
    
    // Listen for navigation changes on YouTube (it's a SPA)
    this.setupNavigationListener();
  }

  private setupNavigationListener() {
    // YouTube is a SPA, so we need to reinitialize when navigation happens
    const checkForYouTubeNavigation = () => {
      if (window.location.href.includes('/watch') && !this.initialized) {
        this.initialize();
      }
    };
    
    // Check every second for navigation changes
    this.navigationInterval = window.setInterval(checkForYouTubeNavigation, 1000);
    
    // Also listen for URL changes
    window.addEventListener('yt-navigate-finish', () => {
      if (window.location.href.includes('/watch')) {
        this.initialize();
      } else {
        this.cleanup();
      }
    });
  }

  private async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      if (result.settings) {
        this.settings = result.settings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private initialize() {
    // Only initialize on watch pages
    if (!window.location.pathname.includes('/watch')) {
      return;
    }
    
    // Clean up any previous instances
    this.cleanup();
    
    // Create subtitle container
    this.container = document.createElement('div');
    this.container.className = 'yt-dual-subs-container';
    this.container.style.cssText = `
      position: absolute;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: none;
      width: 80%;
      max-width: 800px;
    `;

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
        this.settings = changes.settings.newValue;
        this.updateButtonState();
        if (this.container) {
          this.container.style.display = this.settings.enabled ? 'flex' : 'none';
          // Toggle YouTube captions based on our settings
          this.toggleYouTubeNativeCaptions(!this.settings.enabled);
        }
      }
    });

    // Start trying to initialize UI components
    this.tryInitialize();
  }

  private tryInitialize() {
    const videoPlayer = document.querySelector('.html5-video-player');
    const videoContainer = document.querySelector('.html5-video-container');
    const controls = document.querySelector('.ytp-right-controls');
    
    if (videoPlayer && videoContainer && controls) {
      this.initialized = true;
      
      // Add container to video player
      if (this.container && !document.querySelector('.yt-dual-subs-container')) {
        videoPlayer.appendChild(this.container);
        if (this.settings.enabled) {
          this.container.style.display = 'flex';
          // Hide YouTube's native captions when our subtitles are enabled
          this.toggleYouTubeNativeCaptions(false);
        }
      }

      // Add toggle button
      this.addToggleButton();

      // Start observing subtitles
      this.startObserver();
    } else if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.initTimeout = window.setTimeout(() => this.tryInitialize(), 500);
    }
  }

  private addToggleButton() {
    // Find the YouTube right controls container
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls) {
      return;
    }
    
    // Remove any existing button to avoid duplicates
    const existingButton = document.querySelector('.dual-subs-toggle');
    if (existingButton) {
      existingButton.remove();
    }

    // Create button using the EXACT same structure as YouTube buttons
    const toggleButton = document.createElement('button');
    toggleButton.className = 'ytp-button';
    toggleButton.setAttribute('data-priority', '4');
    toggleButton.setAttribute('data-title-no-tooltip', 'Dual Subtitles');
    toggleButton.setAttribute('aria-keyshortcuts', 'd');  // Optional keyboard shortcut
    toggleButton.setAttribute('title', `Dual Subtitles (d)`);
    toggleButton.setAttribute('aria-label', `Dual Subtitles ${this.settings.enabled ? 'ativado' : 'desativado'} atalho do teclado d`);
    
    // Create an SVG icon with better styling
    const svgHTML = `
      <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%" fill-opacity="1">
        <defs>
          <linearGradient id="ds-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.settings.enabled ? '#ff0000' : '#ffffff'};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.settings.enabled ? '#cc0000' : '#e6e6e6'};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect id="ds-background" x="10" y="13" width="16" height="10" rx="5" 
              fill="url(#ds-gradient)" 
              stroke="${this.settings.enabled ? '#ff0000' : '#ccc'}" 
              stroke-width="0.5" />
        <text id="ds-text" x="18" y="21" 
              text-anchor="middle" 
              font-family="Arial, sans-serif" 
              font-size="8" 
              font-weight="bold" 
              fill="${this.settings.enabled ? '#ffffff' : '#333333'}">DS</text>
      </svg>
    `;
    
    toggleButton.innerHTML = svgHTML;
    
    // Add the click handler
    toggleButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.settings.enabled = !this.settings.enabled;
      chrome.storage.sync.set({ settings: this.settings });
      this.updateButtonState();
      
      // Toggle visibility of our custom subtitles
      if (this.container) {
        this.container.style.display = this.settings.enabled ? 'flex' : 'none';
      }
      
      // Toggle visibility of YouTube's native captions
      this.toggleYouTubeNativeCaptions(!this.settings.enabled);
    };

    // Store the button for later state updates
    this.button = toggleButton;
    
    // Insert after captions button
    const subtitlesButton = document.querySelector('.ytp-subtitles-button');
    if (subtitlesButton && subtitlesButton.parentNode) {
      subtitlesButton.parentNode.insertBefore(toggleButton, subtitlesButton.nextSibling);
    } else {
      // Fallback - add to beginning of controls
      const firstButton = rightControls.querySelector('button');
      if (firstButton) {
        rightControls.insertBefore(toggleButton, firstButton);
      } else {
        rightControls.appendChild(toggleButton);
      }
    }
  }

  private updateButtonState() {
    if (this.button) {
      // Get SVG elements
      const background = this.button.querySelector('#ds-background');
      const text = this.button.querySelector('#ds-text');
      const gradient = this.button.querySelector('#ds-gradient');
      
      // Update gradient colors
      if (gradient instanceof SVGElement) {
        const stops = gradient.querySelectorAll('stop');
        if (stops.length >= 2) {
          stops[0].setAttribute('style', `stop-color:${this.settings.enabled ? '#ff0000' : '#ffffff'};stop-opacity:1`);
          stops[1].setAttribute('style', `stop-color:${this.settings.enabled ? '#cc0000' : '#e6e6e6'};stop-opacity:1`);
        }
      }
      
      // Update rectangle stroke
      if (background instanceof SVGElement) {
        background.setAttribute('stroke', this.settings.enabled ? '#ff0000' : '#ccc');
      }
      
      // Update text color
      if (text instanceof SVGElement) {
        text.setAttribute('fill', this.settings.enabled ? '#ffffff' : '#333333');
      }
      
      // Update button title and aria-label with YouTube-style formatting
      this.button.setAttribute('title', `Dual Subtitles (d)`);
      this.button.setAttribute('aria-label', `Dual Subtitles ${this.settings.enabled ? 'ativado' : 'desativado'} atalho do teclado d`);
    }
  }

  private startObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Look for different types of subtitle containers that YouTube might use
    const subtitlesContainer = 
      document.querySelector('.ytp-caption-segment-container') || 
      document.querySelector('.ytp-caption-window-container') || 
      document.querySelector('.captions-text');
      
    if (!subtitlesContainer) {
      setTimeout(() => this.startObserver(), 1000);
      return;
    }

    this.observer = new MutationObserver(() => {
      // Debounce the subtitle changes to avoid excessive processing
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      
      this.debounceTimeout = window.setTimeout(() => {
        this.processSubtitleChanges();
      }, 100); // Reduced debounce delay
    });

    this.observer.observe(subtitlesContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    
    // Also observe the entire video player for captions being enabled/disabled
    const videoPlayer = document.querySelector('.html5-video-player');
    if (videoPlayer) {
      const playerObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const classList = (mutation.target as Element).classList;
            if (classList.contains('ytp-subtitles-enabled')) {
              this.startObserver();
            }
          }
        });
      });
      
      playerObserver.observe(videoPlayer, { attributes: true });
    }
  }

  private processSubtitleChanges() {
    // Look for different types of subtitle elements
    const subtitleElements = 
      document.querySelectorAll('.ytp-caption-segment') || 
      document.querySelectorAll('.captions-text');
      
    if (subtitleElements.length > 0) {
      const text = Array.from(subtitleElements)
        .map(el => el.textContent)
        .join(' ')
        .trim();
      
      // Only process if the text has changed and is not empty
      if (text && text !== this.lastSubtitleText) {
        this.lastSubtitleText = text;
        this.handleSubtitleChange(text);
      }
    }
  }

  private async handleSubtitleChange(text: string) {
    if (!this.settings.enabled || !text) return;

    try {
      // Use background script for translation instead of direct API call
      const response = await chrome.runtime.sendMessage({
        type: 'TRANSLATE',
        text: text,
        from: this.settings.sourceLang,
        to: this.settings.targetLang
      });
      
      if (response && response.success) {
        this.updateSubtitles(text, response.translation);
      } else {
        this.updateSubtitles(text, text); // Show original if translation fails
      }
    } catch (error) {
      this.updateSubtitles(text, text); // Show original if translation fails
    }
  }

  private updateSubtitles(original: string, translated: string) {
    if (!this.container || !this.settings.enabled) return;

    this.container.innerHTML = `
      <div class="original-subtitle" style="
        font-size: 1.8em;
        font-weight: bold;
        text-shadow: 2px 2px 2px rgba(0,0,0,0.8);
        color: white;
        margin-bottom: 5px;
        background: rgba(0, 0, 0, 0.7);
        padding: 5px 10px;
        border-radius: 4px;
        text-align: center;
        width: auto;
        display: inline-block;
        max-width: 100%;
      ">${original}</div>
      <div class="translated-subtitle" style="
        font-size: 1.5em;
        color: rgba(255,255,255,0.9);
        text-shadow: 2px 2px 2px rgba(0,0,0,0.8);
        background: rgba(0, 0, 0, 0.7);
        padding: 5px 10px;
        border-radius: 4px;
        text-align: center;
        width: auto;
        display: inline-block;
        max-width: 100%;
      ">${translated}</div>
    `;
  }

  public cleanup() {
    // Stop observers
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Clear timeouts
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
    
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    // Clear intervals
    if (this.navigationInterval) {
      clearInterval(this.navigationInterval);
      this.navigationInterval = null;
    }
    
    // Remove DOM elements
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
    
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
      this.button = null;
    }
    
    // Reset state
    this.initialized = false;
    this.retryCount = 0;
    this.lastSubtitleText = '';
  }

  private toggleYouTubeNativeCaptions(enabled: boolean) {
    // Find all YouTube caption containers - we need to be very specific
    const captionWindows = document.querySelectorAll('.caption-window, .ytp-caption-window-container');
    
    // Hide entire caption windows but preserve controls
    captionWindows.forEach(container => {
      if (container instanceof HTMLElement) {
        // Set to transparent instead of hiding, so the structure remains but text is invisible
        if (!enabled) {
          container.style.opacity = '0';
          container.style.pointerEvents = 'none'; // Let clicks pass through
        } else {
          container.style.opacity = '1';
          container.style.pointerEvents = 'auto';
        }
      }
    });
    
    // Make our container have higher z-index
    if (this.container) {
      this.container.style.zIndex = '9999';
    }
  }
}

// Initialize the manager when the content script runs
const manager = new DualSubtitlesManager();

// Clean up when the page unloads
window.addEventListener('beforeunload', () => {
  if (manager) {
    manager.cleanup();
  }
});