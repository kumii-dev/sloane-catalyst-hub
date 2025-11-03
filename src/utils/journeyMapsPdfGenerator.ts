import jsPDF from 'jspdf';

// Kumii Brand Colors
const COLORS = {
  sageGreen: '#9BC4BC',
  lightGreen: '#D4E7E5',
  darkCharcoal: '#2C3E50',
  white: '#FFFFFF',
  accent: '#7BA591',
};

interface JourneyStage {
  stage: string;
  touchpoints: string[];
  actions: string[];
  emotions: string[];
  painPoints: string[];
  opportunities: string[];
}

const startupJourney: JourneyStage[] = [
  {
    stage: 'Awareness',
    touchpoints: ['Landing Page', 'Social Media', 'Referrals'],
    actions: ['Discovers Kumii platform', 'Reviews features', 'Watches demo'],
    emotions: ['Curious', 'Hopeful', 'Uncertain'],
    painPoints: ['Lack of funding access', 'No business connections', 'Limited resources'],
    opportunities: ['Clear value proposition', 'Success stories', 'Easy sign-up'],
  },
  {
    stage: 'Onboarding',
    touchpoints: ['Registration', 'Profile Setup', 'KYC Process'],
    actions: ['Creates account', 'Completes profile', 'Uploads documents'],
    emotions: ['Excited', 'Engaged', 'Slightly overwhelmed'],
    painPoints: ['Complex forms', 'Document requirements', 'Time-consuming'],
    opportunities: ['Progressive profiling', 'Clear guidance', 'Quick wins'],
  },
  {
    stage: 'Engagement',
    touchpoints: ['Dashboard', 'Mentorship', 'Services Marketplace', 'Funding Hub'],
    actions: ['Books mentor sessions', 'Explores services', 'Applies for funding'],
    emotions: ['Motivated', 'Supported', 'Confident'],
    painPoints: ['Information overload', 'Decision paralysis', 'Budget constraints'],
    opportunities: ['Smart matching', 'Personalized recommendations', 'Flexible payment'],
  },
  {
    stage: 'Growth',
    touchpoints: ['Financial Model', 'Credit Score', 'Copilot', 'Community'],
    actions: ['Builds financial models', 'Improves credit score', 'Uses AI assistant'],
    emotions: ['Empowered', 'Accomplished', 'Ambitious'],
    painPoints: ['Scaling challenges', 'Resource limitations', 'Market access'],
    opportunities: ['Advanced tools', 'Network expansion', 'Success tracking'],
  },
  {
    stage: 'Advocacy',
    touchpoints: ['Reviews', 'Referrals', 'Community Events', 'Testimonials'],
    actions: ['Shares success story', 'Refers others', 'Mentors newcomers'],
    emotions: ['Grateful', 'Proud', 'Loyal'],
    painPoints: ['Limited time', 'Busy schedule'],
    opportunities: ['Rewards program', 'Recognition', 'Platform ambassador'],
  },
];

const mentorJourney: JourneyStage[] = [
  {
    stage: 'Awareness',
    touchpoints: ['Professional Networks', 'LinkedIn', 'Industry Events'],
    actions: ['Learns about platform', 'Reviews mentorship model', 'Checks benefits'],
    emotions: ['Interested', 'Skeptical', 'Curious'],
    painPoints: ['Time commitment unclear', 'Value proposition uncertain'],
    opportunities: ['Clear benefits', 'Flexible scheduling', 'Impact stories'],
  },
  {
    stage: 'Registration',
    touchpoints: ['Mentor Application', 'Profile Creation', 'Expertise Setup'],
    actions: ['Applies as mentor', 'Sets expertise areas', 'Defines availability'],
    emotions: ['Engaged', 'Professional', 'Committed'],
    painPoints: ['Complex application', 'Verification process'],
    opportunities: ['Streamlined process', 'Showcase credentials', 'Clear guidelines'],
  },
  {
    stage: 'Matching',
    touchpoints: ['AI Matching System', 'Mentee Profiles', 'Session Requests'],
    actions: ['Reviews match suggestions', 'Accepts mentees', 'Schedules sessions'],
    emotions: ['Eager', 'Selective', 'Purpose-driven'],
    painPoints: ['Poor matches', 'No-shows', 'Misaligned expectations'],
    opportunities: ['Smart matching', 'Pre-session prep', 'Clear objectives'],
  },
  {
    stage: 'Mentoring',
    touchpoints: ['Video Calls', 'Messaging', 'Resources Sharing', 'Progress Tracking'],
    actions: ['Conducts sessions', 'Provides guidance', 'Shares resources'],
    emotions: ['Fulfilled', 'Impactful', 'Valued'],
    painPoints: ['Session preparation time', 'Follow-up overhead'],
    opportunities: ['Session templates', 'Resource library', 'Impact metrics'],
  },
  {
    stage: 'Growth',
    touchpoints: ['Reviews', 'Reputation Score', 'Community Recognition'],
    actions: ['Receives feedback', 'Expands expertise', 'Builds reputation'],
    emotions: ['Proud', 'Recognized', 'Motivated'],
    painPoints: ['Limited visibility', 'Growth plateau'],
    opportunities: ['Mentor rankings', 'Featured profiles', 'Advanced certifications'],
  },
];

const providerJourney: JourneyStage[] = [
  {
    stage: 'Discovery',
    touchpoints: ['B2B Marketing', 'Partner Network', 'Direct Outreach'],
    actions: ['Learns about marketplace', 'Evaluates opportunity', 'Reviews terms'],
    emotions: ['Interested', 'Analytical', 'Cautious'],
    painPoints: ['Commission concerns', 'Market fit uncertainty', 'Competition'],
    opportunities: ['Clear pricing model', 'Target audience data', 'Success metrics'],
  },
  {
    stage: 'Setup',
    touchpoints: ['Provider Registration', 'Service Listing', 'Portfolio Upload'],
    actions: ['Creates provider profile', 'Lists services', 'Sets pricing'],
    emotions: ['Focused', 'Detail-oriented', 'Hopeful'],
    painPoints: ['Listing complexity', 'Portfolio formatting', 'Pricing strategy'],
    opportunities: ['Templates', 'Pricing guidance', 'Showcase examples'],
  },
  {
    stage: 'Acquisition',
    touchpoints: ['Marketplace Visibility', 'Search Rankings', 'Client Inquiries'],
    actions: ['Responds to inquiries', 'Sends proposals', 'Negotiates terms'],
    emotions: ['Eager', 'Competitive', 'Proactive'],
    painPoints: ['Low visibility', 'Price competition', 'Qualification of leads'],
    opportunities: ['Featured listings', 'Reviews system', 'Smart matching'],
  },
  {
    stage: 'Delivery',
    touchpoints: ['Project Management', 'Communication', 'Payment Processing'],
    actions: ['Delivers services', 'Updates clients', 'Completes projects'],
    emotions: ['Professional', 'Committed', 'Results-driven'],
    painPoints: ['Scope creep', 'Payment delays', 'Client expectations'],
    opportunities: ['Clear agreements', 'Milestone payments', 'Dispute resolution'],
  },
  {
    stage: 'Retention',
    touchpoints: ['Client Reviews', 'Repeat Business', 'Referrals'],
    actions: ['Receives reviews', 'Builds reputation', 'Gains repeat clients'],
    emotions: ['Satisfied', 'Established', 'Growing'],
    painPoints: ['Client churn', 'Market saturation'],
    opportunities: ['Loyalty rewards', 'Featured provider status', 'Premium placement'],
  },
];

const funderJourney: JourneyStage[] = [
  {
    stage: 'Awareness',
    touchpoints: ['Investment Networks', 'Industry Reports', 'Platform Demo'],
    actions: ['Evaluates deal flow platform', 'Reviews startup quality', 'Checks ROI'],
    emotions: ['Analytical', 'Strategic', 'Cautious'],
    painPoints: ['Deal flow quality', 'Due diligence overhead', 'Risk assessment'],
    opportunities: ['Curated startups', 'Pre-vetted opportunities', 'Data transparency'],
  },
  {
    stage: 'Registration',
    touchpoints: ['Funder Profile', 'Investment Criteria', 'Verification'],
    actions: ['Creates profile', 'Sets criteria', 'Verifies credentials'],
    emotions: ['Professional', 'Selective', 'Thorough'],
    painPoints: ['Time investment', 'Platform learning curve'],
    opportunities: ['Quick setup', 'Investment thesis templates', 'Dashboard tour'],
  },
  {
    stage: 'Discovery',
    touchpoints: ['Funding Hub', 'Startup Profiles', 'Financial Models', 'AI Matching'],
    actions: ['Browses opportunities', 'Reviews financials', 'Filters by criteria'],
    emotions: ['Curious', 'Evaluative', 'Opportunistic'],
    painPoints: ['Information gaps', 'Too many options', 'Quality variance'],
    opportunities: ['Advanced filters', 'Credit scores', 'Verified data'],
  },
  {
    stage: 'Evaluation',
    touchpoints: ['Due Diligence Tools', 'Video Calls', 'Document Review', 'Messaging'],
    actions: ['Conducts due diligence', 'Meets founders', 'Requests information'],
    emotions: ['Focused', 'Critical', 'Engaged'],
    painPoints: ['Incomplete documentation', 'Slow responses', 'Access to data'],
    opportunities: ['Document vault', 'Scheduled meetings', 'Data rooms'],
  },
  {
    stage: 'Investment',
    touchpoints: ['Deal Management', 'Legal Processing', 'Payment Gateway'],
    actions: ['Negotiates terms', 'Executes agreements', 'Transfers funds'],
    emotions: ['Decisive', 'Committed', 'Optimistic'],
    painPoints: ['Legal complexity', 'Transaction security', 'Settlement delays'],
    opportunities: ['Legal templates', 'Secure payments', 'Fast processing'],
  },
  {
    stage: 'Portfolio Management',
    touchpoints: ['Dashboard', 'Performance Reports', 'Startup Updates', 'Events'],
    actions: ['Monitors investments', 'Tracks KPIs', 'Supports startups'],
    emotions: ['Invested', 'Supportive', 'Results-focused'],
    painPoints: ['Limited visibility', 'Reporting inconsistency', 'Communication gaps'],
    opportunities: ['Portfolio dashboard', 'Automated reports', 'Direct channels'],
  },
];

export const generateJourneyMapsPDF = () => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to add a new page with background
  const addPageWithBackground = () => {
    doc.addPage();
    // Gradient background effect
    doc.setFillColor(244, 247, 246);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // Cover Page
  doc.setFillColor(156, 196, 188); // Sage Green
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 40, pageWidth - 40, pageHeight - 80, 5, 5, 'F');
  
  doc.setFontSize(36);
  doc.setTextColor(44, 62, 80); // Dark Charcoal
  doc.setFont('helvetica', 'bold');
  doc.text('Kumii Platform', pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(28);
  doc.setTextColor(123, 165, 145); // Accent
  doc.text('User Journey Maps', pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Understanding our users\' experiences across the platform', pageWidth / 2, 115, { align: 'center' });
  
  // Decorative elements
  doc.setDrawColor(212, 231, 229); // Light Green
  doc.setLineWidth(2);
  doc.line(60, 125, pageWidth - 60, 125);
  
  doc.setFontSize(12);
  doc.setTextColor(123, 165, 145);
  const journeyTypes = ['Startup Journey', 'Mentor Journey', 'Service Provider Journey', 'Funder Journey'];
  let coverYPos = 140;
  journeyTypes.forEach(type => {
    doc.setFillColor(212, 231, 229);
    doc.circle(pageWidth / 2 - 60, coverYPos, 2, 'F');
    doc.text(type, pageWidth / 2 - 50, coverYPos + 1);
    coverYPos += 10;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(123, 165, 145);
  doc.text('© 2025 Kumii Platform', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Helper function to render a journey map
  const renderJourneyMap = (title: string, journey: JourneyStage[], color: string) => {
    addPageWithBackground();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 20);
    
    // Color accent line
    const rgbColor = hexToRgb(color);
    doc.setDrawColor(rgbColor.r, rgbColor.g, rgbColor.b);
    doc.setLineWidth(3);
    doc.line(20, 25, 120, 25);
    
    // Journey stages
    const stageWidth = (pageWidth - 40) / journey.length;
    let xPos = 20;
    
    journey.forEach((stage, index) => {
      const stageColor = hexToRgb(color);
      
      // Stage header
      doc.setFillColor(stageColor.r, stageColor.g, stageColor.b);
      doc.roundedRect(xPos, 35, stageWidth - 5, 12, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(stage.stage, xPos + (stageWidth - 5) / 2, 42, { align: 'center' });
      
      // Stage content
      let contentY = 52;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      // Touchpoints
      doc.setTextColor(44, 62, 80);
      doc.text('Touchpoints:', xPos + 2, contentY);
      contentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      stage.touchpoints.forEach(tp => {
        const lines = doc.splitTextToSize(tp, stageWidth - 10);
        doc.text(lines, xPos + 2, contentY);
        contentY += 4;
      });
      
      contentY += 3;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Actions:', xPos + 2, contentY);
      contentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      stage.actions.forEach(action => {
        const lines = doc.splitTextToSize(action, stageWidth - 10);
        doc.text(lines, xPos + 2, contentY);
        contentY += 4;
      });
      
      contentY += 3;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(123, 165, 145);
      doc.text('Emotions:', xPos + 2, contentY);
      contentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(44, 62, 80);
      doc.text(stage.emotions.join(', '), xPos + 2, contentY);
      
      contentY += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 53, 69);
      doc.text('Pain Points:', xPos + 2, contentY);
      contentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(44, 62, 80);
      stage.painPoints.forEach(pp => {
        const lines = doc.splitTextToSize(pp, stageWidth - 10);
        doc.text(lines, xPos + 2, contentY);
        contentY += 4;
      });
      
      contentY += 3;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 167, 69);
      doc.text('Opportunities:', xPos + 2, contentY);
      contentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(44, 62, 80);
      stage.opportunities.forEach(opp => {
        const lines = doc.splitTextToSize(opp, stageWidth - 10);
        doc.text(lines, xPos + 2, contentY);
        contentY += 4;
      });
      
      xPos += stageWidth;
    });
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Render each journey map
  renderJourneyMap('Startup Journey Map', startupJourney, COLORS.sageGreen);
  renderJourneyMap('Mentor Journey Map', mentorJourney, COLORS.accent);
  renderJourneyMap('Service Provider Journey Map', providerJourney, '#6C9A8B');
  renderJourneyMap('Funder Journey Map', funderJourney, COLORS.darkCharcoal);

  // Summary Page
  addPageWithBackground();
  
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Insights & Next Steps', 20, 20);
  
  doc.setDrawColor(156, 196, 188);
  doc.setLineWidth(3);
  doc.line(20, 25, 130, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(44, 62, 80);
  
  const insights = [
    'Common Theme: Trust and transparency are critical across all user journeys',
    'Startup Focus: Simplify onboarding while maintaining comprehensive profiling',
    'Mentor Opportunity: Enhance matching algorithm and session preparation tools',
    'Provider Need: Improve visibility and quality of leads through smart matching',
    'Funder Priority: Streamline due diligence with verified data and documentation',
    'Cross-Journey: Communication and progress tracking need enhancement',
  ];
  
  let summaryYPos = 40;
  insights.forEach((insight, index) => {
    doc.setFillColor(212, 231, 229);
    doc.circle(25, summaryYPos - 2, 2, 'F');
    
    const lines = doc.splitTextToSize(insight, pageWidth - 60);
    doc.text(lines, 32, summaryYPos);
    summaryYPos += 10 + (lines.length - 1) * 6;
  });
  
  summaryYPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(123, 165, 145);
  doc.text('Strategic Priorities', 20, summaryYPos);
  
  summaryYPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(44, 62, 80);
  
  const priorities = [
    '1. AI-Powered Matching: Enhance algorithms across all user types',
    '2. Progressive UX: Simplify complex processes without losing depth',
    '3. Trust & Safety: Implement verification, reviews, and dispute resolution',
    '4. Data Excellence: Provide transparency, insights, and predictive analytics',
    '5. Community Building: Foster connections beyond transactional relationships',
  ];
  
  priorities.forEach(priority => {
    const lines = doc.splitTextToSize(priority, pageWidth - 50);
    doc.text(lines, 25, summaryYPos);
    summaryYPos += 8;
  });

  // Save the PDF
  doc.save('Kumii_Journey_Maps.pdf');
};
