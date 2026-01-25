
---

# 📕 BACKEND README (Resume Intelligence – Backend)

```md
# Resume Intelligence – Backend API

A secure REST API powering the Resume Intelligence platform.  
Handles AI processing, resume/job analysis, authentication, insights tracking, and email-based password recovery.

---

## 🚀 Live API

🔗 https://resume-intelligence-backend.onrender.com  


---

## 🧩 Features

- JWT authentication
- Secure login & registration
- Resume parsing (Text & PDF)
- AI job description extraction
- Resume vs job match analysis
- Match scoring & verdict logic
- Missing & high-impact skill detection
- Analysis history storage
- Skill gap insights aggregation
- Forgot & reset password (email-based)
- Protected routes via middleware

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Groq AI (LLaMA 3.1)
- Brevo (SendinBlue) Email API
- multer
- pdf-parse
- crypto
- dotenv

---

## 📂 Project Structure

```txt
src/
├── Controller/
│   ├── authController.js
│   ├── resumeController.js
│   ├── jobController.js
│   ├── analysisController.js
│   └── insightController.js
│
├── Model/
│   ├── userSchema.js
│   ├── resumeSchema.js
│   ├── jobSchema.js
│   ├── analysisSchema.js
│   └── insightSchema.js
│
├── Middleware/
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
│
├── Route/
│   ├── authRoute.js
│   ├── resumeRoute.js
│   ├── jobRoute.js
│   ├── analysisRoute.js
│   └── insightRoute.js
│
├── utils/
│   └── sendEmail.js
│
├── config/
│   ├── db.js
│   └── groq.js
│
└── index.js


🧠 Core Logic
AI Processing

Resume and job text processed via Groq AI

Structured JSON extracted for skills & requirements

Match Analysis

Required vs preferred skills comparison

Match score calculation

Missing & repeated skill gaps tracked

Insights System

Tracks recurring skill gaps per user

Sorted by frequency

Used for long-term improvement strategy

🔐 Security

Password hashing with bcrypt

JWT authentication

Reset tokens hashed & time-limited

Protected routes via middleware

Email-based secure password reset

🧪 Run Locally
git clone https://github.com/your-username/resume-intelligence-backend
cd resume-intelligence-backend
npm install
npm start

🔑 Environment Variables
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
BREVO_API_KEY=your_brevo_api_key
PASS_MAIL=verified_sender_email

📌 Portfolio Value

This backend demonstrates:

Real AI integration

Secure authentication workflows

Scalable data modeling

Clean controller & middleware separation

Production-style API architecture

🔗 Frontend Repository

👉 https://github.com/your-username/resume-intelligence-frontend

