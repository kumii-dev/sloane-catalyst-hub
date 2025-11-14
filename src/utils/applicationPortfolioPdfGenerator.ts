import jsPDF from 'jspdf';

export const generateApplicationPortfolioPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, fontSize: number, maxWidth: number, lineHeight: number = 7) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, x, yPosition);
      yPosition += lineHeight;
    });
  };

  // Title Page
  doc.setFillColor(0, 123, 255);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Kumii Platform', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Application Portfolio', pageWidth / 2, 45, { align: 'center' });

  yPosition = 80;
  doc.setTextColor(0, 0, 0);

  // Executive Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  addWrappedText(
    'Kumii is a comprehensive ecosystem platform consisting of 25 integrated systems and applications designed to support startups, mentors, advisors, funders, and service providers throughout their entrepreneurial journey.',
    margin,
    11,
    contentWidth
  );
  yPosition += 5;

  // Summary Stats
  checkPageBreak(40);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 35, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const stats = [
    { label: '25 Total Systems', x: margin + 10 },
    { label: '8 System Categories', x: margin + 60 },
    { label: '100+ Core Features', x: margin + 120 },
    { label: '5 User Personas', x: margin + 180 }
  ];
  
  stats.forEach(stat => {
    doc.text(stat.label, stat.x, yPosition + 20);
  });
  
  yPosition += 45;

  // Systems Detail
  const systems = [
    {
      category: 'Core Platform Systems',
      applications: [
        {
          name: 'Authentication & User Management',
          description: 'Comprehensive multi-role authentication system supporting startups, mentors, advisors, funders, service providers, and administrators.',
          features: [
            'Email, phone, and Google sign-in integration',
            'Role-based access control (RBAC)',
            'Persona-based permissions and workflows',
            'JWT token management and session handling'
          ]
        },
        {
          name: 'Profile Management',
          description: 'Dynamic persona-specific profile system with progressive profiling capabilities.',
          features: [
            'Multi-persona profile types',
            'Progressive profiling with smart recommendations',
            'Profile optimization scoring',
            'Sector and industry tagging'
          ]
        },
        {
          name: 'Credits & Wallet System',
          description: 'Digital currency platform for seamless transactions and value exchange.',
          features: [
            'Virtual wallet with balance tracking',
            'Credits earning through activities',
            'Transaction history and audit trails',
            'Cohort-based credit allocations'
          ]
        },
        {
          name: 'File Management',
          description: 'Secure document storage, organization, and collaboration system.',
          features: [
            'Encrypted file upload and storage',
            'Folder organization with custom categories',
            'File sharing with permission controls',
            'Document tagging and search'
          ]
        },
        {
          name: 'Messaging Hub',
          description: 'Real-time communication platform for all user interactions.',
          features: [
            'Direct messaging between users',
            'Conversation threading and context',
            'File attachments and rich media',
            'Read receipts and typing indicators'
          ]
        },
        {
          name: 'Notifications System',
          description: 'Intelligent alert system keeping users informed of platform activities.',
          features: [
            'Real-time push notifications',
            'Email notification integration',
            'Notification preferences and controls',
            'Activity feed with action items'
          ]
        }
      ]
    },
    {
      category: 'Marketplace & Services',
      applications: [
        {
          name: 'Services Marketplace',
          description: 'Comprehensive platform for listing, discovering, and booking professional services.',
          features: [
            'Service listing creation and management',
            'Advanced search with filters',
            'Booking calendar and scheduling',
            'Integrated payment processing'
          ]
        },
        {
          name: 'Mentorship Platform',
          description: 'AI-powered mentorship matching and session management system.',
          features: [
            'Smart mentor-mentee matching algorithm',
            'Session booking with availability',
            'Video conferencing integration',
            'Session notes and follow-up tracking'
          ]
        },
        {
          name: 'Advisory Platform',
          description: 'Expert advisory services with vetting and quality assurance.',
          features: [
            'Advisor vetting and approval workflow',
            'Expertise area categorization',
            'Hourly rate management in ZAR',
            'Session scheduling and reminders'
          ]
        },
        {
          name: 'Funding Hub',
          description: 'Central platform for funding opportunities and portfolio management.',
          features: [
            'Funding opportunity discovery',
            'Application submission and tracking',
            'Portfolio tracking for funders',
            'Investment pipeline management'
          ]
        }
      ]
    },
    {
      category: 'Learning & Development',
      applications: [
        {
          name: 'Learning Management System (LMS)',
          description: 'Full-featured course platform with certification capabilities.',
          features: [
            'Course creation with modules and lessons',
            'Multiple content types',
            'Progress tracking and certificates',
            'Course recommendations'
          ]
        },
        {
          name: 'Event Management',
          description: 'Platform for hosting and managing webinars, workshops, and events.',
          features: [
            'Event creation and scheduling',
            'Registration management',
            'Virtual and in-person support',
            'Attendance tracking'
          ]
        }
      ]
    },
    {
      category: 'Financial Tools',
      applications: [
        {
          name: 'Credit Scoring Engine',
          description: 'Multi-domain business credit assessment system with AI analysis.',
          features: [
            '10-domain credit assessment framework',
            'AI-powered analysis and recommendations',
            'Risk banding and funding eligibility',
            'Document upload and verification'
          ]
        },
        {
          name: 'Financial Model Builder',
          description: 'Interactive financial modeling tool for business planning.',
          features: [
            'Revenue projection modeling',
            'COGS and OPEX calculations',
            'Cash flow forecasting',
            'Excel export functionality'
          ]
        },
        {
          name: 'Valuation Model',
          description: 'Business valuation calculator with multiple methodologies.',
          features: [
            'DCF analysis',
            'Comparable company analysis',
            'Market-based valuation methods',
            'Scenario modeling'
          ]
        }
      ]
    },
    {
      category: 'AI & Automation',
      applications: [
        {
          name: 'AI Copilot',
          description: 'OpenAI-powered intelligent business assistant for startups.',
          features: [
            'Natural language business queries',
            'Contextual recommendations',
            'Document analysis',
            'Business strategy suggestions'
          ]
        },
        {
          name: 'AI Matching Engine',
          description: 'Machine learning-based matching system for optimal connections.',
          features: [
            'Smart mentor-mentee matching',
            'Service provider recommendations',
            'Course recommendations',
            'Match score calculation'
          ]
        },
        {
          name: 'Voice Narration',
          description: 'ElevenLabs text-to-speech integration for accessibility.',
          features: [
            'Multi-lingual voice synthesis',
            'South African accent support',
            'High-quality voice generation',
            'Document narration capabilities'
          ]
        }
      ]
    },
    {
      category: 'Communication & Collaboration',
      applications: [
        {
          name: 'Video Conferencing',
          description: 'Daily.co integration for high-quality video sessions.',
          features: [
            'One-click video room creation',
            'Screen sharing capabilities',
            'Recording functionality',
            'Integration with booking system'
          ]
        },
        {
          name: 'Document Generator',
          description: 'Multi-format document generation for reports and presentations.',
          features: [
            'PDF generation with branding',
            'Word document export',
            'PowerPoint presentation creation',
            'Journey map visualizations'
          ]
        }
      ]
    },
    {
      category: 'Admin & Governance',
      applications: [
        {
          name: 'Admin Dashboard',
          description: 'Comprehensive administrative control panel.',
          features: [
            'User management and role assignment',
            'Platform analytics and metrics',
            'Financial overview and reporting',
            'System health monitoring'
          ]
        },
        {
          name: 'Cohort Management',
          description: 'Sponsor-funded program administration system.',
          features: [
            'Cohort creation and configuration',
            'Member enrollment and tracking',
            'Credits allocation per cohort',
            'Cohort analytics and reporting'
          ]
        },
        {
          name: 'Audit Logging',
          description: 'Comprehensive activity tracking for compliance.',
          features: [
            'All user actions logging',
            'IP address and session tracking',
            'Resource access history',
            'Security event monitoring'
          ]
        }
      ]
    },
    {
      category: 'Supporting Systems',
      applications: [
        {
          name: 'Calendar & Scheduling',
          description: 'Availability management and appointment scheduling.',
          features: [
            'Personal calendar management',
            'Availability slot configuration',
            'Time zone support',
            'Booking conflict prevention'
          ]
        },
        {
          name: 'System Status & Monitoring',
          description: 'Platform health tracking and incident management.',
          features: [
            'Real-time service status monitoring',
            'Uptime tracking and reporting',
            'Incident history and resolution',
            'Scheduled maintenance notifications'
          ]
        }
      ]
    }
  ];

  systems.forEach((category) => {
    checkPageBreak(30);
    
    // Category Header
    doc.setFillColor(0, 123, 255);
    doc.rect(margin, yPosition, contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(category.category, margin + 5, yPosition + 8);
    yPosition += 18;
    doc.setTextColor(0, 0, 0);

    category.applications.forEach((app) => {
      checkPageBreak(50);
      
      // Application Name
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(app.name, margin, yPosition);
      yPosition += 6;

      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      addWrappedText(app.description, margin, 10, contentWidth, 5);
      yPosition += 2;

      // Features
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Features:', margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      app.features.forEach((feature) => {
        checkPageBreak(5);
        doc.text('•', margin + 2, yPosition);
        addWrappedText(feature, margin + 7, 9, contentWidth - 7, 4);
      });
      
      yPosition += 3;
    });
  });

  // Technology Stack
  checkPageBreak(60);
  doc.setFillColor(0, 123, 255);
  doc.rect(margin, yPosition, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Technology Stack', margin + 5, yPosition + 8);
  yPosition += 18;
  doc.setTextColor(0, 0, 0);

  const techStack = [
    {
      title: 'Frontend',
      items: ['React 18.3+ with TypeScript', 'Tailwind CSS', 'TanStack Query', 'React Router', 'Radix UI']
    },
    {
      title: 'Backend',
      items: ['PostgreSQL (Supabase)', 'Supabase Auth & Storage', 'Edge Functions (Deno)', 'Real-time subscriptions']
    },
    {
      title: 'Third-Party Services',
      items: ['OpenAI', 'ElevenLabs', 'Daily.co', 'Resend', 'Sentry']
    }
  ];

  techStack.forEach((section) => {
    checkPageBreak(30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    section.items.forEach((item) => {
      checkPageBreak(5);
      doc.text('• ' + item, margin + 5, yPosition);
      yPosition += 4;
    });
    yPosition += 3;
  });

  // Footer on last page
  const today = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${today}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Kumii Platform - Application Portfolio', pageWidth / 2, pageHeight - 5, { align: 'center' });

  doc.save('Kumii_Application_Portfolio.pdf');
};
