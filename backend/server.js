const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://nbbkbsdikayrdocvpmea.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const OPENWA_URL = process.env.OPENWA_URL || '';
const OPENWA_TOKEN = process.env.OPENWA_TOKEN || '';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '919557687044';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const otpStore = {};

app.post('/api/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.json({ success: false, message: 'Invalid phone number' });
    }

    const otp = generateOTP();

    otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    try {
      await supabase.from('otps').upsert(
        { phone, otp, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), verified: false },
        { onConflict: 'phone' }
      );
    } catch (dbErr) {
      console.log('Supabase OTP log skipped:', dbErr.message);
    }

    if (FAST2SMS_API_KEY) {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          numbers: phone,
          variables_values: otp
        })
      });
      const result = await response.json();
      if (!result.return) {
        console.log('Fast2SMS send error:', result);
      }
    } else {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return res.json({ success: true, message: 'OTP Sent Successfully' });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.json({ success: false, message: 'Phone and OTP required' });
    }

    const stored = otpStore[phone];
    if (!stored) {
      return res.json({ success: false, message: 'No OTP sent. Please request OTP first.' });
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return res.json({ success: false, message: 'OTP expired. Please request a new OTP.' });
    }

    if (stored.otp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    delete otpStore[phone];

    try {
      await supabase.from('otps').upsert(
        { phone, otp, expires_at: new Date().toISOString(), verified: true },
        { onConflict: 'phone' }
      );
    } catch (dbErr) {
      console.log('Supabase verify log skipped:', dbErr.message);
    }

    return res.json({ success: true, message: 'OTP Verified' });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { product_id, product_name, quantity, customer_name, phone, address, city, pincode, price } = req.body;

    if (!customer_name || !phone || !address || !city || !pincode || !product_name) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const { data, error } = await supabase.from('orders').insert({
      product_name,
      quantity: quantity || 1,
      customer_name,
      phone,
      address,
      city,
      pincode,
      price: price || '',
      payment_method: 'COD',
      status: 'pending'
    }).select();

    if (error) {
      console.error('Order insert error:', error);
      return res.json({ success: false, message: 'Order placement failed' });
    }

    const order = data[0];

    sendCustomerWhatsApp(order);
    sendAdminWhatsApp(order);

    return res.json({
      success: true,
      message: 'Order placed successfully',
      order_id: order.id
    });
  } catch (err) {
    console.error('orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

async function sendCustomerWhatsApp(order) {
  if (!OPENWA_URL || !OPENWA_TOKEN) return;

  const message = `Hello ${order.customer_name},

Thank you for your order ❤️

Order Number: #${order.id}

Product: ${order.product_name}
Quantity: ${order.quantity}
Total: ${order.price || 'COD'}
Estimated Delivery: 3-7 Working Days

Our team will contact you shortly for confirmation.

Need help?
WhatsApp: +91 9557687044`;

  try {
    await fetch(`${OPENWA_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENWA_TOKEN}`
      },
      body: JSON.stringify({
        to: order.phone,
        text: message
      })
    });
  } catch (err) {
    console.error('Customer WhatsApp error:', err);
  }
}

async function sendAdminWhatsApp(order) {
  if (!OPENWA_URL || !OPENWA_TOKEN) return;

  const message = `🔔 *NEW ORDER - AL SHIFA HERB*

Customer: ${order.customer_name}
Phone: ${order.phone}
Address: ${order.address}, ${order.city}, ${order.pincode}
Product: ${order.product_name}
Quantity: ${order.quantity}
Order ID: #${order.id}
Payment: ${order.payment_method || 'COD'}
Date: ${new Date().toLocaleString('en-IN')}`;

  try {
    await fetch(`${OPENWA_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENWA_TOKEN}`
      },
      body: JSON.stringify({
        to: ADMIN_PHONE,
        text: message
      })
    });
  } catch (err) {
    console.error('Admin WhatsApp error:', err);
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AL SHIFA HERB Backend running on port ${PORT}`);
  console.log(`OTP: ${FAST2SMS_API_KEY ? 'Fast2SMS enabled' : 'DEV MODE (OTPs logged to console)'}`);
  console.log(`WhatsApp: ${OPENWA_URL ? 'Connected to ' + OPENWA_URL : 'DISABLED - set OPENWA_URL'}`);
});
