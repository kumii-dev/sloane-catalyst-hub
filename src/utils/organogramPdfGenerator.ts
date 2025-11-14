import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateOrganogramPdf = async () => {
  // Get the page content element
  const element = document.querySelector('.min-h-screen') as HTMLElement;
  if (!element) {
    throw new Error("Could not find page content to convert to PDF");
  }

  // Hide the download button temporarily
  const downloadButton = element.querySelector('button') as HTMLElement;
  const originalDisplay = downloadButton?.style.display;
  if (downloadButton) {
    downloadButton.style.display = 'none';
  }

  try {
    // Capture the page with html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = imgHeight;
    let position = 0;

    // Get image data
    const imgData = canvas.toDataURL('image/png');
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save("Kumii_Organizational_Structure_ISO27001.pdf");
  } finally {
    // Restore the download button
    if (downloadButton && originalDisplay !== undefined) {
      downloadButton.style.display = originalDisplay;
    }
  }
};