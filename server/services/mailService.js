import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transporter
// Using Gmail or environment variables for email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️ Mail service not configured:', error.message);
    console.log('📧 To enable email notifications, set EMAIL_USER and EMAIL_PASSWORD environment variables');
  } else {
    console.log('✅ Mail service is ready to send emails');
  }
});

// Email template for registration
const getRegistrationEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #8B2F39 0%, #000000 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 20px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 15px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; }
        .button { background-color: #D4AF37; color: #000; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block; margin: 15px 0; }
        .footer { background-color: #f9f9f9; padding: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
        .highlight { color: #8B2F39; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Vasstra</h1>
          <p>Ethnic Elegance</p>
        </div>
        <div class="content">
          <div class="greeting">Hello <span class="highlight">${userName}</span>,</div>
          <div class="message">
            <p>Welcome to Vasstra! Your account has been successfully created.</p>
            <p>We're excited to have you join our community of fashion enthusiasts. You now have access to:</p>
            <ul>
              <li>Exclusive ethnic and western wear collections</li>
              <li>Special discounts and offers</li>
              <li>Order tracking and management</li>
              <li>Personalized shopping experience</li>
            </ul>
            <p>Start exploring our latest collections and discover your next favorite outfit!</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://vasstra.com'}" class="button">Shop Now</a>
        </div>
        <div class="footer">
          <p>If you have any questions, contact us at support@vasstra.com</p>
          <p>&copy; 2024 Vasstra. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for login notification
const getLoginNotificationTemplate = (userName, loginTime) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #8B2F39 0%, #000000 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; }
        .info-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0; }
        .footer { background-color: #f9f9f9; padding: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
        .highlight { color: #8B2F39; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Login Notification</h1>
        </div>
        <div class="content">
          <div class="message">
            <p>Hi <span class="highlight">${userName}</span>,</p>
            <p>We detected a login to your Vasstra account at:</p>
          </div>
          <div class="info-box">
            <strong>Time:</strong> ${loginTime}<br>
            <p><strong>If this wasn't you,</strong> please secure your account immediately by changing your password.</p>
          </div>
          <p style="font-size: 14px; color: #666;">Thank you for shopping with Vasstra!</p>
        </div>
        <div class="footer">
          <p>If you have any concerns, contact us at support@vasstra.com</p>
          <p>&copy; 2024 Vasstra. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order confirmation
const getOrderConfirmationTemplate = (userName, orderId, items, totalAmount, estimatedDelivery) => {
  const itemsHTML = items.map(item => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px;">${item.name}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${item.price.toLocaleString()}</td>
      <td style="padding: 10px; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #8B2F39 0%, #000000 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .order-number { font-size: 18px; margin-top: 10px; }
        .content { padding: 20px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #D4AF37; }
        .total-row { background-color: #f9f9f9; font-weight: bold; font-size: 16px; }
        .info-box { background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
        .footer { background-color: #f9f9f9; padding: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
        .highlight { color: #8B2F39; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
          <div class="order-number">Order ID: <span class="highlight">#${orderId.substring(orderId.length - 8).toUpperCase()}</span></div>
        </div>
        <div class="content">
          <p>Hi <span class="highlight">${userName}</span>,</p>
          <p>Thank you for your order! We've received it and will start processing right away.</p>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr class="total-row">
                <td colspan="3" style="padding: 15px; text-align: right;">Total Amount:</td>
                <td style="padding: 15px; text-align: right;">₹${totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="info-box">
            <strong>📦 Estimated Delivery:</strong> ${estimatedDelivery}<br>
            <p>You'll receive tracking information via email once your order ships.</p>
          </div>

          <p style="font-size: 14px; color: #666;">We appreciate your business and hope you love your purchase!</p>
        </div>
        <div class="footer">
          <p>For order updates and tracking, login to your account on our website.</p>
          <p>Contact: support@vasstra.com</p>
          <p>&copy; 2024 Vasstra. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order status update
const getOrderStatusTemplate = (userName, orderId, newStatus, trackingId) => {
  const statusMessages = {
    confirmed: { title: '✓ Order Confirmed', message: 'Your order has been confirmed and is being prepared for shipment.' },
    processing: { title: '⚙️ Processing', message: 'We are processing your order and will ship it soon.' },
    shipped: { title: '📦 Order Shipped', message: 'Your order is on its way! Use the tracking ID below to track your package.' },
    delivered: { title: '✅ Order Delivered', message: 'Your order has been delivered. We hope you enjoy your purchase!' },
    cancelled: { title: '❌ Order Cancelled', message: 'Your order has been cancelled. Please contact support if you have any questions.' }
  };

  const statusInfo = statusMessages[newStatus] || statusMessages.confirmed;

  let trackingInfo = '';
  if (trackingId && (newStatus === 'shipped' || newStatus === 'delivered')) {
    trackingInfo = `
      <div class="info-box">
        <strong>📍 Tracking ID:</strong> ${trackingId}<br>
        <p>Use this ID to track your package on the carrier's website.</p>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #8B2F39 0%, #000000 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; }
        .info-box { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0; }
        .footer { background-color: #f9f9f9; padding: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
        .highlight { color: #8B2F39; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusInfo.title}</h1>
        </div>
        <div class="content">
          <p>Hi <span class="highlight">${userName}</span>,</p>
          <p>${statusInfo.message}</p>
          
          <div class="info-box">
            <strong>Order ID:</strong> #${orderId.substring(orderId.length - 8).toUpperCase()}<br>
            <strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
          </div>

          ${trackingInfo}

          <p style="font-size: 14px; color: #666;">Thank you for shopping with Vasstra!</p>
        </div>
        <div class="footer">
          <p>Contact: support@vasstra.com</p>
          <p>&copy; 2024 Vasstra. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send email
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@vasstra.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Don't throw error - fail silently so it doesn't break the main operation
    return { success: false, error: error.message };
  }
};

// Send registration confirmation email
export const sendRegistrationEmail = async (email, name) => {
  const subject = '🎉 Welcome to Vasstra - Your Account is Ready!';
  const html = getRegistrationEmailTemplate(name);
  return sendEmail(email, subject, html);
};

// Send login notification email
export const sendLoginNotificationEmail = async (email, name, loginTime) => {
  const subject = '🔐 Login to Your Vasstra Account';
  const html = getLoginNotificationTemplate(name, loginTime);
  return sendEmail(email, subject, html);
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, name, orderId, items, totalAmount, estimatedDelivery = '5-7 business days') => {
  const subject = '✅ Order Confirmed - Vasstra Fashion';
  const html = getOrderConfirmationTemplate(name, orderId, items, totalAmount, estimatedDelivery);
  return sendEmail(email, subject, html);
};

// Send order status update email
export const sendOrderStatusEmail = async (email, name, orderId, status, trackingId = null) => {
  const subject = `📦 Your Vasstra Order ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  const html = getOrderStatusTemplate(name, orderId, status, trackingId);
  return sendEmail(email, subject, html);
};
