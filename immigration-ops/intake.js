/**
 * Intake Form Management
 * Handles form validation, submission, and data management
 */

const IntakeManager = {
  form: null,
  visaTypeSelect: null,
  evidenceChecklist: null,
  
  // Visa types and their required documents
  visaTypes: {
    'Spouse Visa': [
      'Valid Passport',
      'Marriage Certificate',
      'Financial Evidence (6 months bank statements)',
      'Accommodation Proof (tenancy agreement/mortgage)',
      'English Language Certificate',
      'Relationship Evidence (photos, correspondence)'
    ],
    'Skilled Worker': [
      'Valid Passport',
      'Certificate of Sponsorship',
      'Job Offer Letter',
      'Payslips (3-6 months)',
      'Qualifications/Degree Certificates',
      'English Language Certificate'
    ],
    'Student Visa': [
      'Valid Passport',
      'CAS (Confirmation of Acceptance for Studies)',
      'Financial Evidence (tuition + living costs)',
      'Academic Transcripts',
      'ATAS Certificate (if required)',
      'Tuberculosis Test Certificate'
    ],
    'Visit Visa': [
      'Valid Passport',
      'Financial Evidence (bank statements)',
      'Accommodation Details',
      'Travel Itinerary',
      'Employment Letter'
    ],
    'Sponsor Licence': [
      'Company Registration Documents',
      'Proof of Trading',
      'HR Systems Documentation',
      'Compliance Documents',
      'Key Personnel Details'
    ],
    'EUSS': [
      'Valid Passport/ID',
      'Proof of Residence in UK',
      'Evidence of Relationship (if applicable)',
      'Comprehensive Sickness Insurance (if required)'
    ],
    'Settlement/ILR': [
      'Valid Passport',
      'Life in the UK Test Certificate',
      'English Language Certificate',
      'Continuous Residence Evidence',
      'P60/Payslips',
      'Council Tax Bills'
    ]
  },

  /**
   * Initialize intake form
   */
  init() {
    this.form = document.getElementById('intakeForm');
    this.visaTypeSelect = document.getElementById('visaType');
    this.evidenceChecklist = document.getElementById('evidenceChecklist');

    if (!this.form) return;

    this.attachEventListeners();
    this.loadSavedData();
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Real-time validation
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });

    // Visa type change
    this.visaTypeSelect.addEventListener('change', (e) => {
      this.updateEvidenceChecklist(e.target.value);
    });

    // Reset form button
    const resetBtn = document.getElementById('resetFormBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetForm());
    }
  },

  /**
   * Validate individual field
   * @param {HTMLElement} field - Form field to validate
   * @returns {boolean} Validation result
   */
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation (UK format)
    if (field.id === 'clientPhone' && value) {
      const phoneRegex = /^(\+44\s?|0)[0-9\s]{9,13}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid UK phone number (e.g., +44 7700 900000)';
      }
    }

    // Postcode validation (UK format)
    if (field.id === 'clientPostcode' && value) {
      const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
      if (!postcodeRegex.test(value.replace(/\s/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid UK postcode (e.g., SW1A 1AA)';
      }
    }

    // Checkbox validation
    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      isValid = false;
      errorMessage = 'You must accept this to continue';
    }

    // Display error
    if (!isValid) {
      this.showError(field, errorMessage);
    } else {
      this.clearError(field);
    }

    return isValid;
  },

  /**
   * Show validation error
   * @param {HTMLElement} field - Form field
   * @param {string} message - Error message
   */
  showError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.setAttribute('role', 'alert');
    }
  },

  /**
   * Clear validation error
   * @param {HTMLElement} field - Form field
   */
  clearError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
    }
  },

  /**
   * Validate entire form
   * @returns {boolean} Validation result
   */
  validateForm() {
    const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  },

  /**
   * Handle form submission
   */
  handleSubmit() {
    if (!this.validateForm()) {
      GDPRManager.showNotification('Please correct the errors in the form', 'error');
      // Focus on first error
      const firstError = this.form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Collect form data
    const formData = new FormData(this.form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Save to storage
    StorageManager.saveClientData(data);

    // Update deadlines
    if (typeof DeadlineManager !== 'undefined') {
      DeadlineManager.updateFromForm(data);
    }

    // Update documents checklist
    if (typeof DocumentManager !== 'undefined') {
      DocumentManager.updateRequiredDocuments(data.visaType);
    }

    // Update dashboard
    this.updateDashboard(data);

    // Show success message
    GDPRManager.showNotification('Intake information saved successfully!', 'success');

    // Optionally navigate to documents section
    setTimeout(() => {
      if (typeof AppManager !== 'undefined') {
        AppManager.navigateToSection('documents');
      }
    }, 1500);
  },

  /**
   * Update evidence checklist based on visa type
   * @param {string} visaType - Selected visa type
   */
  updateEvidenceChecklist(visaType) {
    if (!this.evidenceChecklist || !visaType) {
      this.evidenceChecklist.innerHTML = '<p class="hint-text">Select a visa type to see required documents</p>';
      return;
    }

    const documents = this.visaTypes[visaType];
    if (!documents) {
      this.evidenceChecklist.innerHTML = '<p class="hint-text">No specific document requirements for this visa type</p>';
      return;
    }

    // Render checklist
    this.evidenceChecklist.innerHTML = documents.map((doc, index) => `
      <div class="evidence-item">
        <input type="checkbox" id="evidence_${index}" name="evidence[]" value="${doc}">
        <label for="evidence_${index}">${doc}</label>
      </div>
    `).join('');
  },

  /**
   * Load saved form data
   */
  loadSavedData() {
    const savedData = StorageManager.loadClientData();
    if (!savedData) return;

    // Populate form fields
    Object.keys(savedData).forEach(key => {
      const field = this.form.elements[key];
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = savedData[key] === 'on';
        } else {
          field.value = savedData[key];
        }
      }
    });

    // Update evidence checklist
    if (savedData.visaType) {
      this.updateEvidenceChecklist(savedData.visaType);
    }
  },

  /**
   * Reset form
   */
  resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      this.form.reset();
      this.evidenceChecklist.innerHTML = '<p class="hint-text">Select a visa type to see required documents</p>';
      // Clear errors
      const errors = this.form.querySelectorAll('.error');
      errors.forEach(el => this.clearError(el));
    }
  },

  /**
   * Update dashboard with form data
   * @param {object} data - Form data
   */
  updateDashboard(data) {
    const caseStatus = document.getElementById('caseStatus');
    const caseType = document.getElementById('caseType');

    if (caseStatus && data.visaType) {
      caseStatus.textContent = 'Active';
      caseStatus.style.color = 'var(--color-success)';
    }

    if (caseType && data.visaType) {
      caseType.textContent = data.visaType;
    }
  }
};