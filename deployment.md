# Deployment Guide - Shadow Strike

This guide provides instructions for deploying both the frontend game client and the backend real-time multiplayer server.

---

## 1. Database Setup (MongoDB Atlas)

The game uses Prisma mapped to a MongoDB cluster for user profiles, currency stats, and leaderboard rankings.

1. **Create Cluster**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free shared cluster.
2. **Retrieve Connection String**: Go to "Database" -> "Connect" -> "Drivers" and copy the MongoDB connection string.
3. **Update Configuration**:
   - Open your backend environment config at `server/.env`.
   - Update `DATABASE_URL` with your connection string:
     ```env
     DATABASE_URL="mongodb+srv://username:<db_password>@cluster0.5vecqjl.mongodb.net/shadowstrike?retryWrites=true&w=majority&appName=Cluster0"
     ```
     *(Be sure to replace `<db_password>` with your database user password.)*

4. **Initialize Collections**:
   Run the database sync tool from the `server/` directory:
   ```bash
   cd server
   npx prisma db push
   ```
   This will create the necessary collections and indexes in your MongoDB cluster automatically.

---

## 2. Local Run and Validation

### Step 1: Start Client
In the workspace root directory:
```bash
npm install
npm run dev
```
The game will open at `http://localhost:5173/`.

### Step 2: Start Server
In the `server/` directory:
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:3000`.

---

## 3. Server Deployment (Railway / Render / Heroku)

Deploy the backend Socket.IO server to a cloud platform that supports persistent WebSocket connections.

### Option A: Railway (Recommended)
1. Install the Railway CLI or link your GitHub repository on [Railway](https://railway.app/).
2. Define the following Environment Variables in the project settings:
   - `DATABASE_URL` = (Your MongoDB Connection String)
   - `JWT_SECRET` = (A secure random string)
   - `PORT` = `3000` (or leave default for Railway to allocate dynamically)
3. Set the build command to `npm run build` and start command to `npm start`. Railway will build the TypeScript files and boot the Express/Socket.IO runtime.

### Option B: Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Select your repository.
3. Set:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `DATABASE_URL` = (Your MongoDB Connection String)
   - `JWT_SECRET` = (A secure random string)
5. Ensure the Web Service remains active (Free Tier instances may spin down after inactivity, causing delays on initial connection).

---

## 4. Client Deployment (Vercel / Netlify)

Deploy the static client app to Vercel or Netlify.

1. Connect your repository to [Vercel](https://vercel.com/).
2. Set the build parameters:
   - **Framework Preset**: `Vite` (or `Other`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**. Vercel will bundle the ES Modules and assets into a globally distributed CDN.
4. **Link Backend**:
   - The game client automatically detects if it's running on `localhost`. If so, it points to local port `3000`.
   - If running in production, it points to `https://shadow-strike-server.up.railway.app`.
   - To change this production server URL, open `main.js` and modify `SERVER_URL` to match your newly deployed server endpoint.
