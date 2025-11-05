/**
 * Document Upload Management
 * Handles file uploads, validation, and document checklist
 */

const DocumentManager = {
  dropZone: null,
  fileInput: null,
  uploadedFilesContainer: null,
  requiredDocsChecklist: null,
  uploadedFiles: [],
  requiredDocs: [],
  maxFileSize: 20 * 1024 * 1024, // 20MB in bytes
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],

  /**
   * Initialize document manager
   */
  init() {
    this.dropZone = document.getElementById('dropZone');
    this.fileInput = document.getElementById('fileInput');
    this.uploadedFilesContainer = document.getElementById('uploadedFiles');
    this.requiredDocsChecklist = document.getElementById('requiredDocsChecklist');

    if (!this.dropZone || !this.fileInput) return;

    this.attachEventListeners();
    this.loadUploadedFiles();
    this.loadRequiredDocs();
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Click to upload
    this.dropZone.addEventListener('click', () => {
      if (GDPRManager.areFeaturesEnabled()) {
        this.fileInput.click();
      } else {
        GDPRManager.showNotification('Please accept privacy consent to upload files', 'error');
      }
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      
      if (GDPRManager.areFeaturesEnabled()) {
        this.handleFiles(e.dataTransfer.files);
      } else {
        GDPRManager.showNotification('Please accept privacy consent to upload files', 'error');
      }
    });

    // Keyboard accessibility for drop zone
    this.dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.fileInput.click();
      }
    });
  },

  /**
   * Handle selected files
   * @param {FileList} files - Selected files
   */
  handleFiles(files) {
    Array.from(files).forEach(file => {
      if (this.validateFile(file)) {
        this.addFile(file);
      }
    });
  },

  /**
   * Validate file
   * @param {File} file - File to validate
   * @returns {boolean} Validation result
   */
  validateFile(file) {
    // Check file size
    if (file.size > this.maxFileSize) {
      GDPRManager.showNotification(`File "${file.name}" is too large. Maximum size is 20MB.`, 'error');
      return false;
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      GDPRManager.showNotification(`File "${file.name}" has an unsupported format. Please upload PDF, JPG, or PNG files.`, 'error');
      return false;
    }

    return true;
  },

  /**
   * Add file to uploaded files list
   * @param {File} file - File to add
   */
  addFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target.result,
        uploadedAt: new Date().toISOString()
      };

      this.uploadedFiles.push(fileData);
      this.saveUploadedFiles();
      this.renderUploadedFiles();
      this.updateRequiredDocsChecklist();
      this.updateDashboard();

      // Show warning for image files
      if (file.type.startsWith('image/')) {
        GDPRManager.showNotification(`Note: "${file.name}" is an image file. For tribunal submissions, PDF format at 300 DPI is recommended.`, 'info');
      }

      GDPRManager.showNotification(`File "${file.name}" uploaded successfully!`, 'success');
    };

    reader.readAsDataURL(file);
  },

  /**
   * Remove file from uploaded files
   * @param {string} fileId - File ID to remove
   */
  removeFile(fileId) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
    this.saveUploadedFiles();
    this.renderUploadedFiles();
    this.updateRequiredDocsChecklist();
    this.updateDashboard();
    GDPRManager.showNotification('File removed successfully', 'success');
  },

  /**
   * Save uploaded files to storage
   */
  saveUploadedFiles() {
    StorageManager.saveUploadedFiles(this.uploadedFiles);
  },

  /**
   * Load uploaded files from storage
   */
  loadUploadedFiles() {
    this.uploadedFiles = StorageManager.loadUploadedFiles();
    this.renderUploadedFiles();
  },

  /**
   * Render uploaded files list
   */
  renderUploadedFiles() {
    if (!this.uploadedFilesContainer) return;

    if (this.uploadedFiles.length === 0) {
      this.uploadedFilesContainer.innerHTML = '';
      return;
    }

    this.uploadedFilesContainer.innerHTML = this.uploadedFiles.map(file => `
      <div class="file-item" data-file-id="${file.id}">
        <div class="file-icon">${this.getFileIcon(file.type)}</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">${this.formatFileSize(file.size)} • ${this.getFileTypeLabel(file.type)}</div>
        </div>
        <div class="file-actions">
          <button class="file-delete" onclick="DocumentManager.removeFile('${file.id}')" aria-label="Delete ${file.name}">
            ❌
          </button>
        </div>
      </div>
    `).join('');
  },

  /**
   * Get file icon emoji
   * @param {string} fileType - MIME type
   * @returns {string} Emoji icon
   */
  getFileIcon(fileType) {
    if (fileType === 'application/pdf') return '📄';
    if (fileType.startsWith('image/')) return '🖼️';
    return '📁';
  },

  /**
   * Get file type label
   * @param {string} fileType - MIME type
   * @returns {string} Human-readable label
   */
  getFileTypeLabel(fileType) {
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') return 'JPG';
    if (fileType === 'image/png') return 'PNG';
    return 'File';
  },

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  /**
   * Update required documents based on visa type
   * @param {string} visaType - Selected visa type
   */
  updateRequiredDocuments(visaType) {
    // Get required documents from IntakeManager
    if (typeof IntakeManager !== 'undefined' && IntakeManager.visaTypes[visaType]) {
      this.requiredDocs = IntakeManager.visaTypes[visaType];
      this.saveRequiredDocs();
      this.renderRequiredDocsChecklist();
      this.updateDashboard();
    }
  },

  /**
   * Save required docs to storage
   */
  saveRequiredDocs() {
    const clientData = StorageManager.loadClientData() || {};
    clientData.requiredDocs = this.requiredDocs;
    StorageManager.saveClientData(clientData);
  },

  /**
   * Load required docs from storage
   */
  loadRequiredDocs() {
    const clientData = StorageManager.loadClientData();
    if (clientData && clientData.requiredDocs) {
      this.requiredDocs = clientData.requiredDocs;
      this.renderRequiredDocsChecklist();
    }
  },

  /**
   * Render required documents checklist
   */
  renderRequiredDocsChecklist() {
    if (!this.requiredDocsChecklist) return;

    if (this.requiredDocs.length === 0) {
      this.requiredDocsChecklist.innerHTML = '<p class="hint-text">Complete the intake form to see required documents for your visa type</p>';
      return;
    }

    this.requiredDocsChecklist.innerHTML = this.requiredDocs.map(doc => {
      const isUploaded = this.isDocumentUploaded(doc);
      return `
        <div class="required-doc-item ${isUploaded ? 'completed' : ''}">
          <span class="doc-checkbox ${isUploaded ? 'checked' : ''}">${isUploaded ? '✅' : '⬜'}</span>
          <span class="doc-name">${doc}</span>
        </div>
      `;
    }).join('');
  },

  /**
   * Check if a required document has been uploaded
   * @param {string} docName - Document name
   * @returns {boolean}
   */
  isDocumentUploaded(docName) {
    // Simple keyword matching
    const keywords = docName.toLowerCase().split(/[\s\/\(\)]+/);
    return this.uploadedFiles.some(file => {
      const fileName = file.name.toLowerCase();
      return keywords.some(keyword => fileName.includes(keyword) && keyword.length > 2);
    });
  },

  /**
   * Update required docs checklist status
   */
  updateRequiredDocsChecklist() {
    this.renderRequiredDocsChecklist();
  },

  /**
   * Update dashboard with document stats
   */
  updateDashboard() {
    const docsProgress = document.getElementById('docsProgress');
    if (docsProgress) {
      const completed = this.requiredDocs.filter(doc => this.isDocumentUploaded(doc)).length;
      const total = this.requiredDocs.length;
      docsProgress.textContent = `${completed}/${total}`;
      
      if (completed === total && total > 0) {
        docsProgress.style.color = 'var(--color-success)';
      } else {
        docsProgress.style.color = 'var(--color-primary)';
      }
    }
  }
};