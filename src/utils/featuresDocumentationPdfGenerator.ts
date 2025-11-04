import jsPDF from 'jspdf';

export const generateFeaturesDocumentationPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const kumiiGreen = { r: 76, g: 130, b: 88 };
  
  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  // Title Page
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text('Kumii Platform', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(18);
  doc.text('Feature Documentation', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Complete Platform Capabilities', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

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
          status: 'Implemented',
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
          name: 'Analytics Dashboard',
          status: 'Coming Soon',
          description: 'Track your service performance and business metrics.',
          benefits: [
            'Revenue analytics',
            'Client acquisition metrics',
            'Service performance',
            'Growth insights'
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
          description: 'Track and monitor your funded startups.',
          benefits: [
            'Portfolio dashboard',
            'Performance metrics',
            'Milestone tracking',
            'Risk monitoring'
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
        }
      ]
    }
  ];

  // Add features sections
  featureSections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) addNewPage();
    
    // Section header
    yPos = margin + 10;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
    doc.text(section.title, margin, yPos);
    
    yPos += 15;
    
    // Features
    section.features.forEach((feature) => {
      checkPageBreak(60);
      
      // Feature name
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(feature.name, margin, yPos);
      
      // Status badge
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const statusColors = {
        'Implemented': { r: 34, g: 197, b: 94 },
        'Coming Soon': { r: 251, g: 191, b: 36 },
        'Planned': { r: 148, g: 163, b: 184 }
      };
      const statusColor = statusColors[feature.status as keyof typeof statusColors];
      doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
      doc.text(`[${feature.status}]`, margin + 100, yPos);
      
      yPos += 8;
      
      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const descLines = doc.splitTextToSize(feature.description, maxWidth);
      doc.text(descLines, margin, yPos);
      yPos += descLines.length * 5;
      
      yPos += 3;
      
      // Benefits
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Key Benefits:', margin, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      feature.benefits.forEach((benefit) => {
        checkPageBreak(10);
        doc.circle(margin + 2, yPos - 1, 0.8, 'F');
        const benefitLines = doc.splitTextToSize(benefit, maxWidth - 8);
        doc.text(benefitLines, margin + 6, yPos);
        yPos += benefitLines.length * 4 + 1;
      });
      
      yPos += 8;
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    });
  });

  // Summary page
  addNewPage();
  yPos = margin + 10;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.text('Implementation Summary', margin, yPos);
  
  yPos += 15;
  
  const stats = [
    { label: 'Total Startup Features', value: '10/10 Implemented', color: { r: 34, g: 197, b: 94 } },
    { label: 'Total Mentor Features', value: '8/10 Implemented', color: { r: 34, g: 197, b: 94 } },
    { label: 'Total Service Provider Features', value: '6/10 Implemented', color: { r: 251, g: 191, b: 36 } },
    { label: 'Total Funder Features', value: '6/12 Implemented', color: { r: 251, g: 191, b: 36 } }
  ];
  
  stats.forEach((stat) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(stat.label, margin, yPos);
    
    doc.setTextColor(stat.color.r, stat.color.g, stat.color.b);
    doc.text(stat.value, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 12;
  });
  
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const footerText = [
    'The Kumii Platform is continuously evolving to better serve the African startup ecosystem.',
    'All implemented features are fully functional and available to users today.',
    'Coming Soon features are in active development and will be released in upcoming updates.',
    '',
    'For more information, visit our platform or contact support.'
  ];
  
  footerText.forEach((line) => {
    const lines = doc.splitTextToSize(line, maxWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 2;
  });

  // Save PDF
  doc.save('kumii-features-documentation.pdf');
};
