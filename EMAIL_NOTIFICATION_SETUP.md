# 📧 Email Notification System Setup Guide

## Overview
Your Vasstra e-commerce platform now has a complete email notification system that sends emails to users for:
- ✅ **Registration** - Welcome email when user creates an account
- ✅ **Login** - Security notification when user logs in
- ✅ **Order Confirmation** - Detailed order confirmation with items and total
- ✅ **Order Status Updates** - Notifications when order is shipped/delivered

---

## 🚀 Quick Start

### Step 1: Set Up Gmail App Password

1. **Go to Gmail Security Settings**
   - Visit: https://myaccount.google.com/apppasswords
   - You must have 2-factor authentication enabled on your Gmail account

2. **Generate App Password**
   - Select "Mail" and "Windows Computer" (or your device)
   - Click "Generate"
   - Copy the 16-character password

3. **Set Environment Variables**
   Add to your `.env` file or environment settings:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   FRONTEND_URL=https://yourdomain.com
   ```

### Step 2: Restart Backend Server
After setting environment variables, restart your backend server:
```bash
cd server
npm run dev
```

You should see in the logs:
```
✅ Mail service is ready to send emails
```

If you see a warning:
```
⚠️ Mail service not configured
```
Please check your EMAIL_USER and EMAIL_PASSWORD variables.

---

## 📧 Email Templates

### 1. Registration Email
**Sent when:** User creates a new account
**Contains:**
- Personalized welcome message
- Benefits of joining (exclusive deals, order tracking, etc.)
- "Shop Now" button
- Account security notice

### 2. Login Notification Email
**Sent when:** User logs in
**Contains:**
- Login time and date (in IST)
- Security notice
- Instructions to secure account if unauthorized

### 3. Order Confirmation Email
**Sent when:** Order is created
**Contains:**
- Order ID
- List of items with quantity and prices
- Total amount
- Estimated delivery timeframe (5-7 business days)
- Next steps notification

### 4. Order Status Update Email
**Sent when:** Admin updates order status
**Contains:**
- Order ID
- New status (confirmed, shipped, delivered, etc.)
- Status-specific message
- Tracking ID (if available for shipped/delivered orders)

---

## 🔧 Technical Implementation

### File Structure
```
server/
├── services/
│   └── mailService.js          # Email service with templates
├── routes/
│   ├── auth.js                 # Registration & Login emails
│   └── orders.js               # Order confirmation & status emails
├── .env                        # Configuration (EMAIL_USER, EMAIL_PASSWORD)
└── package.json               # nodemailer dependency
```

### Key Functions

#### Signup Email
```javascript
// In auth.js - POST /signup
sendRegistrationEmail(user.email, user.name)
```

#### Login Email
```javascript
// In auth.js - POST /login
sendLoginNotificationEmail(user.email, user.name, loginTime)
```

#### Order Confirmation
```javascript
// In orders.js - POST /
sendOrderConfirmationEmail(
  user.email,
  user.name,
  order._id,
  order.items,
  order.totalAmount,
  estimatedDelivery
)
```

#### Order Status Update
```javascript
// In orders.js - PUT /:id/status
sendOrderStatusEmail(
  order.userId.email,
  order.userId.name,
  order._id,
  status,
  trackingId
)
```

---

## 🔐 Security Notes

1. **Email Service Uses Gmail**
   - App Password is more secure than regular password
   - Enable 2FA on your Gmail account

2. **Emails Fail Gracefully**
   - If email sending fails, the main operation (signup, order) still succeeds
   - Email failures are logged but don't block user operations

3. **Environment Variables**
   - Never commit `.env` file with real credentials to git
   - Use `.env.example` as a template

---

## ✅ Testing Email Notifications

### Test Registration Email
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login Email
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Order Confirmation
```bash
# First authenticate
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | jq -r '.token')

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "name": "Sample Dress",
        "price": 5000,
        "quantity": 1
      }
    ],
    "totalAmount": 5000,
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001"
    },
    "paymentMethod": "upi"
  }'
```

---

## 🐛 Troubleshooting

### Issue: "Mail service not configured"
**Solution:**
- Check EMAIL_USER and EMAIL_PASSWORD in environment variables
- Verify Gmail App Password is correct (should be 16 characters)
- Ensure 2FA is enabled on Gmail account

### Issue: Emails not sending
**Solution:**
- Check backend logs for error messages
- Verify email credentials are correct
- Check if SMTP port (587) is not blocked by firewall
- Test with a simpler email service (like Mailtrap.io for testing)

### Issue: User info not in email
**Solution:**
- Ensure user.name and user.email are populated
- Check database for user records

---

## 🎯 Admin Dashboard

### Email Notifications are Automatic
- ✅ Registration: Auto-sent when user signs up
- ✅ Login: Auto-sent each time user logs in
- ✅ Order Confirmation: Auto-sent when order is created
- ✅ Status Updates: Auto-sent when admin updates order status from Admin Dashboard → Orders tab

### To Send Order Status Email
1. Go to **Admin Dashboard** → **Orders Tab**
2. Click on an order to view details
3. Update the **"Order Status"** dropdown
4. Click **"Update"**
5. Email will be automatically sent to customer

---

## 📱 Customization

### Change Email Template
Edit `server/services/mailService.js`:
- `getRegistrationEmailTemplate()`
- `getLoginNotificationTemplate()`
- `getOrderConfirmationTemplate()`
- `getOrderStatusTemplate()`

### Change Email Service
To use a different email provider (SendGrid, AWS SES, etc.):
1. Update the transporter configuration in `mailService.js`
2. Update environment variables accordingly

### Change Estimated Delivery Time
In `server/routes/orders.js`, update:
```javascript
const estimatedDelivery = '5-7 business days'; // Change this value
```

---

## 📊 Email Service Flow Diagram

```
User Registration
       ↓
    signup() → sendRegistrationEmail()
       ↓
   Gmail SMTP
       ↓
   User Email

User Login
       ↓
    login() → sendLoginNotificationEmail()
       ↓
   Gmail SMTP
       ↓
   User Email

Order Creation
       ↓
  POST /orders → sendOrderConfirmationEmail()
       ↓
   Gmail SMTP
       ↓
   User Email

Status Update (Admin)
       ↓
 PUT /orders/:id/status → sendOrderStatusEmail()
       ↓
   Gmail SMTP
       ↓
   User Email
```

---

## 🎉 Features Summary

| Event | Email Sent | Status | Template |
|-------|-----------|--------|----------|
| User Registration | ✅ Yes | Auto | Welcome Email |
| User Login | ✅ Yes | Auto | Login Notification |
| Order Confirmation | ✅ Yes | Auto | Order Details |
| Order Shipped | ✅ Yes | Auto (Admin Trigger) | Tracking Info |
| Order Delivered | ✅ Yes | Auto (Admin Trigger) | Delivery Confirmation |

---

## 📞 Support

For issues or customizations:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify environment variables are set correctly
4. Test with sample requests using curl or Postman

---

**Email Notification System Successfully Implemented! 🚀**
