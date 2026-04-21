# IPT One Telecoms Reseller Portal - Implementation Summary

I have built a full-stack, premium management application for **IPT One Telecoms** in South Africa. The application features a state-of-the-art dark theme, comprehensive ordering flows, and detailed catalog management.

## 🚀 Key Features

### 1. Admin Management Dashboard
- **Dashboard Stats**: Real-time overview of revenue (ZAR), total orders, active resellers, and managed products.
- **Order Flow Manager**: Track and process orders through their lifecycle (Pending → Confirmed → Processing → Provisioning → Completed).
- **Catalog Manager**: Create and manage separate catalogs for **Hardware** and **Services** (VOIP, Fibre, Cloud, Mobile).
- **Category Manager (Hierarchical)**: Build complex parent-child category structures for each catalog.
- **User Management**: API & UI structure for managing Resellers and secondary Admins.

### 2. Reseller Purchasing Portal
- **Reseller Dashboard**: Personalized view of expenditure, pending orders, and cart status.
- **Unified Shop**: Browse hardware and services with intelligent catalog/category filtering.
- **ZAR Ordering System**: Prices displayed in Rand with automatic 15% VAT calculation.
- **Cart & Checkout**: Advanced quantity controls and order notes for resellers.
- **Order Tracking**: Full history of previous purchases and their real-time statuses.

### 3. Technical Stack
- **Framework**: Next.js 15 (App Router, Turbopack) with TypeScript.
- **Database**: **Neon PostgreSQL** (Serverless driver).
- **Authentication**: JWT-based secure auth with `jose` and `bcryptjs`.
- **Styling**: Premium Vanilla CSS/Design Tokens for high performance and custom look.
- **Currency**: South African Rand (ZAR) formatted throughout.

---

## 🔐 Access Credentials

I have created the initial super admin user in the database.

- **URL**: `http://localhost:3000/login`
- **Email**: `admin@iptone.co.za`
- **Password**: `Admin@IPTOne2024!`

---

## 🛠️ Database Schema
The system uses a relational PostgreSQL schema including:
- `users`: Role-based access (super_admin, admin, reseller).
- `catalogs`: Separate containers for different product types.
- `categories`: Self-referencing table for multi-level hierarchy.
- `products`: Detailed product data, including recurring billing options.
- `orders` & `order_items`: Full relational order tracking.
- `cart_items`: Per-reseller persistent shopping carts.
- `invoices`: (Structure ready) for billing generation.

---
*Note: The development server is currently running. You can navigate to the login page to begin using the application.*
