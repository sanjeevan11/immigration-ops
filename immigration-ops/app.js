/**
 * Main Application Controller
 */

const DashboardApp = {
    /**
     * Initialize application
     */
    init() {
        console.log('Initializing Immigration Solicitor Dashboard...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize dashboard
        Dashboard.init();
        
        console.log('Dashboard initialized successfully!');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Search and filters
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => Dashboard.applyFilters());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => Dashboard.applyFilters());
        }

        const urgencyFilter = document.getElementById('urgencyFilter');
        if (urgencyFilter) {
            urgencyFilter.addEventListener('change', () => Dashboard.applyFilters());
        }

        // Pagination
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => Dashboard.previousPage());
        }

        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => Dashboard.nextPage());
        }

        const pageSize = document.getElementById('pageSize');
        if (pageSize) {
            pageSize.addEventListener('change', () => Dashboard.changePageSize());
        }

        // Table sorting
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', (e) => {
                const column = e.target.dataset.sort;
                Dashboard.sortTable(column);
            });
        });

        // Modal
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'detailModal') {
                    this.closeModal();
                }
            });

            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
        }
    },

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const selectedSection = document.getElementById(tabName);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }

        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const selectedTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Refresh data
     */
    async refreshData() {
        await Dashboard.loadCases();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DashboardApp.init();
});