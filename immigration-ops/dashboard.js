/**
 * Dashboard Module - Handles dashboard logic and case management
 */

const Dashboard = {
    // State
    allCases: [],
    filteredCases: [],
    currentPage: 1,
    pageSize: 25,
    sortColumn: 'Case ID',
    sortAscending: true,

    /**
     * Initialize dashboard
     */
    async init() {
        if (API.isConfigured()) {
            await this.loadCases();
            this.setupAutoRefresh();
        } else {
            document.getElementById('setupNotice').style.display = 'block';
        }
    },

    /**
     * Load cases from API
     */
    async loadCases() {
        try {
            const data = await API.getCases();
            if (data.cases && Array.isArray(data.cases)) {
                this.allCases = data.cases;
                this.applyFilters();
                this.updateStats();
            } else {
                Utils.showToast('Error loading cases', 'error');
            }
        } catch (error) {
            Utils.showToast('Failed to load cases: ' + error.message, 'error');
        }
    },

    /**
     * Apply filters and search
     */
    applyFilters() {
        const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const urgencyFilter = document.getElementById('urgencyFilter')?.value || '';

        this.filteredCases = this.allCases.filter(c => {
            const matchesSearch = !search || 
                (c['Case ID'] && c['Case ID'].toLowerCase().includes(search)) ||
                (c['Name'] && c['Name'].toLowerCase().includes(search)) ||
                (c['Email'] && c['Email'].toLowerCase().includes(search));
            
            const matchesStatus = !statusFilter || c['Status'] === statusFilter;
            const matchesUrgency = !urgencyFilter || c['Urgency'] === urgencyFilter;

            return matchesSearch && matchesStatus && matchesUrgency;
        });

        this.currentPage = 1;
        this.renderTable();
    },

    /**
     * Sort table by column
     */
    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortAscending = !this.sortAscending;
        } else {
            this.sortColumn = column;
            this.sortAscending = true;
        }

        this.filteredCases.sort((a, b) => {
            const aVal = a[column] || '';
            const bVal = b[column] || '';
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return this.sortAscending ? comparison : -comparison;
        });

        this.renderTable();
    },

    /**
     * Render cases table
     */
    renderTable() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredCases.slice(start, end);

        const tbody = document.getElementById('casesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-cell">No cases found</td>
                </tr>
            `;
            this.updatePagination();
            return;
        }

        pageData.forEach((caseData) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${Utils.escape(caseData['Case ID'])}</strong></td>
                <td>${Utils.escape(caseData['Name'])}</td>
                <td>${Utils.escape(caseData['Email'])}</td>
                <td>${Utils.escape(caseData['Visa Route'])}</td>
                <td>
                    <select onchange="Dashboard.updateField(this, '${Utils.escape(caseData['Case ID'])}', 'Status')">
                        <option ${caseData['Status'] === 'New - Waiting for docs' ? 'selected' : ''}>New - Waiting for docs</option>
                        <option ${caseData['Status'] === 'Waiting for Documents' ? 'selected' : ''}>Waiting for Documents</option>
                        <option ${caseData['Status'] === 'Documents Received' ? 'selected' : ''}>Documents Received</option>
                        <option ${caseData['Status'] === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option ${caseData['Status'] === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option ${caseData['Status'] === 'Awaiting Decision' ? 'selected' : ''}>Awaiting Decision</option>
                        <option ${caseData['Status'] === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option ${caseData['Status'] === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option ${caseData['Status'] === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <select onchange="Dashboard.updateField(this, '${Utils.escape(caseData['Case ID'])}', 'Urgency')">
                        <option ${caseData['Urgency'] === 'Normal' ? 'selected' : ''}>Normal</option>
                        <option ${caseData['Urgency'] === 'Urgent' ? 'selected' : ''}>Urgent</option>
                    </select>
                </td>
                <td>
                    <select onchange="Dashboard.updateField(this, '${Utils.escape(caseData['Case ID'])}', 'Docs Received')">
                        <option ${caseData['Docs Received'] === 'No' ? 'selected' : ''}>No</option>
                        <option ${caseData['Docs Received'] === 'Yes' ? 'selected' : ''}>Yes</option>
                    </select>
                </td>
                <td>
                    <div class="actions">
                        ${caseData['Intake Form Link'] ? `<a href="${Utils.escape(caseData['Intake Form Link'])}" target="_blank" class="action-btn">📋</a>` : ''}
                        ${caseData['Upload Documents Link'] ? `<a href="${Utils.escape(caseData['Upload Documents Link'])}" target="_blank" class="action-btn">📤</a>` : ''}
                        ${caseData['Drive Folder Link'] ? `<a href="${Utils.escape(caseData['Drive Folder Link'])}" target="_blank" class="action-btn">📁</a>` : ''}
                        <button class="action-btn secondary" onclick="Dashboard.sendReminder('${Utils.escape(caseData['Case ID'])}', '${Utils.escape(caseData['Email'])}', '${Utils.escape(caseData['Name'])}')">✉️</button>
                        <button class="action-btn secondary" onclick="Dashboard.showCaseDetails('${Utils.escape(caseData['Case ID'])}')">👁️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updatePagination();
    },

    /**
     * Update a case field
     */
    async updateField(element, caseId, field) {
        const value = element.value;
        element.disabled = true;

        try {
            const data = await API.updateCaseField(caseId, field, value);
            if (data.status === 'success') {
                Utils.showToast('✓ Saved');
                await this.loadCases();
            } else {
                Utils.showToast('Error: ' + (data.message || 'Unknown error'), 'error');
                element.disabled = false;
            }
        } catch (error) {
            Utils.showToast('Failed: ' + error.message, 'error');
            element.disabled = false;
        }
    },

    /**
     * Send reminder email
     */
    async sendReminder(caseId, email, clientName) {
        if (!email) {
            Utils.showToast('No email on file', 'error');
            return;
        }

        if (!confirm(`Send reminder to ${email}?`)) return;

        try {
            const data = await API.sendReminder(caseId, email, clientName);
            const message = data.status === 'success' ? '✉️ Email sent' : 'Error sending';
            const type = data.status === 'success' ? 'success' : 'error';
            Utils.showToast(message, type);
        } catch (error) {
            Utils.showToast('Failed: ' + error.message, 'error');
        }
    },

    /**
     * Show case details modal
     */
    showCaseDetails(caseId) {
        const caseData = this.allCases.find(c => c['Case ID'] === caseId);
        if (!caseData) return;

        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <p><strong>Case ID:</strong> ${Utils.escape(caseData['Case ID'])}</p>
            <p><strong>Name:</strong> ${Utils.escape(caseData['Name'])}</p>
            <p><strong>Email:</strong> ${Utils.escape(caseData['Email'])}</p>
            <p><strong>Phone:</strong> ${Utils.escape(caseData['Phone'])}</p>
            <p><strong>Visa Route:</strong> ${Utils.escape(caseData['Visa Route'])}</p>
            <p><strong>Status:</strong> ${Utils.escape(caseData['Status'])}</p>
            <p><strong>Urgency:</strong> ${caseData['Urgency']}</p>
            <p><strong>Docs Received:</strong> ${caseData['Docs Received']}</p>
            <p><strong>Date Submitted:</strong> ${Utils.escape(caseData['Date Submitted'])}</p>
            ${caseData['Notes'] ? `<p><strong>Notes:</strong> ${Utils.escape(caseData['Notes'])}</p>` : ''}
            ${caseData['Evidence Checklist'] ? `<p><strong>Evidence Needed:</strong> ${Utils.escape(caseData['Evidence Checklist'])}</p>` : ''}
        `;

        document.getElementById('detailModal').classList.add('active');
    },

    /**
     * Update statistics
     */
    updateStats() {
        let total = 0, urgent = 0, pending = 0, completed = 0;

        this.allCases.forEach(c => {
            total++;
            if (c['Urgency'] === 'Urgent') urgent++;
            if (c['Status'] === 'New - Waiting for docs' || c['Status'] === 'Waiting for Documents') pending++;
            if (c['Status'] === 'Completed') completed++;
        });

        document.getElementById('totalCases').textContent = total;
        document.getElementById('urgentCases').textContent = urgent;
        document.getElementById('pendingCases').textContent = pending;
        document.getElementById('completedCases').textContent = completed;
    },

    /**
     * Pagination
     */
    nextPage() {
        const maxPages = Math.ceil(this.filteredCases.length / this.pageSize);
        if (this.currentPage < maxPages) {
            this.currentPage++;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    },

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
            window.scrollTo(0, 0);
        }
    },

    changePageSize() {
        this.pageSize = parseInt(document.getElementById('pageSize').value);
        this.currentPage = 1;
        this.renderTable();
    },

    updatePagination() {
        const maxPages = Math.ceil(this.filteredCases.length / this.pageSize) || 1;
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${maxPages}`;
        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === maxPages;
    },

    /**
     * Setup auto refresh
     */
    setupAutoRefresh() {
        setInterval(() => {
            this.loadCases();
        }, 30000); // Refresh every 30 seconds
    }
};

// Utility functions
const Utils = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    escape(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
};