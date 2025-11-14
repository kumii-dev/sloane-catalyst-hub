import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  supabase_url: string
  token_hash: string
  redirect_to: string
  email_action_type: string
  first_name?: string
}

export const ConfirmationEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  email_action_type,
  first_name,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Kumii - Confirm your email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Kumii{first_name ? `, ${first_name}` : ''}!</Heading>
        <Text style={text}>
          Thank you for joining Kumii, the platform that connects startups, mentors, funders, and service providers across Africa.
        </Text>
        <Text style={text}>
          To get started, please confirm your email address by clicking the button below:
        </Text>
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={button}
        >
          Confirm Email Address
        </Link>
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={link}>
          {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
        </Text>
        <Text style={footerText}>
          If you didn't create an account with Kumii, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          <Link
            href="https://kumii.africa"
            target="_blank"
            style={{ ...footerLink, color: '#898989' }}
          >
            Kumii Africa
          </Link>
          <br />
          Empowering African Innovation
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
  lineHeight: '1.4',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#9b87f5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '24px 0',
}

const link = {
  color: '#9b87f5',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '24px',
  borderTop: '1px solid #e6e6e6',
  paddingTop: '20px',
}

const footerLink = {
  color: '#9b87f5',
  textDecoration: 'none',
}
