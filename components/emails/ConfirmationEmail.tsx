// components/emails/ConfirmationEmail.tsx

import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button as EmailButton,
} from "@react-email/components";

interface ConfirmationEmailProps {
  email: string;
  confirmUrl: string;
}

export const ConfirmationEmail: React.FC<ConfirmationEmailProps> = ({
  email,
  confirmUrl,
}) => (
  <Html>
    <Head />
    <Preview>Confirm your newsletter subscription</Preview>
    <Body style={{ backgroundColor: "#f9f9f9", padding: "20px" }}>
      <Container
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Text style={{ fontSize: "16px", marginBottom: "12px" }}>Hello,</Text>
        <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
          You asked to subscribe with <strong>{email}</strong>. Please confirm
          by clicking the button below:
        </Text>
        <EmailButton
          style={{
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
            marginBottom: "12px",
            padding: "12px 20px",
          }}
          href={confirmUrl}
        >
          Confirm Subscription
        </EmailButton>
        <Text style={{ fontSize: "16px", marginTop: "12px" }}>
          If you did not request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);
