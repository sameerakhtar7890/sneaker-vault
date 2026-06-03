# Sneaker Vault

A premium, dark-themed, full-stack MERN e-commerce store for luxury sneakers.

## Stack
MongoDB, Express, React (Vite), Node.js, Tailwind CSS, Framer Motion, Stripe.

## Quick start
```bash
cp .env.example server/.env
npm run install-all
npm run dev
```
- API: http://localhost:5000
- Client: http://localhost:3000

## Structure
```
sneaker-vault/
├── server/
│   ├── models/        Product.js, User.js, Order.js
│   ├── controllers/   auth, product, order, payment
│   ├── routes/        auth, product, order, checkout
│   ├── middleware/    auth, error
│   ├── config/        db connection
│   └── index.js
└── client/
    ├── src/
    │   ├── components/  Navbar, Hero, ProductCard, CheckoutForm, Footer, CartDrawer
    │   ├── context/     CartContext, AuthContext
    │   ├── pages/       Home, Shop, Detail, Checkout, Success
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

## Stripe webhook
Endpoint: `POST /api/checkout/webhook` (raw body). Set `STRIPE_WEBHOOK_SECRET` from the Stripe CLI / dashboard.
