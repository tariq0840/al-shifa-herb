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
const ADMIN_PHONE = process.env.ADMIN_PHONE || '9119084044';
const OPENWA_SESSION = process.env.OPENWA_SESSION || '1807ae98-6886-42bb-8584-690cbb79b2e0';

const ITL_ACCESS_TOKEN = process.env.ITL_ACCESS_TOKEN || '';
const ITL_SECRET_KEY = process.env.ITL_SECRET_KEY || '';
const ITL_PICKUP_ADDRESS_ID = process.env.ITL_PICKUP_ADDRESS_ID || '';
const ITL_RETURN_ADDRESS_ID = process.env.ITL_RETURN_ADDRESS_ID || '';

const SITE_URL = process.env.SITE_URL || 'https://tariq0840.github.io/al-shifa-herb';

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

    return res.json({
      success: true,
      message: 'OTP Sent Successfully',
      otp
    });
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
    const { items, total_amount, customer_name, phone, address, city, pincode, payment_method } = req.body;

    if (!customer_name || !phone || !address || !city || !pincode || !items || items.length === 0) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const { data, error } = await supabase.from('orders').insert({
      items,
      total_amount,
      customer_name,
      phone,
      address,
      city,
      pincode,
      payment_method: payment_method || 'COD',
      status: 'pending'
    }).select('id');

    if (error) {
      console.error('Order insert error:', error);
      return res.json({ success: false, message: 'Order placement failed', error: error.message });
    }

    const order = { id: data[0].id, items, total_amount, customer_name, phone, address, city, pincode, payment_method: payment_method || 'COD' };

    sendAdminWhatsApp(order);
    sendCustomerWhatsApp(order);

    if (ITL_ACCESS_TOKEN && ITL_SECRET_KEY && ITL_PICKUP_ADDRESS_ID) {
      const waybill = await createItlDraft(order);
      if (waybill) {
        await supabase.from('orders').update({ tracking_number: waybill, status: 'drafted' }).eq('id', order.id);
        const trackingUrl = `${SITE_URL}/track.html?order_id=${order.id}`;
        sendTrackingWhatsApp(order.phone, order.customer_name, trackingUrl, waybill);
      }
    }

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

// ── Saved Addresses ──

app.get('/api/customer/:phone/addresses', async (req, res) => {
  try {
    const { phone } = req.params;
    const { data, error } = await supabase.from('saved_addresses').select('*').eq('phone', phone).order('is_default', { ascending: false }).order('created_at', { ascending: false });
    if (error) return res.json({ success: false, message: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/customer/address', async (req, res) => {
  try {
    const { phone, name, address, city, pincode, is_default } = req.body;
    if (!phone || !name || !address || !city || !pincode) {
      return res.json({ success: false, message: 'All fields required' });
    }
    if (is_default) {
      await supabase.from('saved_addresses').update({ is_default: false }).eq('phone', phone);
    }
    const { data, error } = await supabase.from('saved_addresses').insert({ phone, name, address, city, pincode, is_default: is_default || false }).select();
    if (error) return res.json({ success: false, message: error.message });
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/customer/address/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, name, address, city, pincode, is_default } = req.body;
    if (is_default) {
      await supabase.from('saved_addresses').update({ is_default: false }).eq('phone', phone).neq('id', id);
    }
    const { data, error } = await supabase.from('saved_addresses').update({ name, address, city, pincode, is_default: is_default || false, updated_at: new Date() }).eq('id', id).select();
    if (error) return res.json({ success: false, message: error.message });
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/customer/address/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('saved_addresses').delete().eq('id', id);
    if (error) return res.json({ success: false, message: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Order Tracking ──

app.get('/api/orders/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { data, error } = await supabase.from('orders').select('id,total_amount,items,status,tracking_number,created_at').eq('phone', phone).order('created_at', { ascending: false }).limit(20);
    if (error) return res.json({ success: false, message: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/track/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;
    const { data, error } = await supabase.from('orders').select('id,customer_name,phone,items,total_amount,status,tracking_number,created_at,address,city,pincode').eq('id', order_id).single();
    if (error) return res.json({ success: false, message: 'Order not found' });

    let tracking = null;
    if (data.tracking_number && ITL_ACCESS_TOKEN && ITL_SECRET_KEY) {
      try {
        const itlRes = await fetch('https://pre-alpha.ithinklogistics.com/api_v3/order/get_details.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              awb_number_list: data.tracking_number,
              start_date: new Date(data.created_at).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
              access_token: ITL_ACCESS_TOKEN,
              secret_key: ITL_SECRET_KEY
            }
          })
        });
        tracking = await itlRes.json();
      } catch (itlErr) {
        console.error('ITL tracking error:', itlErr.message);
      }
    }

    res.json({ success: true, data: { ...data, tracking } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── WhatsApp ──

function waChatId(phone) {
  let p = phone.replace(/[^0-9]/g, '');
  if (p.length === 10) p = '91' + p;
  else if (p.length === 12 && p.startsWith('91')) p = p;
  else if (p.length === 11 && p.startsWith('91')) p = '91' + p.slice(2);
  else p = '91' + p.slice(-10);
  return p + '@c.us';
}

async function waSend(chatId, text) {
  if (!OPENWA_URL || !OPENWA_TOKEN) return;
  try {
    await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}/messages/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': OPENWA_TOKEN },
      body: JSON.stringify({ chatId, text })
    });
  } catch (err) {
    console.error('WhatsApp error:', err);
  }
}

async function sendAdminWhatsApp(order) {
  const itemsList = order.items.map(i => `${i.product_name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString()}`).join('\n');
  const message = `🔔 NEW ORDER - AL SHIFA HERB

Customer: ${order.customer_name}
Phone: ${order.phone}
Address: ${order.address}, ${order.city}, ${order.pincode}

Items:
${itemsList}

Total: ₹${order.total_amount?.toLocaleString() || ''}
Order ID: #${order.id}
Payment: ${order.payment_method || 'COD'}
Date: ${new Date().toLocaleString('en-IN')}`;

  await waSend(waChatId(ADMIN_PHONE), message);
}

async function sendCustomerWhatsApp(order) {
  const itemsList = order.items.map(i => `• ${i.product_name} × ${i.quantity}`).join('\n');
  const message = `🛒 Order Confirmed - AL SHIFA HERB

Thank you for your order, ${order.customer_name}!

Items:
${itemsList}

Total: ₹${order.total_amount?.toLocaleString() || ''}
Order ID: #${order.id}
Payment: ${order.payment_method || 'COD'}

Your order will be processed shortly. We will notify you once it is shipped.

For any queries, contact us at +91 9557687044

🚚 Estimated dispatch: 1-2 business days`;

  await waSend(waChatId(order.phone), message);
}

async function sendTrackingWhatsApp(phone, name, trackingUrl, waybill) {
  const message = `📦 Your order is being processed - AL SHIFA HERB

Hi ${name},

Your order has been handed over to our logistics partner.

📋 Tracking Number: ${waybill}
🔗 Track your order: ${trackingUrl}

You can track your order anytime to see real-time updates.`;

  await waSend(waChatId(phone), message);
}

// ── I Think Logistics ──

async function createItlDraft(order) {
  const productList = order.items.map(i => ({
    product_name: i.product_name,
    product_quantity: i.quantity,
    product_price: parseFloat(i.price)
  }));

  const body = {
    data: {
      access_token: ITL_ACCESS_TOKEN,
      secret_key: ITL_SECRET_KEY,
      shipments: [{
        pickup_address_id: ITL_PICKUP_ADDRESS_ID,
        order: `AL${order.id}`,
        order_date: new Date().toLocaleDateString('en-IN'),
        total_amount: parseFloat(order.total_amount || 0),
        name: order.customer_name,
        add: order.address,
        city: order.city,
        pin: order.pincode,
        phone: order.phone.replace(/[^0-9]/g, '').slice(-10),
        payment_mode: 'COD',
        products: productList,
        shipment_length: 15,
        shipment_width: 10,
        shipment_height: 5,
        weight: 0.5,
        return_address_id: ITL_RETURN_ADDRESS_ID || ITL_PICKUP_ADDRESS_ID
      }]
    }
  };

  const res = await fetch('https://pre-alpha.ithinklogistics.com/api_v3/order/add.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await res.json();
  if (result.status === 'success' && result.data) {
    const shipment = Object.values(result.data)[0];
    return shipment?.waybill || null;
  }
  console.error('ITL create error:', JSON.stringify(result));
  return null;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AL SHIFA HERB Backend running on port ${PORT}`);
  console.log('OTP: Screen-based (visible to user on checkout page)');
  console.log(`WhatsApp: ${OPENWA_URL ? 'Connected to ' + OPENWA_URL : 'DISABLED - set OPENWA_URL'}`);
  console.log(`I Think Logistics: ${ITL_ACCESS_TOKEN && ITL_PICKUP_ADDRESS_ID ? 'Connected' : 'DISABLED'}`);
});
