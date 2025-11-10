import jsPDF from 'jspdf';

export const generateRACIMatrixPDF = () => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkAndAddPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to draw text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * fontSize * 0.35; // Return height of text
  };

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RACI Matrix - Kumii Platform', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // RACI Legend
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RACI Legend', margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const legendItems = [
    { code: 'R', name: 'Responsible', desc: 'Does the work to complete the task', color: [59, 130, 246] },
    { code: 'A', name: 'Accountable', desc: 'Ultimately answerable for completion', color: [34, 197, 94] },
    { code: 'C', name: 'Consulted', desc: 'Provides input and expertise', color: [234, 179, 8] },
    { code: 'I', name: 'Informed', desc: 'Kept up-to-date on progress', color: [156, 163, 175] }
  ];

  legendItems.forEach((item) => {
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.roundedRect(margin, yPosition - 3, 8, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(item.code, margin + 4, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(item.name, margin + 12, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(` - ${item.desc}`, margin + 12 + doc.getTextWidth(item.name), yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // RACI Matrices Data
  const raciMatrix: { [key: string]: Array<{ [key: string]: string }> } = {
    "User Management": [
      { task: "User Registration", platformAdmin: "A", userAdmin: "R", l1Support: "I", startup: "R" },
      { task: "Profile Verification", platformAdmin: "A", userAdmin: "R", complianceAdmin: "C", allUsers: "I" },
      { task: "Role Assignment", platformAdmin: "A", userAdmin: "R", allUsers: "I" },
      { task: "Access Control", platformAdmin: "A", securityEngineer: "R", userAdmin: "C" },
      { task: "Account Suspension", platformAdmin: "A", userAdmin: "R", complianceAdmin: "C", affectedUser: "I" },
    ],
    "Marketplace Operations": [
      { task: "Listing Creation", marketplaceOwner: "A", seller: "R", contentAdmin: "C" },
      { task: "Listing Approval", marketplaceOwner: "A", seller: "R", contentAdmin: "C" },
      { task: "Transaction Processing", marketplaceOwner: "A", seller: "R", contentAdmin: "I", buyer: "I" },
      { task: "Dispute Resolution", marketplaceOwner: "A", seller: "R", contentAdmin: "C", buyer: "C" },
      { task: "Payment Processing", marketplaceOwner: "A", financialAdmin: "R", contentAdmin: "C" },
    ],
    "Mentorship Program": [
      { task: "Mentor Onboarding", mentorshipAdmin: "A", mentorshipOwner: "R", mentor: "C" },
      { task: "Matching Algorithm", mentorshipAdmin: "A", mentorshipOwner: "R", mentor: "C" },
      { task: "Session Booking", mentorshipAdmin: "A", mentorshipOwner: "R", mentor: "R", mentee: "I" },
      { task: "Session Review", mentorshipAdmin: "A", mentorshipOwner: "R", mentor: "I", mentee: "I" },
      { task: "Mentor Performance", mentorshipAdmin: "A", mentorshipOwner: "R", platformAdmin: "I" },
    ],
    "Funding Operations": [
      { task: "Funding Opportunity Creation", fundingOwner: "A", funder: "R", contentAdmin: "C" },
      { task: "Application Review", fundingOwner: "A", funder: "R", complianceAdmin: "C", startup: "I" },
      { task: "Credit Assessment", creditScoringOwner: "A", financialAdmin: "R", startup: "C" },
      { task: "Due Diligence", fundingOwner: "A", funder: "R", complianceAdmin: "C" },
      { task: "Fund Disbursement", financialAdmin: "A", fundingOwner: "R", funder: "I", startup: "I" },
    ],
    "Content & Learning": [
      { task: "Course Creation", learningOwner: "A", contentAdmin: "R", mentor: "C" },
      { task: "Resource Publishing", learningOwner: "A", contentAdmin: "R", complianceAdmin: "C" },
      { task: "Content Moderation", contentAdmin: "A", l2Support: "R", complianceAdmin: "C" },
      { task: "Learning Path Design", learningOwner: "A", contentAdmin: "R", mentorshipOwner: "C" },
    ],
    "Technical Operations": [
      { task: "System Monitoring", devOps: "A/R", l3Support: "C", platformAdmin: "I" },
      { task: "Incident Response", l3Support: "A", devOps: "R", l2Support: "C", platformAdmin: "I" },
      { task: "Security Patches", securityEngineer: "A", devOps: "R", l3Support: "C" },
      { task: "Database Backup", devOps: "A/R", platformAdmin: "I" },
      { task: "Performance Optimization", l3Support: "A", devOps: "R", moduleOwners: "C" },
    ],
    "Compliance & Security": [
      { task: "POPIA Compliance", complianceAdmin: "A/R", platformAdmin: "C", securityEngineer: "C" },
      { task: "Security Audits", securityEngineer: "A/R", complianceAdmin: "C", platformAdmin: "I" },
      { task: "Data Privacy Policy", complianceAdmin: "A", platformAdmin: "R", securityEngineer: "C" },
      { task: "Breach Notification", platformAdmin: "A", securityEngineer: "R", complianceAdmin: "R", allUsers: "I" },
      { task: "Access Audit", securityEngineer: "A/R", complianceAdmin: "C", platformAdmin: "I" },
    ],
    "Financial Management": [
      { task: "Revenue Reporting", financialAdmin: "A/R", platformAdmin: "I", moduleOwners: "C" },
      { task: "Payment Reconciliation", financialAdmin: "A/R", devOps: "C" },
      { task: "Subscription Management", financialAdmin: "A", userAdmin: "R", platformAdmin: "I" },
      { task: "Commission Tracking", financialAdmin: "A/R", marketplaceOwner: "C", fundingOwner: "C" },
      { task: "Financial Audit", platformAdmin: "A", financialAdmin: "R", complianceAdmin: "C" },
    ]
  };

  // Format role names
  const formatRoleName = (role: string): string => {
    return role.replace(/([A-Z])/g, ' $1').trim();
  };

  // Draw each module's RACI matrix
  Object.entries(raciMatrix).forEach(([module, tasks], moduleIndex) => {
    if (moduleIndex > 0) {
      checkAndAddPage(40);
    }

    // Module title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text(module, margin + 3, yPosition);
    yPosition += 10;

    // Get all unique roles
    const allRoles = Array.from(
      new Set(tasks.flatMap(task => Object.keys(task).filter(k => k !== 'task')))
    );

    // Table headers
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Ensure text is black
    const colWidth = (pageWidth - 2 * margin - 50) / allRoles.length;
    
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, yPosition - 4, 50, 7, 'F');
    doc.text('Task', margin + 2, yPosition);
    
    allRoles.forEach((role, idx) => {
      const x = margin + 50 + idx * colWidth;
      doc.rect(x, yPosition - 4, colWidth, 7, 'F');
      const roleName = formatRoleName(role);
      doc.text(roleName, x + colWidth / 2, yPosition, { align: 'center' });
    });

    yPosition += 6;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Ensure text is black for task names
    tasks.forEach((task) => {
      checkAndAddPage(10);

      // Task name
      doc.rect(margin, yPosition - 4, 50, 7);
      const taskText = task.task.length > 25 ? task.task.substring(0, 22) + '...' : task.task;
      doc.text(taskText, margin + 2, yPosition);

      // RACI values
      allRoles.forEach((role, idx) => {
        const x = margin + 50 + idx * colWidth;
        doc.rect(x, yPosition - 4, colWidth, 7);
        
        const value = task[role];
        if (value) {
          const badges = value.split('/');
          badges.forEach((badge, badgeIdx) => {
            const badgeWidth = 5;
            const badgeX = x + colWidth / 2 - (badges.length * badgeWidth) / 2 + badgeIdx * badgeWidth;
            
            // Set badge color
            if (badge === 'R') doc.setFillColor(59, 130, 246);
            else if (badge === 'A') doc.setFillColor(34, 197, 94);
            else if (badge === 'C') doc.setFillColor(234, 179, 8);
            else if (badge === 'I') doc.setFillColor(156, 163, 175);
            
            doc.roundedRect(badgeX, yPosition - 3, 4, 4, 0.5, 0.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text(badge, badgeX + 2, yPosition, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
          });
        }
      });

      yPosition += 7;
    });

    yPosition += 5;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`© ${new Date().getFullYear()} Kumii Platform - RACI Matrix`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save('kumii-raci-matrix.pdf');
};
