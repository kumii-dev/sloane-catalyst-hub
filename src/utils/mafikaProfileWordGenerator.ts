import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export const generateMafikaProfileWord = async () => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          text: "Mafika William Nkambule",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "IT Executive | Digital Transformation Leader | Enterprise Architecture Specialist",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "📞 071 510 9134  |  ", bold: true }),
            new TextRun({ text: "✉️ nkambumw@gmail.com  |  ", bold: true }),
            new TextRun({ text: "📍 Pretoria East, South Africa", bold: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // Executive Profile
        new Paragraph({
          text: "Executive Profile",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "Dynamic and visionary IT Executive with over 18 years of experience in leading IT strategy, governance, and innovation across multinational organizations, including healthcare, education, and telecommunications sectors. Proven expertise in aligning IT with business goals, driving cost-efficient IT transformations, and managing large-scale IT environments with a focus on cybersecurity, resilience, and enterprise architecture.",
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Adept at fostering organizational excellence through strategic leadership, budget management, and stakeholder engagement. Renowned for steering organizations through critical cybersecurity challenges and modernizing IT infrastructure to enable agility and innovation.",
          spacing: { after: 400 },
        }),

        // Current Leadership Roles
        new Paragraph({
          text: "Current Leadership Roles",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "22 On Sloane - Digital Lead",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "• Driving digital innovation initiatives",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "• Strategic technology partnerships",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "• Ecosystem development and collaboration",
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Kumii Marketplace - Digital Lead & Founding Architect",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "• Platform architecture and technical strategy",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "• Building Africa's all-in-one SMME ecosystem",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "• Digital transformation for entrepreneurs",
          spacing: { after: 400 },
        }),

        // Core Competencies
        new Paragraph({
          text: "Core Competencies",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "Functional Competencies:",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• IT Strategy Development and Implementation", spacing: { after: 100 } }),
        new Paragraph({ text: "• Cybersecurity and Risk Management", spacing: { after: 100 } }),
        new Paragraph({ text: "• IT Governance and Compliance (COBIT, ITIL, TOGAF)", spacing: { after: 100 } }),
        new Paragraph({ text: "• Enterprise Architecture and Service Delivery", spacing: { after: 100 } }),
        new Paragraph({ text: "• IT Financial Management and Budget Oversight", spacing: { after: 100 } }),
        new Paragraph({ text: "• Business Process Automation and Optimization", spacing: { after: 100 } }),
        new Paragraph({ text: "• Strategic Planning and Leadership", spacing: { after: 200 } }),

        new Paragraph({
          text: "Leadership Capabilities:",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• Leading companies effectively and ethically for all stakeholders", spacing: { after: 100 } }),
        new Paragraph({ text: "• Contributing to strategy-setting and implementation", spacing: { after: 100 } }),
        new Paragraph({ text: "• Interrogating financial statements and concluding on performance", spacing: { after: 100 } }),
        new Paragraph({ text: "• Risk management policy formation and implementation", spacing: { after: 100 } }),
        new Paragraph({ text: "• Compliance policy formation and oversight", spacing: { after: 400 } }),

        // Professional Experience
        new Paragraph({
          text: "Professional Experience Highlights",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "Tshwane University of Technology (2017-2025)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Director & Head of ICT Services", italics: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• Led ICT strategy and digital transformation initiatives", spacing: { after: 100 } }),
        new Paragraph({ text: "• Executed major cybersecurity overhaul post-ransomware attack", spacing: { after: 100 } }),
        new Paragraph({ text: "• Implemented enterprise architecture aligned with COBIT & ITIL frameworks", spacing: { after: 200 } }),

        new Paragraph({
          text: "National Health Laboratory Service (2016-2017)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Head – Strategy Development, Application Support & System Development", italics: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• Directed development and support of all business-critical systems", spacing: { after: 100 } }),
        new Paragraph({ text: "• Established IT governance and risk management frameworks", spacing: { after: 200 } }),

        new Paragraph({
          text: "University of South Africa - UNISA (2012-2016)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Director – Information & Communication Technology", italics: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• Led Enterprise Architecture & Strategy development", spacing: { after: 100 } }),
        new Paragraph({ text: "• Managed all ERP Systems and Business Support Systems", spacing: { after: 100 } }),
        new Paragraph({ text: "• Implemented 13 major systems including Oracle, OpenText, and BPM", spacing: { after: 200 } }),

        new Paragraph({
          text: "Multi-Links Telkom Nigeria (2008-2010)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "IT Executive (Acting CIO for 12 months)", italics: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• ICT Strategy, Architecture, and Integration leadership", spacing: { after: 100 } }),
        new Paragraph({ text: "• Implemented 10 major projects including billing solutions and data centre", spacing: { after: 200 } }),

        new Paragraph({
          text: "Telkom South Africa (2005-2008)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Solutions Architect", italics: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• Architecture Impact Assessments and Solution Definitions", spacing: { after: 100 } }),
        new Paragraph({ text: "• Successfully deployed E-Billing and Number Management systems", spacing: { after: 400 } }),

        // Education
        new Paragraph({
          text: "Education & Professional Qualifications",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "PhD in Cybersecurity (2021 - Present)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "Research: Cybersecurity Framework for Higher Education", spacing: { after: 200 } }),
        new Paragraph({
          text: "Master of Computer Science (2002-2004)",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "Research: Quality of Service Provisioning in Mobile Wireless Networks", spacing: { after: 200 } }),

        new Paragraph({
          text: "Professional Certifications:",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "• Institute of Directors South Africa - Being a Director Parts 1-4 (2014)", spacing: { after: 100 } }),
        new Paragraph({ text: "• COBIT 5 Foundation - IT Governance Framework (2014)", spacing: { after: 100 } }),
        new Paragraph({ text: "• Framework Expertise: TOGAF, SOA, ITIL, COBIT, NGOSS", spacing: { after: 400 } }),

        // Board Participation
        new Paragraph({
          text: "Board Participation & Leadership",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({ text: "• Kalafong Provincial Tertiary Hospital - Board Member & Chairperson of Audit Committee", spacing: { after: 100 } }),
        new Paragraph({ text: "• TUT ICT Committee of Council - ICT Governance Committee Member", spacing: { after: 100 } }),
        new Paragraph({ text: "• Vuselela TVET College - ICT Governance Committee Board Member", spacing: { after: 100 } }),
        new Paragraph({ text: "• TENET (Tertiary Education Network) - Board Member", spacing: { after: 100 } }),
        new Paragraph({ text: "• Professional Membership: Higher Education Information Technology South Africa (HEITSA)", spacing: { after: 400 } }),

        // Key Achievements
        new Paragraph({
          text: "Key Achievements & Impact",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({ text: "• 18+ Years of IT Leadership Excellence", spacing: { after: 100 } }),
        new Paragraph({ text: "• 25+ Major Systems Successfully Implemented", spacing: { after: 100 } }),
        new Paragraph({ text: "• 5 Active Board Memberships", spacing: { after: 100 } }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mafika_Nkambule_Profile.docx';
  link.click();
  window.URL.revokeObjectURL(url);
};
