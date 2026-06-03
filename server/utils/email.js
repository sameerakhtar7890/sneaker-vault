import nodemailer from 'nodemailer';

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

export function buildOrderConfirmationEmail(recipient, order) {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const emailParam = encodeURIComponent(order.confirmation_email || recipient.email);
  const trackUrl = order.is_guest
    ? `${APP_URL}/order/${order._id}?email=${emailParam}`
    : `${APP_URL}/order/${order._id}`;

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
            <h1 style="margin:0;font-size:28px;color:#fafafa;font-weight:normal;">Order Confirmed</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#a1a1aa;font-size:15px;">Hi ${recipient.name || 'there'},</p>
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
              Thank you for your order! We've received your payment and your kicks are being prepared for the vault.
            </p>
            <p style="margin:0 0 24px;color:#71717a;font-size:13px;">
              Order <strong style="color:#d4af37;">#${orderId}</strong> · ${new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${orderItemsHtml(order.cart_items)}
            </table>
            ${order.discount_amount > 0 ? `
            <p style="margin:0 0 8px;color:#4ade80;font-size:14px;text-align:right;">
              Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}: -$${order.discount_amount.toFixed(2)}
            </p>` : ''}
            <p style="margin:0 0 32px;color:#fafafa;font-size:20px;text-align:right;">
              Total: <span style="color:#d4af37;">$${order.total_price.toFixed(2)}</span>
            </p>
            <a href="${trackUrl}" style="display:inline-block;background:#d4af37;color:#0f0f14;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:bold;">
              Track Your Order
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #2a2a35;">
            <p style="margin:0;color:#52525b;font-size:12px;text-align:center;">
              Questions? Reply to this email or visit our store.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${recipient.name || 'there'},\n\nYour Sneaker Vault order #${orderId} is confirmed.\nTotal: $${order.total_price.toFixed(2)}\n\nTrack your order: ${trackUrl}`;

  return {
    subject: `Order Confirmed — #${orderId} | Sneaker Vault`,
    html,
    text
  };
}

export async function sendOrderConfirmationEmail(recipient, order) {
  const { subject, html, text } = buildOrderConfirmationEmail(recipient, order);
  return sendMail({ to: recipient.email, subject, html, text });
}
