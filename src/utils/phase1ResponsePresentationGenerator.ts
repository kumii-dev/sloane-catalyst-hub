import pptxgen from "pptxgenjs";

export const generatePhase1ResponsePresentation = () => {
  const pptx = new pptxgen();
  
  // Helper to convert string arrays to table rows
  const toTableRows = (data: string[][]): any[] => data.map(row => row.map(cell => ({ text: cell })));
  
  // Kumii brand colors
  const colors = {
    primary: "1a1a2e",
    secondary: "16213e",
    accent: "0f3460",
    highlight: "e94560",
    lightGray: "f5f5f5",
    white: "ffffff",
    darkText: "2d3748",
    success: "10b981",
    warning: "f59e0b",
    info: "3b82f6"
  };

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: colors.primary };
  
  titleSlide.addText("Kumii Phase 1 Assessment", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: colors.white,
    align: "center"
  });
  
  titleSlide.addText("Response & Remediation Roadmap", {
    x: 0.5,
    y: 2.7,
    w: 9,
    h: 0.6,
    fontSize: 28,
    color: colors.highlight,
    align: "center"
  });
  
  titleSlide.addText([
    { text: "Period Covered: ", options: { color: colors.lightGray } },
    { text: "1 October 2025 – 14 November 2025", options: { color: colors.white, bold: true } }
  ], {
    x: 0.5,
    y: 4,
    w: 9,
    h: 0.5,
    fontSize: 18,
    align: "center"
  });
  
  titleSlide.addText("Product & Development Team Response\nDecember 2025", {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.8,
    fontSize: 16,
    color: colors.lightGray,
    align: "center"
  });

  // Table of Contents
  const tocSlide = pptx.addSlide();
  tocSlide.addText("Contents", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.primary
  });
  
  const tocItems = [
    "1. Executive Response",
    "2. Phase 1 Achievements Recognition",
    "3. Response to Key Findings",
    "4. UX Issues & Remediation Plan",
    "5. Platform Walkthrough Issues Resolution",
    "6. Technical Debt & Quality Improvements",
    "7. Comprehensive Remediation Roadmap",
    "8. Phase 2 Readiness Plan",
    "9. Resource Allocation & Timeline",
    "10. Success Metrics & KPIs"
  ];
  
  tocSlide.addText(tocItems.join("\n"), {
    x: 1,
    y: 1.5,
    w: 8,
    h: 4.5,
    fontSize: 16,
    color: colors.darkText,
    lineSpacing: 28
  });

  // Executive Response
  const execSlide = pptx.addSlide();
  execSlide.addText("Executive Response", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.primary
  });
  
  execSlide.addText([
    { text: "Acknowledgment\n", options: { fontSize: 20, bold: true, color: colors.accent } },
    { text: "We acknowledge the comprehensive Phase 1 assessment and thank Product Lead Noma Ngubane for the detailed analysis. The findings are accurate and provide critical insights for Phase 2 preparation.\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "Commitment\n", options: { fontSize: 20, bold: true, color: colors.accent } },
    { text: "The development team commits to addressing all identified issues with a structured remediation approach. Our response includes immediate fixes, short-term improvements, and long-term quality enhancements.\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "Phase 2 Readiness\n", options: { fontSize: 20, bold: true, color: colors.accent } },
    { text: "All critical issues will be resolved before Phase 2 launch. We have prioritized fixes based on user impact and business value.", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Phase 1 Achievements Recognition
  const achievementsSlide = pptx.addSlide();
  achievementsSlide.addText("Phase 1 Achievements Recognition", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const achievementsData = [
    ["Achievement", "Impact", "Status"],
    ["63 registrations (42 legitimate users)", "Validated market interest", "✓"],
    ["Working onboarding process established", "Foundation for user acquisition", "✓"],
    ["Persona-based UX workshop completed", "Improved user journey clarity", "✓"],
    ["SU20 Summit partnerships identified", "Pipeline for Phase 2 growth", "✓"],
    ["Explainer video added to landing page", "Improved first-touch experience", "✓"],
    ["Platform functionality validated", "Core features operational", "✓"]
  ];
  
  achievementsSlide.addTable(toTableRows(achievementsData), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 12,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5
  } as any);
  
  achievementsSlide.addText("The team successfully delivered a functional platform ready for Phase 2 refinement", {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.5,
    fontSize: 14,
    italic: true,
    color: colors.success,
    align: "center"
  });

  // Key Findings Response - User Behavior
  const findingsSlide1 = pptx.addSlide();
  findingsSlide1.addText("Response to Key Findings", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  findingsSlide1.addText("1. Drop-Off After Initial Sign-Up", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: colors.accent
  });
  
  const dropOffData = [
    ["Issue", "Root Cause", "Solution", "Priority"],
    ["Users stop after account creation", "No onboarding prompts", "Implement guided flow", "P0"],
    ["Persona not selected", "Optional step, not enforced", "Make persona selection mandatory", "P0"],
    ["Profile incomplete", "No progress indicators", "Add completion checklist", "P0"],
    ["No behavioral cues", "Missing nudges/tooltips", "Add contextual guidance", "P1"]
  ];
  
  findingsSlide1.addTable(toTableRows(dropOffData), {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 2.2,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5
  } as any);
  
  findingsSlide1.addText([
    { text: "Implementation Timeline: ", options: { bold: true, color: colors.accent } },
    { text: "Week 1-2 (Immediate)", options: { color: colors.darkText } }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 0.4,
    fontSize: 14
  });
  
  findingsSlide1.addText("• Progressive profiling modal after signup\n• Persona selection wizard with clear value props\n• Profile completion progress bar (0-100%)\n• Step-by-step guidance tooltips", {
    x: 0.8,
    y: 4.7,
    w: 8.7,
    h: 1,
    fontSize: 12,
    color: colors.darkText,
    bullet: true
  });

  // Closing Slide
  const closingSlide = pptx.addSlide();
  closingSlide.background = { color: colors.secondary };
  
  closingSlide.addText("Thank You", {
    x: 0.5,
    y: 2,
    w: 9,
    h: 0.8,
    fontSize: 44,
    bold: true,
    color: colors.white,
    align: "center"
  });
  
  closingSlide.addText("Questions & Discussion", {
    x: 0.5,
    y: 3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    color: colors.highlight,
    align: "center"
  });
  
  closingSlide.addText([
    { text: "Product & Development Team\n", options: { fontSize: 16, color: colors.lightGray } },
    { text: "tech@kumii.africa\n", options: { fontSize: 16, color: colors.white, bold: true } },
    { text: "December 2025", options: { fontSize: 14, color: colors.lightGray, italic: true } }
  ], {
    x: 0.5,
    y: 4.2,
    w: 9,
    h: 1,
    align: "center"
  });

  pptx.writeFile({ fileName: "Kumii_Phase_1_Response_Roadmap.pptx" });
};
