/**
 * PDF Export Functionality
 * Generates PDF summary of case intake information
 */

const PDFExporter = {
  /**
   * Initialize PDF exporter
   */
  init() {
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.generatePDF());
    }
  },

  /**
   * Generate PDF document
   */
  generatePDF() {
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
      GDPRManager.showNotification('PDF library not loaded. Please refresh the page and try again.', 'error');
      return;
    }

    const clientData = StorageManager.loadClientData();
    if (!clientData || !clientData.clientName) {
      GDPRManager.showNotification('No intake data found. Please complete the intake form first.', 'error');
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      let yPosition = 20;
      const lineHeight = 7;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('UK Immigration Case Summary', margin, yPosition);
      yPosition += lineHeight * 2;

      // Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Personal Details Section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Personal Details', margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const personalDetails = [
        ['Full Name:', clientData.clientName || 'N/A'],
        ['Email:', clientData.clientEmail || 'N/A'],
        ['Phone:', clientData.clientPhone || 'N/A'],
        ['Address:', `${clientData.clientAddress || ''}, ${clientData.clientCity || ''}, ${clientData.clientPostcode || ''}`]
      ];

      personalDetails.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label, margin, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(value, margin + 30, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Visa Details Section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Visa Application Details', margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Visa Type: ${clientData.visaType || 'Not specified'}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Deadlines Section
      const deadlines = StorageManager.loadDeadlines();
      if (deadlines && deadlines.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Key Deadlines', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        deadlines.forEach(deadline => {
          const dateObj = new Date(deadline.date);
          const formattedDate = dateObj.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          doc.text(`${deadline.type}: ${formattedDate}`, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += lineHeight;
      }

      // Required Documents Section
      if (clientData.requiredDocs && clientData.requiredDocs.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Required Documents', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const uploadedFiles = StorageManager.loadUploadedFiles();
        
        clientData.requiredDocs.forEach(doc_name => {
          // Check if document is uploaded
          const isUploaded = this.isDocumentUploaded(doc_name, uploadedFiles);
          const status = isUploaded ? '[✓]' : '[ ]';
          doc.text(`${status} ${doc_name}`, margin, yPosition);
          yPosition += lineHeight;

          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });

        yPosition += lineHeight;
      }

      // Uploaded Files Section
      const uploadedFiles = StorageManager.loadUploadedFiles();
      if (uploadedFiles && uploadedFiles.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Uploaded Documents', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        uploadedFiles.forEach(file => {
          const fileSize = this.formatFileSize(file.size);
          const fileType = this.getFileTypeLabel(file.type);
          doc.text(`• ${file.name} (${fileType}, ${fileSize})`, margin, yPosition);
          yPosition += lineHeight;

          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });

        yPosition += lineHeight;
      }

      // Case Notes Section
      if (clientData.caseNotes) {
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Case Notes', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        const notes = doc.splitTextToSize(clientData.caseNotes, pageWidth - margin * 2);
        notes.forEach(line => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.text(
          `Page ${i} of ${pageCount} • Generated by UK Immigration Case Manager • Confidential`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `Immigration_Case_${clientData.clientName?.replace(/\s+/g, '_') || 'Summary'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      GDPRManager.showNotification('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      GDPRManager.showNotification('Error generating PDF. Please try again.', 'error');
    }
  },

  /**
   * Check if document is uploaded
   * @param {string} docName - Document name
   * @param {array} uploadedFiles - Array of uploaded files
   * @returns {boolean}
   */
  isDocumentUploaded(docName, uploadedFiles) {
    const keywords = docName.toLowerCase().split(/[\s\/\(\)]+/);
    return uploadedFiles.some(file => {
      const fileName = file.name.toLowerCase();
      return keywords.some(keyword => fileName.includes(keyword) && keyword.length > 2);
    });
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
   * Get file type label
   * @param {string} fileType - MIME type
   * @returns {string} Human-readable label
   */
  getFileTypeLabel(fileType) {
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') return 'JPG';
    if (fileType === 'image/png') return 'PNG';
    return 'File';
  }
};