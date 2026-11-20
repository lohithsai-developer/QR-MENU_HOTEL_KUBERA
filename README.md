# 🏛️ Hotel Kubera (Eluru) - Digital QR Menu & Management System

> *"Taste the Wealth of Flavours"* — Authentic Godavari & Multi-Cuisine Dining Experience

A modern, production-grade Digital QR Code Menu, Dish Catalog, and Mobile-First Administrative Portal designed specifically for **Hotel Kubera (Eluru)**. Built with a regal light luxury design aesthetic (deep burgundy `#781226`, warm royal gold `#C59B27`, and clean slate cards).

---

## ✨ Key Features & Architecture

### 1. 📱 Customer Mobile Menu Experience
- **Continuous Single-Page Orderly Scroll:**
  - **Chef's Recommendations & Suggestions:** Highlighted signature dishes at the top for instant discovery.
  - **Category-wise Sections:** Starters, Tikkas, Andhra Specials, Biryanis & Pulaos, Main Course, Soups, Breads, Desserts, and Beverages presented in a clear, scrollable sequence.
- **Interactive Category Navigation Bar:**
  - Sticky horizontal pill selector with scroll-spy synchronization.
  - Tapping any category pill smoothly scrolls directly to that category section.
- **Streamlined Minimalist Dish Cards:**
  - Displays essential details: Food preference indicator (Veg/Non-Veg), Dish Name, Tags (`Bestseller`, `Chef Signature`, `Recommended`), Portion Size (`Serves 1-2`), Price (`₹`), Dish Photo, and `+ ADD` button.
  - Clean card surface with **"View Details ›"** action.
- **Dish Details Modal:**
  - High-resolution dish photography, spice intensity level, estimated preparation time, portion size, and culinary description.
- **Filter Controls:**
  - Real-time search by dish or ingredient.
  - Quick dietary filter toggle: `All`, `Pure Veg`, `Non-Veg`.
- **Guest Shortlist / My Selection:**
  - Floating selection bar tracking selected items with live total and count.
  - Shortlist modal to review selected dishes before ordering with the waiter.

### 2. 🔐 Mobile-First Admin Management Portal (`/login` or via Shield Icon)
- **Secure Authentication:** Protected with JWT token authentication and dedicated `/login` interface.
- **Menu Dishes Manager (CRUD):**
  - **1-Tap Stock Control:** Toggle dishes between `✓ In Stock` and `✗ Sold Out` with a single tap.
  - **Add / Edit Dishes:** Manage names, descriptions, prices, categories, tags, spice levels, and portions.
  - **Dish Photo Upload:** Upload dish images directly or paste image URLs.
- **Category Manager:**
  - Dynamically create, edit, reorder, or remove menu categories with custom icons and descriptions.
- **Direct QR Code & Table Standee Generator:**
  - Instant QR code generation pointing directly to your live production domain or table URLs (`/?table=04`).
  - One-click **Download PNG (High-Res)** for digital marketing or menus.
  - **Print Luxury Table Standee:** Ornate royal standee card with Hotel Kubera crest, gold corner filigree, and table identification ready for table acrylic display stands.
- **Restaurant Floor Analytics:**
  - Live counts of dishes, categories, and inventory metrics.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v3, Vite, Lucide React, Canvas Confetti, QRCode |
| **Backend** | Node.js, Express.js, Mongoose, Multer, CORS, Dotenv, JWT |
| **Database** | MongoDB Atlas (Cloud Cluster: `hotel_kubera` database) |
| **Resilience** | Automatic dual-mode: MongoDB Atlas cloud storage with zero-crash Local Storage Fallback |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **MongoDB Atlas** account (or local MongoDB)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/hotel-kubera-menu.git
cd hotel-kubera-menu

# Install dependencies
npm install
```


```

### 4. Running the Development Server
```bash
# Runs full-stack server (Backend on port 5000 + Vite Frontend on port 5173 with mobile LAN access)
npm run dev
```

Open:
- **Customer Menu:** `http://localhost:5173` (or scan from mobile on same Wi-Fi)
- **Staff / Admin Portal:** `http://localhost:5173/login`
- **Backend API Health:** `http://localhost:5000/api/health`

---

## 📦 Production Deployment

### Option A: Deploying on Render / Railway (Full Stack)
1. Push this repository to GitHub.
2. In Render or Railway, create a **New Web Service** connected to your repository.
3. Configure the build and start commands:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add the Environment Variables from your `.env` (including `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`).
5. Your service will build the React frontend and serve it statically from the Express production server.

### Option B: Deploying Frontend on Vercel & Backend on Render
1. **Backend (Render / Railway):** Deploy the `server/` directory as a Node.js web service.
2. **Frontend (Vercel / Netlify):** Deploy the repository, set build command to `npm run build` and output directory to `dist`. Set `VITE_API_BASE_URL` to your backend URL.

---

## 📄 License
Private & Proprietary — Developed for **Hotel Kubera (Eluru)**.
