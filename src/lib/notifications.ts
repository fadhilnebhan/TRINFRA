// Trinfra — Notification Interfaces (Placeholder)
// These are clean contracts for future backend integration.
// They NEVER claim external delivery unless actually configured.

export interface NotificationResult {
  sent: boolean;
  reason: string;
}

const NOT_CONFIGURED: NotificationResult = {
  sent: false,
  reason: 'Integration not configured',
};

/**
 * Send email confirmation to the landowner.
 * Currently a placeholder — will be connected to a real email service.
 */
export async function sendEmailConfirmation(
  email: string,
  referenceNumber: string
): Promise<NotificationResult> {
  console.log(`[Trinfra Notifications] Email confirmation queued for ${email}, ref: ${referenceNumber}`);
  // TODO: Connect to email service (e.g., SendGrid, AWS SES)
  return NOT_CONFIGURED;
}

/**
 * Send WhatsApp confirmation to the landowner.
 * Currently a placeholder — will be connected to WhatsApp Business API.
 */
export async function sendWhatsAppConfirmation(
  phone: string,
  referenceNumber: string
): Promise<NotificationResult> {
  console.log(`[Trinfra Notifications] WhatsApp confirmation queued for ${phone}, ref: ${referenceNumber}`);
  // TODO: Connect to WhatsApp Business API
  return NOT_CONFIGURED;
}

/**
 * Send SMS confirmation to the landowner.
 * Currently a placeholder — will be connected to an SMS gateway.
 */
export async function sendSMSConfirmation(
  phone: string,
  referenceNumber: string
): Promise<NotificationResult> {
  console.log(`[Trinfra Notifications] SMS confirmation queued for ${phone}, ref: ${referenceNumber}`);
  // TODO: Connect to SMS gateway (e.g., Twilio, MSG91)
  return NOT_CONFIGURED;
}
