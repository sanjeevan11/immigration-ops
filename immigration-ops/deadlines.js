/**
 * Deadline Tracking and Management
 * Handles deadline display, countdown, calendar integration
 */

const DeadlineManager = {
  deadlines: [],
  deadlineBar: null,
  deadlineItemsContainer: null,

  /**
   * Initialize deadline management
   */
  init() {
    this.deadlineBar = document.getElementById('deadlineBar');
    this.deadlineItemsContainer = document.getElementById('deadlineItems');
    this.loadDeadlines();
    this.render();
    this.updateDashboard();

    // Update every minute for countdown
    setInterval(() => {
      this.render();
    }, 60000);
  },

  /**
   * Load deadlines from storage
   */
  loadDeadlines() {
    this.deadlines = StorageManager.loadDeadlines();
  },

  /**
   * Save deadlines to storage
   */
  saveDeadlines() {
    StorageManager.saveDeadlines(this.deadlines);
  },

  /**
   * Add or update deadlines from form
   * @param {object} formData - Form data containing deadline fields
   */
  updateFromForm(formData) {
    this.deadlines = [];

    // Map deadline fields
    const deadlineFields = [
      { key: 'deadline1', label: 'Application Submission' },
      { key: 'deadline2', label: 'Biometrics Appointment' },
      { key: 'deadline3', label: 'Decision Expected' },
      { key: 'deadline4', label: 'Appeal Deadline' }
    ];

    deadlineFields.forEach(field => {
      if (formData[field.key]) {
        this.deadlines.push({
          type: field.label,
          date: formData[field.key],
          id: Date.now() + Math.random()
        });
      }
    });

    this.saveDeadlines();
    this.render();
    this.updateDashboard();
  },

  /**
   * Calculate days remaining until deadline
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {number} Days remaining
   */
  getDaysRemaining(dateString) {
    const deadline = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Get urgency class based on days remaining
   * @param {number} daysRemaining - Days remaining
   * @returns {string} CSS class (green, amber, red)
   */
  getUrgencyClass(daysRemaining) {
    if (daysRemaining < 0) return 'red';
    if (daysRemaining <= 7) return 'red';
    if (daysRemaining <= 30) return 'amber';
    return 'green';
  },

  /**
   * Format days remaining text
   * @param {number} daysRemaining - Days remaining
   * @returns {string} Formatted text
   */
  formatDaysRemaining(daysRemaining) {
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)} days overdue`;
    if (daysRemaining === 0) return 'Today!';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  },

  /**
   * Generate Google Calendar link
   * @param {object} deadline - Deadline object
   * @returns {string} Google Calendar URL
   */
  generateCalendarLink(deadline) {
    const title = encodeURIComponent(`UK Immigration: ${deadline.type}`);
    const date = deadline.date.replace(/-/g, '');
    const details = encodeURIComponent(`Immigration case deadline: ${deadline.type}`);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=${details}`;
  },

  /**
   * Render deadlines in the deadline bar
   */
  render() {
    if (!this.deadlineItemsContainer) return;

    // Clear existing items
    this.deadlineItemsContainer.innerHTML = '';

    if (this.deadlines.length === 0) {
      this.deadlineItemsContainer.innerHTML = '<span class="no-deadlines">No deadlines set</span>';
      return;
    }

    // Sort deadlines by date
    const sortedDeadlines = [...this.deadlines].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // Render each deadline
    sortedDeadlines.forEach(deadline => {
      const daysRemaining = this.getDaysRemaining(deadline.date);
      const urgencyClass = this.getUrgencyClass(daysRemaining);
      const daysText = this.formatDaysRemaining(daysRemaining);

      const deadlineItem = document.createElement('div');
      deadlineItem.className = `deadline-item ${urgencyClass}`;
      deadlineItem.innerHTML = `
        <span class="deadline-type">${deadline.type}:</span>
        <span class="deadline-date">${this.formatDate(deadline.date)}</span>
        <span class="deadline-countdown">(${daysText})</span>
        <a href="${this.generateCalendarLink(deadline)}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="deadline-calendar-link"
           title="Add to Google Calendar"
           style="margin-left: 8px; color: inherit; text-decoration: none;">
          📅
        </a>
      `;

      this.deadlineItemsContainer.appendChild(deadlineItem);

      // Show warning for urgent deadlines
      if (daysRemaining <= 7 && daysRemaining >= 0) {
        this.showUrgentWarning(deadline, daysRemaining);
      }
    });
  },

  /**
   * Format date for display
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  },

  // In-memory storage for shown warnings
  shownWarnings: {},

  /**
   * Show urgent deadline warning (only once per session)
   * @param {object} deadline - Deadline object
   * @param {number} daysRemaining - Days remaining
   */
  showUrgentWarning(deadline, daysRemaining) {
    const warningKey = `warning_shown_${deadline.id}`;
    if (this.shownWarnings[warningKey]) return;

    // Mark as shown
    this.shownWarnings[warningKey] = true;

    // Don't show warning in first minute to avoid spam on page load
    if (this.initTime && Date.now() - this.initTime < 60000) return;
  },

  /**
   * Update dashboard with deadline information
   */
  updateDashboard() {
    const nextDeadlineValue = document.getElementById('nextDeadlineValue');
    const nextDeadlineLabel = document.getElementById('nextDeadlineLabel');

    if (!nextDeadlineValue || !nextDeadlineLabel) return;

    if (this.deadlines.length === 0) {
      nextDeadlineValue.textContent = 'None';
      nextDeadlineLabel.textContent = 'Set deadlines in intake form';
      return;
    }

    // Find next upcoming deadline
    const sortedDeadlines = [...this.deadlines].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    const nextDeadline = sortedDeadlines[0];
    const daysRemaining = this.getDaysRemaining(nextDeadline.date);

    nextDeadlineValue.textContent = this.formatDate(nextDeadline.date);
    nextDeadlineLabel.textContent = `${nextDeadline.type} - ${this.formatDaysRemaining(daysRemaining)}`;

    // Set color based on urgency
    const urgencyClass = this.getUrgencyClass(daysRemaining);
    nextDeadlineValue.style.color = 
      urgencyClass === 'red' ? 'var(--color-error)' :
      urgencyClass === 'amber' ? 'var(--color-warning)' :
      'var(--color-success)';
  }
};

// Track initialization time
DeadlineManager.initTime = Date.now();