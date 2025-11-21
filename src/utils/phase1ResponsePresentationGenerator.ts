import pptxgen from "pptxgenjs";
import kumiiLogoPath from '@/assets/kumii-logo.png';

export const generatePhase1ResponsePresentation = () => {
  const pptx = new pptxgen();
  
  // Helper to convert string arrays to table rows
  const toTableRows = (data: string[][]): any[] => data.map(row => row.map(cell => ({ text: cell })));
  
  // Helper to add Kumii branded header to slides
  const addBrandedHeader = (slide: any, title: string) => {
    // Add logo
    slide.addImage({
      path: kumiiLogoPath,
      x: 8.5,
      y: 0.2,
      w: 1.2,
      h: 0.48
    });
    
    // Add title
    slide.addText(title, {
      x: 0.5,
      y: 0.3,
      w: 7.5,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: colors.primary
    });
    
    // Add separator line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 0.95,
      w: 9,
      h: 0.03,
      fill: { color: colors.primary }
    });
  };
  
  // Kumii Official Brand Colors
  const colors = {
    primary: "7A8566",      // Sage Green (Primary Brand Color)
    secondary: "444345",    // Dark Charcoal
    accent: "C5DF94",       // Light Green
    highlight: "F5A623",    // Golden Yellow (for emphasis)
    lightGray: "CDCDCE",    // Light Gray
    white: "FFFFFF",
    darkText: "444345",
    success: "C5DF94",
    warning: "F5A623",
    info: "7A8566"
  };

  // Title Slide with Kumii Branding
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: colors.secondary };
  
  // Add Kumii Logo
  titleSlide.addImage({
    path: kumiiLogoPath,
    x: 4.0,
    y: 0.5,
    w: 2.0,
    h: 0.8
  });
  
  titleSlide.addText("Kumii Phase 1 Assessment", {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: colors.white,
    align: "center"
  });
  
  titleSlide.addText("Response & Remediation Roadmap", {
    x: 0.5,
    y: 3.0,
    w: 9,
    h: 0.6,
    fontSize: 28,
    color: colors.accent,
    align: "center"
  });
  
  // Decorative line
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 3.5,
    y: 3.8,
    w: 3,
    h: 0.05,
    fill: { color: colors.primary }
  });
  
  titleSlide.addText([
    { text: "Period Covered: ", options: { color: colors.lightGray } },
    { text: "1 October 2025 – 14 November 2025", options: { color: colors.white, bold: true } }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 0.5,
    fontSize: 18,
    align: "center"
  });
  
  titleSlide.addText("Product & Development Team Response\nDecember 2025", {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.8,
    fontSize: 16,
    color: colors.lightGray,
    align: "center"
  });

  // Table of Contents
  const tocSlide = pptx.addSlide();
  addBrandedHeader(tocSlide, "Contents");
  
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
    y: 1.3,
    w: 8,
    h: 4.5,
    fontSize: 16,
    color: colors.darkText,
    lineSpacing: 28
  });

  // Executive Response
  const execSlide = pptx.addSlide();
  addBrandedHeader(execSlide, "Executive Response");
  
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
  addBrandedHeader(achievementsSlide, "Phase 1 Achievements Recognition");
  
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
  addBrandedHeader(findingsSlide1, "Response to Key Findings");
  
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

  // Key Findings Response - Email Verification Friction
  const findingsSlide2 = pptx.addSlide();
  addBrandedHeader(findingsSlide2, "Response to Key Findings");
  
  findingsSlide2.addText("2. Email Verification Friction", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: colors.accent
  });
  
  const emailData = [
    ["Issue", "Root Cause", "Solution", "Priority"],
    ["Users don't verify email", "Emails in spam folder", "Improve email deliverability", "P0"],
    ["Confusing verification flow", "Unclear instructions", "Add clear messaging & resend option", "P0"],
    ["No reminder system", "Users forget to check", "Implement reminder emails", "P1"],
    ["Broken email links", "Session timeout issues", "Extend verification link validity", "P1"]
  ];
  
  findingsSlide2.addTable(toTableRows(emailData), {
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
  
  findingsSlide2.addText([
    { text: "Implementation: ", options: { bold: true, color: colors.accent } },
    { text: "Week 1-2", options: { color: colors.darkText } }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 0.4,
    fontSize: 14
  });

  // Key Findings Response - Platform Walkthrough
  const findingsSlide3 = pptx.addSlide();
  addBrandedHeader(findingsSlide3, "Response to Key Findings");
  
  findingsSlide3.addText("3. Platform Walkthrough Issues", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: colors.accent
  });
  
  const walkthroughData = [
    ["Issue", "User Impact", "Solution", "Priority"],
    ["No first-time user tour", "Confusion about features", "Implement interactive tour", "P0"],
    ["Hidden key features", "Low feature adoption", "Feature discovery prompts", "P0"],
    ["Unclear navigation", "Users get lost", "Simplified menu structure", "P0"],
    ["No contextual help", "Support burden", "Add inline help tooltips", "P1"]
  ];
  
  findingsSlide3.addTable(toTableRows(walkthroughData), {
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
  
  findingsSlide3.addText([
    { text: "Implementation: ", options: { bold: true, color: colors.accent } },
    { text: "Week 2-3", options: { color: colors.darkText } }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 0.4,
    fontSize: 14
  });

  // UX Issues & Remediation Plan
  const uxSlide = pptx.addSlide();
  addBrandedHeader(uxSlide, "UX Issues & Remediation Plan");
  
  const uxData = [
    ["UX Issue", "Current State", "Target State", "Timeline"],
    ["Onboarding completion", "23% complete profile", "85% completion rate", "Week 1-2"],
    ["Feature discovery", "Low awareness", "Guided feature tours", "Week 2-3"],
    ["Navigation clarity", "Users report confusion", "Intuitive menu structure", "Week 3"],
    ["Mobile responsiveness", "Inconsistent experience", "Fully responsive design", "Week 4"],
    ["Loading states", "No feedback", "Clear loading indicators", "Week 3"],
    ["Error messaging", "Technical jargon", "User-friendly messages", "Week 2"]
  ];
  
  uxSlide.addTable(toTableRows(uxData), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5
  } as any);
  
  uxSlide.addText("All critical UX issues will be resolved before Phase 2 launch", {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.5,
    fontSize: 14,
    italic: true,
    color: colors.success,
    align: "center"
  });

  // Technical Debt & Quality Improvements
  const techDebtSlide = pptx.addSlide();
  addBrandedHeader(techDebtSlide, "Technical Debt & Quality Improvements");
  
  const techData = [
    ["Category", "Issue", "Impact", "Resolution", "Week"],
    ["Performance", "Slow page loads", "High", "Code splitting & lazy loading", "3"],
    ["Code Quality", "Duplicate code", "Medium", "Refactor shared components", "4"],
    ["Testing", "Low test coverage", "High", "Add unit & integration tests", "5"],
    ["Security", "Unvalidated inputs", "Critical", "Input validation & sanitization", "1"],
    ["Database", "Slow queries", "Medium", "Add indexes & optimize queries", "2"],
    ["Error Handling", "Poor error tracking", "High", "Implement Sentry monitoring", "1"]
  ];
  
  techDebtSlide.addTable(toTableRows(techData), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5
  } as any);

  // Remediation Roadmap - Week 1
  const roadmapWeek1 = pptx.addSlide();
  addBrandedHeader(roadmapWeek1, "Remediation Roadmap: Week 1");
  
  roadmapWeek1.addText([
    { text: "Priority: ", options: { bold: true, color: colors.accent } },
    { text: "Critical Issues (P0)\n\n", options: { color: colors.darkText } },
    { text: "✓ Progressive Onboarding Flow\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Mandatory persona selection after signup\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Profile completion wizard\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Progress indicator (0-100%)\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Security & Input Validation\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Implement input sanitization\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Add CSRF protection\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Set up Sentry error tracking\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Email Deliverability\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Configure SPF & DKIM records\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Improve email templates\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Add resend verification option", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Remediation Roadmap - Week 2
  const roadmapWeek2 = pptx.addSlide();
  addBrandedHeader(roadmapWeek2, "Remediation Roadmap: Week 2");
  
  roadmapWeek2.addText([
    { text: "Priority: ", options: { bold: true, color: colors.accent } },
    { text: "High Priority Issues (P0-P1)\n\n", options: { color: colors.darkText } },
    { text: "✓ Interactive Platform Tour\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • First-time user walkthrough\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Feature discovery tooltips\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Skip/replay options\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ User-Friendly Error Messages\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Replace technical jargon\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Add actionable solutions\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Implement toast notifications\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Database Optimization\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Add missing indexes\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Optimize slow queries\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Implement query caching", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Remediation Roadmap - Week 3
  const roadmapWeek3 = pptx.addSlide();
  addBrandedHeader(roadmapWeek3, "Remediation Roadmap: Week 3");
  
  roadmapWeek3.addText([
    { text: "Priority: ", options: { bold: true, color: colors.accent } },
    { text: "Navigation & Performance\n\n", options: { color: colors.darkText } },
    { text: "✓ Navigation Improvements\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Simplified menu structure\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Breadcrumb navigation\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Quick action shortcuts\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Performance Optimization\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Implement code splitting\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Add lazy loading for routes\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Optimize image delivery\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Loading States\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Add skeleton loaders\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Implement progress indicators\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Better async state handling", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Remediation Roadmap - Week 4
  const roadmapWeek4 = pptx.addSlide();
  addBrandedHeader(roadmapWeek4, "Remediation Roadmap: Week 4");
  
  roadmapWeek4.addText([
    { text: "Priority: ", options: { bold: true, color: colors.accent } },
    { text: "Mobile & Code Quality\n\n", options: { color: colors.darkText } },
    { text: "✓ Mobile Responsiveness\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Fix layout issues on mobile\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Touch-friendly UI elements\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Mobile-optimized forms\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Code Refactoring\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Extract shared components\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Remove duplicate code\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Improve code organization\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Accessibility Improvements\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • ARIA labels and roles\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Keyboard navigation\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Screen reader compatibility", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Remediation Roadmap - Week 5
  const roadmapWeek5 = pptx.addSlide();
  addBrandedHeader(roadmapWeek5, "Remediation Roadmap: Week 5");
  
  roadmapWeek5.addText([
    { text: "Priority: ", options: { bold: true, color: colors.accent } },
    { text: "Testing & Quality Assurance\n\n", options: { color: colors.darkText } },
    { text: "✓ Automated Testing\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Unit tests for core functions\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Integration tests for APIs\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • E2E tests for critical flows\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Documentation\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Code documentation\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • API documentation\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • User guides\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "✓ Final QA & Bug Fixes\n", options: { fontSize: 16, color: colors.darkText, bold: true } },
    { text: "  • Cross-browser testing\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Performance benchmarking\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "  • Security audit", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Phase 2 Readiness Plan
  const phase2Slide = pptx.addSlide();
  addBrandedHeader(phase2Slide, "Phase 2 Readiness Plan");
  
  const phase2Data = [
    ["Milestone", "Criteria", "Target Date", "Status"],
    ["All P0 issues resolved", "100% critical bugs fixed", "Week 2", "On Track"],
    ["Onboarding completion >80%", "User testing validation", "Week 3", "On Track"],
    ["Performance benchmarks met", "<2s page load time", "Week 3", "On Track"],
    ["Security audit passed", "No critical vulnerabilities", "Week 4", "On Track"],
    ["Test coverage >70%", "Unit + integration tests", "Week 5", "On Track"],
    ["Documentation complete", "All docs up to date", "Week 5", "On Track"]
  ];
  
  phase2Slide.addTable(toTableRows(phase2Data), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5
  } as any);
  
  phase2Slide.addText("Phase 2 launch ready by end of Week 5", {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.5,
    fontSize: 16,
    bold: true,
    color: colors.success,
    align: "center"
  });

  // Resource Allocation & Timeline
  const resourceSlide = pptx.addSlide();
  addBrandedHeader(resourceSlide, "Resource Allocation & Timeline");
  
  const resourceData = [
    ["Team Member", "Role", "Focus Areas", "Weeks"],
    ["Frontend Dev 1", "Senior Developer", "Onboarding, Navigation, UX", "1-5"],
    ["Frontend Dev 2", "Developer", "Mobile, Responsiveness, UI", "3-5"],
    ["Backend Dev", "Senior Developer", "Security, Performance, Database", "1-3"],
    ["QA Engineer", "Tester", "Testing, Bug fixes, QA", "4-5"],
    ["UX Designer", "Designer", "User flows, Prototypes, Testing", "1-2"],
    ["Product Manager", "PM", "Coordination, Prioritization", "1-5"]
  ];
  
  resourceSlide.addTable(toTableRows(resourceData), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5
  } as any);
  
  resourceSlide.addText([
    { text: "Total Team: ", options: { bold: true, color: colors.accent } },
    { text: "6 people  |  ", options: { color: colors.darkText } },
    { text: "Duration: ", options: { bold: true, color: colors.accent } },
    { text: "5 weeks  |  ", options: { color: colors.darkText } },
    { text: "Budget: ", options: { bold: true, color: colors.accent } },
    { text: "Within current allocation", options: { color: colors.darkText } }
  ], {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.5,
    fontSize: 14,
    align: "center"
  });

  // Success Metrics & KPIs
  const metricsSlide = pptx.addSlide();
  addBrandedHeader(metricsSlide, "Success Metrics & KPIs");
  
  const metricsData = [
    ["Metric", "Current", "Target", "Measurement"],
    ["Profile completion rate", "23%", "85%", "% of users with complete profiles"],
    ["Email verification rate", "~70%", "95%", "% of users verifying email"],
    ["Feature adoption", "Low", "High", "% using key features weekly"],
    ["Page load time", "4-6s", "<2s", "Average load time"],
    ["User retention (Week 1)", "Unknown", "60%", "% returning after 1 week"],
    ["Support tickets", "High", "-50%", "Reduction in common issues"],
    ["Mobile experience score", "3/5", "4.5/5", "User satisfaction rating"],
    ["Test coverage", "~20%", "70%+", "% of code covered by tests"]
  ];
  
  metricsSlide.addTable(toTableRows(metricsData), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 4,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.48
  } as any);

  // Tracking & Reporting
  const trackingSlide = pptx.addSlide();
  addBrandedHeader(trackingSlide, "Tracking & Reporting");
  
  trackingSlide.addText([
    { text: "Weekly Progress Reports\n\n", options: { fontSize: 20, bold: true, color: colors.accent } },
    { text: "• Every Monday: Team standup & week planning\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Every Wednesday: Mid-week progress check\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Every Friday: Week review & metrics update\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "Monitoring Tools\n\n", options: { fontSize: 20, bold: true, color: colors.accent } },
    { text: "• Sentry: Error tracking & performance monitoring\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Google Analytics: User behavior & engagement\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Hotjar: Session recordings & heatmaps\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Jira: Task tracking & sprint management\n\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "Communication\n\n", options: { fontSize: 20, bold: true, color: colors.accent } },
    { text: "• Slack channel for daily updates\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Weekly email summary to stakeholders\n", options: { fontSize: 14, color: colors.darkText } },
    { text: "• Bi-weekly demo to product team", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.5,
    fontSize: 14,
    valign: "top"
  });

  // Risk Mitigation
  const riskSlide = pptx.addSlide();
  addBrandedHeader(riskSlide, "Risk Mitigation Strategy");
  
  const riskData = [
    ["Risk", "Probability", "Impact", "Mitigation Strategy"],
    ["Timeline delays", "Medium", "High", "Built-in buffer time, prioritization"],
    ["Technical blockers", "Low", "High", "Early spike tasks, expert consultation"],
    ["Resource unavailability", "Low", "Medium", "Cross-training, backup resources"],
    ["Scope creep", "Medium", "Medium", "Strict change control process"],
    ["Integration issues", "Low", "Medium", "Early integration testing"],
    ["User acceptance", "Low", "High", "Continuous user testing & feedback"]
  ];
  
  riskSlide.addTable(toTableRows(riskData), {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.55
  } as any);
  
  riskSlide.addText("Weekly risk review in team meetings", {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.5,
    fontSize: 14,
    italic: true,
    color: colors.info,
    align: "center"
  });

  // Commitment Summary
  const commitmentSlide = pptx.addSlide();
  commitmentSlide.background = { color: colors.primary };
  
  // Add Kumii Logo
  commitmentSlide.addImage({
    path: kumiiLogoPath,
    x: 4.0,
    y: 0.4,
    w: 2.0,
    h: 0.8
  });
  
  commitmentSlide.addText("Our Commitment", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: colors.white,
    align: "center"
  });
  
  commitmentSlide.addText([
    { text: "✓ All critical issues resolved by end of Week 2\n\n", options: { fontSize: 18, color: colors.white } },
    { text: "✓ Platform ready for Phase 2 by end of Week 5\n\n", options: { fontSize: 18, color: colors.white } },
    { text: "✓ Profile completion rate >85%\n\n", options: { fontSize: 18, color: colors.white } },
    { text: "✓ Page load times <2 seconds\n\n", options: { fontSize: 18, color: colors.white } },
    { text: "✓ Mobile-optimized experience\n\n", options: { fontSize: 18, color: colors.white } },
    { text: "✓ 70%+ test coverage\n\n", options: { fontSize: 18, color: colors.white } }
  ], {
    x: 1,
    y: 2.6,
    w: 8,
    h: 3,
    align: "left",
    valign: "top"
  });

  // Closing Slide
  const closingSlide = pptx.addSlide();
  closingSlide.background = { color: colors.secondary };
  
  // Add Kumii Logo
  closingSlide.addImage({
    path: kumiiLogoPath,
    x: 4.0,
    y: 0.5,
    w: 2.0,
    h: 0.8
  });
  
  closingSlide.addText("Thank You", {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.8,
    fontSize: 44,
    bold: true,
    color: colors.white,
    align: "center"
  });
  
  closingSlide.addText("Questions & Discussion", {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.6,
    fontSize: 28,
    color: colors.accent,
    align: "center"
  });
  
  closingSlide.addText([
    { text: "Product & Development Team\n", options: { fontSize: 16, color: colors.lightGray } },
    { text: "tech@kumii.africa\n", options: { fontSize: 16, color: colors.white, bold: true } },
    { text: "December 2025", options: { fontSize: 14, color: colors.lightGray, italic: true } }
  ], {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 1,
    align: "center"
  });

  pptx.writeFile({ fileName: "Kumii_Phase_1_Response_Roadmap.pptx" });
};
