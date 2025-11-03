import pptxgen from "pptxgenjs";

export const generateKumiiPresentation = () => {
  const pptx = new pptxgen();
  
  // Brand colors (Kumii purple/blue theme)
  const primaryColor = "4F46E5"; // Indigo
  const accentColor = "8B5CF6"; // Purple
  const textColor = "1E293B"; // Dark slate
  const lightBg = "F8FAFC"; // Light background

  // === COVER SLIDE ===
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: primaryColor };
  
  // Add gradient overlay effect
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { type: "solid", color: "000000", transparency: 20 }
  });

  // Kumii Logo/Title
  coverSlide.addText("KUMII", {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 72,
    bold: true,
    color: "FFFFFF",
    align: "center",
    fontFace: "Arial"
  });

  coverSlide.addText("Empowering Township Entrepreneurs", {
    x: 0.5,
    y: 4,
    w: 9,
    h: 0.6,
    fontSize: 24,
    color: "FFFFFF",
    align: "center",
    fontFace: "Arial"
  });

  coverSlide.addText("Platform Overview & Stakeholder Presentation", {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.4,
    fontSize: 16,
    color: "E2E8F0",
    align: "center",
    fontFace: "Arial"
  });

  // === TABLE OF CONTENTS ===
  const tocSlide = pptx.addSlide();
  tocSlide.background = { color: "FFFFFF" };

  // Header
  tocSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1,
    fill: { color: primaryColor }
  });

  tocSlide.addText("Table of Contents", {
    x: 0.5,
    y: 0.25,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  const tocItems = [
    "1. Executive Summary",
    "2. Platform Overview",
    "3. Key Features",
    "4. Technology Stack",
    "5. Market Impact",
    "6. Partnerships & Collaborations",
    "7. Roadmap & Future Vision",
    "8. Contact Information"
  ];

  tocItems.forEach((item, index) => {
    tocSlide.addText(item, {
      x: 1.5,
      y: 1.8 + (index * 0.5),
      w: 7,
      h: 0.4,
      fontSize: 18,
      color: textColor,
      fontFace: "Arial",
      bullet: { type: "number" }
    });
  });

  // === SLIDE 1: EXECUTIVE SUMMARY ===
  const execSlide = pptx.addSlide();
  execSlide.background = { color: lightBg };

  execSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.8,
    fill: { color: primaryColor }
  });

  execSlide.addText("Executive Summary", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.4,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  execSlide.addText([
    { text: "Mission: ", options: { bold: true, fontSize: 18, color: primaryColor } },
    { text: "To democratize access to funding, mentorship, and business services for township entrepreneurs in South Africa.", options: { fontSize: 16 } }
  ], {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 0.8,
    color: textColor,
    fontFace: "Arial"
  });

  const execPoints = [
    "Comprehensive ecosystem connecting entrepreneurs, mentors, funders, and service providers",
    "AI-powered credit scoring and business intelligence",
    "Real-time mentorship and advisory services",
    "Access to funding opportunities and marketplace solutions",
    "Built for scalability and financial inclusion"
  ];

  execPoints.forEach((point, index) => {
    execSlide.addText(point, {
      x: 1.2,
      y: 2.8 + (index * 0.6),
      w: 7.6,
      h: 0.5,
      fontSize: 14,
      color: textColor,
      fontFace: "Arial",
      bullet: true
    });
  });

  // === SLIDE 2: PLATFORM OVERVIEW ===
  const platformSlide = pptx.addSlide();
  platformSlide.background = { color: "FFFFFF" };

  platformSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.8,
    fill: { color: accentColor }
  });

  platformSlide.addText("Platform Overview", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.4,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  platformSlide.addText("Four Core User Types:", {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: primaryColor,
    fontFace: "Arial"
  });

  const userTypes = [
    { title: "Startups & Entrepreneurs", desc: "Access funding, mentorship, and business services" },
    { title: "Mentors & Advisors", desc: "Provide guidance and earn through consultations" },
    { title: "Funders & Investors", desc: "Discover and fund promising ventures" },
    { title: "Service Providers", desc: "Offer business services to growing enterprises" }
  ];

  userTypes.forEach((type, index) => {
    platformSlide.addShape(pptx.ShapeType.rect, {
      x: 0.8 + (index % 2) * 4.7,
      y: 2.1 + Math.floor(index / 2) * 1.8,
      w: 4.2,
      h: 1.5,
      fill: { color: lightBg },
      line: { color: primaryColor, width: 2 }
    });

    platformSlide.addText(type.title, {
      x: 1,
      y: 2.3 + Math.floor(index / 2) * 1.8,
      w: 3.8,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: primaryColor,
      fontFace: "Arial"
    });

    platformSlide.addText(type.desc, {
      x: 1,
      y: 2.8 + Math.floor(index / 2) * 1.8,
      w: 3.8,
      h: 0.6,
      fontSize: 11,
      color: textColor,
      fontFace: "Arial"
    });
  });

  // === SLIDE 3: KEY FEATURES ===
  const featuresSlide = pptx.addSlide();
  featuresSlide.background = { color: lightBg };

  featuresSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.8,
    fill: { color: primaryColor }
  });

  featuresSlide.addText("Key Features", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.4,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  const features = [
    { icon: "💰", title: "Credit Scoring", desc: "AI-powered assessment for funding eligibility" },
    { icon: "🎓", title: "Mentorship", desc: "Video consultations with industry experts" },
    { icon: "🏪", title: "Marketplace", desc: "Access to business services and solutions" },
    { icon: "📊", title: "Financial Modeling", desc: "Build comprehensive business projections" },
    { icon: "📁", title: "Document Management", desc: "Secure storage and sharing" },
    { icon: "🤝", title: "Smart Matching", desc: "AI-driven connections to resources" }
  ];

  features.forEach((feature, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);

    featuresSlide.addText(feature.icon, {
      x: 1 + col * 3,
      y: 1.5 + row * 2,
      w: 2.5,
      h: 0.5,
      fontSize: 32,
      align: "center"
    });

    featuresSlide.addText(feature.title, {
      x: 1 + col * 3,
      y: 2.1 + row * 2,
      w: 2.5,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: primaryColor,
      align: "center",
      fontFace: "Arial"
    });

    featuresSlide.addText(feature.desc, {
      x: 0.8 + col * 3,
      y: 2.5 + row * 2,
      w: 2.9,
      h: 0.8,
      fontSize: 11,
      color: textColor,
      align: "center",
      fontFace: "Arial"
    });
  });

  // === SLIDE 4: TECHNOLOGY STACK ===
  const techSlide = pptx.addSlide();
  techSlide.background = { color: "FFFFFF" };

  techSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.8,
    fill: { color: accentColor }
  });

  techSlide.addText("Technology Stack", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.4,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  const techCategories = [
    {
      title: "Frontend",
      items: ["React", "TypeScript", "Tailwind CSS", "Vite"]
    },
    {
      title: "Backend & Database",
      items: ["Supabase", "PostgreSQL", "Edge Functions", "Real-time subscriptions"]
    },
    {
      title: "AI & Integrations",
      items: ["OpenAI GPT-4", "Daily.co Video", "Sharetribe", "Sentry Monitoring"]
    }
  ];

  techCategories.forEach((category, index) => {
    techSlide.addText(category.title, {
      x: 0.8,
      y: 1.5 + index * 1.8,
      w: 8.4,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: primaryColor,
      fontFace: "Arial"
    });

    category.items.forEach((item, itemIndex) => {
      techSlide.addText(item, {
        x: 1.5,
        y: 2 + index * 1.8 + itemIndex * 0.35,
        w: 7.5,
        h: 0.3,
        fontSize: 12,
        color: textColor,
        fontFace: "Arial",
        bullet: true
      });
    });
  });

  // === SLIDE 5: PARTNERSHIPS ===
  const partnersSlide = pptx.addSlide();
  partnersSlide.background = { color: lightBg };

  partnersSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.8,
    fill: { color: primaryColor }
  });

  partnersSlide.addText("Partnerships & Collaborations", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.4,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  const partnerships = [
    { name: "Nedbank", role: "Financial Services Partner" },
    { name: "Microsoft", role: "Technology & Cloud Partner" },
    { name: "22 On Sloane", role: "Innovation Hub Partner" },
    { name: "Journey Horizon", role: "Strategic Technology Partner" }
  ];

  partnerships.forEach((partner, index) => {
    partnersSlide.addShape(pptx.ShapeType.rect, {
      x: 1.5,
      y: 1.8 + index * 1.1,
      w: 7,
      h: 0.9,
      fill: { color: "FFFFFF" },
      line: { color: accentColor, width: 2 }
    });

    partnersSlide.addText(partner.name, {
      x: 1.8,
      y: 1.95 + index * 1.1,
      w: 6.4,
      h: 0.35,
      fontSize: 16,
      bold: true,
      color: primaryColor,
      fontFace: "Arial"
    });

    partnersSlide.addText(partner.role, {
      x: 1.8,
      y: 2.35 + index * 1.1,
      w: 6.4,
      h: 0.3,
      fontSize: 12,
      color: textColor,
      fontFace: "Arial"
    });
  });

  // === CLOSING SLIDE ===
  const closingSlide = pptx.addSlide();
  closingSlide.background = { color: primaryColor };

  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { type: "solid", color: "000000", transparency: 20 }
  });

  closingSlide.addText("KUMII", {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.2,
    fontSize: 64,
    bold: true,
    color: "FFFFFF",
    align: "center",
    fontFace: "Arial"
  });

  closingSlide.addText("Building Tomorrow's Township Economy", {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.6,
    fontSize: 22,
    color: "FFFFFF",
    align: "center",
    fontFace: "Arial"
  });

  closingSlide.addText("Contact: info@kumii.co.za", {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.4,
    fontSize: 16,
    color: "E2E8F0",
    align: "center",
    fontFace: "Arial"
  });

  closingSlide.addText("www.kumii.co.za", {
    x: 0.5,
    y: 5.3,
    w: 9,
    h: 0.4,
    fontSize: 16,
    color: "E2E8F0",
    align: "center",
    fontFace: "Arial"
  });

  // Save the presentation
  pptx.writeFile({ fileName: "Kumii_Platform_Presentation.pptx" });
};
