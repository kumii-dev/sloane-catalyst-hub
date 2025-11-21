import PptxGenJS from "pptxgenjs";
import kumiiLogo from "@/assets/kumii-logo.png";

// Kumii Brand Colors (from index.css)
export const KUMII_COLORS = {
  sageGreen: "66BB6A",      // Primary brand color
  darkCharcoal: "2D3436",   // Dark text/headings
  lightGreen: "81C784",     // Accent
  goldenYellow: "FFC107",   // Highlight
  white: "FFFFFF",
  lightGray: "F5F5F5",
  // Aliases for compatibility
  primary: "66BB6A",
  secondary: "2D3436",
  accent: "81C784",
  highlight: "FFC107",
  darkText: "2D3436",
  success: "81C784",
  warning: "FFC107",
  info: "66BB6A"
};

/**
 * Creates a new PowerPoint presentation with Kumii branding
 */
export const createKumiiBrandedPresentation = (): PptxGenJS => {
  const pptx = new PptxGenJS();
  
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Kumii Platform";
  pptx.company = "Kumii";
  pptx.subject = "Kumii Platform Presentation";
  
  return pptx;
};

/**
 * Adds Kumii branded header to a slide
 * @param slide - The slide to add the header to
 * @param title - The title text for the slide
 */
export const addKumiiBrandedHeader = (
  slide: PptxGenJS.Slide,
  title: string
): void => {
  // Add Kumii logo in top-left
  slide.addImage({
    path: kumiiLogo,
    x: 0.3,
    y: 0.3,
    w: 1.2,
    h: 0.6,
  });

  // Add title with brand styling
  slide.addText(title, {
    x: 1.8,
    y: 0.35,
    w: 8,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: KUMII_COLORS.darkCharcoal,
    align: "left",
    valign: "middle",
  });

  // Add subtle green line under header
  slide.addShape("rect", {
    x: 0,
    y: 1.0,
    w: 10,
    h: 0.05,
    fill: { color: KUMII_COLORS.sageGreen },
  });
};

/**
 * Creates a title slide with Kumii branding
 * @param pptx - The PowerPoint presentation
 * @param mainTitle - Main title text
 * @param subtitle - Subtitle text (optional)
 */
export const createKumiiTitleSlide = (
  pptx: PptxGenJS,
  mainTitle: string,
  subtitle?: string
): void => {
  const slide = pptx.addSlide();

  // Background with gradient
  slide.background = { color: KUMII_COLORS.lightGray };

  // Kumii logo (centered, larger)
  slide.addImage({
    path: kumiiLogo,
    x: 3.5,
    y: 1.5,
    w: 3,
    h: 1.5,
  });

  // Main title
  slide.addText(mainTitle, {
    x: 1,
    y: 3.5,
    w: 8,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: KUMII_COLORS.darkCharcoal,
    align: "center",
  });

  // Subtitle (if provided)
  if (subtitle) {
    slide.addText(subtitle, {
      x: 1,
      y: 4.5,
      w: 8,
      h: 0.5,
      fontSize: 20,
      color: KUMII_COLORS.sageGreen,
      align: "center",
    });
  }
};

/**
 * Creates a closing/thank you slide with Kumii branding
 * @param pptx - The PowerPoint presentation
 * @param message - Closing message
 * @param contactInfo - Optional contact information
 */
export const createKumiiClosingSlide = (
  pptx: PptxGenJS,
  message: string,
  contactInfo?: string
): void => {
  const slide = pptx.addSlide();

  // Background
  slide.background = { color: KUMII_COLORS.sageGreen };

  // Kumii logo
  slide.addImage({
    path: kumiiLogo,
    x: 3.5,
    y: 2,
    w: 3,
    h: 1.5,
  });

  // Message
  slide.addText(message, {
    x: 1,
    y: 4,
    w: 8,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: KUMII_COLORS.white,
    align: "center",
  });

  // Contact info (if provided)
  if (contactInfo) {
    slide.addText(contactInfo, {
      x: 1,
      y: 5,
      w: 8,
      h: 0.4,
      fontSize: 16,
      color: KUMII_COLORS.white,
      align: "center",
    });
  }
};

/**
 * Adds a content slide with Kumii branding
 * @param pptx - The PowerPoint presentation
 * @param title - Slide title
 * @param content - Content items (text or bullet points)
 * @param options - Optional styling options
 */
export const addKumiiContentSlide = (
  pptx: PptxGenJS,
  title: string,
  content: string | string[],
  options?: {
    backgroundColor?: string;
    bulletPoints?: boolean;
  }
): void => {
  const slide = pptx.addSlide();

  // Background
  slide.background = { 
    color: options?.backgroundColor || KUMII_COLORS.white 
  };

  // Add branded header
  addKumiiBrandedHeader(slide, title);

  // Add content
  if (typeof content === "string") {
    slide.addText(content, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
      fontSize: 16,
      color: KUMII_COLORS.darkCharcoal,
      align: "left",
      valign: "top",
    });
  } else {
    slide.addText(
      content.map((item) => ({ text: item, options: { bullet: true } })),
      {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 16,
        color: KUMII_COLORS.darkCharcoal,
        bullet: options?.bulletPoints !== false,
      }
    );
  }
};
