import pptxgen from "pptxgenjs";

export const generateKumiiPresentation = () => {
  const pptx = new pptxgen();
  
  // Kumii Official Brand Colors
  const primaryColor = "7A8566"; // Sage Green (Brand Signature)
  const accentColor = "C5DF94"; // Light Green
  const darkCharcoal = "444345"; // Dark Charcoal
  const mutedGray = "CDCDCE"; // Light Gray
  const textColor = "444345"; // Dark Charcoal for text
  const lightBg = "F5F5F3"; // Warm light background
  const white = "FFFFFF";

  // === COVER SLIDE ===
  const coverSlide = pptx.addSlide();
  
  // Gradient background (Dark Charcoal to Sage Green)
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { type: "solid", color: darkCharcoal }
  });
  
  // Accent gradient overlay
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { type: "solid", color: primaryColor, transparency: 70 }
  });

  // Decorative elements - top right accent
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 7,
    y: 0,
    w: 3,
    h: 3,
    fill: { color: accentColor, transparency: 15 },
    line: { type: "none" }
  });

  // Kumii Logo/Title with modern styling
  coverSlide.addText("KUMII", {
    x: 0.5,
    y: 2.3,
    w: 9,
    h: 1.5,
    fontSize: 88,
    bold: true,
    color: white,
    align: "center",
    fontFace: "Arial",
    shadow: {
      type: "outer",
      color: primaryColor,
      blur: 15,
      opacity: 0.6
    }
  });

  coverSlide.addText("Empowering Township Entrepreneurs", {
    x: 0.5,
    y: 4,
    w: 9,
    h: 0.6,
    fontSize: 26,
    color: accentColor,
    align: "center",
    fontFace: "Arial",
    bold: true
  });

  coverSlide.addText("Platform Overview & Stakeholder Presentation", {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.4,
    fontSize: 18,
    color: mutedGray,
    align: "center",
    fontFace: "Arial"
  });

  // Decorative bottom accent line
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 3,
    y: 5.8,
    w: 4,
    h: 0.05,
    fill: { color: accentColor }
  });

  // === TABLE OF CONTENTS ===
  const tocSlide = pptx.addSlide();
  tocSlide.background = { color: lightBg };

  // Modern header with gradient
  tocSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1.2,
    fill: { color: darkCharcoal }
  });

  // Accent stripe
  tocSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 1.1,
    w: "100%",
    h: 0.1,
    fill: { color: accentColor }
  });

  tocSlide.addText("Table of Contents", {
    x: 0.8,
    y: 0.35,
    w: 8.4,
    h: 0.5,
    fontSize: 36,
    bold: true,
    color: white,
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
    // Decorative accent bar
    tocSlide.addShape(pptx.ShapeType.rect, {
      x: 1,
      y: 2 + (index * 0.55),
      w: 0.15,
      h: 0.35,
      fill: { color: primaryColor }
    });
    
    tocSlide.addText(item, {
      x: 1.5,
      y: 2 + (index * 0.55),
      w: 7.5,
      h: 0.4,
      fontSize: 16,
      color: textColor,
      fontFace: "Arial"
    });
  });

  // === SLIDE 1: EXECUTIVE SUMMARY ===
  const execSlide = pptx.addSlide();
  execSlide.background = { color: white };

  // Modern header
  execSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1,
    fill: { color: primaryColor }
  });

  // Accent corner
  execSlide.addShape(pptx.ShapeType.rect, {
    x: 8.5,
    y: 0,
    w: 1.5,
    h: 1,
    fill: { color: accentColor }
  });

  execSlide.addText("Executive Summary", {
    x: 0.8,
    y: 0.3,
    w: 7,
    h: 0.4,
    fontSize: 32,
    bold: true,
    color: white,
    fontFace: "Arial"
  });

  // Mission box with modern styling
  execSlide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 1,
    fill: { color: lightBg },
    line: { color: accentColor, width: 3 }
  });

  execSlide.addText([
    { text: "Mission: ", options: { bold: true, fontSize: 18, color: primaryColor } },
    { text: "To democratize access to funding, mentorship, and business services for township entrepreneurs in South Africa.", options: { fontSize: 16, color: textColor } }
  ], {
    x: 1.2,
    y: 1.7,
    w: 7.6,
    h: 0.6,
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
    // Modern bullet point
    execSlide.addShape(pptx.ShapeType.rect, {
      x: 1,
      y: 2.9 + (index * 0.6),
      w: 0.12,
      h: 0.12,
      fill: { color: primaryColor }
    });
    
    execSlide.addText(point, {
      x: 1.3,
      y: 2.8 + (index * 0.6),
      w: 7.7,
      h: 0.5,
      fontSize: 14,
      color: textColor,
      fontFace: "Arial"
    });
  });

  // === SLIDE 2: PLATFORM OVERVIEW ===
  const platformSlide = pptx.addSlide();
  platformSlide.background = { color: lightBg };

  // Modern header with dark background
  platformSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1,
    fill: { color: darkCharcoal }
  });

  // Accent element
  platformSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.4,
    h: 1,
    fill: { color: primaryColor }
  });

  platformSlide.addText("Platform Overview", {
    x: 0.8,
    y: 0.3,
    w: 8.2,
    h: 0.4,
    fontSize: 32,
    bold: true,
    color: white,
    fontFace: "Arial"
  });

  platformSlide.addText("Four Core User Types:", {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 0.4,
    fontSize: 20,
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
    const xPos = 0.8 + (index % 2) * 4.7;
    const yPos = 2.2 + Math.floor(index / 2) * 1.9;
    
    // Card background
    platformSlide.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 4.2,
      h: 1.6,
      fill: { color: white },
      line: { type: "none" },
      shadow: {
        type: "outer",
        color: darkCharcoal,
        blur: 8,
        opacity: 0.15
      }
    });

    // Top accent bar
    platformSlide.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 4.2,
      h: 0.15,
      fill: { color: primaryColor }
    });

    platformSlide.addText(type.title, {
      x: xPos + 0.3,
      y: yPos + 0.4,
      w: 3.6,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: darkCharcoal,
      fontFace: "Arial"
    });

    platformSlide.addText(type.desc, {
      x: xPos + 0.3,
      y: yPos + 0.9,
      w: 3.6,
      h: 0.6,
      fontSize: 12,
      color: textColor,
      fontFace: "Arial"
    });
  });

  // === SLIDE 3: KEY FEATURES ===
  const featuresSlide = pptx.addSlide();
  featuresSlide.background = { color: white };

  // Header with gradient effect
  featuresSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1,
    fill: { color: primaryColor }
  });

  featuresSlide.addShape(pptx.ShapeType.rect, {
    x: 8.5,
    y: 0,
    w: 1.5,
    h: 1,
    fill: { color: darkCharcoal }
  });

  featuresSlide.addText("Key Features", {
    x: 0.8,
    y: 0.3,
    w: 7,
    h: 0.4,
    fontSize: 32,
    bold: true,
    color: white,
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
    const xPos = 0.9 + col * 3;
    const yPos = 1.5 + row * 2.1;

    // Feature card
    featuresSlide.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 2.7,
      h: 1.8,
      fill: { color: lightBg },
      line: { type: "none" },
      shadow: {
        type: "outer",
        color: primaryColor,
        blur: 6,
        opacity: 0.2
      }
    });

    // Icon background circle
    featuresSlide.addShape(pptx.ShapeType.ellipse, {
      x: xPos + 0.9,
      y: yPos + 0.25,
      w: 0.9,
      h: 0.9,
      fill: { color: white }
    });

    featuresSlide.addText(feature.icon, {
      x: xPos,
      y: yPos + 0.25,
      w: 2.7,
      h: 0.9,
      fontSize: 36,
      align: "center",
      valign: "middle"
    });

    featuresSlide.addText(feature.title, {
      x: xPos + 0.2,
      y: yPos + 1.2,
      w: 2.3,
      h: 0.3,
      fontSize: 13,
      bold: true,
      color: darkCharcoal,
      align: "center",
      fontFace: "Arial"
    });

    featuresSlide.addText(feature.desc, {
      x: xPos + 0.2,
      y: yPos + 1.5,
      w: 2.3,
      h: 0.25,
      fontSize: 10,
      color: textColor,
      align: "center",
      fontFace: "Arial"
    });
  });

  // === SLIDE 4: TECHNOLOGY STACK ===
  const techSlide = pptx.addSlide();
  techSlide.background = { color: lightBg };

  // Dark header
  techSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1,
    fill: { color: darkCharcoal }
  });

  // Accent bar
  techSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.4,
    h: 1,
    fill: { color: accentColor }
  });

  techSlide.addText("Technology Stack", {
    x: 0.8,
    y: 0.3,
    w: 8.2,
    h: 0.4,
    fontSize: 32,
    bold: true,
    color: white,
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
      items: ["OpenAI GPT-4", "Daily.co Video", "Sharetribe Marketplace", "Sentry Monitoring"]
    }
  ];

  techCategories.forEach((category, index) => {
    const yPos = 1.5 + index * 1.8;
    
    // Category box
    techSlide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: yPos,
      w: 8.4,
      h: 1.5,
      fill: { color: white },
      line: { color: primaryColor, width: 2 }
    });
    
    // Category header bar
    techSlide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: yPos,
      w: 8.4,
      h: 0.4,
      fill: { color: primaryColor }
    });
    
    techSlide.addText(category.title, {
      x: 1.1,
      y: yPos + 0.05,
      w: 7.8,
      h: 0.3,
      fontSize: 16,
      bold: true,
      color: white,
      fontFace: "Arial"
    });

    category.items.forEach((item, itemIndex) => {
      // Tech bullet
      techSlide.addShape(pptx.ShapeType.ellipse, {
        x: 1.2,
        y: yPos + 0.6 + itemIndex * 0.35,
        w: 0.08,
        h: 0.08,
        fill: { color: accentColor }
      });
      
      techSlide.addText(item, {
        x: 1.5,
        y: yPos + 0.52 + itemIndex * 0.35,
        w: 7.2,
        h: 0.3,
        fontSize: 12,
        color: textColor,
        fontFace: "Arial"
      });
    });
  });

  // === SLIDE 5: PARTNERSHIPS ===
  const partnersSlide = pptx.addSlide();
  partnersSlide.background = { color: white };

  // Modern header
  partnersSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1,
    fill: { color: primaryColor }
  });

  partnersSlide.addShape(pptx.ShapeType.rect, {
    x: 8.5,
    y: 0,
    w: 1.5,
    h: 1,
    fill: { color: darkCharcoal }
  });

  partnersSlide.addText("Partnerships & Collaborations", {
    x: 0.8,
    y: 0.3,
    w: 7,
    h: 0.4,
    fontSize: 32,
    bold: true,
    color: white,
    fontFace: "Arial"
  });

  const partnerships = [
    { name: "Nedbank", role: "Financial Services Partner" },
    { name: "Microsoft", role: "Technology & Cloud Partner" },
    { name: "Kumii Innovation Hub", role: "Innovation Hub Partner" },
    { name: "Journey Horizon", role: "Strategic Technology Partner" }
  ];

  partnerships.forEach((partner, index) => {
    const yPos = 1.6 + index * 1.05;
    
    // Partner card with modern design
    partnersSlide.addShape(pptx.ShapeType.rect, {
      x: 1.2,
      y: yPos,
      w: 7.6,
      h: 0.9,
      fill: { color: lightBg },
      line: { type: "none" },
      shadow: {
        type: "outer",
        color: primaryColor,
        blur: 6,
        opacity: 0.2
      }
    });

    // Left accent bar
    partnersSlide.addShape(pptx.ShapeType.rect, {
      x: 1.2,
      y: yPos,
      w: 0.2,
      h: 0.9,
      fill: { color: primaryColor }
    });

    partnersSlide.addText(partner.name, {
      x: 1.7,
      y: yPos + 0.15,
      w: 6.5,
      h: 0.35,
      fontSize: 17,
      bold: true,
      color: darkCharcoal,
      fontFace: "Arial"
    });

    partnersSlide.addText(partner.role, {
      x: 1.7,
      y: yPos + 0.52,
      w: 6.5,
      h: 0.3,
      fontSize: 12,
      color: textColor,
      fontFace: "Arial"
    });
  });

  // === CLOSING SLIDE ===
  const closingSlide = pptx.addSlide();
  
  // Gradient background
  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: darkCharcoal }
  });
  
  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: primaryColor, transparency: 65 }
  });

  // Decorative elements
  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 2.5,
    h: 2.5,
    fill: { color: accentColor, transparency: 20 }
  });

  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 7.5,
    y: 5,
    w: 2.5,
    h: 2.5,
    fill: { color: accentColor, transparency: 20 }
  });

  closingSlide.addText("KUMII", {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.2,
    fontSize: 80,
    bold: true,
    color: white,
    align: "center",
    fontFace: "Arial",
    shadow: {
      type: "outer",
      color: accentColor,
      blur: 20,
      opacity: 0.7
    }
  });

  closingSlide.addText("Building Tomorrow's Township Economy", {
    x: 0.5,
    y: 3.4,
    w: 9,
    h: 0.6,
    fontSize: 24,
    color: accentColor,
    align: "center",
    fontFace: "Arial",
    bold: true
  });

  // Contact info box
  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 2.5,
    y: 4.5,
    w: 5,
    h: 1,
    fill: { color: white, transparency: 15 },
    line: { color: accentColor, width: 2 }
  });

  closingSlide.addText("Contact: info@kumii.co.za", {
    x: 2.5,
    y: 4.7,
    w: 5,
    h: 0.3,
    fontSize: 15,
    color: white,
    align: "center",
    fontFace: "Arial"
  });

  closingSlide.addText("www.kumii.co.za", {
    x: 2.5,
    y: 5.05,
    w: 5,
    h: 0.3,
    fontSize: 15,
    color: accentColor,
    align: "center",
    fontFace: "Arial",
    bold: true
  });

  // Save the presentation
  pptx.writeFile({ fileName: "Kumii_Platform_Presentation.pptx" });
};
