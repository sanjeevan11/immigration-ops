/**
 * Storage Utilities
 * Manages in-memory data storage for the UK Immigration Case Management App
 * NOTE: All data is stored in browser memory (not localStorage due to sandbox restrictions)
 * Data will be cleared when the page is refreshed or closed
 */

const StorageManager = {
  // In-memory storage object (replaces localStorage)
  memoryStorage: {},

  // Storage keys
  KEYS: {
    GDPR_CONSENT: 'ukimm_gdpr_consent',
    CLIENT_DATA: 'ukimm_client_data',
    DEADLINES: 'ukimm_deadlines',
    UPLOADED_FILES: 'ukimm_uploaded_files',
    DEMO_MODE: 'ukimm_demo_mode'
  },

  /**
   * Save data to in-memory storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  save(key, value) {
    try {
      this.memoryStorage[key] = JSON.parse(JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      return false;
    }
  },

  /**
   * Load data from in-memory storage
   * @param {string} key - Storage key
   * @returns {any} Data or null
   */
  load(key) {
    try {
      return this.memoryStorage[key] ? JSON.parse(JSON.stringify(this.memoryStorage[key])) : null;
    } catch (error) {
      console.error('Storage load error:', error);
      return null;
    }
  },

  /**
   * Remove specific item from in-memory storage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      delete this.memoryStorage[key];
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  /**
   * Clear all application data from in-memory storage
   */
  clearAll() {
    try {
      this.memoryStorage = {};
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  /**
   * Save client intake data
   * @param {object} data - Client data object
   */
  saveClientData(data) {
    return this.save(this.KEYS.CLIENT_DATA, data);
  },

  /**
   * Load client intake data
   * @returns {object|null} Client data
   */
  loadClientData() {
    return this.load(this.KEYS.CLIENT_DATA);
  },

  /**
   * Save GDPR consent status
   * @param {boolean} consent - Consent status
   */
  saveGDPRConsent(consent) {
    return this.save(this.KEYS.GDPR_CONSENT, {
      consented: consent,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Check GDPR consent status
   * @returns {boolean} Consent status
   */
  hasGDPRConsent() {
    const consent = this.load(this.KEYS.GDPR_CONSENT);
    return consent && consent.consented === true;
  },

  /**
   * Save deadlines
   * @param {array} deadlines - Array of deadline objects
   */
  saveDeadlines(deadlines) {
    return this.save(this.KEYS.DEADLINES, deadlines);
  },

  /**
   * Load deadlines
   * @returns {array} Array of deadline objects
   */
  loadDeadlines() {
    return this.load(this.KEYS.DEADLINES) || [];
  },

  /**
   * Save uploaded files metadata
   * NOTE: Files are stored as base64 strings in localStorage
   * This is not suitable for production with large files
   * @param {array} files - Array of file objects
   */
  saveUploadedFiles(files) {
    return this.save(this.KEYS.UPLOADED_FILES, files);
  },

  /**
   * Load uploaded files metadata
   * @returns {array} Array of file objects
   */
  loadUploadedFiles() {
    return this.load(this.KEYS.UPLOADED_FILES) || [];
  },

  /**
   * Save demo mode status
   * @param {boolean} isDemoMode - Demo mode status
   */
  saveDemoMode(isDemoMode) {
    return this.save(this.KEYS.DEMO_MODE, isDemoMode);
  },

  /**
   * Check if demo mode is active
   * @returns {boolean} Demo mode status
   */
  isDemoMode() {
    return this.load(this.KEYS.DEMO_MODE) === true;
  },

  /**
   * Get storage usage information
   * @returns {object} Storage usage stats
   */
  getStorageInfo() {
    let totalSize = 0;
    const items = {};

    Object.entries(this.KEYS).forEach(([name, key]) => {
      const value = this.memoryStorage[key];
      const size = value ? new Blob([JSON.stringify(value)]).size : 0;
      items[name] = {
        key,
        size,
        sizeKB: (size / 1024).toFixed(2)
      };
      totalSize += size;
    });

    return {
      items,
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}