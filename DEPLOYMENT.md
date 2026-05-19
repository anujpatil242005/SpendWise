# SpendWise — Multi-Platform Deployment & Setup Guide

This comprehensive guide details the step-by-step instructions for deploying SpendWise - Smart Personal Expense Tracker to production using MongoDB Atlas, Render, and Vercel.

---

## 1. MongoDB Atlas Setup (Database Cloud Cluster)

MongoDB Atlas is the recommended cloud-hosted MongoDB service to host your transactional ledgers.

1. **Create an Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2. **Deploy a Free Shared Cluster**:
   - Select **New Cluster** > Choose **M0 Free Tier**.
   - Select your preferred cloud provider (AWS/GCP) and region closest to your users.
3. **Configure Database Access (Credentials)**:
   - Go to **Security** > **Database Access**.
   - Click **Add New Database User**.
   - Create a user with **Read and Write to any database** privilege (e.g. username: `spendwise_admin`, secure password). Keep these credentials safe!
4. **Configure Network Whitelist (IP Access)**:
   - Go to **Security** > **Network Access**.
   - Click **Add IP Address**.
   - For a production deployment on Render, select **Allow Access From Anywhere** (`0.0.0.0/0`).
5. **Acquire Connection URI String**:
   - Go to the Atlas Dashboard **Database Clusters** overview.
   - Click **Connect** > Choose **Connect your application**.
   - Copy the SRV Connection String. It should look like this:
     ```text
     mongodb+srv://spendwise_admin:<PASSWORD>@cluster0.abcde.mongodb.net/spendwise_tracker?retryWrites=true&w=majority
     ```
   - Replace `<PASSWORD>` with the password you generated for the database user.

---

## 2. Backend Server Deployment (Render Cloud)

Render is ideal for hosting Node.js Express APIs.

1. **Create a Render Account**:
   - Link your GitHub repository at [Render.com](https://render.com).
2. **Create a New Web Service**:
   - Click **New +** > Choose **Web Service**.
   - Connect the repository containing your SpendWise codebase.
3. **Configure Build Settings**:
   - **Name**: `spendwise-backend-api`
   - **Environment**: `Node`
   - **Root Directory**: `backend` (if you split folders, or leave blank if backend is root)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Select **Free**.
4. **Map Production Environment Variables**:
   - Go to the **Environment** tab in your Render Web Service.
   - Add the following environment variables:
     | Key | Value | Description |
     | :--- | :--- | :--- |
     | `PORT` | `10000` | Port handled automatically by Render |
     | `NODE_ENV` | `production` | Standard node node indicator |
     | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI string |
     | `PRIVY_APP_ID` | `cl...` | Your Privy App ID |
     | `PRIVY_APP_SECRET` | `sk_...` | Your Privy App Secret key (attached to auth tokens) |
5. **Trigger Deploy**:
   - Render will build and deploy your Express REST API. Copy the live API address (e.g., `https://spendwise-backend-api.onrender.com`).

---

## 3. Frontend SPA Deployment (Vercel SPA hosting)

Vercel is the ultimate CDN-based platform for hosting Vite-React Single Page Applications.

1. **Deploying via Vercel Dashboard**:
   - Sign up at [Vercel.com](https://vercel.com) using your GitHub account.
   - Click **Add New** > Choose **Project**.
   - Select and import your SpendWise repository.
2. **Configure Build Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Configure Environment Variables**:
   - Add the following environment variable inside the Vercel project configuration:
     - `VITE_API_URL` = `https://spendwise-backend-api.onrender.com/api` (The Render API URL you copied, appending `/api`)
4. **Handle client-side Router Redirections (`vercel.json`)**:
   - To prevent `404 Not Found` errors when refreshing pages nested in React-Router, create a `vercel.json` file inside the `frontend/` root folder with the following configuration:
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```
5. **Deploy**:
   - Click **Deploy**. Vercel will bundle the Vite project, pre-optimize assets, and output your live secure site URL (e.g. `https://spendwise.vercel.app`).

---

## 4. End-to-End Project Verification Checklist

Verify your production system using this exact QA checklist:

- [ ] **Database Connection**: Confirm the Render live logs show `[Database] MongoDB Connected successfully` at launch.
- [ ] **Secure Authentication**: Navigate to the Vercel site and attempt logging in with Privy.
- [ ] **Transactional Synchronization**: Log a new Expense and Income, confirming that they save and that your Dashboard Stats update immediately.
- [ ] **Budget Progress & Threshold Alerts**: Set a budget limit of `$1,000` with sub-budgets. Confirm that safe/depletion color blocks display.
- [ ] **Analytics Visuals**: Click the **Analytics** page. Confirm the composed comparisons, category distributions, daily trends, and monthly bars load and refilter dynamically.
- [ ] **Data Reports CSV/PDF**: Click **Export CSV** and **Print PDF** inside the Expense and Income pages. Confirm clean files are created and print stylesheets apply.
