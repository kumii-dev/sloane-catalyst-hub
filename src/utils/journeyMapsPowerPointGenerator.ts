import pptxgen from "pptxgenjs";

// Kumii Brand Colors
const COLORS = {
  sageGreen: '9BC4BC',
  lightGreen: 'D4E7E5',
  darkCharcoal: '2C3E50',
  white: 'FFFFFF',
  accent: '7BA591',
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

export const generateJourneyMapsPowerPoint = () => {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.author = 'Kumii Platform';
  pptx.company = 'Kumii';
  pptx.title = 'User Journey Maps';
  pptx.subject = 'Understanding our users\' experiences';

  // Cover Slide
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: COLORS.sageGreen };
  
  coverSlide.addText('Kumii Platform', {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1,
    fontSize: 48,
    bold: true,
    color: COLORS.white,
    align: 'center',
  });

  coverSlide.addText('User Journey Maps', {
    x: 0.5,
    y: 3.0,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: COLORS.lightGreen,
    align: 'center',
  });

  coverSlide.addText('Understanding our users\' experiences across the platform', {
    x: 1,
    y: 4.0,
    w: 8,
    h: 0.5,
    fontSize: 16,
    color: COLORS.white,
    align: 'center',
  });

  coverSlide.addText('© 2025 Kumii Platform', {
    x: 0.5,
    y: 6.8,
    w: 9,
    h: 0.3,
    fontSize: 10,
    color: COLORS.lightGreen,
    align: 'center',
  });

  // Table of Contents
  const tocSlide = pptx.addSlide();
  tocSlide.background = { color: COLORS.lightGreen };

  tocSlide.addText('User Journey Maps Overview', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: COLORS.darkCharcoal,
  });

  const tocItems = [
    '1. Startup Journey',
    '2. Mentor Journey',
    '3. Service Provider Journey',
    '4. Funder Journey',
    '5. Key Insights & Next Steps',
  ];

  tocItems.forEach((item, index) => {
    tocSlide.addText(item, {
      x: 1.5,
      y: 1.8 + (index * 0.7),
      w: 7,
      h: 0.5,
      fontSize: 18,
      color: COLORS.darkCharcoal,
      bullet: { code: '2022' },
    });
  });

  // Helper function to create journey map slide
  const createJourneySlide = (title: string, journey: JourneyStage[], color: string) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'F4F7F6' };

    // Title
    slide.addText(title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: COLORS.darkCharcoal,
    });

    // Accent line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 0.95,
      w: 3,
      h: 0.05,
      fill: { color: color },
    });

    // Journey stages
    const stageWidth = 1.7;
    const startX = 0.5;
    const startY = 1.2;

    journey.forEach((stage, index) => {
      const xPos = startX + (index * stageWidth);

      // Stage header box
      slide.addShape(pptx.ShapeType.rect, {
        x: xPos,
        y: startY,
        w: stageWidth - 0.1,
        h: 0.4,
        fill: { color: color },
        line: { width: 0 },
      });

      slide.addText(stage.stage, {
        x: xPos,
        y: startY,
        w: stageWidth - 0.1,
        h: 0.4,
        fontSize: 11,
        bold: true,
        color: COLORS.white,
        align: 'center',
        valign: 'middle',
      });

      // Content sections
      let contentY = startY + 0.5;

      // Touchpoints
      slide.addText('Touchpoints:', {
        x: xPos,
        y: contentY,
        w: stageWidth - 0.1,
        h: 0.2,
        fontSize: 8,
        bold: true,
        color: COLORS.darkCharcoal,
      });
      contentY += 0.2;

      stage.touchpoints.slice(0, 3).forEach(tp => {
        slide.addText(`• ${tp}`, {
          x: xPos,
          y: contentY,
          w: stageWidth - 0.1,
          h: 0.15,
          fontSize: 7,
          color: COLORS.darkCharcoal,
        });
        contentY += 0.15;
      });

      contentY += 0.1;

      // Actions
      slide.addText('Actions:', {
        x: xPos,
        y: contentY,
        w: stageWidth - 0.1,
        h: 0.2,
        fontSize: 8,
        bold: true,
        color: COLORS.darkCharcoal,
      });
      contentY += 0.2;

      stage.actions.slice(0, 2).forEach(action => {
        slide.addText(`• ${action}`, {
          x: xPos,
          y: contentY,
          w: stageWidth - 0.1,
          h: 0.15,
          fontSize: 7,
          color: COLORS.darkCharcoal,
        });
        contentY += 0.15;
      });

      contentY += 0.1;

      // Emotions
      slide.addText('Emotions:', {
        x: xPos,
        y: contentY,
        w: stageWidth - 0.1,
        h: 0.2,
        fontSize: 8,
        bold: true,
        color: color,
      });
      contentY += 0.2;

      slide.addText(stage.emotions.join(', '), {
        x: xPos,
        y: contentY,
        w: stageWidth - 0.1,
        h: 0.15,
        fontSize: 7,
        color: COLORS.darkCharcoal,
      });
      contentY += 0.25;

      // Pain Points
      slide.addText('Pain Points:', {
        x: xPos,
        y: contentY,
        w: stageWidth - 0.1,
        h: 0.2,
        fontSize: 8,
        bold: true,
        color: 'DC3545',
      });
      contentY += 0.2;

      stage.painPoints.slice(0, 2).forEach(pp => {
        slide.addText(`• ${pp}`, {
          x: xPos,
          y: contentY,
          w: stageWidth - 0.1,
          h: 0.15,
          fontSize: 7,
          color: COLORS.darkCharcoal,
        });
        contentY += 0.15;
      });

      contentY += 0.1;

      // Opportunities
      slide.addText('Opportunities:', {
        x: xPos,
        y: contentY,
        w: stageWidth - 0.1,
        h: 0.2,
        fontSize: 8,
        bold: true,
        color: '28A745',
      });
      contentY += 0.2;

      stage.opportunities.slice(0, 2).forEach(opp => {
        slide.addText(`• ${opp}`, {
          x: xPos,
          y: contentY,
          w: stageWidth - 0.1,
          h: 0.15,
          fontSize: 7,
          color: COLORS.darkCharcoal,
        });
        contentY += 0.15;
      });
    });
  };

  // Create journey slides
  createJourneySlide('Startup Journey Map', startupJourney, COLORS.sageGreen);
  createJourneySlide('Mentor Journey Map', mentorJourney, COLORS.accent);
  createJourneySlide('Service Provider Journey Map', providerJourney, '6C9A8B');
  createJourneySlide('Funder Journey Map', funderJourney, COLORS.darkCharcoal);

  // Key Insights Slide
  const insightsSlide = pptx.addSlide();
  insightsSlide.background = { color: COLORS.lightGreen };

  insightsSlide.addText('Key Insights & Next Steps', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: COLORS.darkCharcoal,
  });

  insightsSlide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.15,
    w: 3,
    h: 0.05,
    fill: { color: COLORS.sageGreen },
  });

  const insights = [
    'Common Theme: Trust and transparency are critical across all user journeys',
    'Startup Focus: Simplify onboarding while maintaining comprehensive profiling',
    'Mentor Opportunity: Enhance matching algorithm and session preparation tools',
    'Provider Need: Improve visibility and quality of leads through smart matching',
    'Funder Priority: Streamline due diligence with verified data and documentation',
    'Cross-Journey: Communication and progress tracking need enhancement',
  ];

  insights.forEach((insight, index) => {
    insightsSlide.addText(insight, {
      x: 1,
      y: 1.8 + (index * 0.5),
      w: 8,
      h: 0.4,
      fontSize: 12,
      color: COLORS.darkCharcoal,
      bullet: { code: '2022' },
    });
  });

  // Strategic Priorities
  const prioritiesSlide = pptx.addSlide();
  prioritiesSlide.background = { color: 'F4F7F6' };

  prioritiesSlide.addText('Strategic Priorities', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: COLORS.darkCharcoal,
  });

  prioritiesSlide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.15,
    w: 3,
    h: 0.05,
    fill: { color: COLORS.accent },
  });

  const priorities = [
    '1. AI-Powered Matching: Enhance algorithms across all user types',
    '2. Progressive UX: Simplify complex processes without losing depth',
    '3. Trust & Safety: Implement verification, reviews, and dispute resolution',
    '4. Data Excellence: Provide transparency, insights, and predictive analytics',
    '5. Community Building: Foster connections beyond transactional relationships',
  ];

  priorities.forEach((priority, index) => {
    prioritiesSlide.addShape(pptx.ShapeType.rect, {
      x: 1,
      y: 2 + (index * 0.8),
      w: 8,
      h: 0.6,
      fill: { color: COLORS.white },
      line: { color: COLORS.sageGreen, width: 2 },
    });

    prioritiesSlide.addText(priority, {
      x: 1.2,
      y: 2.1 + (index * 0.8),
      w: 7.6,
      h: 0.4,
      fontSize: 13,
      color: COLORS.darkCharcoal,
      valign: 'middle',
    });
  });

  // Closing Slide
  const closingSlide = pptx.addSlide();
  closingSlide.background = { color: COLORS.darkCharcoal };

  closingSlide.addText('Thank You', {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: COLORS.white,
    align: 'center',
  });

  closingSlide.addText('Kumii Platform', {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 0.6,
    fontSize: 24,
    color: COLORS.sageGreen,
    align: 'center',
  });

  closingSlide.addText('Building the future of startup ecosystem', {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.4,
    fontSize: 14,
    color: COLORS.lightGreen,
    align: 'center',
  });

  // Save presentation
  pptx.writeFile({ fileName: 'Kumii_Journey_Maps.pptx' });
};
