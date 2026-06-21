# GreenStep 🌿

Every Step Counts Toward a Greener Planet.

GreenStep is a modern fullstack web application for tracking carbon footprints, completing eco-friendly challenges, and receiving personalized AI-driven sustainability recommendations to reduce daily emissions.

---

## 🚀 Key Features

* **Intelligent Onboarding Questionnaire:** Dynamic carbon scoring system calculates your starting footprint based on daily transportation, electricity, food habits, waste management, and lifestyle choices.
* **AI Coach Insights:** Integrates with the **Gemini 3.5 Flash** model via Google AI Studio to analyze your footprint and generate 3 highly personalized, actionable reduction recommendations.
* **Dynamic Eco Challenges:** Join community challenges like "Bus & Rail Commuter", "Plant-Powered Week", and "Green Pedaling" with context-specific evidence verification prompts (e.g. upload train ticket images for transit, cycle logs for biking).
* **Eco Guide Library:** Access articles detailing carbon impact reductions, daily climate facts, and tips to improve everyday sustainability.
* **Admin Verification Queue:** Admin panels to approve or reject proof of challenge completions, verify support reports, and seed demo analytics.
* **Beautiful Responsive UI:** premium dark-mode interface powered by React, Tailwind CSS, Lucide icons, and Motion micro-animations.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Motion, Lucide Icons
* **Backend:** Node.js, Express, TypeScript, tsx
* **Database & ORM:** PostgreSQL, Drizzle ORM, Drizzle Kit
* **AI Integration:** Google Gen AI SDK (`gemini-3.5-flash`)

---

## 💻 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [PostgreSQL](https://www.postgresql.org/) database running locally

### 1. Install Dependencies
Clone this repository to your local machine and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini API
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# App URL Configuration
APP_URL="http://localhost:3000"

# Local PostgreSQL Database Credentials
SQL_HOST="localhost"
SQL_DB_NAME="Greenstep"
SQL_USER="postgres"
SQL_PASSWORD="YOUR_LOCAL_DB_PASSWORD"

# Drizzle Kit connection variables
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="YOUR_LOCAL_DB_PASSWORD"
```

### 3. Initialize Database Tables
Drizzle Kit will automatically push the schema defined in `src/db/schema.ts` to your local PostgreSQL instance:
```bash
npx drizzle-kit push --config src/db/drizzle.config.ts
```

### 4. Seed Database Data
Seed the challenges and resources tables to display the cards on the UI:
```bash
npx tsx src/db/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🌐 Production Deployment (Render)

This project is fully optimized to be deployed to **[Render.com](https://render.com/)**.

1. **Database:** Deploy a free PostgreSQL database on Render.
2. **Web Service:** Deploy a Web Service linked to your GitHub repository.
   * **Build Command:** `npm run build`
   * **Start Command:** `npm start`
3. **Environment Variables:** Set the database credentials (`SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`, `SQL_PASSWORD`), `NODE_ENV=production`, `GEMINI_API_KEY`, and your live `APP_URL` on Render's **Environment** settings tab.

---

## 📄 License
This project is open-source and available under the MIT License.
