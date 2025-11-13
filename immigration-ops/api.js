/**
 * API Module - Handles all communication with Google Apps Script
 */

const API = {
    // ===== CONFIGURATION - UPDATE THIS URL =====
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzc8udblouZ2GOkaimcGeQrvtkbQ447lvSoiRNvLCsT4rsD-grTcaR56pIFrB6ZrPoj/exec",

    /**
     * Fetch all cases from Google Sheet
     */
    async getCases() {
        try {
            const response = await fetch(`${this.APPS_SCRIPT_URL}?action=get_cases`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching cases:', error);
            throw error;
        }
    },

    /**
     * Update a field in a specific case
     */
    async updateCaseField(caseId, field, value) {
        try {
            const response = await fetch(this.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update',
                    caseId: caseId,
                    field: field,
                    value: value
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating case:', error);
            throw error;
        }
    },

    /**
     * Send reminder email to client
     */
    async sendReminder(caseId, email, clientName) {
        try {
            const response = await fetch(this.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'send_reminder',
                    caseId: caseId,
                    email: email,
                    clientName: clientName
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending reminder:', error);
            throw error;
        }
    },

    /**
     * Check if API is configured
     */
    isConfigured() {
        return !this.APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
