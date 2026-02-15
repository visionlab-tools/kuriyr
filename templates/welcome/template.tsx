// Required for JSX runtime when templates are loaded dynamically outside the tsconfig scope
import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeProps {
  t: Record<string, string>
  name?: string
  appName?: string
}

export default function WelcomeEmail({ t }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>{t['subject']}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{t['greeting']}</Heading>
          <Text style={text}>{t['body']}</Text>
          <Section style={ctaSection}>
            <Button style={button} href="https://example.com">
              {t['cta']}
            </Button>
          </Section>
          <Text style={footer}>{t['footer']}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#1a1a1a',
  marginBottom: '16px',
}

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4a4a4a',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5046e5',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
}

const footer = {
  fontSize: '12px',
  color: '#999999',
  marginTop: '32px',
}
