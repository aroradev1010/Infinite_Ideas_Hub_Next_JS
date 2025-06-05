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

export const ConfirmationEmail = () => (
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
        <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
          Hi there,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
          Thank you for subscribing to our newsletter!
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
          href="/" // replace "#" with your actual confirmation link if needed
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
