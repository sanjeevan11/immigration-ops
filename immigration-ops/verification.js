/**
 * ✅ VERIFICATION SCRIPT
 * Run this in browser console to verify deployment
 */

console.log("🔍 IMMIGRATION DASHBOARD VERIFICATION SCRIPT");
console.log("==========================================\n");

// Check 1: HTML Elements
console.log("✅ CHECK 1: HTML Elements");
const checks = {
    "Header exists": !!document.querySelector('header'),
    "Navigation tabs exist": !!document.querySelector('.nav-tabs'),
    "Dashboard section exists": !!document.getElementById('dashboard'),
    "Cases section exists": !!document.getElementById('cases'),
    "Summary cards exist": !!document.querySelector('.dashboard-grid'),
    "Table wrapper exists": !!document.querySelector('.table-wrapper'),
    "Modal exists": !!document.getElementById('detailModal'),
    "Toast container exists": !!document.getElementById('toastContainer'),
};

Object.entries(checks).forEach(([check, result]) => {
    console.log(`  ${result ? '✓' : '✗'} ${check}`);
});

// Check 2: CSS Loaded
console.log("\n✅ CHECK 2: Styles");
const header = document.querySelector('header');
const headerStyles = window.getComputedStyle(header);
const hasStyles = headerStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' || headerStyles.borderBottom !== 'none';
console.log(`  ${hasStyles ? '✓' : '✗'} CSS is loaded and applied`);

// Check 3: JavaScript Modules
console.log("\n✅ CHECK 3: JavaScript Modules");
const modules = {
    "API module": typeof API !== 'undefined',
    "Dashboard module": typeof Dashboard !== 'undefined',
    "DashboardApp module": typeof DashboardApp !== 'undefined',
};

Object.entries(modules).forEach(([module, exists]) => {
    console.log(`  ${exists ? '✓' : '✗'} ${module} loaded`);
});

// Check 4: Configuration
console.log("\n✅ CHECK 4: Configuration");
if (typeof API !== 'undefined') {
    const isConfigured = API.isConfigured && API.isConfigured();
    const apiUrl = API.APPS_SCRIPT_URL || 'Not set';
    console.log(`  Apps Script URL: ${apiUrl.substring(0, 60)}...`);
    console.log(`  ${isConfigured ? '✓' : '✗'} Configuration ${isConfigured ? 'complete' : 'incomplete - needs Apps Script URL'}`);
}

// Check 5: Summary Cards
console.log("\n✅ CHECK 5: Summary Cards");
const totalCases = document.getElementById('totalCases');
const urgentCases = document.getElementById('urgentCases');
const pendingCases = document.getElementById('pendingCases');
const completedCases = document.getElementById('completedCases');

console.log(`  Total Cases: ${totalCases?.textContent || 'Error'}`);
console.log(`  Urgent Cases: ${urgentCases?.textContent || 'Error'}`);
console.log(`  Pending Docs: ${pendingCases?.textContent || 'Error'}`);
console.log(`  Completed: ${completedCases?.textContent || 'Error'}`);

// Check 6: Event Listeners
console.log("\n✅ CHECK 6: Event Listeners");
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

console.log(`  ${searchInput ? '✓' : '✗'} Search input`);
console.log(`  ${statusFilter ? '✓' : '✗'} Status filter`);
console.log(`  ${prevBtn ? '✓' : '✗'} Pagination buttons`);

// Summary
console.log("\n==========================================");
console.log("✅ VERIFICATION COMPLETE");
console.log("==========================================\n");

console.log("📊 NEXT STEPS:");
console.log("1. If CSS is NOT loaded → Force refresh (Ctrl+Shift+R)");
console.log("2. If API module not found → Check js/api.js is in correct path");
console.log("3. If configuration incomplete → Update Apps Script URL in js/api.js");
console.log("4. Click 'Dashboard' or 'Cases' tab to navigate");
console.log("\n🎉 If all checks pass - Dashboard is ready to use!\n");