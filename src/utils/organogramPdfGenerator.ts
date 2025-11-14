import jsPDF from "jspdf";

export const generateOrganogramPdf = async () => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Colors matching Kumii brand
  const primaryColor: [number, number, number] = [138, 75, 175]; // Purple
  const accentColor: [number, number, number] = [75, 138, 175]; // Blue
  const textColor: [number, number, number] = [51, 51, 51];

  // Helper function to add new page if needed
  const checkAndAddPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header with logo space and title
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 35, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("22 On Sloane Capital", margin, 20);
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Trading as Kumii", margin, 28);

  pdf.setFontSize(16);
  pdf.text("Organizational Structure", pageWidth - margin, 24, { align: "right" });

  yPos = 50;

  // Company Overview
  pdf.setTextColor(...textColor);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Company Overview", margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const overview = [
    "Total Employees: 8",
    "Executive Leadership: 2",
    "Governance & Compliance: 1",
    "Technology Leadership: 1",
    "Development & Support: 2",
    "Product & Business: 2",
  ];

  overview.forEach((line) => {
    pdf.text(line, margin + 5, yPos);
    yPos += 5;
  });

  yPos += 10;

  // Organizational Structure by Category
  const roles = [
    {
      category: "Executive Leadership",
      positions: [
        {
          title: "CEO / Managing Director (1)",
          secondary: undefined,
          responsibilities: [
            "• Strategic Direction & Vision",
            "• Stakeholder Management",
            "• Business Development & Partnerships",
          ],
        },
        {
          title: "COO / CFO (1)",
          secondary: undefined,
          responsibilities: [
            "• Operations Management",
            "• Financial Oversight & Planning",
            "• Resource Allocation",
          ],
        },
      ],
    },
    {
      category: "Governance & Compliance",
      positions: [
        {
          title: "Governance Manager (1)",
          secondary: "Acting Data Protection Officer, Compliance Officer",
          responsibilities: [
            "• ISO 27001 Compliance & Certification",
            "• Policy Management & Documentation",
            "• Audit Coordination & Reporting",
            "• Data Protection (POPIA/GDPR)",
            "• Risk Management Framework",
          ],
        },
      ],
    },
    {
      category: "Technology Leadership",
      positions: [
        {
          title: "CIO / CTO (1)",
          secondary: "Acting CISO, Infrastructure Owner",
          responsibilities: [
            "• Technology Strategy & Roadmap",
            "• Information Security Management",
            "• Infrastructure & Cloud Management",
            "• Technical Architecture Decisions",
            "• Vendor & Third-Party Management",
          ],
        },
      ],
    },
    {
      category: "Development & Support",
      positions: [
        {
          title: "Senior Developer (1)",
          secondary: "Security Champion, L2/L3 Support Lead",
          responsibilities: [
            "• Software Development & Architecture",
            "• Code Security Reviews",
            "• Technical Support (L2/L3)",
            "• Quality Assurance & Testing",
            "• DevOps & CI/CD",
          ],
        },
        {
          title: "Developer (1)",
          secondary: "L1/L2 Support, QA Specialist",
          responsibilities: [
            "• Software Development",
            "• Technical Support (L1/L2)",
            "• Quality Testing & Bug Fixes",
            "• Documentation Maintenance",
            "• User Issue Resolution",
          ],
        },
      ],
    },
    {
      category: "Product & Business",
      positions: [
        {
          title: "Product Lead / Owner (1)",
          secondary: "Acting Business Analyst",
          responsibilities: [
            "• Product Strategy & Roadmap",
            "• Feature Prioritization",
            "• User Research & Feedback",
            "• Business Requirements Analysis",
            "• Stakeholder Communication",
          ],
        },
        {
          title: "Module Owners (2)",
          secondary: "Distributed: Mentorship, Credit Scoring, Document Gen, Valuation, Financial Model",
          responsibilities: [
            "• Domain Expertise & Knowledge",
            "• Module Requirements Definition",
            "• User Acceptance Testing",
            "• Training & User Documentation",
            "• Continuous Module Improvement",
          ],
        },
      ],
    },
  ];

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Functional Roles & Responsibilities", margin, yPos);
  yPos += 8;

  roles.forEach((category) => {
    checkAndAddPage(40);

    // Category Header
    pdf.setFillColor(...accentColor);
    pdf.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(category.category, margin + 3, yPos + 2);
    yPos += 10;

    pdf.setTextColor(...textColor);

    category.positions.forEach((position, idx) => {
      checkAndAddPage(35);

      // Position Title
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(position.title, margin + 5, yPos);
      yPos += 5;

      // Secondary Roles
      if (position.secondary) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100, 100, 100);
        const secondaryLines = pdf.splitTextToSize(
          `Also: ${position.secondary}`,
          pageWidth - 2 * margin - 10
        );
        secondaryLines.forEach((line: string) => {
          pdf.text(line, margin + 5, yPos);
          yPos += 4;
        });
        pdf.setTextColor(...textColor);
        yPos += 2;
      }

      // Responsibilities
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      position.responsibilities.forEach((resp) => {
        checkAndAddPage(5);
        pdf.text(resp, margin + 8, yPos);
        yPos += 4;
      });

      yPos += 5;
    });

    yPos += 5;
  });

  // Governance Committees
  checkAndAddPage(60);
  yPos += 5;
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Governance Committees (Matrix Structure)", margin, yPos);
  yPos += 8;

  const committees = [
    {
      name: "Information Security Committee",
      frequency: "Monthly",
      members: ["CEO", "CTO (Chair)", "Governance Manager", "Senior Developer"],
      purpose: "Security oversight, risk review, incident response coordination",
    },
    {
      name: "Change Advisory Board",
      frequency: "Bi-weekly",
      members: ["CTO (Chair)", "Product Lead", "Senior Developer", "Governance Manager"],
      purpose: "Change approval, release planning, risk assessment",
    },
    {
      name: "Incident Response Team",
      frequency: "On-demand",
      members: ["CTO (Lead)", "Senior Developer", "Developer", "Governance Manager"],
      purpose: "Security incident management and response",
    },
  ];

  committees.forEach((committee) => {
    checkAndAddPage(25);

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${committee.name} (${committee.frequency})`, margin + 3, yPos);
    yPos += 5;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Members:", margin + 5, yPos);
    yPos += 4;

    committee.members.forEach((member) => {
      pdf.text(`  • ${member}`, margin + 8, yPos);
      yPos += 4;
    });

    pdf.text("Purpose:", margin + 5, yPos);
    yPos += 4;
    const purposeLines = pdf.splitTextToSize(`  ${committee.purpose}`, pageWidth - 2 * margin - 10);
    purposeLines.forEach((line: string) => {
      checkAndAddPage(5);
      pdf.text(line, margin + 8, yPos);
      yPos += 4;
    });

    yPos += 6;
  });

  // ISO Compliance Approach
  checkAndAddPage(50);
  yPos += 5;

  pdf.setFillColor(240, 240, 240);
  const complianceBoxHeight = 55;
  pdf.rect(margin, yPos - 4, pageWidth - 2 * margin, complianceBoxHeight, "F");

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("ISO 27001 Compliance Approach", margin + 3, yPos + 2);
  yPos += 8;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  const principles = [
    "✓ Clear Accountability: Every ISO control has designated responsible party",
    "✓ Matrix Responsibility: Team members wear multiple hats with documented duties",
    "✓ Segregation of Duties: Code reviews by different developers, executive approvals",
    "✓ Committee Oversight: Regular governance meetings ensure proper decision-making",
    "✓ Role-Based Access: Security controls enforce least privilege principles",
    "✓ Audit Trail: Comprehensive logging and monitoring of all security-relevant events",
  ];

  principles.forEach((principle) => {
    const lines = pdf.splitTextToSize(principle, pageWidth - 2 * margin - 15);
    lines.forEach((line: string) => {
      checkAndAddPage(5);
      pdf.text(line, margin + 3, yPos);
      yPos += 4;
    });
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `ISO 27001 Organizational Structure | Generated ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 10
    );
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  }

  pdf.save("Kumii_Organizational_Structure_ISO27001.pdf");
};