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
  
  achievementsSlide.addTable(achievementsData, {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 3.5,
    fontSize: 12,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5,
    headerRowFill: colors.accent,
    headerRowColor: colors.white,
    headerRowBold: true
  });
  
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
  
  findingsSlide1.addTable(dropOffData, {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 2.2,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5,
    headerRowFill: colors.warning,
    headerRowColor: colors.white,
    headerRowBold: true
  });
  
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

  // Key Findings Response - Gmail Identity
  const findingsSlide2 = pptx.addSlide();
  findingsSlide2.addText("Response to Key Findings", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  findingsSlide2.addText("2. Gmail Sign-Ins Missing Name/Surname", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: colors.accent
  });
  
  const identityData = [
    ["Issue", "Impact", "Solution", "Priority"],
    ["Google OAuth users show only email", "No personalization", "Enforce name capture post-OAuth", "P0"],
    ["Difficult to map personas", "Analytics limitations", "Update profile creation flow", "P0"],
    ["Cannot address users by name", "Poor engagement", "Mandatory name/surname fields", "P0"]
  ];
  
  findingsSlide2.addTable(identityData, {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 1.7,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5,
    headerRowFill: colors.warning,
    headerRowColor: colors.white,
    headerRowBold: true
  });
  
  findingsSlide2.addText([
    { text: "Technical Implementation:\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "1. ", options: { bold: true } },
    { text: "Intercept OAuth callback and check profile completeness\n", options: {} },
    { text: "2. ", options: { bold: true } },
    { text: "Display modal requiring First Name and Last Name if missing\n", options: {} },
    { text: "3. ", options: { bold: true } },
    { text: "Block dashboard access until identity is captured\n", options: {} },
    { text: "4. ", options: { bold: true } },
    { text: "Update profiles table with validation rules\n", options: {} },
    { text: "5. ", options: { bold: true } },
    { text: "Add server-side validation in edge functions", options: {} }
  ], {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 2,
    fontSize: 12,
    color: colors.darkText
  });
  
  findingsSlide2.addText("Timeline: Week 1 | Responsible: Auth Team", {
    x: 0.5,
    y: 5.5,
    w: 9,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: colors.info,
    align: "center"
  });

  // Key Findings Response - Dummy Content
  const findingsSlide3 = pptx.addSlide();
  findingsSlide3.addText("Response to Key Findings", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  findingsSlide3.addText("3. Dummy/Inactive Content Visible", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: colors.accent
  });
  
  const contentData = [
    ["Content Type", "Current State", "Action Required", "Priority"],
    ["Test listings", "Publicly visible", "Remove all test data", "P0"],
    ["Placeholder services", "Appear usable", "Hide or badge as 'Coming Soon'", "P0"],
    ["Inactive features", "Confusing to users", "Disable or clearly label", "P1"],
    ["Demo accounts", "Mixed with real users", "Archive test accounts", "P1"]
  ];
  
  findingsSlide3.addTable(contentData, {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 2.2,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.5,
    headerRowFill: colors.warning,
    headerRowColor: colors.white,
    headerRowBold: true
  });
  
  findingsSlide3.addText([
    { text: "Content Cleanup Strategy:\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "Phase 1 (Immediate): ", options: { bold: true } },
    { text: "Remove all test/dummy listings from database\n", options: {} },
    { text: "Phase 2 (Week 1): ", options: { bold: true } },
    { text: "Add feature flags for unreleased functionality\n", options: {} },
    { text: "Phase 3 (Week 2): ", options: { bold: true } },
    { text: "Implement 'Coming Soon' badges for future features\n", options: {} },
    { text: "Phase 4 (Ongoing): ", options: { bold: true } },
    { text: "Establish content review process before production deployment", options: {} }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 1.5,
    fontSize: 12,
    color: colors.darkText
  });

  // Platform Walkthrough - Landing Page Issues
  const walkthroughSlide1 = pptx.addSlide();
  walkthroughSlide1.addText("Platform Walkthrough Issues - Landing Page", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const landingPageData = [
    ["Issue #", "Finding", "Response & Action", "Timeline"],
    ["1", "Background not African city/landmark", "Replace hero image with African cityscape (Johannesburg, Cape Town, Lagos)", "Week 1"],
    ["2", "Trusted partners (AWS, African Bank) - accuracy?", "Verify partnerships and update with actual logos/names only", "Week 1"],
    ["3", "Premature mention of 'discounted' services", "Revise copy to 'Negotiated rates' until contracts finalized", "Week 1"],
    ["4", "Schedule Demo & Get Started buttons inactive", "Implement routing and contact forms for both CTAs", "Week 2"],
    ["5", "Inflated user numbers (1000+ active startups)", "Update with real metrics or use 'Growing community' messaging", "Week 1"]
  ];
  
  walkthroughSlide1.addTable(landingPageData, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 3,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.55,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.5, 4.5, 1.9]
  });
  
  walkthroughSlide1.addText("All landing page issues categorized as P0/P1 - Target completion: Week 1-2", {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: colors.success,
    align: "center"
  });

  // Platform Walkthrough - AI Chatbot
  const walkthroughSlide2 = pptx.addSlide();
  walkthroughSlide2.addText("Platform Walkthrough Issues - AI Chatbot", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const chatbotData = [
    ["Issue #", "Finding", "Response & Action", "Priority"],
    ["6", "Bot responses have asterisks and quotation marks", "Clean up markdown rendering in chat component", "P1"],
    ["7", "Generic responses not persona-specific", "Update prompts to reflect all 6 user personas", "P0"],
    ["8", "Navigation suggestions don't map to actual routes", "Audit all bot suggestions and link to real pages", "P0"]
  ];
  
  walkthroughSlide2.addTable(chatbotData, {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 1.7,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.52,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true
  });
  
  walkthroughSlide2.addText([
    { text: "Chatbot Improvement Plan:\n\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "• Update RichTextEditor component to properly handle markdown\n", options: { fontSize: 12 } },
    { text: "• Revise copilot-chat edge function with persona-aware prompts\n", options: { fontSize: 12 } },
    { text: "• Add routing validation to ensure all suggested paths exist\n", options: { fontSize: 12 } },
    { text: "• Include context about user's selected persona in AI requests\n", options: { fontSize: 12 } },
    { text: "• Test chatbot responses for each of 6 persona types", options: { fontSize: 12 } }
  ], {
    x: 0.5,
    y: 3.3,
    w: 9,
    h: 2,
    color: colors.darkText
  });
  
  walkthroughSlide2.addText("Owner: AI/ML Team | Timeline: Week 2-3", {
    x: 0.5,
    y: 5.4,
    w: 9,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: colors.info,
    align: "center"
  });

  // Platform Walkthrough - Help Center
  const walkthroughSlide3 = pptx.addSlide();
  walkthroughSlide3.addText("Platform Walkthrough Issues - Help Center", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const helpCenterData = [
    ["Issue #", "Finding", "Response & Action", "Timeline"],
    ["9", "User Guides button inactive", "Create initial user guides for core workflows", "Week 3-4"],
    ["10", "Video Tutorials button inactive", "Record screen tutorials for key features", "Week 4-6"],
    ["11", "Live Chat Support inactive", "Integrate customer support tool (Intercom/Zendesk)", "Week 5-6"],
    ["12", "Email Support inactive", "Set up support email routing and ticketing", "Week 2"],
    ["13", "FAQ section incomplete", "Add profile completion FAQ as suggested", "Week 1"]
  ];
  
  walkthroughSlide3.addTable(helpCenterData, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 2.8,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.52,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.3, 4.7, 1.9]
  });
  
  walkthroughSlide3.addText([
    { text: "Content Creation Strategy:\n", options: { fontSize: 14, bold: true, color: colors.accent } },
    { text: "User Guides: ", options: { bold: true } },
    { text: "Prioritize onboarding, profile setup, and funding application guides\n", options: {} },
    { text: "Videos: ", options: { bold: true } },
    { text: "Start with 'Getting Started' and 'How to Apply for Funding' tutorials\n", options: {} },
    { text: "Support: ", options: { bold: true } },
    { text: "Establish support@kumii.africa with SLA response times", options: {} }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 1.3,
    fontSize: 11,
    color: colors.darkText
  });

  // Platform Walkthrough - Expert Advisory
  const walkthroughSlide4 = pptx.addSlide();
  walkthroughSlide4.addText("Platform Walkthrough Issues - Expert Advisory", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const advisoryData = [
    ["Issue #", "Finding", "Response & Action", "Priority"],
    ["14", "Should ask for certificates/documentation", "Add document upload to advisor profile creation", "P1"],
    ["15", "More Filters button inactive", "Implement advanced filtering (industry, rate, availability)", "P2"],
    ["16", "Advisor rates still in USD", "Convert all pricing to ZAR with proper currency display", "P0"],
    ["17", "No application status tracking", "Build advisor approval workflow dashboard", "P1"],
    ["18", "Missing 'Other' option in specializations", "Update industry focus and specializations dropdowns", "P1"]
  ];
  
  walkthroughSlide4.addTable(advisoryData, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 2.8,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.52,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.3, 4.7, 1.9]
  });
  
  walkthroughSlide4.addText([
    { text: "Advisor Vetting Enhancement:\n", options: { fontSize: 14, bold: true, color: colors.accent } },
    { text: "• Add certificate upload to MentorProfileEditor and AdvisorProfileEditor\n", options: { fontSize: 11 } },
    { text: "• Create admin review dashboard for pending advisor applications\n", options: { fontSize: 11 } },
    { text: "• Define SLA for application review (proposed: 3-5 business days)\n", options: { fontSize: 11 } },
    { text: "• Email notifications for approval/rejection status changes\n", options: { fontSize: 11 } },
    { text: "• Public badge system to show verified advisors", options: { fontSize: 11 } }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 1.4,
    color: colors.darkText
  });

  // Platform Walkthrough - Funding Hub
  const walkthroughSlide5 = pptx.addSlide();
  walkthroughSlide5.addText("Platform Walkthrough Issues - Funding Hub", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const fundingData = [
    ["Issue #", "Finding", "Response & Action", "Timeline"],
    ["19", "New funding matches placeholder visible when empty", "Hide matches banner until actual matches exist", "Week 1"],
    ["20", "Funder profile form not comprehensive enough", "Expand form with detailed criteria fields", "Week 2"],
    ["21", "Undefined SLA for profile review/approval", "Establish 3-5 day SLA for funder verification", "Week 1"],
    ["22", "Coming Soon needed for inactive funding types", "Add badges to grant/VC/angel investor categories", "Week 1"],
    ["23", "Placeholder opportunities with fake data", "Remove all placeholder funding opportunities", "Immediate"],
    ["24", "Apply popup disappears - needs profile link", "Add 'Complete Profile' button in application modal", "Week 1"],
    ["25", "Naming inconsistency: Market Access vs Access to Market", "Standardize to 'Access to Market' across platform", "Week 1"]
  ];
  
  walkthroughSlide5.addTable(fundingData, {
    x: 0.2,
    y: 1.3,
    w: 9.6,
    h: 3.8,
    fontSize: 9,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.52,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.5, 4.8, 1.8]
  });

  // Platform Walkthrough - Profile Creation
  const walkthroughSlide6 = pptx.addSlide();
  walkthroughSlide6.addText("Platform Walkthrough Issues - Profile Creation", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const profileData = [
    ["Issue #", "Finding", "Response & Action", "Priority"],
    ["26", "Form fields not visible until 'Basic Info' clicked", "Auto-expand first section and improve UI affordance", "P1"],
    ["27", "Persona shows as 'UNASSIGNED'", "Force persona selection before profile creation", "P0"],
    ["28", "Inconsistent use of 'Recommended' vs asterisk (*)", "Standardize to asterisk for required fields only", "P1"],
    ["29", "Profile completion stuck at 23%", "Fix calculation logic and ensure all fields counted", "P0"]
  ];
  
  walkthroughSlide6.addTable(profileData, {
    x: 0.4,
    y: 1.3,
    w: 9.2,
    h: 2.3,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.54,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.5, 5, 1.2]
  });
  
  walkthroughSlide6.addText([
    { text: "Profile UX Improvements:\n", options: { fontSize: 14, bold: true, color: colors.accent } },
    { text: "1. Auto-expand Basic Info section on profile page load\n", options: { fontSize: 11 } },
    { text: "2. Show clear section headers with expand/collapse icons\n", options: { fontSize: 11 } },
    { text: "3. Display inline validation messages for required fields\n", options: { fontSize: 11 } },
    { text: "4. Add progress indicator showing X of Y sections completed\n", options: { fontSize: 11 } },
    { text: "5. Implement save draft functionality for partial completion\n", options: { fontSize: 11 } },
    { text: "6. Email reminders for incomplete profiles after 24 hours", options: { fontSize: 11 } }
  ], {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 1.8,
    color: colors.darkText
  });

  // Platform Walkthrough - Mentorship
  const walkthroughSlide7 = pptx.addSlide();
  walkthroughSlide7.addText("Platform Walkthrough Issues - Mentorship", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const mentorshipData = [
    ["Issue #", "Finding", "Response & Action", "Priority"],
    ["30", "Text alignment issues and overlapping content", "Fix CSS layouts in mentor card components", "P1"],
    ["31", "No way to contact mentor directly during booking", "Add 'Contact Mentor' button with messaging integration", "P2"],
    ["32", "Cannot offer both free and paid mentorship", "Add pricing tier options to mentor profile setup", "P1"],
    ["33", "No available slots message lacks action", "Suggest alternative mentors or waitlist signup", "P2"]
  ];
  
  walkthroughSlide7.addTable(mentorshipData, {
    x: 0.4,
    y: 1.3,
    w: 9.2,
    h: 2.3,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.54,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.5, 5, 1.2]
  });
  
  walkthroughSlide7.addText([
    { text: "Mentorship Booking Enhancements:\n", options: { fontSize: 14, bold: true, color: colors.accent } },
    { text: "1. ", options: { bold: true } },
    { text: "Fix layout issues in MentorMatchCard component (z-index, padding, alignment)\n", options: {} },
    { text: "2. ", options: { bold: true } },
    { text: "Add messaging integration in BookSessionDialog for pre-booking questions\n", options: {} },
    { text: "3. ", options: { bold: true } },
    { text: "Support multi-tier pricing: Free, Discounted, Premium rates\n", options: {} },
    { text: "4. ", options: { bold: true } },
    { text: "Implement availability suggestions when slots are full\n", options: {} },
    { text: "5. ", options: { bold: true } },
    { text: "Add waitlist feature for popular mentors", options: {} }
  ], {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 1.8,
    fontSize: 11,
    color: colors.darkText
  });

  // Platform Walkthrough - Business Tools & Resources
  const walkthroughSlide8 = pptx.addSlide();
  walkthroughSlide8.addText("Platform Walkthrough Issues - Business Tools & Resources", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: colors.primary
  });
  
  const toolsData = [
    ["Issue #", "Finding", "Response & Action", "Timeline"],
    ["34", "Placeholder listings visible behind categories", "Remove demo listings and clean up database", "Immediate"],
    ["35", "Categories need 'Coming Soon' labels", "Add status badges to inactive service categories", "Week 1"],
    ["36", "Resources Hub sections empty", "Plan content creation for learning hub, guides, tools", "Week 3-8"]
  ];
  
  walkthroughSlide8.addTable(toolsData, {
    x: 0.4,
    y: 1.3,
    w: 9.2,
    h: 1.8,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.55,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.5, 2.5, 4.8, 1.4]
  });
  
  walkthroughSlide8.addText([
    { text: "Content Development Roadmap:\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "\nLearning Hub (Week 3-6):\n", options: { fontSize: 13, bold: true, color: colors.darkText } },
    { text: "• Partner with educational providers for course content\n• Create starter courses: Business Planning 101, Financial Literacy, Digital Marketing\n\n", options: { fontSize: 11 } },
    { text: "Knowledge Library (Week 4-8):\n", options: { fontSize: 13, bold: true, color: colors.darkText } },
    { text: "• Develop downloadable templates: Business Plan, Pitch Deck, Financial Model\n• Write articles on funding, mentorship, and growth strategies\n\n", options: { fontSize: 11 } },
    { text: "Tools & Downloads (Week 5-7):\n", options: { fontSize: 13, bold: true, color: colors.darkText } },
    { text: "• Build business calculators (cash flow, break-even, valuation)\n• Create startup checklists and assessment tools", options: { fontSize: 11 } }
  ], {
    x: 0.5,
    y: 3.3,
    w: 9,
    h: 2.4,
    color: colors.darkText
  });

  // General Issues
  const generalSlide = pptx.addSlide();
  generalSlide.addText("General Platform Issues", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const generalData = [
    ["Issue #", "Finding", "Response & Action", "Priority"],
    ["37", "British vs American English inconsistency", "Standardize to South African English (British spelling)", "P2"],
    ["38", "System Status page blocks inactive", "Implement status monitoring with real uptime data", "P2"],
    ["39", "Footer menu items don't link properly", "Audit and fix all footer navigation links", "P1"]
  ];
  
  generalSlide.addTable(generalData, {
    x: 0.5,
    y: 1.4,
    w: 9,
    h: 1.8,
    fontSize: 11,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.55,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true
  });
  
  generalSlide.addText([
    { text: "Quality Assurance Measures:\n\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "• Implement automated spell-checking and language consistency tools\n", options: { fontSize: 12 } },
    { text: "• Create comprehensive link checker for navigation audits\n", options: { fontSize: 12 } },
    { text: "• Set up monitoring dashboard for system health and uptime\n", options: { fontSize: 12 } },
    { text: "• Establish code review checklist including UX/content quality\n", options: { fontSize: 12 } },
    { text: "• Add pre-deployment checklist for content verification", options: { fontSize: 12 } }
  ], {
    x: 0.5,
    y: 3.4,
    w: 9,
    h: 1.8,
    color: colors.darkText
  });

  // Questions from Appendix 2
  const questionsSlide = pptx.addSlide();
  questionsSlide.addText("Responses to Key Questions (Appendix 2)", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const questionsData = [
    ["#", "Question", "Response"],
    ["1", "What is the business model?", "Freemium SaaS + transaction fees + premium services"],
    ["2", "Can users post physical products?", "Phase 2+ feature - currently services/software only"],
    ["3", "Subscription fee for non-cohort users?", "R99-R499/month depending on tier (under review)"],
    ["4", "How are services vetted?", "3-5 day manual review + automated quality checks"],
    ["5", "Will there be a mobile app?", "PWA is live; native apps planned for Q2 2026"],
    ["6", "Startup verification timeline?", "2-3 business days for basic verification"],
    ["7", "International mentors/advisors?", "Yes, expanding to pan-African in Phase 2"],
    ["8", "Sedfa payment integration?", "Under technical evaluation for Q1 2026"],
    ["9", "Process for becoming partner?", "Submit via partnerships form - reviewed weekly"],
    ["10", "Certificate after course completion?", "Yes, digital certificates with blockchain verification"],
    ["11", "Who owns Kumii?", "Kumii Marketplace (Pty) Ltd - ownership structure on About page"],
    ["12", "Cost for service providers/corporates?", "Commission-based: 10-15% per transaction"]
  ];
  
  questionsSlide.addTable(questionsData, {
    x: 0.2,
    y: 1.2,
    w: 9.6,
    h: 4.5,
    fontSize: 8,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.36,
    headerRowFill: colors.success,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.3, 2.8, 6.5]
  });

  // Comprehensive Remediation Roadmap - Week 1
  const roadmapSlide1 = pptx.addSlide();
  roadmapSlide1.addText("Remediation Roadmap - Week 1 (Critical)", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const week1Data = [
    ["Priority", "Task", "Owner", "Status"],
    ["P0", "Remove all test/dummy listings and accounts", "Database Team", "Not Started"],
    ["P0", "Enforce name/surname capture after Google OAuth", "Auth Team", "Not Started"],
    ["P0", "Make persona selection mandatory", "Frontend Team", "Not Started"],
    ["P0", "Fix profile completion percentage calculation", "Backend Team", "Not Started"],
    ["P0", "Convert all USD pricing to ZAR", "Full Stack Team", "Not Started"],
    ["P0", "Hide funding matches banner when empty", "Frontend Team", "Not Started"],
    ["P0", "Replace hero image with African cityscape", "Design Team", "Not Started"],
    ["P1", "Update trusted partner logos (verify accuracy)", "Marketing Team", "Not Started"],
    ["P1", "Revise 'discounted' copy to 'negotiated rates'", "Content Team", "Not Started"],
    ["P1", "Add 'Complete Profile' link in application modal", "Frontend Team", "Not Started"],
    ["P1", "Standardize naming to 'Access to Market'", "Full Stack Team", "Not Started"],
    ["P1", "Define and document SLA for profile reviews", "Operations Team", "Not Started"],
    ["P1", "Add 'Coming Soon' badges to inactive features", "Frontend Team", "Not Started"]
  ];
  
  roadmapSlide1.addTable(week1Data, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 4.3,
    fontSize: 9,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.32,
    headerRowFill: colors.highlight,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.6, 4.8, 2.2, 1.8]
  });

  // Comprehensive Remediation Roadmap - Week 2-3
  const roadmapSlide2 = pptx.addSlide();
  roadmapSlide2.addText("Remediation Roadmap - Week 2-3 (High Priority)", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const week23Data = [
    ["Week", "Task", "Owner", "Deliverable"],
    ["2", "Implement guided onboarding flow with tooltips", "UX + Frontend", "Progressive profiling modal"],
    ["2", "Add profile completion progress bar", "Frontend Team", "Visual progress indicator"],
    ["2", "Implement Schedule Demo and Get Started CTAs", "Full Stack", "Working contact forms"],
    ["2", "Set up support@kumii.africa email routing", "Operations", "Ticketing system"],
    ["2", "Expand funder profile form with detailed criteria", "Backend Team", "Enhanced form fields"],
    ["2", "Auto-expand Basic Info section on profile pages", "Frontend Team", "Improved UX"],
    ["3", "Update chatbot with persona-aware prompts", "AI/ML Team", "Context-aware responses"],
    ["3", "Audit and fix all bot navigation suggestions", "QA + AI Team", "Accurate routing"],
    ["3", "Clean up markdown rendering in chat", "Frontend Team", "No asterisks/quotes"],
    ["3", "Add certificate upload to advisor profiles", "Full Stack", "Document storage"],
    ["3", "Build advisor approval workflow dashboard", "Backend + Frontend", "Admin review panel"],
    ["3", "Create initial user guides for core workflows", "Content Team", "Getting started docs"]
  ];
  
  roadmapSlide2.addTable(week23Data, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 4.3,
    fontSize: 9,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.34,
    headerRowFill: colors.warning,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.6, 4.5, 2.2, 2.1]
  });

  // Comprehensive Remediation Roadmap - Week 4-6
  const roadmapSlide3 = pptx.addSlide();
  roadmapSlide3.addText("Remediation Roadmap - Week 4-6 (Medium Priority)", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const week46Data = [
    ["Week", "Task", "Owner", "Deliverable"],
    ["4", "Record video tutorials for key features", "Content + Video", "Getting started videos"],
    ["4", "Add messaging integration to booking flow", "Backend Team", "Pre-booking chat"],
    ["4", "Implement advanced filtering for advisors", "Frontend Team", "More Filters feature"],
    ["4", "Develop downloadable business templates", "Content Team", "Plan/Pitch/Model templates"],
    ["5", "Integrate customer support tool (Intercom/Zendesk)", "DevOps", "Live chat support"],
    ["5", "Support multi-tier pricing for mentors", "Full Stack", "Free/Discounted/Premium"],
    ["5", "Build business calculators", "Frontend Team", "Cash flow/Break-even tools"],
    ["5", "Implement system status monitoring", "DevOps", "Uptime dashboard"],
    ["6", "Partner with educational providers for courses", "Partnerships", "Course catalog"],
    ["6", "Add waitlist feature for popular mentors", "Full Stack", "Waitlist management"],
    ["6", "Create startup assessment tools", "Product Team", "Readiness checklists"],
    ["6", "Fix mentor card layout and alignment issues", "Frontend Team", "Polished UI"]
  ];
  
  roadmapSlide3.addTable(week46Data, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 4.3,
    fontSize: 9,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.34,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.6, 4.5, 2.2, 2.1]
  });

  // Comprehensive Remediation Roadmap - Week 7-8
  const roadmapSlide4 = pptx.addSlide();
  roadmapSlide4.addText("Remediation Roadmap - Week 7-8 (Lower Priority)", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: colors.primary
  });
  
  const week78Data = [
    ["Week", "Task", "Owner", "Deliverable"],
    ["7", "Populate knowledge library with articles", "Content Team", "15+ articles on key topics"],
    ["7", "Create comprehensive case studies", "Marketing Team", "Success stories"],
    ["7", "Develop startup checklists", "Product Team", "Stage-based checklists"],
    ["7", "Implement language consistency tool", "DevOps", "Automated spell check"],
    ["8", "Write articles on funding strategies", "Content Team", "Funding guide series"],
    ["8", "Build valuation calculator", "Frontend Team", "Startup valuation tool"],
    ["8", "Complete resources hub content", "Content Team", "Fully populated hub"],
    ["8", "Audit and fix all footer links", "QA Team", "Working navigation"]
  ];
  
  roadmapSlide4.addTable(week78Data, {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 3,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.36,
    headerRowFill: colors.secondary,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [0.6, 4.5, 2.2, 1.7]
  });
  
  roadmapSlide4.addText([
    { text: "Phase 2 Launch Target: ", options: { bold: true, fontSize: 16, color: colors.accent } },
    { text: "End of Week 8", options: { fontSize: 16, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.5,
    align: "center"
  });

  // Resource Allocation
  const resourceSlide = pptx.addSlide();
  resourceSlide.addText("Resource Allocation & Team Structure", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const resourceData = [
    ["Team", "Allocation", "Key Responsibilities", "Week 1-2 Focus"],
    ["Frontend (3 devs)", "100%", "UI/UX fixes, components, styling", "Onboarding flow, persona selection"],
    ["Backend (2 devs)", "100%", "APIs, database, edge functions", "Profile calculations, OAuth fixes"],
    ["Full Stack (2 devs)", "100%", "End-to-end features", "Pricing conversion, CTAs, forms"],
    ["AI/ML (1 dev)", "80%", "Chatbot, matching algorithms", "Persona-aware responses"],
    ["QA (2 testers)", "100%", "Testing, validation, bug fixes", "Regression testing, link audits"],
    ["DevOps (1 eng)", "60%", "Infrastructure, monitoring, deployment", "Support tool integration"],
    ["Content (2 writers)", "100%", "Documentation, guides, copy", "User guides, FAQ updates"],
    ["Design (1 designer)", "60%", "Visual assets, branding", "Hero image, UI polish"],
    ["Product (1 PM)", "100%", "Coordination, prioritization", "Sprint planning, stakeholder sync"]
  ];
  
  resourceSlide.addTable(resourceData, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 4,
    fontSize: 8,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.42,
    headerRowFill: colors.accent,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [1.5, 1.2, 3.5, 3.2]
  });
  
  resourceSlide.addText("Total Team: 14 people dedicated to Phase 1 remediation", {
    x: 0.5,
    y: 5.4,
    w: 9,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: colors.success,
    align: "center"
  });

  // Success Metrics & KPIs
  const metricsSlide = pptx.addSlide();
  metricsSlide.addText("Success Metrics & KPIs for Phase 2", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  metricsSlide.addText([
    { text: "User Onboarding Metrics:\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "• ", options: { bold: true } },
    { text: "Target: 80% of users complete persona selection (current: <20%)\n", options: {} },
    { text: "• ", options: { bold: true } },
    { text: "Target: 60% reach 100% profile completion (current: <5%)\n", options: {} },
    { text: "• ", options: { bold: true } },
    { text: "Target: <10% drop-off after account creation (current: >90%)\n\n", options: {} },
    
    { text: "Platform Quality Metrics:\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "• ", options: { bold: true } },
    { text: "Zero test/dummy content visible to users\n", options: {} },
    { text: "• ", options: { bold: true } },
    { text: "100% of CTAs functional and linked correctly\n", options: {} },
    { text: "• ", options: { bold: true } },
    { text: "All pricing displayed in ZAR across platform\n\n", options: {} },
    
    { text: "Support & Content Metrics:\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "• ", options: { bold: true } },
    { text: "Minimum 10 user guides published\n", options: {} },
    { text: "• ", options: { bold: true } },
    { text: "Support SLA: <24 hours response time\n", options: {} },
    { text: "• ", options: { bold: true } },
    { text: "Profile review SLA: 3-5 business days", options: {} }
  ], {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4.2,
    fontSize: 12,
    color: colors.darkText
  });

  // Phase 2 Readiness Checklist
  const checklistSlide = pptx.addSlide();
  checklistSlide.addText("Phase 2 Launch Readiness Checklist", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const checklistData = [
    ["Category", "Checklist Item", "Target Date", "Status"],
    ["UX", "Guided onboarding flow implemented", "Week 2", "🔴 Not Started"],
    ["UX", "Profile completion indicators added", "Week 2", "🔴 Not Started"],
    ["Auth", "Name/surname capture enforced", "Week 1", "🔴 Not Started"],
    ["Content", "All test data removed", "Week 1", "🔴 Not Started"],
    ["Content", "'Coming Soon' badges added", "Week 1", "🔴 Not Started"],
    ["Pricing", "All USD converted to ZAR", "Week 1", "🔴 Not Started"],
    ["Support", "Support email operational", "Week 2", "🔴 Not Started"],
    ["Support", "User guides published (10+)", "Week 3-4", "🔴 Not Started"],
    ["Quality", "All CTAs functional", "Week 2", "🔴 Not Started"],
    ["Quality", "Chatbot responses accurate", "Week 2-3", "🔴 Not Started"],
    ["Compliance", "SLA defined and documented", "Week 1", "🔴 Not Started"],
    ["Compliance", "POPIA/GDPR review complete", "Week 4", "🔴 Not Started"]
  ];
  
  checklistSlide.addTable(checklistData, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 4.2,
    fontSize: 9,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.33,
    headerRowFill: colors.primary,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [1.2, 4.2, 1.5, 2.5]
  });

  // Risk Management
  const riskSlide = pptx.addSlide();
  riskSlide.addText("Risk Management & Mitigation", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const riskData = [
    ["Risk", "Impact", "Probability", "Mitigation Strategy"],
    ["Scope creep during remediation", "High", "Medium", "Strict prioritization; defer P2+ to Phase 3"],
    ["Inadequate testing time", "High", "Medium", "Parallel QA; automated regression tests"],
    ["User confusion during changes", "Medium", "High", "Incremental rollout; in-app notifications"],
    ["Content creation delays", "Medium", "Medium", "Start content work in Week 1; use templates"],
    ["Integration issues (support tools)", "Medium", "Low", "POC testing; fallback to email initially"],
    ["Database migration errors", "High", "Low", "Staged rollout; backup procedures; rollback plan"],
    ["Team burnout (8-week sprint)", "Medium", "Medium", "Realistic planning; no weekend work policy"]
  ];
  
  riskSlide.addTable(riskData, {
    x: 0.3,
    y: 1.3,
    w: 9.4,
    h: 3.2,
    fontSize: 9,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.44,
    headerRowFill: colors.highlight,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [2.2, 1.2, 1.2, 4.8]
  });
  
  riskSlide.addText([
    { text: "Risk Review Cadence: ", options: { bold: true, fontSize: 14, color: colors.accent } },
    { text: "Weekly standup + Mid-sprint risk assessment", options: { fontSize: 14, color: colors.darkText } }
  ], {
    x: 0.5,
    y: 4.7,
    w: 9,
    h: 0.4,
    align: "center"
  });

  // Communication Plan
  const commSlide = pptx.addSlide();
  commSlide.addText("Stakeholder Communication Plan", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: colors.primary
  });
  
  const commData = [
    ["Stakeholder", "Update Frequency", "Format", "Key Topics"],
    ["Product Lead (Noma)", "Daily", "Slack + Weekly sync", "Progress, blockers, decisions needed"],
    ["Executive Team", "Weekly", "Status report", "Milestone progress, risks, budget"],
    ["Development Team", "Daily", "Stand-up", "Task status, dependencies, blockers"],
    ["Early Users (42)", "Bi-weekly", "Email newsletter", "Feature updates, improvements, feedback request"],
    ["Partnership Leads", "As needed", "Email/Call", "Integration readiness, timeline updates"],
    ["Cohort Sponsors", "Monthly", "Presentation", "User growth, platform improvements, ROI"]
  ];
  
  commSlide.addTable(commData, {
    x: 0.4,
    y: 1.3,
    w: 9.2,
    h: 2.8,
    fontSize: 10,
    border: { pt: 1, color: colors.accent },
    fill: { color: colors.lightGray },
    color: colors.darkText,
    rowH: 0.44,
    headerRowFill: colors.info,
    headerRowColor: colors.white,
    headerRowBold: true,
    colW: [2, 1.6, 1.8, 3.8]
  });
  
  commSlide.addText([
    { text: "Transparency Commitment:\n\n", options: { fontSize: 16, bold: true, color: colors.accent } },
    { text: "• Weekly status updates posted to internal wiki\n", options: { fontSize: 12 } },
    { text: "• Blocker escalation protocol: Issues unresolved for >24 hours raised to Product Lead\n", options: { fontSize: 12 } },
    { text: "• User feedback channel: Dedicated Slack channel for early user input\n", options: { fontSize: 12 } },
    { text: "• Demo day: Week 4 mid-point demo for stakeholder review and feedback", options: { fontSize: 12 } }
  ], {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 1.4,
    color: colors.darkText
  });

  // Commitment & Next Steps
  const commitmentSlide = pptx.addSlide();
  commitmentSlide.background = { color: colors.primary };
  
  commitmentSlide.addText("Our Commitment to Excellence", {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 0.7,
    fontSize: 36,
    bold: true,
    color: colors.white,
    align: "center"
  });
  
  commitmentSlide.addText([
    { text: "We take full ownership of the issues identified in the Phase 1 assessment. ", options: { fontSize: 16, color: colors.lightGray } },
    { text: "Every finding has been carefully reviewed, prioritized, and scheduled for resolution.\n\n", options: { fontSize: 16, color: colors.lightGray } },
    { text: "The development team is committed to delivering a polished, user-friendly platform that meets the needs of all our stakeholders: startups, mentors, advisors, funders, and service providers.\n\n", options: { fontSize: 16, color: colors.lightGray } },
    { text: "We will provide weekly progress updates and maintain open communication throughout the remediation process.", options: { fontSize: 16, color: colors.lightGray } }
  ], {
    x: 1,
    y: 2.3,
    w: 8,
    h: 2.5,
    align: "center",
    valign: "middle"
  });
  
  commitmentSlide.addText("Phase 2 Launch: Week 8 🚀", {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: colors.highlight,
    align: "center"
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
