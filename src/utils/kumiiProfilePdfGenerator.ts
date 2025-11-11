import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateKumiiProfilePDF = async () => {
  const profileElement = document.getElementById('mafika-profile');
  
  if (!profileElement) {
    throw new Error('Mafika profile element not found');
  }

  // Create a new jsPDF instance
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (2 * margin);
  const contentHeight = pageHeight - (2 * margin);

  // Get all sections (Cards) within the profile
  const sections = profileElement.querySelectorAll('.space-y-8 > *');
  
  let currentY = margin;
  let pageNumber = 1;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i] as HTMLElement;
    
    // Capture each section as canvas
    const canvas = await html2canvas(section, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: section.scrollWidth,
      windowHeight: section.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Check if section fits on current page
    if (currentY + imgHeight > pageHeight - margin) {
      // Add new page if section doesn't fit
      if (pageNumber > 1 || currentY > margin) {
        pdf.addPage();
        pageNumber++;
        currentY = margin;
      }
    }

    // If section is taller than a page, split it across multiple pages
    if (imgHeight > contentHeight) {
      let heightLeft = imgHeight;
      let position = currentY;

      while (heightLeft > 0) {
        const availableHeight = pageHeight - position;
        const addHeight = Math.min(availableHeight, heightLeft);
        
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        
        heightLeft -= availableHeight;

        if (heightLeft > 0) {
          pdf.addPage();
          pageNumber++;
          position = margin - (imgHeight - heightLeft);
          currentY = margin;
        } else {
          currentY = position + addHeight + 5;
        }
      }
    } else {
      // Add the section to current page
      pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 5; // Add small gap between sections
    }
  }

  // Add footer with page numbers
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `Mafika William Nkambule - Professional Profile - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  return pdf;
};
