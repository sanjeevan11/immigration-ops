/**
 * Main Application Controller
 * Coordinates all modules and manages application state
 */

const AppManager = {
  currentSection: 'dashboard',
  demoMode: false,

  // Sample demo data
  demoData: {
    clientName: 'John Smith',
    clientEmail: 'john.smith@example.com',
    clientPhone: '+44 7700 900123',
    clientAddress: '123 High Street',
    clientCity: 'London',
    clientPostcode: 'SW1A 1AA',
    visaType: 'Spouse Visa',
    deadline1: '2025-12-15',
    deadline2: '2025-12-20',
    deadline3: '2026-02-15',
    deadline4: '',
    caseNotes: 'Client is British citizen sponsoring spouse from USA. Currently on visit visa, switching in-country.',
    gdprConsent: 'on'
  },

  // Immigration rules updates data
  rulesUpdates: [
    {
      date: '2025-04-04',
      title: 'Skilled Worker Salary Threshold Increase',
      description: 'Minimum salary increased from £26,200 to £38,700 for most roles',
      affectedRoutes: ['Skilled Worker', 'Health and Care Worker'],
      impact: 'Existing visa holders unaffected; new applicants must meet higher threshold'
    },
    {
      date: '2025-03-15',
      title: 'ETA Requirement Expansion',
      description: 'Electronic Travel Authorization now required for all non-visa nationals',
      affectedRoutes: ['Visit Visa'],
      impact: 'Visitors from visa-exempt countries must obtain ETA before travel'
    },
    {
      date: '2025-02-01',
      title: 'Family Visa Financial Requirement',
      description: 'Minimum income requirement confirmed at £29,000',
      affectedRoutes: ['Spouse Visa', 'Parent Visa', 'Partner Visa'],
      impact: 'Applies to all new applications; savings can supplement income'
    },
    {
      date: '2025-01-10',
      title: 'Student Work Hour Restrictions',
      description: 'Term-time work limit remains 20 hours/week; vacation work unlimited',
      affectedRoutes: ['Student Visa'],
      impact: 'Breach can lead to visa curtailment; employers must verify'
    }
  ],

  /**
   * Initialize application
   */
  init() {
    console.log('Initializing UK Immigration Case Manager...');

    // Initialize all modules
    GDPRManager.init();
    DeadlineManager.init();
    IntakeManager.init();
    DocumentManager.init();
    PDFExporter.init();

    // Setup navigation
    this.setupNavigation();

    // Setup demo mode
    this.setupDemoMode();

    // Setup WhatsApp integration
    this.setupWhatsApp();

    // Render rules updates
    this.renderRulesUpdates();

    // Setup help/FAQ
    this.setupHelpFAQ();

    console.log('Application initialized successfully!');
  },

  /**
   * Setup navigation between sections
   */
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        this.navigateToSection(section);
      });
    });
  },

  /**
   * Navigate to a specific section
   * @param {string} sectionId - Section ID to navigate to
   */
  navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === sectionId) {
        link.classList.add('active');
      }
    });

    this.currentSection = sectionId;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Setup demo mode toggle
   */
  setupDemoMode() {
    const demoToggle = document.getElementById('demoModeToggle');
    if (!demoToggle) return;

    // Check saved demo mode state
    this.demoMode = StorageManager.isDemoMode();
    this.updateDemoModeUI();

    demoToggle.addEventListener('click', () => {
      this.toggleDemoMode();
    });
  },

  /**
   * Toggle demo mode
   */
  toggleDemoMode() {
    this.demoMode = !this.demoMode;
    StorageManager.saveDemoMode(this.demoMode);
    this.updateDemoModeUI();

    if (this.demoMode) {
      this.loadDemoData();
      GDPRManager.showNotification('Demo mode enabled. Sample data loaded.', 'success');
    } else {
      GDPRManager.showNotification('Demo mode disabled. You can now enter real data.', 'info');
    }
  },

  /**
   * Update demo mode UI
   */
  updateDemoModeUI() {
    const demoToggle = document.getElementById('demoModeToggle');
    if (demoToggle) {
      demoToggle.textContent = `Demo Mode: ${this.demoMode ? 'ON' : 'OFF'}`;
      demoToggle.setAttribute('aria-pressed', this.demoMode);
      demoToggle.classList.toggle('btn--primary', this.demoMode);
      demoToggle.classList.toggle('btn--secondary', !this.demoMode);
    }
  },

  /**
   * Load demo data into form
   */
  loadDemoData() {
    // Save demo data
    StorageManager.saveClientData(this.demoData);

    // Populate form
    const form = document.getElementById('intakeForm');
    if (form) {
      Object.keys(this.demoData).forEach(key => {
        const field = form.elements[key];
        if (field) {
          if (field.type === 'checkbox') {
            field.checked = this.demoData[key] === 'on';
          } else {
            field.value = this.demoData[key];
          }
        }
      });

      // Update evidence checklist
      if (IntakeManager && IntakeManager.updateEvidenceChecklist) {
        IntakeManager.updateEvidenceChecklist(this.demoData.visaType);
      }
    }

    // Update deadlines
    if (DeadlineManager) {
      DeadlineManager.updateFromForm(this.demoData);
    }

    // Update documents
    if (DocumentManager) {
      DocumentManager.updateRequiredDocuments(this.demoData.visaType);
    }

    // Update dashboard
    if (IntakeManager) {
      IntakeManager.updateDashboard(this.demoData);
    }
  },

  /**
   * Setup WhatsApp integration
   */
  setupWhatsApp() {
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const closeWhatsappModal = document.getElementById('closeWhatsappModal');
    const openWhatsappBtn = document.getElementById('openWhatsappBtn');

    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        this.showWhatsAppModal();
      });
    }

    if (closeWhatsappModal) {
      closeWhatsappModal.addEventListener('click', () => {
        whatsappModal.setAttribute('hidden', 'true');
      });
    }

    if (openWhatsappBtn) {
      openWhatsappBtn.addEventListener('click', () => {
        this.openWhatsApp();
      });
    }
  },

  /**
   * Show WhatsApp modal
   */
  showWhatsAppModal() {
    const modal = document.getElementById('whatsappModal');
    const preview = document.getElementById('whatsappPreview');
    
    if (!modal || !preview) return;

    // Generate message preview
    const message = this.generateWhatsAppMessage();
    preview.textContent = message;

    modal.removeAttribute('hidden');
  },

  /**
   * Generate WhatsApp message
   * @returns {string} WhatsApp message
   */
  generateWhatsAppMessage() {
    const clientData = StorageManager.loadClientData();
    const deadlines = StorageManager.loadDeadlines();
    const uploadedFiles = StorageManager.loadUploadedFiles();

    let message = 'Hi! I\'ve started my UK immigration application.\n\n';

    if (clientData) {
      if (clientData.clientName) {
        message += `Name: ${clientData.clientName}\n`;
      }
      if (clientData.visaType) {
        message += `Visa Type: ${clientData.visaType}\n`;
      }
    }

    if (deadlines && deadlines.length > 0) {
      const nextDeadline = deadlines[0];
      message += `\nNext Deadline: ${nextDeadline.type} on ${nextDeadline.date}\n`;
    }

    if (clientData && clientData.requiredDocs) {
      const missingDocs = clientData.requiredDocs.filter(doc => {
        return !this.isDocumentUploaded(doc, uploadedFiles);
      });

      if (missingDocs.length > 0) {
        message += `\nI need help uploading:\n`;
        missingDocs.slice(0, 3).forEach(doc => {
          message += `• ${doc}\n`;
        });
      }
    }

    message += '\nCan you assist me with my application?';

    return message;
  },

  /**
   * Open WhatsApp with pre-filled message
   */
  openWhatsApp() {
    const phoneInput = document.getElementById('whatsappNumber');
    const phone = phoneInput ? phoneInput.value.replace(/\s+/g, '') : '+447000000000';
    const message = encodeURIComponent(this.generateWhatsAppMessage());
    const url = `https://wa.me/${phone}?text=${message}`;
    
    window.open(url, '_blank');
    
    const modal = document.getElementById('whatsappModal');
    if (modal) {
      modal.setAttribute('hidden', 'true');
    }
  },

  /**
   * Check if document is uploaded
   * @param {string} docName - Document name
   * @param {array} uploadedFiles - Array of uploaded files
   * @returns {boolean}
   */
  isDocumentUploaded(docName, uploadedFiles) {
    if (!uploadedFiles) return false;
    const keywords = docName.toLowerCase().split(/[\s\/\(\)]+/);
    return uploadedFiles.some(file => {
      const fileName = file.name.toLowerCase();
      return keywords.some(keyword => fileName.includes(keyword) && keyword.length > 2);
    });
  },

  /**
   * Render rules updates
   */
  renderRulesUpdates() {
    this.renderRulesList();
    this.renderRulesDetailed();
  },

  /**
   * Render rules list (dashboard widget)
   */
  renderRulesList() {
    const container = document.getElementById('rulesUpdatesList');
    if (!container) return;

    // Show latest 3 updates
    const recentUpdates = this.rulesUpdates.slice(0, 3);

    container.innerHTML = recentUpdates.map(update => `
      <div class="rule-item">
        <div class="rule-header">
          <h3 class="rule-title">${update.title}</h3>
          <span class="rule-date">${this.formatDate(update.date)}</span>
        </div>
        <p class="rule-description">${update.description}</p>
        <div class="rule-tags">
          ${update.affectedRoutes.map(route => `<span class="rule-tag">${route}</span>`).join('')}
        </div>
      </div>
    `).join('');
  },

  /**
   * Render detailed rules list
   */
  renderRulesDetailed() {
    const container = document.getElementById('rulesUpdatesDetailed');
    if (!container) return;

    container.innerHTML = this.rulesUpdates.map(update => `
      <div class="rule-item">
        <div class="rule-header">
          <h3 class="rule-title">${update.title}</h3>
          <span class="rule-date">${this.formatDate(update.date)}</span>
        </div>
        <p class="rule-description">${update.description}</p>
        <div class="rule-tags">
          ${update.affectedRoutes.map(route => `<span class="rule-tag">${route}</span>`).join('')}
        </div>
        <div class="rule-impact">
          <strong>Impact:</strong>
          <p>${update.impact}</p>
        </div>
      </div>
    `).join('');
  },

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  },

  /**
   * Setup help/FAQ
   */
  setupHelpFAQ() {
    const helpBtn = document.getElementById('helpFaqBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showHelpFAQ();
      });
    }
  },

  /**
   * Show help/FAQ modal
   */
  showHelpFAQ() {
    const helpContent = `
      <h3>Frequently Asked Questions</h3>
      
      <h4>What is a Certificate of Sponsorship?</h4>
      <p>A document from your UK employer confirming they are sponsoring your work visa.</p>
      
      <h4>What counts as accommodation proof?</h4>
      <p>Tenancy agreement, mortgage statement, or property inspection report showing you have suitable housing.</p>
      
      <h4>What is financial evidence?</h4>
      <p>Bank statements, payslips, or other documents proving you meet the income requirement for your visa type.</p>
      
      <h4>What is a CAS?</h4>
      <p>Confirmation of Acceptance for Studies - issued by your UK university or college for student visa applications.</p>
      
      <h4>Is my data secure?</h4>
      <p>Yes! All data is stored locally in your browser only and is never uploaded to any server. You can clear all data at any time.</p>
      
      <h4>How do I export my case summary?</h4>
      <p>Click the "Export Summary PDF" button on the dashboard to generate a PDF document with all your case information.</p>
    `;

    alert('Help & FAQ\n\nFor detailed help, please refer to the application sections or visit GOV.UK Immigration guidance.');
  }
};

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AppManager.init());
} else {
  AppManager.init();
}