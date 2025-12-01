import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">
          Last Updated: January 2025
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Welcome to Kumii Marketplace ("Kumii", "we", "us", "our"). These Terms and Conditions 
                ("Terms") govern your access to and use of our platform, services, and website located at 
                www.kumii.co.za (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. 
                If you do not agree with these Terms, you must not use our Services.
              </p>
              <p>
                Kumii Marketplace (Pty) Ltd is a company registered in South Africa and operates in accordance 
                with South African law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Definitions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>"Platform"</strong> refers to the Kumii website and mobile applications</li>
                <li><strong>"User"</strong> refers to any person or entity using our Services</li>
                <li><strong>"Startup"</strong> refers to small and medium enterprises seeking services, funding, or mentorship</li>
                <li><strong>"Service Provider"</strong> refers to businesses or professionals offering services on the Platform</li>
                <li><strong>"Funder"</strong> refers to investors or financial institutions providing funding opportunities</li>
                <li><strong>"Mentor"</strong> refers to experienced professionals offering guidance and advice</li>
                <li><strong>"Content"</strong> refers to text, images, videos, data, and other materials on the Platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Eligibility and Account Registration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">3.1 Eligibility</h4>
              <p>
                You must be at least 18 years old and have the legal capacity to enter into binding contracts 
                to use our Services. By registering, you represent and warrant that you meet these requirements.
              </p>

              <h4 className="font-semibold mt-4">3.2 Account Registration</h4>
              <p>To access certain features, you must create an account by providing accurate information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to notify us immediately of any unauthorized access or security breach</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must provide truthful, accurate, and complete information</li>
                <li>You must update your information to keep it current</li>
              </ul>

              <h4 className="font-semibold mt-4">3.3 Account Termination</h4>
              <p>
                We reserve the right to suspend or terminate your account at our sole discretion if you 
                violate these Terms or engage in fraudulent, illegal, or harmful activities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Use of Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">4.1 Permitted Use</h4>
              <p>You may use our Services for lawful business purposes, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Accessing marketplace services</li>
                <li>Seeking or providing funding opportunities</li>
                <li>Participating in mentorship programs</li>
                <li>Connecting with other users</li>
                <li>Accessing educational resources and tools</li>
              </ul>

              <h4 className="font-semibold mt-4">4.2 Prohibited Activities</h4>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Engage in fraudulent, deceptive, or misleading practices</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Scrape, crawl, or collect data without authorization</li>
                <li>Impersonate others or misrepresent your identity</li>
                <li>Interfere with the Platform's operation or security</li>
                <li>Use automated systems (bots) without permission</li>
                <li>Post spam, unsolicited communications, or advertisements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Marketplace Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">5.1 Service Provider Obligations</h4>
              <p>Service providers must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Accurately describe their services</li>
                <li>Provide services professionally and competently</li>
                <li>Comply with applicable licenses and regulations</li>
                <li>Honor agreed-upon terms with clients</li>
                <li>Maintain appropriate insurance coverage</li>
              </ul>

              <h4 className="font-semibold mt-4">5.2 Service Purchaser Obligations</h4>
              <p>Users purchasing services must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Pay agreed fees promptly</li>
                <li>Provide necessary information and cooperation</li>
                <li>Comply with service provider terms</li>
              </ul>

              <h4 className="font-semibold mt-4">5.3 Platform Role</h4>
              <p>
                Kumii acts as a facilitator connecting users. We are not a party to transactions between users 
                and do not guarantee the quality, legality, or safety of services. Users contract directly with 
                each other.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Funding and Investment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">6.1 No Investment Advice</h4>
              <p>
                Kumii does not provide financial, investment, or legal advice. Information on the Platform 
                is for informational purposes only. Consult professional advisors before making financial decisions.
              </p>

              <h4 className="font-semibold mt-4">6.2 Risk Acknowledgment</h4>
              <p>
                Users acknowledge that investing in startups carries significant risk, including potential 
                loss of capital. We do not guarantee investment returns or startup success.
              </p>

              <h4 className="font-semibold mt-4">6.3 Compliance</h4>
              <p>
                All funding activities must comply with South African financial regulations, including the 
                Financial Advisory and Intermediary Services Act (FAIS) and Companies Act.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">7.1 Fees</h4>
              <p>
                Certain Services may require payment of fees. All fees are in South African Rand (ZAR) unless 
                otherwise stated and include applicable VAT.
              </p>

              <h4 className="font-semibold mt-4">7.2 Payment Processing</h4>
              <p>
                Payments are processed through secure third-party payment processors. You authorize us to 
                charge your payment method for applicable fees.
              </p>

              <h4 className="font-semibold mt-4">7.3 Refunds</h4>
              <p>
                Refund eligibility depends on the specific service. Platform fees are generally non-refundable. 
                Disputes regarding service quality should be resolved directly between parties.
              </p>

              <h4 className="font-semibold mt-4">7.4 Commission</h4>
              <p>
                Kumii may charge a commission or transaction fee on marketplace transactions. Applicable fees 
                will be clearly disclosed before completion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">8.1 Platform IP</h4>
              <p>
                All intellectual property in the Platform (trademarks, logos, software, design, content) 
                is owned by Kumii or our licensors. You may not use our IP without prior written consent.
              </p>

              <h4 className="font-semibold mt-4">8.2 User Content</h4>
              <p>
                You retain ownership of content you submit but grant Kumii a worldwide, non-exclusive, 
                royalty-free license to use, display, reproduce, and distribute your content for operating 
                and promoting the Platform.
              </p>

              <h4 className="font-semibold mt-4">8.3 Copyright Infringement</h4>
              <p>
                We respect intellectual property rights. If you believe content infringes your copyright, 
                contact us at legal@kumii.co.za with details of the alleged infringement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Disclaimers and Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">9.1 "As Is" Basis</h4>
              <p>
                The Services are provided "as is" and "as available" without warranties of any kind, either 
                express or implied, including but not limited to warranties of merchantability, fitness for 
                a particular purpose, or non-infringement.
              </p>

              <h4 className="font-semibold mt-4">9.2 No Guarantee</h4>
              <p>We do not guarantee that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Services will be uninterrupted, secure, or error-free</li>
                <li>Results obtained will be accurate or reliable</li>
                <li>The quality of services, information, or materials will meet your expectations</li>
                <li>All errors or defects will be corrected</li>
              </ul>

              <h4 className="font-semibold mt-4">9.3 Limitation of Liability</h4>
              <p>
                To the maximum extent permitted by South African law, Kumii, its directors, employees, 
                and affiliates shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including loss of profits, data, or goodwill, arising from your use 
                of the Services.
              </p>
              <p>
                Our total liability for any claim shall not exceed the amount you paid to Kumii in the 
                12 months preceding the claim, or R1,000, whichever is greater.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless Kumii and its affiliates from any claims, 
                losses, liabilities, damages, costs, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of third parties</li>
                <li>Your conduct or content on the Platform</li>
                <li>Any fraudulent or illegal activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">11.1 Governing Law</h4>
              <p>
                These Terms are governed by the laws of the Republic of South Africa, without regard to 
                conflict of law principles.
              </p>

              <h4 className="font-semibold mt-4">11.2 Jurisdiction</h4>
              <p>
                You consent to the exclusive jurisdiction of the courts of Johannesburg, South Africa, 
                for any disputes arising from these Terms or your use of the Services.
              </p>

              <h4 className="font-semibold mt-4">11.3 Mediation and Arbitration</h4>
              <p>
                Before initiating legal proceedings, parties agree to attempt resolution through good faith 
                negotiations. If unresolved within 30 days, disputes may be submitted to arbitration in 
                accordance with the Arbitration Act, 1965.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Data Protection and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Our collection, use, and protection of your personal information is governed by our Privacy Policy, 
                which complies with the Protection of Personal Information Act (POPIA). By using our Services, 
                you consent to our data practices as described in the Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Modifications to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page 
                with an updated "Last Updated" date. Material changes will be communicated via email or 
                Platform notification.
              </p>
              <p>
                Your continued use of the Services after changes constitutes acceptance of the modified Terms. 
                If you do not agree with the changes, you must stop using the Services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                You may terminate your account at any time by contacting support. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your right to access the Services immediately ceases</li>
                <li>We may delete your account and data (subject to retention obligations)</li>
                <li>Outstanding obligations (payments, agreements) remain enforceable</li>
                <li>Provisions that should survive (liability, indemnification) continue to apply</li>
              </ul>
              <p className="mt-4">
                We may terminate or suspend your account immediately, without notice, for violation of these Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>15. General Provisions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">15.1 Entire Agreement</h4>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                and Kumii regarding the Services.
              </p>

              <h4 className="font-semibold mt-4">15.2 Severability</h4>
              <p>
                If any provision is found unenforceable, the remaining provisions remain in full effect.
              </p>

              <h4 className="font-semibold mt-4">15.3 Waiver</h4>
              <p>
                Our failure to enforce any right or provision does not constitute a waiver of such right or provision.
              </p>

              <h4 className="font-semibold mt-4">15.4 Assignment</h4>
              <p>
                You may not assign these Terms without our written consent. We may assign our rights without restriction.
              </p>

              <h4 className="font-semibold mt-4">15.5 Force Majeure</h4>
              <p>
                We are not liable for failure to perform obligations due to circumstances beyond our reasonable 
                control (natural disasters, strikes, government actions, network failures).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>16. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                For questions, concerns, or notices regarding these Terms, please contact:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">Kumii Marketplace (Pty) Ltd</p>
                <p>Legal Department</p>
                <p>Email: legal@kumii.co.za</p>
                <p>Phone: 011 463 7602</p>
                <p>Address: Johannesburg, South Africa</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted p-6 rounded-lg mt-8">
            <p className="text-sm text-muted-foreground">
              <strong>Acknowledgment:</strong> By using Kumii Marketplace, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
