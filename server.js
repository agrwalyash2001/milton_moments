/* server.js — simple Node/Express backend for coupon generation

Usage:
  - npm init -y
  - npm i express cors uuid
  - node server.js

This is a minimal demo server. For production, secure endpoints, rate-limit, persistent DB, and auth are required.
*/

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory store (demo only)
const usedCoupons = new Set();

function makeCoupon(){ // MILTON-XXXX-YYYY
  const short = uuidv4().split('-')[0].toUpperCase();
  return `MILTON-${short}`;
}

app.post('/api/generate-coupon', (req, res) => {
  const { score, profile } = req.body || {};
  // Simple eligibility rule: must have at least 10 points (adjustable)
  if(typeof score !== 'number' || score < 10) return res.status(400).json({ error: 'Score too low for coupon' });

  // generate unique coupon
  let coupon = makeCoupon();
  while(usedCoupons.has(coupon)) coupon = makeCoupon();
  usedCoupons.add(coupon);

  // in a real app you'd persist coupon to DB, associate with user, and send email
  console.log('Generated coupon', coupon, 'for profile', profile, 'score', score);

  res.json({ coupon });
});

// static files (if hosting frontend together)
app.use(express.static('public'));

app.listen(PORT, ()=> console.log(`Coupon server running on http://localhost:${PORT}`));
