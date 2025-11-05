/**
 * GDPR Consent Management
 * Handles privacy consent, data protection, and user preferences
 */

const GDPRManager = {
  modal: null,
  acceptBtn: null,
  rejectBtn: null,
  consentCheckbox: null,
  featuresEnabled: false,

  /**
   * Initialize GDPR consent management
   */
  init() {
    this.modal = document.getElementById('gdprModal');
    this.acceptBtn = document.getElementById('gdprAccept');
    this.rejectBtn = document.getElementById('gdprReject');
    this.consentCheckbox = document.getElementById('gdprConsentCheckbox');

    // Check if consent already given
    if (StorageManager.hasGDPRConsent()) {
      this.hideModal();
      this.enableFeatures();
    } else {
      this.showModal();
    }

    this.attachEventListeners();
  },

  /**
   * Attach event listeners for consent actions
   */
  attachEventListeners() {
    // Enable accept button when checkbox is checked
    this.consentCheckbox.addEventListener('change', (e) => {
      this.acceptBtn.disabled = !e.target.checked;
    });

    // Accept consent
    this.acceptBtn.addEventListener('click', () => {
      this.acceptConsent();
    });

    // Reject consent
    this.rejectBtn.addEventListener('click', () => {
      this.rejectConsent();
    });

    // View privacy notice link
    const viewPrivacyBtn = document.getElementById('viewPrivacyBtn');
    if (viewPrivacyBtn) {
      viewPrivacyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showPrivacyNotice();
      });
    }

    // Clear all data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        this.clearAllData();
      });
    }
  },

  /**
   * Show GDPR consent modal
   */
  showModal() {
    if (this.modal) {
      this.modal.removeAttribute('hidden');
      this.modal.style.display = 'flex';
      // Focus on modal for accessibility
      this.consentCheckbox.focus();
    }
  },

  /**
   * Hide GDPR consent modal
   */
  hideModal() {
    if (this.modal) {
      this.modal.setAttribute('hidden', 'true');
      this.modal.style.display = 'none';
    }
  },

  /**
   * Handle consent acceptance
   */
  acceptConsent() {
    // Save consent
    StorageManager.saveGDPRConsent(true);
    this.hideModal();
    this.enableFeatures();
    this.showNotification('Privacy consent accepted. You can now use all features.', 'success');
  },

  /**
   * Handle consent rejection
   */
  rejectConsent() {
    StorageManager.saveGDPRConsent(false);
    this.hideModal();
    this.disableFeatures();
    this.showNotification('Privacy consent rejected. File upload and data features are disabled.', 'info');
  },

  /**
   * Enable all features after consent
   */
  enableFeatures() {
    this.featuresEnabled = true;
    document.body.classList.remove('features-disabled');
    
    // Enable file upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (dropZone && fileInput) {
      dropZone.style.pointerEvents = 'auto';
      fileInput.disabled = false;
    }
  },

  /**
   * Disable features when consent is rejected
   */
  disableFeatures() {
    this.featuresEnabled = false;
    document.body.classList.add('features-disabled');
    
    // Disable file upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (dropZone && fileInput) {
      dropZone.style.pointerEvents = 'none';
      dropZone.style.opacity = '0.5';
      fileInput.disabled = true;
    }
  },

  /**
   * Show privacy notice
   */
  showPrivacyNotice() {
    this.showModal();
  },

  /**
   * Clear all application data
   */
  clearAllData() {
    if (confirm('Are you sure you want to delete all case data? This action cannot be undone.')) {
      StorageManager.clearAll();
      this.showNotification('All data has been cleared successfully.', 'success');
      
      // Reload page to reset app state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  },

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      background-color: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-error)' : 'var(--color-info)'};
      color: white;
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-lg);
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  },

  /**
   * Check if features are enabled
   * @returns {boolean}
   */
  areFeaturesEnabled() {
    return this.featuresEnabled;
  }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);