import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema({
  // UPI Payment Settings
  upiEnabled: {
    type: Boolean,
    default: true
  },
  upiAddress: {
    type: String,
    default: '',
    trim: true
  },
  upiQrCode: {
    type: String, // Base64 encoded QR code image
    default: ''
  },
  upiName: {
    type: String,
    default: 'Vasstra Payments',
    trim: true
  },

  // Code/Reference Payment Settings (for codes like phone pay, paytm)
  codePaymentEnabled: {
    type: Boolean,
    default: true
  },
  paymentCodes: [{
    name: {
      type: String,
      enum: ['phonepe', 'paytm', 'googlepay', 'amazon_pay', 'other'],
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    qrCode: {
      type: String, // Base64 encoded QR code image
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema);

export default PaymentSettings;
