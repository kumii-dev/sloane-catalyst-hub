import jsPDF from 'jspdf';

export const generateFeaturesDocumentationPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const kumiiGreen = { r: 76, g: 130, b: 88 };
  const kumiiGold = { r: 218, g: 165, b: 32 };
  const implementedColor = { r: 34, g: 197, b: 94 };
  const comingSoonColor = { r: 251, g: 191, b: 36 };
  const plannedColor = { r: 148, g: 163, b: 184 };
  const partialColor = { r: 59, g: 130, b: 246 };
  
  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  // ========== ENHANCED TITLE PAGE WITH DASHBOARD ==========
  
  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text('Kumii Platform', pageWidth / 2, yPos + 15, { align: 'center' });
  
  // Subtitle
  yPos += 25;
  doc.setFontSize(20);
  doc.setTextColor(kumiiGold.r, kumiiGold.g, kumiiGold.b);
  doc.text('Feature Documentation', pageWidth / 2, yPos, { align: 'center' });
  
  // Tagline
  yPos += 12;
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Empowering African Startups Through Innovation', pageWidth / 2, yPos, { align: 'center' });
  
  // Date
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
  
  // ========== IMPLEMENTATION DASHBOARD ==========
  yPos += 20;
  
  // Dashboard Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text('Feature Implementation Status', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Dashboard stats
  const dashboardStats = [
    { 
      persona: 'Startup Features', 
      total: 10, 
      implemented: 10, 
      comingSoon: 0, 
      planned: 0,
      icon: '🚀'
    },
    { 
      persona: 'Mentor Features', 
      total: 10, 
      implemented: 8, 
      comingSoon: 2, 
      planned: 0,
      icon: '👥'
    },
    { 
      persona: 'Service Provider Features', 
      total: 10, 
      implemented: 6, 
      comingSoon: 2, 
      planned: 2,
      icon: '💼'
    },
    { 
      persona: 'Funder Features', 
      total: 13, 
      implemented: 9, 
      comingSoon: 3, 
      planned: 0,
      partial: 1,
      icon: '💰'
    }
  ];
  
  // Calculate totals
  const totals = dashboardStats.reduce((acc, stat) => ({
    total: acc.total + stat.total,
    implemented: acc.implemented + stat.implemented,
    comingSoon: acc.comingSoon + stat.comingSoon,
    planned: acc.planned + stat.planned
  }), { total: 0, implemented: 0, comingSoon: 0, planned: 0 });
  
  // Overall Summary Box
  yPos += 5;
  const summaryBoxHeight = 28;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, maxWidth, summaryBoxHeight, 3, 3, 'F');
  
  // Summary stats in one line
  const summaryY = yPos + 8;
  const columnWidth = maxWidth / 4;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Total Features', margin + (columnWidth * 0) + columnWidth / 2, summaryY, { align: 'center' });
  doc.text('Implemented', margin + (columnWidth * 1) + columnWidth / 2, summaryY, { align: 'center' });
  doc.text('Coming Soon', margin + (columnWidth * 2) + columnWidth / 2, summaryY, { align: 'center' });
  doc.text('Planned', margin + (columnWidth * 3) + columnWidth / 2, summaryY, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text(totals.total.toString(), margin + (columnWidth * 0) + columnWidth / 2, summaryY + 10, { align: 'center' });
  
  doc.setTextColor(implementedColor.r, implementedColor.g, implementedColor.b);
  doc.text(totals.implemented.toString(), margin + (columnWidth * 1) + columnWidth / 2, summaryY + 10, { align: 'center' });
  
  doc.setTextColor(comingSoonColor.r, comingSoonColor.g, comingSoonColor.b);
  doc.text(totals.comingSoon.toString(), margin + (columnWidth * 2) + columnWidth / 2, summaryY + 10, { align: 'center' });
  
  doc.setTextColor(plannedColor.r, plannedColor.g, plannedColor.b);
  doc.text(totals.planned.toString(), margin + (columnWidth * 3) + columnWidth / 2, summaryY + 10, { align: 'center' });
  
  yPos += summaryBoxHeight + 10;
  
  // Persona Breakdown
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text('Breakdown by User Type', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Draw persona stats
  dashboardStats.forEach((stat) => {
    const boxHeight = 30;
    const percentage = (stat.implemented / stat.total * 100).toFixed(0);
    
    // Box background
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos, maxWidth, boxHeight, 2, 2, 'F');
    
    // Border based on completion
    if (stat.implemented === stat.total) {
      doc.setDrawColor(implementedColor.r, implementedColor.g, implementedColor.b);
    } else if (stat.implemented > stat.total / 2) {
      doc.setDrawColor(comingSoonColor.r, comingSoonColor.g, comingSoonColor.b);
    } else {
      doc.setDrawColor(plannedColor.r, plannedColor.g, plannedColor.b);
    }
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, maxWidth, boxHeight, 2, 2, 'S');
    
    // Persona name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(stat.persona, margin + 5, yPos + 8);
    
    // Stats on right side
    const statsX = pageWidth - margin - 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    // Percentage circle/badge
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    if (stat.implemented === stat.total) {
      doc.setTextColor(implementedColor.r, implementedColor.g, implementedColor.b);
    } else {
      doc.setTextColor(comingSoonColor.r, comingSoonColor.g, comingSoonColor.b);
    }
    doc.text(`${percentage}%`, statsX, yPos + 8, { align: 'right' });
    
    // Progress bar
    const barY = yPos + 14;
    const barWidth = maxWidth - 10;
    const barHeight = 4;
    const progressWidth = (barWidth * stat.implemented) / stat.total;
    
    // Background bar
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(margin + 5, barY, barWidth, barHeight, 1, 1, 'F');
    
    // Progress bar
    if (stat.implemented === stat.total) {
      doc.setFillColor(implementedColor.r, implementedColor.g, implementedColor.b);
    } else {
      doc.setFillColor(comingSoonColor.r, comingSoonColor.g, comingSoonColor.b);
    }
    doc.roundedRect(margin + 5, barY, progressWidth, barHeight, 1, 1, 'F');
    
    // Status breakdown text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const statusY = yPos + 23;
    
    doc.setTextColor(implementedColor.r, implementedColor.g, implementedColor.b);
    doc.text(`${stat.implemented} Implemented`, margin + 5, statusY);
    
    if (stat.comingSoon > 0) {
      doc.setTextColor(comingSoonColor.r, comingSoonColor.g, comingSoonColor.b);
      doc.text(`${stat.comingSoon} Coming Soon`, margin + 50, statusY);
    }
    
    if (stat.planned > 0) {
      doc.setTextColor(plannedColor.r, plannedColor.g, plannedColor.b);
      doc.text(`${stat.planned} Planned`, margin + 95, statusY);
    }
    
    yPos += boxHeight + 4;
  });
  
  // Legend at bottom of first page
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Status Legend:', margin, yPos);
  
  yPos += 6;
  const legendX = margin + 5;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.setFillColor(implementedColor.r, implementedColor.g, implementedColor.b);
  doc.circle(legendX, yPos - 1.5, 2, 'F');
  doc.setTextColor(60, 60, 60);
  doc.text('Implemented - Feature is live and available', legendX + 5, yPos);
  
  yPos += 5;
  doc.setFillColor(comingSoonColor.r, comingSoonColor.g, comingSoonColor.b);
  doc.circle(legendX, yPos - 1.5, 2, 'F');
  doc.text('Coming Soon - In active development', legendX + 5, yPos);
  
  yPos += 5;
  doc.setFillColor(plannedColor.r, plannedColor.g, plannedColor.b);
  doc.circle(legendX, yPos - 1.5, 2, 'F');
  doc.text('Planned - Scheduled for future release', legendX + 5, yPos);

  // All features data
  const featureSections = [
    {
      title: 'Startup Features',
      icon: 'STARTUP',
      features: [
        {
          name: 'AI Copilot & Chat Support',
          status: 'Implemented',
          description: '24/7 intelligent AI assistant that helps you navigate the platform, answer questions, and provide guidance on your startup journey.',
          benefits: [
            'Instant answers to platform questions',
            'Personalized guidance based on your startup stage',
            'Available across all pages via floating chat button',
            'Context-aware assistance'
          ]
        },
        {
          name: 'Credit Score Assessment',
          status: 'Implemented',
          description: 'Comprehensive credit scoring system that evaluates your startup\'s creditworthiness based on multiple factors.',
          benefits: [
            'Detailed breakdown of scoring factors',
            'Technical, financial, and market scores',
            'Actionable recommendations for improvement',
            'Visible to potential funders'
          ]
        },
        {
          name: 'Financial Model Builder',
          status: 'Implemented',
          description: 'Professional-grade financial modeling tool with support for IFRS and US GAAP standards.',
          benefits: [
            'Income statements, balance sheets, and cash flow',
            'Scenario planning (Base, Best, Worst case)',
            'Export to Excel',
            'Validation and error checking'
          ]
        },
        {
          name: 'Mentorship Matching',
          status: 'Implemented',
          description: 'AI-powered matching system that connects you with experienced mentors.',
          benefits: [
            'Smart matching algorithm',
            'View mentor profiles and expertise',
            'Book sessions directly',
            'Track mentorship progress'
          ]
        },
        {
          name: 'Service Marketplace',
          status: 'Implemented',
          description: 'Access affordable professional services from verified providers.',
          benefits: [
            'Vetted service providers',
            'Transparent pricing',
            'Service categories from legal to marketing',
            'Direct booking and payment'
          ]
        },
        {
          name: 'Funding Hub',
          status: 'Implemented',
          description: 'Central platform to discover funding opportunities and submit applications.',
          benefits: [
            'AI-matched funding opportunities',
            'Application management',
            'Track application status',
            'Direct funder communication'
          ]
        },
        {
          name: 'Secure Messaging',
          status: 'Implemented',
          description: 'Encrypted messaging system for secure communication.',
          benefits: [
            'End-to-end encrypted conversations',
            'File sharing capabilities',
            'Contact management',
            'Message history and search'
          ]
        },
        {
          name: 'Document Management',
          status: 'Implemented',
          description: 'Secure cloud storage for all your startup documents.',
          benefits: [
            'Organized file storage with folders',
            'Share documents securely',
            'Version control',
            'Access from anywhere'
          ]
        },
        {
          name: 'Resource Library',
          status: 'Implemented',
          description: 'Comprehensive library of guides, templates, and training materials.',
          benefits: [
            'Business plan templates',
            'Industry-specific guides',
            'Video tutorials',
            'Downloadable resources'
          ]
        },
        {
          name: 'Smart Dashboard',
          status: 'Implemented',
          description: 'Personalized dashboard showing your progress, opportunities, and next steps.',
          benefits: [
            'Activity tracking',
            'Progress metrics',
            'Opportunity alerts',
            'Action recommendations'
          ]
        }
      ]
    },
    {
      title: 'Mentor Features',
      icon: 'MENTOR',
      features: [
        {
          name: 'Profile Management',
          status: 'Implemented',
          description: 'Create and manage your mentor profile showcasing expertise and experience.',
          benefits: [
            'Highlight areas of expertise',
            'Display credentials and achievements',
            'Set availability and rates',
            'Build credibility'
          ]
        },
        {
          name: 'Availability Calendar',
          status: 'Implemented',
          description: 'Manage your mentorship schedule and availability.',
          benefits: [
            'Set recurring availability',
            'Block time slots',
            'Sync with personal calendar',
            'Automated booking confirmations'
          ]
        },
        {
          name: 'Session Management',
          status: 'Implemented',
          description: 'Track and manage all your mentorship sessions.',
          benefits: [
            'Session history',
            'Notes and action items',
            'Rating and feedback',
            'Revenue tracking'
          ]
        },
        {
          name: 'Mentee Matching',
          status: 'Implemented',
          description: 'Get matched with mentees that align with your expertise.',
          benefits: [
            'AI-powered matching',
            'View mentee profiles',
            'Accept or decline requests',
            'Build long-term relationships'
          ]
        },
        {
          name: 'Video Conferencing',
          status: 'Implemented',
          description: 'Built-in video call platform for remote mentorship sessions.',
          benefits: [
            'High-quality video calls',
            'Screen sharing',
            'Recording capabilities',
            'No external tools needed'
          ]
        },
        {
          name: 'Secure Messaging',
          status: 'Implemented',
          description: 'Direct communication channel with your mentees.',
          benefits: [
            'Private conversations',
            'File sharing',
            'Message history',
            'Mobile notifications'
          ]
        },
        {
          name: 'Performance Analytics',
          status: 'Implemented',
          description: 'Track your impact and mentorship effectiveness.',
          benefits: [
            'Session completion rates',
            'Mentee satisfaction scores',
            'Impact metrics',
            'Performance insights'
          ]
        },
        {
          name: 'Payment Integration',
          status: 'Implemented',
          description: 'Automated payment processing for paid mentorship.',
          benefits: [
            'Secure payment handling',
            'Multiple payment methods',
            'Automatic invoicing',
            'Earnings dashboard'
          ]
        },
        {
          name: 'Resource Sharing',
          status: 'Coming Soon',
          description: 'Share resources and materials with your mentees.',
          benefits: [
            'Upload documents and templates',
            'Curated resource library',
            'Track resource usage',
            'Organize by topic'
          ]
        },
        {
          name: 'Cohort Management',
          status: 'Coming Soon',
          description: 'Manage group mentorship programs and cohorts.',
          benefits: [
            'Group session scheduling',
            'Cohort progress tracking',
            'Collaborative learning',
            'Batch communications'
          ]
        }
      ]
    },
    {
      title: 'Service Provider Features',
      icon: 'PROVIDER',
      features: [
        {
          name: 'Service Listings',
          status: 'Implemented',
          description: 'Create and manage your service offerings on the marketplace.',
          benefits: [
            'Detailed service descriptions',
            'Pricing tiers',
            'Portfolio showcase',
            'Service categories'
          ]
        },
        {
          name: 'Lead Generation',
          status: 'Implemented',
          description: 'Receive qualified leads from startups seeking your services.',
          benefits: [
            'Targeted lead matching',
            'Lead notifications',
            'Lead management dashboard',
            'Conversion tracking'
          ]
        },
        {
          name: 'Booking Management',
          status: 'Implemented',
          description: 'Manage service bookings and client appointments.',
          benefits: [
            'Availability calendar',
            'Automated booking confirmations',
            'Scheduling flexibility',
            'Reminders and notifications'
          ]
        },
        {
          name: 'Payment Processing',
          status: 'Planned',
          description: 'Secure payment collection for your services.',
          benefits: [
            'Multiple payment methods',
            'Automatic invoicing',
            'Payment tracking',
            'Financial reporting'
          ]
        },
        {
          name: 'Client Communication',
          status: 'Implemented',
          description: 'Direct messaging with clients and prospects.',
          benefits: [
            'Secure messaging',
            'File sharing',
            'Proposal submission',
            'Communication history'
          ]
        },
        {
          name: 'Reviews & Ratings',
          status: 'Implemented',
          description: 'Build credibility through client reviews and ratings.',
          benefits: [
            'Client feedback collection',
            'Public rating display',
            'Review management',
            'Reputation building'
          ]
        },
        {
          name: 'Profile Optimization Tools',
          status: 'Available',
          description: 'Tools and guidance to optimize your provider profile for maximum visibility.',
          benefits: [
            'Profile completeness percentage tracker',
            'Interactive checklist with required and recommended items',
            'Real-time optimization tips',
            'Visual progress tracking'
          ]
        },
        {
          name: 'Analytics Dashboard',
          status: 'Implemented',
          description: 'Comprehensive analytics dashboard with detailed metrics, charts, and insights on service performance.',
          benefits: [
            'Real-time performance metrics with trend analysis',
            'Interactive charts for views, bookings, and revenue',
            'Conversion funnel visualization and optimization',
            'Service-level performance comparison',
            'Exportable analytics reports',
            'Time-based filtering (7d, 30d, 90d, 1y)'
          ]
        },
        {
          name: 'Portfolio Management',
          status: 'Coming Soon',
          description: 'Showcase your work and case studies.',
          benefits: [
            'Project galleries',
            'Case study templates',
            'Before/after showcases',
            'Client testimonials'
          ]
        },
        {
          name: 'Contract Templates',
          status: 'Coming Soon',
          description: 'Pre-built contract templates for service agreements.',
          benefits: [
            'Legal protection',
            'Standard terms',
            'E-signature support',
            'Template customization'
          ]
        },
        {
          name: 'Team Collaboration',
          status: 'Planned',
          description: 'Collaborate with team members on service delivery.',
          benefits: [
            'Team member accounts',
            'Task assignment',
            'Internal communication',
            'Resource sharing'
          ]
        }
      ]
    },
    {
      title: 'Funder Features',
      icon: 'FUNDER',
      features: [
        {
          name: 'Startup Discovery',
          status: 'Implemented',
          description: 'Browse and discover high-potential startups based on your criteria.',
          benefits: [
            'Advanced filtering',
            'Industry and stage selection',
            'Credit score visibility',
            'Saved searches'
          ]
        },
        {
          name: 'Application Management',
          status: 'Implemented',
          description: 'Review and manage funding applications efficiently.',
          benefits: [
            'Centralized application inbox',
            'Status tracking',
            'Collaborative review',
            'Decision workflows'
          ]
        },
        {
          name: 'Due Diligence Tools',
          status: 'Implemented',
          description: 'Access comprehensive startup information for evaluation.',
          benefits: [
            'Financial model review',
            'Credit score analysis',
            'Document access',
            'Communication history'
          ]
        },
        {
          name: 'Secure Communication',
          status: 'Implemented',
          description: 'Direct communication with startups throughout the funding process.',
          benefits: [
            'Encrypted messaging',
            'Document sharing',
            'Video calls',
            'Application discussions'
          ]
        },
        {
          name: 'Portfolio Tracking',
          status: 'Implemented',
          description: 'Monitor and track all your portfolio companies with performance metrics, visualizations, and key investment data.',
          benefits: [
            'Dashboard view of all funded startups',
            'Key metrics: total funded, portfolio size, average deal size',
            'Industry and stage distribution charts',
            'Detailed company information with funding history',
            'Filter portfolio by industry and other criteria',
            'Export portfolio reports'
          ]
        },
        {
          name: 'Smart Matching',
          status: 'Implemented',
          description: 'AI-powered matching with startups that fit your investment thesis.',
          benefits: [
            'Personalized recommendations',
            'Match score algorithm',
            'Investment criteria alignment',
            'Opportunity alerts'
          ]
        },
        {
          name: 'Advanced Search & Filters',
          status: 'Available',
          description: 'Powerful search and filtering tools to discover startups by sector, stage, location, and more.',
          benefits: [
            'Multi-criteria search with 10+ filter options',
            'Save and load frequently used searches',
            'Custom filters for industry, stage, location, metrics',
            'Export search results functionality'
          ]
        },
        {
          name: 'Deal Flow Analytics',
          status: 'Coming Soon',
          description: 'Analytics on your deal flow and investment pipeline.',
          benefits: [
            'Pipeline visualization',
            'Conversion metrics',
            'Time-to-decision tracking',
            'Performance benchmarks'
          ]
        },
        {
          name: 'Investment Syndication',
          status: 'Coming Soon',
          description: 'Collaborate with other funders on investment opportunities.',
          benefits: [
            'Co-investment opportunities',
            'Syndicate management',
            'Investment sharing',
            'Network collaboration'
          ]
        },
        {
          name: 'Automated Reporting',
          status: 'Coming Soon',
          description: 'Automated portfolio and performance reporting.',
          benefits: [
            'Quarterly reports',
            'Portfolio performance',
            'Risk analysis',
            'Investor updates'
          ]
        },
        {
          name: 'Term Sheet Templates',
          status: 'Coming Soon',
          description: 'Pre-built term sheet and agreement templates.',
          benefits: [
            'Standard terms',
            'Legal compliance',
            'Quick deal closure',
            'Template customization'
          ]
        },
        {
          name: 'Post-Investment Monitoring',
          status: 'Coming Soon',
          description: 'Monitor startup progress after investment.',
          benefits: [
            'KPI tracking',
            'Milestone verification',
            'Financial reporting',
            'Risk alerts'
          ]
        },
        {
          name: 'Network Effects',
          status: 'Coming Soon',
          description: 'Connect your portfolio companies for mutual benefit.',
          benefits: [
            'Portfolio introductions',
            'Resource sharing',
            'Collaboration opportunities',
            'Ecosystem building'
          ]
        },
        {
          name: 'Cohort Manager',
          status: 'Partially Available',
          description: 'Create and manage cohorts with bulk subscription capabilities and email-based auto-assignment. Core functionality is available; linking individual mentees to active programmes is coming soon.',
          benefits: [
            'Create and manage multiple cohorts (Available)',
            'Bulk assign listings to cohorts (Available)',
            'Email-based auto-assignment (Available)',
            'Track cohort status and members (Available)',
            'Link individual mentees to programmes (Coming Soon)'
          ]
        }
      ]
    }
  ];

  // ========== FEATURE SECTIONS ==========
  featureSections.forEach((section, sectionIndex) => {
    addNewPage();
    
    // Section header with background
    yPos = margin;
    const headerHeight = 20;
    doc.setFillColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
    doc.rect(0, yPos, pageWidth, headerHeight, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(section.title, pageWidth / 2, yPos + 13, { align: 'center' });
    
    yPos += headerHeight + 12;
    
    // Features
    section.features.forEach((feature, featureIndex) => {
      checkPageBreak(70);
      
      // Feature card background
      const cardStartY = yPos;
      const estimatedHeight = 55;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, maxWidth, estimatedHeight, 2, 2, 'F');
      
      yPos += 8;
      
      // Feature name and status on same line
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(feature.name, margin + 5, yPos);
      
      // Status badge with background
      const statusColors = {
        'Implemented': implementedColor,
        'Coming Soon': comingSoonColor,
        'Planned': plannedColor,
        'Partially Available': partialColor
      };
      const statusColor = statusColors[feature.status as keyof typeof statusColors];
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const statusText = feature.status.toUpperCase();
      const statusWidth = doc.getTextWidth(statusText) + 6;
      const statusX = pageWidth - margin - statusWidth - 5;
      
      doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
      doc.roundedRect(statusX, yPos - 4, statusWidth, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(statusText, statusX + 3, yPos);
      
      yPos += 7;
      
      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      const descLines = doc.splitTextToSize(feature.description, maxWidth - 10);
      doc.text(descLines, margin + 5, yPos);
      yPos += descLines.length * 5 + 4;
      
      // Benefits header
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
      doc.text('KEY BENEFITS', margin + 5, yPos);
      yPos += 5;
      
      // Benefits list
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      
      feature.benefits.forEach((benefit, benefitIndex) => {
        checkPageBreak(10);
        
        // Checkmark bullet
        doc.setTextColor(implementedColor.r, implementedColor.g, implementedColor.b);
        doc.text('✓', margin + 7, yPos);
        
        doc.setTextColor(80, 80, 80);
        const benefitLines = doc.splitTextToSize(benefit, maxWidth - 20);
        doc.text(benefitLines, margin + 12, yPos);
        yPos += benefitLines.length * 4 + 2;
      });
      
      yPos += 6;
    });
  });


  // ========== CLOSING PAGE ==========
  addNewPage();
  yPos = margin + 30;
  
  // Closing statement
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text('Powering African Innovation', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  const closingText = [
    'The Kumii Platform is continuously evolving to better serve the African startup ecosystem.',
    '',
    'All implemented features are fully functional and available to users today, providing',
    'immediate value to startups, mentors, service providers, and funders across the continent.',
    '',
    'Features marked as "Coming Soon" are in active development and will be released in',
    'upcoming updates as we continue to enhance the platform based on user feedback and',
    'emerging needs in the ecosystem.',
    '',
    'Our commitment is to build Africa\'s most comprehensive startup support platform,',
    'democratizing access to resources, funding, mentorship, and services that help',
    'entrepreneurs succeed.'
  ];
  
  closingText.forEach((line) => {
    if (line === '') {
      yPos += 6;
    } else {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    }
  });
  
  yPos += 15;
  
  // Contact info box
  const contactBoxHeight = 35;
  doc.setFillColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.roundedRect(margin + 20, yPos, maxWidth - 40, contactBoxHeight, 3, 3, 'F');
  
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Get Started Today', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Visit our platform to explore all features and join the ecosystem', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('support@kumii.africa', pageWidth / 2, yPos, { align: 'center' });

  // Save PDF
  doc.save('kumii-features-documentation.pdf');
};
