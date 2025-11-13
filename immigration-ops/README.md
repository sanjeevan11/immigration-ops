# Immigration Solicitor Dashboard

A modern, professional web dashboard for UK immigration solicitors to manage client cases in real-time.

## 🚀 Features

- 📊 Real-time case dashboard with summary cards
- 🔍 Search, filter, and sort capabilities
- ✏️ Inline editing (Status, Urgency, Docs Received)
- ✉️ Email reminders to clients
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌙 Dark/Light mode (auto-detects system preference)
- 📋 Case details modal
- ⚡ Auto-refresh every 30 seconds

## 📁 Project Structure

```
immigration-solicitor-dashboard/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styles
├── js/
│   ├── api.js         # API communication with Google Apps Script
│   ├── dashboard.js   # Dashboard logic and case management
│   └── app.js         # Main application controller
├── README.md          # This file
└── .gitignore         # Git ignore file
```

## ⚙️ Setup Instructions

### Step 1: Google Apps Script Setup

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/105mrH6iAIPzUJ035iHymxIjS7FaEnPcPeb3hIdgBr-s/edit

2. Go to **Extensions → Apps Script**

3. Delete any existing code and paste this:

```javascript
function doGet(e) {
  const action = e.parameter.action || "get_cases";
  const ss = SpreadsheetApp.getActive().getSheetByName("Cases");
  const data = ss.getDataRange().getValues();
  const headers = data[0];
  const cases = [];
  
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, j) => { obj[h] = data[i][j] || ""; });
    if (obj["Case ID"]) cases.push(obj);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ cases: cases }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActive().getSheetByName("Cases");
  const data = ss.getDataRange().getValues();
  
  if (payload.action === "update") {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.caseId) {
        const colIndex = data[0].indexOf(payload.field) + 1;
        ss.getRange(i + 1, colIndex).setValue(payload.value);
        ss.getRange(i + 1, 15).setValue(new Date()); // Last Updated
        return ContentService
          .createTextOutput(JSON.stringify({ status: "success" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  if (payload.action === "send_reminder") {
    try {
      GmailApp.sendEmail(
        payload.email,
        `Reminder: Immigration Case ${payload.caseId}`,
        `Hi ${payload.clientName},\n\nWe're waiting for your documents for case ${payload.caseId}.\n\nPlease upload them as soon as possible.\n\nThank you,\nImmigration Team`
      );
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}
```

4. Click **Deploy → New Deployment → Web App**
   - Execute as: **Your email**
   - Who has access: **Anyone**

5. Click **Deploy** and copy the web app URL

### Step 2: Configure Dashboard

1. Open `js/api.js` in your text editor

2. Find this line (around line 7):
```javascript
APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
```

3. Replace `YOUR_SCRIPT_ID` with your actual Apps Script web app URL

4. Save the file

### Step 3: Deploy to GitHub Pages

```bash
# Create new repository on GitHub
git init
git add .
git commit -m "Initial commit: Immigration Solicitor Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/immigration-solicitor-dashboard.git
git push -u origin main
```

Then in GitHub:
1. Go to **Settings → Pages**
2. Source: **Deploy from branch**
3. Branch: **main**, folder: **/ (root)**
4. Click **Save**

**Your dashboard will be live at:**  
`https://YOUR-USERNAME.github.io/immigration-solicitor-dashboard/`

## 📊 Sheet Column Structure

Your Google Sheet must have these columns (in order):

1. Case ID
2. Date Submitted
3. Name
4. Email
5. Phone
6. Urgency
7. Visa Route
8. Evidence Checklist
9. Notes
10. Docs Received
11. Intake Form Link
12. Upload Documents Link
13. Drive Folder Link
14. Status
15. Last Updated

## 🎨 Customization

### Change Colors

Edit CSS variables in `css/style.css`:

```css
:root {
    --color-primary: rgba(33, 128, 141, 1);  /* Change to your brand color */
    --color-background: rgba(252, 252, 249, 1);
    /* ... more colors */
}
```

### Change Auto-Refresh Interval

Edit `js/dashboard.js` (line ~250):

```javascript
setupAutoRefresh() {
    setInterval(() => {
        this.loadCases();
    }, 30000); // Change 30000 to your desired milliseconds
}
```

## 🔧 Troubleshooting

### Dashboard Not Loading Cases

1. Check browser console (F12) for errors
2. Verify Apps Script URL is correct in `js/api.js`
3. Ensure Apps Script is deployed as "Anyone" access
4. Check Google Sheet has correct column names

### Updates Not Saving

1. Verify Apps Script has `doPost` function
2. Check browser console for error messages
3. Ensure sheet has write permissions

### Emails Not Sending

1. Check Gmail quota (500 emails/day)
2. Verify email addresses are valid
3. Check Apps Script execution log for errors

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ IE11 (not supported)

## 🔐 Security

- No API keys exposed in frontend
- All credentials in Google Apps Script only
- HTTPS enforced on GitHub Pages
- Input validation on all fields

## 📄 License

Free to use and modify for immigration solicitors.

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Verify all setup steps completed
3. Review Google Apps Script execution logs

---

**Built for UK immigration solicitors** 🏛️