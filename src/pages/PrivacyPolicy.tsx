import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
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
                Kumii Marketplace (Pty) Ltd ("we", "us", "our") is committed to protecting your privacy and 
                complying with the Protection of Personal Information Act, 2013 (POPIA). This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your personal information when you use 
                our platform.
              </p>
              <p>
                By accessing or using Kumii, you consent to the collection and use of your information in 
                accordance with this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <h4 className="font-semibold">2.1 Personal Information</h4>
              <p>We collect the following types of personal information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Identity information (name, surname, ID number, date of birth)</li>
                <li>Contact information (email address, phone number, physical address)</li>
                <li>Business information (company name, registration number, tax details)</li>
                <li>Financial information (banking details, payment information)</li>
                <li>Credentials (username, password, security questions)</li>
                <li>Profile information (bio, skills, qualifications, experience)</li>
              </ul>

              <h4 className="font-semibold mt-4">2.2 Usage Information</h4>
              <p>We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent on platform)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Communication data (messages, feedback, support requests)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>We process your personal information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide and maintain our services</li>
                <li>To process transactions and payments</li>
                <li>To facilitate connections between startups, funders, mentors, and service providers</li>
                <li>To verify identity and prevent fraud</li>
                <li>To communicate with you about services, updates, and promotional offers</li>
                <li>To improve our platform and develop new features</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To conduct analytics and research</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Legal Basis for Processing (POPIA Compliance)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>We process your personal information based on:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Consent:</strong> You have given explicit consent for processing</li>
                <li><strong>Contractual necessity:</strong> Processing is necessary to fulfill our services</li>
                <li><strong>Legal obligations:</strong> We must comply with South African law</li>
                <li><strong>Legitimate interests:</strong> Processing serves our legitimate business interests while respecting your rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Other platform users:</strong> Profile information visible to matched parties</li>
                <li><strong>Service providers:</strong> Third-party vendors who assist our operations (payment processors, hosting services)</li>
                <li><strong>Business partners:</strong> Funders, mentors, and service providers you engage with</li>
                <li><strong>Legal authorities:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mt-4">
                We do not sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your information, no method of transmission over the internet 
                is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights Under POPIA</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Withdraw consent:</strong> Withdraw consent at any time (without affecting prior lawful processing)</li>
                <li><strong>Lodge a complaint:</strong> Submit a complaint to the Information Regulator</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at privacy@kumii.co.za
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined 
                in this Privacy Policy, unless a longer retention period is required by law. Retention periods vary based on:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Type of information collected</li>
                <li>Purpose of processing</li>
                <li>Legal and regulatory requirements</li>
                <li>Statute of limitations for legal claims</li>
              </ul>
              <p className="mt-4">
                After the retention period, we securely delete or anonymize your information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and deliver personalized content. You can control cookies through your browser settings, 
                though disabling cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Your information may be transferred to and processed in countries outside South Africa. 
                We ensure adequate safeguards are in place to protect your information in accordance with POPIA 
                and international data protection standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Our platform is not intended for individuals under 18 years of age. We do not knowingly 
                collect personal information from children. If you believe we have collected information 
                from a child, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page 
                with an updated "Last Updated" date. We encourage you to review this policy periodically. 
                Continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Information Regulator Details</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                If you have concerns about how we handle your personal information, you may lodge a complaint with:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">Information Regulator (South Africa)</p>
                <p>JD House, 27 Stiemens Street</p>
                <p>Braamfontein, Johannesburg, 2001</p>
                <p>P.O Box 31533, Braamfontein, Johannesburg, 2017</p>
                <p>Email: inforeg@justice.gov.za</p>
                <p>Website: www.justice.gov.za/inforeg</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                For questions about this Privacy Policy or to exercise your rights, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">Kumii Marketplace (Pty) Ltd</p>
                <p>Privacy Officer</p>
                <p>Email: privacy@kumii.co.za</p>
                <p>Phone: 011 463 7602</p>
                <p>Address: Johannesburg, South Africa</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
