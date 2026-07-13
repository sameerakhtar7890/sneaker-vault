import asyncHandler from 'express-async-handler';
import EmailTemplate from '../models/EmailTemplate.js';
import { sendMail } from '../utils/email.js';

const TEMPLATE_DEFAULTS = {
  order_confirmation: {
    label: 'Order Confirmation',
    subject: 'Order Confirmed — #{orderId} | Sneaker Vault',
    headerTitle: 'Order Confirmed',
    bodyText: "Thank you for your order! We've received your payment and your kicks are being prepared for the vault.",
    ctaText: 'Track Your Order',
    footerText: 'Questions? Reply to this email or visit our store.',
    accentColor: '#d4af37',
    logoText: 'Sneaker Vault'
  },
  newsletter_welcome: {
    label: 'Newsletter Welcome',
    subject: "Welcome to Sneaker Vault — You're subscribed",
    headerTitle: "You're on the list",
    bodyText: "Thanks for subscribing. You'll be first to hear about exclusive drops, restocks, and vault-only offers.",
    ctaText: 'Explore the Vault',
    footerText: 'You can unsubscribe anytime.',
    accentColor: '#d4af37',
    logoText: 'Sneaker Vault'
  },
  password_reset: {
    label: 'Password Reset',
    subject: 'Reset Password Request | Sneaker Vault',
    headerTitle: 'Reset Your Password',
    bodyText: "We received a request to reset the password for your Sneaker Vault account. Click the button below to set a new password.",
    ctaText: 'Reset Password',
    footerText: 'This link is valid for 1 hour. If you did not request this, you can safely ignore this email.',
    accentColor: '#d4af37',
    logoText: 'Sneaker Vault'
  },
  back_in_stock: {
    label: 'Back In Stock Alert',
    subject: '🔥 Restock Alert: #{productName} is Back in Stock!',
    headerTitle: 'Back In Stock!',
    bodyText: "Great news! A pair you've been eyeing is back in the vault and ready for you. Don't wait — stock is highly limited.",
    ctaText: 'Grab Yours Now',
    footerText: 'You received this because you subscribed to a stock alert for this product.',
    accentColor: '#d4af37',
    logoText: 'Sneaker Vault'
  }
};

const TEMPLATE_KEYS = Object.keys(TEMPLATE_DEFAULTS);

/** Ensures all 4 template documents exist in DB */
async function ensureTemplates() {
  for (const key of TEMPLATE_KEYS) {
    const exists = await EmailTemplate.findOne({ templateKey: key });
    if (!exists) {
      await EmailTemplate.create({
        templateKey: key,
        label: TEMPLATE_DEFAULTS[key].label,
        isActive: true
      });
    }
  }
}

/**
 * GET /api/email-templates
 * Returns all templates merged with defaults
 */
export const listEmailTemplates = asyncHandler(async (req, res) => {
  await ensureTemplates();
  const docs = await EmailTemplate.find({}).sort({ templateKey: 1 }).lean();

  const merged = docs.map(doc => ({
    ...doc,
    defaults: TEMPLATE_DEFAULTS[doc.templateKey] || {}
  }));

  res.json(merged);
});

/**
 * GET /api/email-templates/:key
 */
export const getEmailTemplate = asyncHandler(async (req, res) => {
  await ensureTemplates();
  const doc = await EmailTemplate.findOne({ templateKey: req.params.key }).lean();
  if (!doc) { res.status(404); throw new Error('Template not found'); }
  res.json({ ...doc, defaults: TEMPLATE_DEFAULTS[req.params.key] || {} });
});

/**
 * PUT /api/email-templates/:key
 */
export const updateEmailTemplate = asyncHandler(async (req, res) => {
  const { subject, headerTitle, bodyText, ctaText, footerText, accentColor, logoText, isActive } = req.body;

  let doc = await EmailTemplate.findOne({ templateKey: req.params.key });
  if (!doc) { res.status(404); throw new Error('Template not found'); }

  if (subject      !== undefined) doc.subject      = subject;
  if (headerTitle  !== undefined) doc.headerTitle  = headerTitle;
  if (bodyText     !== undefined) doc.bodyText     = bodyText;
  if (ctaText      !== undefined) doc.ctaText      = ctaText;
  if (footerText   !== undefined) doc.footerText   = footerText;
  if (accentColor  !== undefined) doc.accentColor  = accentColor;
  if (logoText     !== undefined) doc.logoText     = logoText;
  if (isActive     !== undefined) doc.isActive     = isActive;

  const updated = await doc.save();
  res.json({ ...updated.toObject(), defaults: TEMPLATE_DEFAULTS[req.params.key] || {} });
});

/**
 * POST /api/email-templates/:key/reset
 * Clears all overrides back to defaults
 */
export const resetEmailTemplate = asyncHandler(async (req, res) => {
  const doc = await EmailTemplate.findOne({ templateKey: req.params.key });
  if (!doc) { res.status(404); throw new Error('Template not found'); }

  doc.subject     = '';
  doc.headerTitle = '';
  doc.bodyText    = '';
  doc.ctaText     = '';
  doc.footerText  = '';
  doc.accentColor = '';
  doc.logoText    = '';

  await doc.save();
  res.json({ message: 'Template reset to defaults' });
});

/**
 * POST /api/email-templates/:key/send-test
 * Sends a test email using the current template config
 */
export const sendTestEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Target email is required'); }

  const { key } = req.params;
  const doc = await EmailTemplate.findOne({ templateKey: key }).lean();
  const defaults = TEMPLATE_DEFAULTS[key] || {};

  const subject      = (doc?.subject      || defaults.subject      || 'Test Email').replace(/#{.*?}/g, '[SAMPLE]');
  const headerTitle  =  doc?.headerTitle  || defaults.headerTitle  || 'Test Email';
  const bodyText     =  doc?.bodyText     || defaults.bodyText     || 'This is a test email.';
  const ctaText      =  doc?.ctaText      || defaults.ctaText      || 'Click Here';
  const footerText   =  doc?.footerText   || defaults.footerText   || '';
  const accent       =  doc?.accentColor  || defaults.accentColor  || '#d4af37';
  const logo         =  doc?.logoText     || defaults.logoText     || 'Sneaker Vault';

  const html = buildPreviewHtml({ headerTitle, bodyText, ctaText, footerText, accent, logo, ctaHref: '#' });

  await sendMail({ to: email, subject: `[TEST] ${subject}`, html, text: `TEST: ${bodyText}` });

  res.json({ message: `Test email sent to ${email}` });
});

export function buildPreviewHtml({ headerTitle, bodyText, ctaText, footerText, accent, logo, ctaHref = '#' }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:${accent};text-transform:uppercase;">${logo}</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">${headerTitle}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">${bodyText}</p>
            <a href="${ctaHref}" style="display:inline-block;background:${accent};color:#0f0f14;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:bold;">${ctaText}</a>
          </td>
        </tr>
        ${footerText ? `<tr>
          <td style="padding:24px 40px;border-top:1px solid #2a2a35;">
            <p style="margin:0;color:#52525b;font-size:12px;text-align:center;">${footerText}</p>
          </td>
        </tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export { TEMPLATE_DEFAULTS };
