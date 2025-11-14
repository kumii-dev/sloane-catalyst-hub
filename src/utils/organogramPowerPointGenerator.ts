import pptxgen from "pptxgenjs";

export const generateOrganogramPowerPoint = () => {
  const pptx = new pptxgen();
  
  // Brand colors
  const primaryColor = "7A8566"; // Sage Green
  const accentColor = "C5DF94"; // Light Green
  const darkCharcoal = "444345";
  const lightBg = "F5F5F3";
  const white = "FFFFFF";
  const highlightYellow = "FFD700"; // Yellow highlighter

  // Organization data
  const roles = [
    {
      category: "Executive Leadership",
      positions: [
        {
          title: "CEO / Managing Director",
          responsibilities: ["Strategic Direction", "Stakeholder Management", "Business Development"],
          count: 1
        },
        {
          title: "COO / CFO",
          responsibilities: ["Operations Management", "Financial Oversight", "Resource Allocation"],
          count: 1
        }
      ]
    },
    {
      category: "Governance & Compliance",
      positions: [
        {
          title: "Governance Manager",
          secondary: ["Acting Data Protection Officer", "Compliance Officer"] as string[] | undefined,
          responsibilities: [
            "ISO 27001 Compliance",
            "Policy Management",
            "Audit Coordination",
            "Data Protection (POPIA/GDPR)",
            "Risk Management"
          ],
          count: 1
        }
      ]
    },
    {
      category: "Technology Leadership",
      positions: [
        {
          title: "CIO / CTO",
          secondary: ["Acting CISO", "Infrastructure Owner"] as string[] | undefined,
          responsibilities: [
            "Technology Strategy",
            "Information Security",
            "Infrastructure Management",
            "Technical Architecture",
            "Vendor Management"
          ],
          count: 1
        }
      ]
    },
    {
      category: "Development & Support",
      positions: [
        {
          title: "Senior Developer",
          secondary: ["Security Champion", "L2/L3 Support Lead"] as string[] | undefined,
          responsibilities: [
            "Software Development",
            "Code Security Reviews",
            "Technical Support (L2/L3)",
            "Quality Assurance",
            "DevOps"
          ],
          count: 1
        },
        {
          title: "Developer",
          secondary: ["L1/L2 Support", "QA Specialist"] as string[] | undefined,
          responsibilities: [
            "Software Development",
            "Technical Support (L1/L2)",
            "Quality Testing",
            "Documentation",
            "Bug Fixes"
          ],
          count: 1
        }
      ]
    },
    {
      category: "Product & Business",
      positions: [
        {
          title: "Product Lead / Owner",
          secondary: ["Acting Business Analyst"] as string[] | undefined,
          responsibilities: [
            "Product Strategy",
            "Feature Prioritization",
            "User Research",
            "Business Requirements",
            "Stakeholder Communication"
          ],
          count: 1
        },
        {
          title: "Module Owners",
          modules: ["Mentorship", "Credit Scoring", "Document Generation", "Valuation", "Financial Model"] as string[] | undefined,
          responsibilities: [
            "Domain Expertise",
            "Module Requirements",
            "User Acceptance Testing",
            "Training & Documentation",
            "Continuous Improvement"
          ],
          count: 2,
          note: "Distributed across modules" as string | undefined
        }
      ]
    }
  ];

  const committees = [
    {
      name: "Information Security Committee",
      members: ["CEO", "CTO (Chair)", "Governance Manager", "Senior Developer"],
      frequency: "Monthly",
      purpose: "Security oversight, risk review, incident response coordination"
    },
    {
      name: "Change Advisory Board",
      members: ["CTO (Chair)", "Product Lead", "Senior Developer", "Governance Manager"],
      frequency: "Bi-weekly",
      purpose: "Change approval, impact assessment, deployment coordination"
    },
    {
      name: "Incident Response Team",
      members: ["CTO (Lead)", "Senior Developer", "Governance Manager", "CEO (Escalation)"],
      frequency: "On-demand",
      purpose: "Security incident handling, breach response, business continuity"
    }
  ];

  // === COVER SLIDE ===
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: darkCharcoal };
  
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { type: "solid", color: primaryColor, transparency: 70 }
  });

  coverSlide.addText("KUMII", {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 72,
    bold: true,
    color: white,
    align: "center",
    fontFace: "Arial"
  });

  coverSlide.addText("Organizational Structure & ISO 27001 Governance", {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 0.6,
    fontSize: 24,
    color: accentColor,
    align: "center",
    fontFace: "Arial",
    bold: true
  });

  // === OVERVIEW SLIDE ===
  const overviewSlide = pptx.addSlide();
  overviewSlide.background = { color: lightBg };

  overviewSlide.addText("Organization Overview", {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: darkCharcoal,
    fontFace: "Arial"
  });

  const statsY = 1.5;
  const stats = [
    { label: "Total Team Size", value: "7", desc: "Lean & efficient structure" },
    { label: "Leadership", value: "2", desc: "Strategic oversight" },
    { label: "Technical Team", value: "3", desc: "Development & support" }
  ];

  stats.forEach((stat, idx) => {
    const xPos = 0.5 + (idx * 3.2);
    
    overviewSlide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: statsY,
      w: 2.8,
      h: 1.5,
      fill: { color: white },
      line: { color: primaryColor, width: 2 }
    });

    overviewSlide.addText(stat.label, {
      x: xPos,
      y: statsY + 0.2,
      w: 2.8,
      h: 0.3,
      fontSize: 12,
      color: darkCharcoal,
      align: "center",
      fontFace: "Arial"
    });

    overviewSlide.addText(stat.value, {
      x: xPos,
      y: statsY + 0.6,
      w: 2.8,
      h: 0.5,
      fontSize: 36,
      bold: true,
      color: primaryColor,
      align: "center",
      fontFace: "Arial"
    });

    overviewSlide.addText(stat.desc, {
      x: xPos,
      y: statsY + 1.1,
      w: 2.8,
      h: 0.3,
      fontSize: 10,
      color: darkCharcoal,
      align: "center",
      fontFace: "Arial",
      italic: true
    });
  });

  // === FUNCTIONAL ROLES SLIDES ===
  roles.forEach((category) => {
    const roleSlide = pptx.addSlide();
    roleSlide.background = { color: lightBg };

    roleSlide.addText(category.category, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: darkCharcoal,
      fontFace: "Arial"
    });

    let yPos = 1.3;

    category.positions.forEach((position) => {
      // Position title with count
      const countText = `(${position.count} ${position.count === 1 ? "Person" : "People"})`;
      
      roleSlide.addText([
        { text: position.title, options: { fontSize: 18, bold: true, color: darkCharcoal } },
        { text: " ", options: { fontSize: 18 } },
        { 
          text: countText, 
          options: { 
            fontSize: 12, 
            bold: true, 
            color: "1F1F1F",
            highlight: highlightYellow
          } 
        }
      ], {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.4,
        fontFace: "Arial"
      });

      yPos += 0.5;

      // Secondary roles (highlighted)
      if ("secondary" in position && position.secondary) {
        const secondaryText = (position.secondary as string[]).map(sec => `(${sec})`).join("  ");
        roleSlide.addText(secondaryText, {
          x: 0.7,
          y: yPos,
          w: 8.8,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: "1F1F1F",
          highlight: highlightYellow,
          fontFace: "Arial"
        });
        yPos += 0.4;
      }

      // Modules (highlighted)
      if ("modules" in position && position.modules) {
        const modulesText = (position.modules as string[]).map(mod => `(${mod})`).join("  ");
        roleSlide.addText(modulesText, {
          x: 0.7,
          y: yPos,
          w: 8.8,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: "1F1F1F",
          highlight: highlightYellow,
          fontFace: "Arial"
        });
        yPos += 0.4;
      }

      // Note
      if ("note" in position && position.note) {
        roleSlide.addText(position.note as string, {
          x: 0.7,
          y: yPos,
          w: 8.8,
          h: 0.3,
          fontSize: 9,
          italic: true,
          color: "666666",
          fontFace: "Arial"
        });
        yPos += 0.35;
      }

      // Responsibilities
      roleSlide.addText("Key Responsibilities:", {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: darkCharcoal,
        fontFace: "Arial"
      });
      yPos += 0.35;

      position.responsibilities.forEach((resp) => {
        roleSlide.addText(`• ${resp}`, {
          x: 0.9,
          y: yPos,
          w: 8.6,
          h: 0.25,
          fontSize: 10,
          color: darkCharcoal,
          fontFace: "Arial"
        });
        yPos += 0.28;
      });

      yPos += 0.3; // Space between positions
    });
  });

  // === GOVERNANCE COMMITTEES SLIDE ===
  const committeesSlide = pptx.addSlide();
  committeesSlide.background = { color: lightBg };

  committeesSlide.addText("Governance Committees", {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: darkCharcoal,
    fontFace: "Arial"
  });

  committeesSlide.addText("Matrix structure enabling proper oversight with lean team", {
    x: 0.5,
    y: 1,
    w: 9,
    h: 0.3,
    fontSize: 12,
    color: "666666",
    fontFace: "Arial",
    italic: true
  });

  let committeeY = 1.6;
  committees.forEach((committee) => {
    committeesSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: committeeY,
      w: 9,
      h: 1.3,
      fill: { color: white },
      line: { color: primaryColor, width: 1 }
    });

    // Committee name with frequency (highlighted)
    const freqText = `(${committee.frequency})`;
    committeesSlide.addText([
      { text: committee.name, options: { fontSize: 14, bold: true, color: darkCharcoal } },
      { text: " ", options: { fontSize: 14 } },
      { 
        text: freqText, 
        options: { 
          fontSize: 11, 
          bold: true, 
          color: "1F1F1F",
          highlight: highlightYellow
        } 
      }
    ], {
      x: 0.7,
      y: committeeY + 0.15,
      w: 8.6,
      h: 0.3,
      fontFace: "Arial"
    });

    // Members
    committeesSlide.addText(`Members: ${committee.members.join(", ")}`, {
      x: 0.7,
      y: committeeY + 0.5,
      w: 8.6,
      h: 0.3,
      fontSize: 10,
      color: darkCharcoal,
      fontFace: "Arial"
    });

    // Purpose
    committeesSlide.addText(`Purpose: ${committee.purpose}`, {
      x: 0.7,
      y: committeeY + 0.8,
      w: 8.6,
      h: 0.3,
      fontSize: 10,
      color: darkCharcoal,
      fontFace: "Arial"
    });

    committeeY += 1.5;
  });

  // === ISO 27001 COMPLIANCE SLIDE ===
  const complianceSlide = pptx.addSlide();
  complianceSlide.background = { color: lightBg };

  complianceSlide.addText("ISO 27001 Compliance Approach", {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: darkCharcoal,
    fontFace: "Arial"
  });

  const principles = [
    {
      title: "✓ Clear Accountability",
      desc: "Every ISO control has a designated responsible party with documented authority"
    },
    {
      title: "✓ Matrix Responsibility",
      desc: "Team members wear multiple hats with clear secondary responsibilities"
    },
    {
      title: "✓ Segregation of Duties",
      desc: "Code reviews by different developers, executive approval for critical changes"
    },
    {
      title: "✓ Committee Oversight",
      desc: "Regular governance meetings ensure proper oversight and decision-making"
    }
  ];

  let principleY = 1.4;
  principles.forEach((principle, idx) => {
    const xPos = idx % 2 === 0 ? 0.5 : 5.2;
    const localY = principleY + Math.floor(idx / 2) * 1.5;

    complianceSlide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: localY,
      w: 4.5,
      h: 1.2,
      fill: { color: white },
      line: { color: primaryColor, width: 2 }
    });

    complianceSlide.addText(principle.title, {
      x: xPos + 0.2,
      y: localY + 0.2,
      w: 4.1,
      h: 0.3,
      fontSize: 13,
      bold: true,
      color: primaryColor,
      fontFace: "Arial"
    });

    complianceSlide.addText(principle.desc, {
      x: xPos + 0.2,
      y: localY + 0.55,
      w: 4.1,
      h: 0.5,
      fontSize: 10,
      color: darkCharcoal,
      fontFace: "Arial"
    });
  });

  // Save presentation
  pptx.writeFile({ fileName: "Kumii_Organizational_Structure_ISO27001.pptx" });
};
