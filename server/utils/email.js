import nodemailer from 'nodemailer';
import EmailTemplate from '../models/EmailTemplate.js';

async function getTemplateOverrides(key) {
  try {
    const doc = await EmailTemplate.findOne({ templateKey: key }).lean();
    if (doc && doc.isActive !== false) {
      return doc;
    }
  } catch (err) {
    console.error('Error fetching template overrides:', err.message);
  }
  return null;
}

const FROM = process.env.EMAIL_FROM || 'Sneaker Vault <orders@sneakervault.com>';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:3000';

function getTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

export async function sendMail({ to, subject, html, text }) {
  const transport = getTransport();

  if (!transport) {
    console.log('\n📧 ─── EMAIL (dev mode — SMTP not configured) ───');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html.replace(/<[^>]+>/g, ' ').slice(0, 500));
    console.log('Configure SMTP_HOST, SMTP_USER, SMTP_PASS in server/.env to send real emails.\n');
    return { success: true, dev: true };
  }

  try {
    await transport.sendMail({ from: FROM, to, subject, html, text });
    return { success: true, dev: false };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

function orderItemsHtml(items) {
  return items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a35;color:#e4e4e7;">
        ${item.name}<br>
        <span style="font-size:12px;color:#71717a;">Size ${item.size} × ${item.qty}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a35;color:#d4af37;text-align:right;">
        $${(item.price * item.qty).toFixed(2)}
      </td>
    </tr>
  `).join('');
}

export function buildOrderConfirmationEmail(recipient, order, overrides = null) {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const emailParam = encodeURIComponent(order.confirmation_email || recipient.email);
  const trackUrl = order.is_guest
    ? `${APP_URL}/order/${order._id}?email=${emailParam}`
    : `${APP_URL}/order/${order._id}`;

  const accent = overrides?.accentColor || '#d4af37';
  const logo = overrides?.logoText || 'Sneaker Vault';
  const header = overrides?.headerTitle || 'Order Confirmed';
  
  let body = overrides?.bodyText || "Thank you for your order! We've received your payment and your kicks are being prepared for the vault.";
  body = body.replace(/#{customerName}/g, recipient.name || 'there')
             .replace(/#{orderId}/g, orderId)
             .replace(/#{totalPrice}/g, `$${order.total_price.toFixed(2)}`);

  const cta = overrides?.ctaText || 'Track Your Order';
  const footer = overrides?.footerText || 'Questions? Reply to this email or visit our store.';

  let subjectLine = overrides?.subject || `Order Confirmed — #${orderId} | Sneaker Vault`;
  subjectLine = subjectLine.replace(/#{customerName}/g, recipient.name || 'there')
                           .replace(/#{orderId}/g, orderId)
                           .replace(/#{totalPrice}/g, `$${order.total_price.toFixed(2)}`);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:${accent};text-transform:uppercase;">${logo}</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">${header}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#a1a1aa;font-size:15px;">Hi ${recipient.name || 'there'},</p>
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
              ${body}
            </p>
            <p style="margin:0 0 24px;color:#71717a;font-size:13px;">
              Order <strong style="color:${accent};">#${orderId}</strong> · ${new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${orderItemsHtml(order.cart_items)}
            </table>
            ${order.discount_amount > 0 ? `
            <p style="margin:0 0 8px;color:#4ade80;font-size:14px;text-align:right;">
              Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}: -$${order.discount_amount.toFixed(2)}
            </p>` : ''}
            <p style="margin:0 0 8px;color:#a1a1aa;font-size:14px;text-align:right;">
              Shipping: ${order.shipping_cost > 0 ? `$${order.shipping_cost.toFixed(2)}` : 'Free'}
            </p>
            <p style="margin:0 0 32px;color:#fafafa;font-size:20px;text-align:right;">
              Total: <span style="color:${accent};">$${order.total_price.toFixed(2)}</span>
            </p>
            <a href="${trackUrl}" style="display:inline-block;background:${accent};color:#0f0f14;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:bold;">
              ${cta}
            </a>
          </td>
        </tr>
        ${footer ? `<tr>
          <td style="padding:24px 40px;border-top:1px solid #2a2a35;">
            <p style="margin:0;color:#52525b;font-size:12px;text-align:center;">
              ${footer}
            </p>
          </td>
        </tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${recipient.name || 'there'},\n\n${body}\nTotal: $${order.total_price.toFixed(2)}\n\nTrack your order: ${trackUrl}`;

  return {
    subject: subjectLine,
    html,
    text
  };
}

export async function sendOrderConfirmationEmail(recipient, order) {
  const overrides = await getTemplateOverrides('order_confirmation');
  const { subject, html, text } = buildOrderConfirmationEmail(recipient, order, overrides);
  return sendMail({ to: recipient.email, subject, html, text });
}

export function buildNewsletterWelcomeEmail(email, unsubscribeUrl, overrides = null) {
  const accent = overrides?.accentColor || '#d4af37';
  const logo = overrides?.logoText || 'Sneaker Vault';
  const header = overrides?.headerTitle || "You're on the list";
  
  let body = overrides?.bodyText || "Thanks for subscribing. You'll be first to hear about exclusive drops, restocks, and vault-only offers.";
  body = body.replace(/#{email}/g, email);

  const cta = overrides?.ctaText || 'Explore the Vault';
  const footer = overrides?.footerText || '';

  let subjectLine = overrides?.subject || "Welcome to Sneaker Vault — You're subscribed";
  subjectLine = subjectLine.replace(/#{email}/g, email);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:${accent};text-transform:uppercase;">${logo}</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">${header}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#a1a1aa;font-size:15px;line-height:1.6;">
              ${body}
            </p>
            <p style="margin:0 0 24px;color:#71717a;font-size:13px;">Subscribed as <strong style="color:#e4e4e7;">${email}</strong></p>
            <a href="${APP_URL}/shop" style="display:inline-block;background:${accent};color:#0a0a0f;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;">${cta}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #2a2a35;">
            <p style="margin:0;font-size:11px;color:#52525b;line-height:1.5;">
              <a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a> from these emails anytime.
              ${footer ? `<br><span style="color:#52525b;margin-top:8px;display:inline-block;">${footer}</span>` : ''}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `You're subscribed to Sneaker Vault updates at ${email}. Shop: ${APP_URL}/shop. Unsubscribe: ${unsubscribeUrl}`;

  return {
    subject: subjectLine,
    html,
    text
  };
}

export async function sendNewsletterWelcomeEmail(email, unsubscribeToken) {
  const unsubscribeUrl = `${APP_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const overrides = await getTemplateOverrides('newsletter_welcome');
  const { subject, html, text } = buildNewsletterWelcomeEmail(email, unsubscribeUrl, overrides);
  return sendMail({ to: email, subject, html, text });
}

export function buildPasswordResetEmail(recipient, resetUrl, overrides = null) {
  const accent = overrides?.accentColor || '#d4af37';
  const logo = overrides?.logoText || 'Sneaker Vault';
  const header = overrides?.headerTitle || 'Reset Your Password';
  
  let body = overrides?.bodyText || "We received a request to reset the password for your Sneaker Vault account. Click the button below to set a new password.";
  body = body.replace(/#{customerName}/g, recipient.name || 'there');

  const cta = overrides?.ctaText || 'Reset Password';
  const footer = overrides?.footerText || 'This link is valid for 1 hour. If you did not request this, you can safely ignore this email.';

  let subjectLine = overrides?.subject || 'Reset Password Request | Sneaker Vault';
  subjectLine = subjectLine.replace(/#{customerName}/g, recipient.name || 'there');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:${accent};text-transform:uppercase;">${logo}</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">${header}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#a1a1aa;font-size:15px;line-height:1.6;">
              Hi ${recipient.name || 'there'},
            </p>
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
              ${body}
            </p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;background:${accent};color:#0a0a0f;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;">${cta}</a>
            </div>
            <p style="margin:0 0 24px;color:#71717a;font-size:13px;line-height:1.5;">
              ${footer}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #2a2a35;">
            <p style="margin:0;font-size:11px;color:#52525b;line-height:1.5;text-align:center;">
              If the button above doesn't work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color:#71717a;word-break:break-all;">${resetUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${recipient.name || 'there'},\n\n${body}\n\n${resetUrl}`;

  return {
    subject: subjectLine,
    html,
    text
  };
}

export async function sendPasswordResetEmail(recipient, resetUrl) {
  const overrides = await getTemplateOverrides('password_reset');
  const { subject, html, text } = buildPasswordResetEmail(recipient, resetUrl, overrides);
  return sendMail({ to: recipient.email, subject, html, text });
}

export function buildContactReceiptEmail(name, email, subject, message) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:#d4af37;text-transform:uppercase;">Sneaker Vault</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">Message Received</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#a1a1aa;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
              Thank you for contacting Sneaker Vault. We've received your message regarding <strong>${subject}</strong> and will get back to you within 24 hours.
            </p>
            <div style="background:#0f0f14;border-radius:12px;padding:20px;border:1px solid #2a2a35;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;color:#71717a;text-transform:uppercase;">Your Message Summary</p>
              <p style="margin:0;color:#e4e4e7;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
            <a href="${APP_URL}/shop" style="display:inline-block;background:#d4af37;color:#0a0a0f;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;">Visit the Vault</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #2a2a35;">
            <p style="margin:0;color:#52525b;font-size:12px;text-align:center;">
              Sneaker Vault Support · This is an automated receipt confirmation.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${name},\n\nThank you for contacting Sneaker Vault. We have received your inquiry about "${subject}". Our team will respond within 24 hours.\n\nYour message:\n${message}`;

  return {
    subject: `We've received your message — #${Date.now().toString().slice(-6)} | Sneaker Vault`,
    html,
    text
  };
}

export function buildContactAdminNotificationEmail(name, email, subject, message) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:#d4af37;text-transform:uppercase;">Admin Notification</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">New Contact Inquiry</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a35;color:#71717a;font-size:13px;width:100px;">From Name</td>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a35;color:#fafafa;font-size:14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a35;color:#71717a;font-size:13px;">From Email</td>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a35;color:#d4af37;font-size:14px;"><a href="mailto:${email}" style="color:#d4af37;text-decoration:none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a35;color:#71717a;font-size:13px;">Subject</td>
                <td style="padding:8px 0;border-bottom:1px solid #2a2a35;color:#fafafa;font-size:14px;font-weight:bold;">${subject}</td>
              </tr>
            </table>
            
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;color:#71717a;text-transform:uppercase;">Message Details</p>
            <div style="background:#0f0f14;border-radius:12px;padding:20px;border:1px solid #2a2a35;">
              <p style="margin:0;color:#e4e4e7;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `New Contact Form Submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`;

  return {
    subject: `[New Inquiry] ${subject} — From ${name}`,
    html,
    text
  };
}

export async function sendContactEmails({ name, email, subject, message }) {
  const adminEmail = process.env.SMTP_USER || 'support@sneakervault.com';

  const userReceipt = buildContactReceiptEmail(name, email, subject, message);
  const adminAlert = buildContactAdminNotificationEmail(name, email, subject, message);

  const [resUser, resAdmin] = await Promise.all([
    sendMail({ to: email, subject: userReceipt.subject, html: userReceipt.html, text: userReceipt.text }),
    sendMail({ to: adminEmail, subject: adminAlert.subject, html: adminAlert.html, text: adminAlert.text })
  ]);

  return {
    userMail: resUser,
    adminMail: resAdmin,
    success: resUser.success || resAdmin.success
  };
}

export function buildBackInStockEmail(email, product, overrides = null) {
  const productUrl = `${APP_URL}/product/${product.slug}`;
  
  const accent = overrides?.accentColor || '#d4af37';
  const logo = overrides?.logoText || 'Sneaker Vault Restock';
  const header = overrides?.headerTitle || 'Back In Stock!';
  
  let body = overrides?.bodyText || "Great news! A pair you've been eyeing is back in the vault and ready for you. Don't wait — stock is highly limited.";
  body = body.replace(/#{productName}/g, product.name)
             .replace(/#{brand}/g, product.brand)
             .replace(/#{price}/g, product.price);

  const cta = overrides?.ctaText || 'Grab Yours Now';
  const footer = overrides?.footerText || 'You received this because you subscribed to a stock alert for this product.';

  let subjectLine = overrides?.subject || `🔥 Restock Alert: ${product.name} is Back in Stock!`;
  subjectLine = subjectLine.replace(/#{productName}/g, product.name)
                           .replace(/#{brand}/g, product.brand)
                           .replace(/#{price}/g, product.price);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:${accent};text-transform:uppercase;">${logo}</p>
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">${header}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;text-align:center;">
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:16px;line-height:1.6;text-align:left;">
              ${body}
            </p>
            
            <div style="background:#0f0f14;border-radius:12px;padding:24px;border:1px solid #2a2a35;margin-bottom:32px;display:inline-block;width:100%;box-sizing:border-box;">
              <img src="${product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'}" alt="${product.name}" style="max-width:200px;border-radius:8px;margin-bottom:16px;display:inline-block;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.2em;color:#71717a;text-transform:uppercase;">${product.brand}</p>
              <h3 style="margin:0 0 8px;color:#fafafa;font-size:20px;font-weight:normal;">${product.name}</h3>
              <p style="margin:0 0 16px;color:${accent};font-size:18px;font-weight:bold;">$${product.price}</p>
              <a href="${productUrl}" style="display:inline-block;background:${accent};color:#0a0a0f;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;">${cta}</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #2a2a35;">
            <p style="margin:0;font-size:11px;color:#52525b;line-height:1.5;text-align:center;">
              ${footer}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Good news! ${product.brand} ${product.name} is back in stock at Sneaker Vault.\nPrice: $${product.price}\nShop now: ${productUrl}`;

  return {
    subject: subjectLine,
    html,
    text
  };
}

export async function sendBackInStockEmail(email, product) {
  const overrides = await getTemplateOverrides('back_in_stock');
  const { subject, html, text } = buildBackInStockEmail(email, product, overrides);
  return sendMail({ to: email, subject, html, text });
}


