// lib/subscription.ts
export async function sendSubscription(email: string) {
  const res = await fetch("/api/sendConfirmationEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}
