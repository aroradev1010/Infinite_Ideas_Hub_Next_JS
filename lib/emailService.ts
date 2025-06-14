import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendConfirmationEmail(email: string, url: string) {
  return resend.emails.send({
    from: "Your App <onboarding@resend.dev>",
    to: [email],
    subject: "Confirm your subscription",
    react: `<a href="${url}">Click here to confirm</a>`, // Or JSX template
  });
}

export async function addResendContact(email: string) {
  return resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId: process.env.RESEND_AUDIENCE_ID!,
  });
}

export async function confirmResendContact(email: string) {
  return resend.contacts.update({
    email,
    audienceId: process.env.RESEND_AUDIENCE_ID!,
    unsubscribed: false,
  });
}
  
