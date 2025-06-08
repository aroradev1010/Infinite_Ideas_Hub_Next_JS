// lib/subscriptionService.ts
export interface SendSubscriptionResponse {
  already: boolean;
}

export async function sendSubscription(
  email: string
): Promise<SendSubscriptionResponse> {
  const res = await fetch("/api/sendConfirmationEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Subscription request failed");
  }

  return res.json();
}
