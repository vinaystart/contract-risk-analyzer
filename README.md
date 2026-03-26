#  AI Contract Risk Analyzer

## 📌 Overview

AI Contract Risk Analyzer is a full-stack web application that analyzes legal contracts and identifies risky clauses using Natural Language Processing (NLP) and Machine Learning.

It allows users to securely authenticate using Email OTP, upload contracts, analyze risks, and gain actionable insights through an interactive dashboard.

---

## ✨ Features

### 🔐 Authentication
- Email-based OTP authentication system
- Secure user registration and login
- OTP verification for login
- User profile management

---

### 📄 Contract Analysis
- Upload contracts (PDF, DOCX, TXT)
- Automatic text extraction
- Clause detection and segmentation
- Risk classification (Low / Medium / High)
- Confidence score for predictions

---

### 🤖 AI & NLP
- Named Entity Recognition (NER) using SpaCy
- Machine Learning-based risk detection
- AI-generated contract insights
- Improved model accuracy using custom training data

---

### 🎯 User Interface
- Highlight risky clauses in the UI
- Clean and interactive dashboard
- Real-time analysis results

---

### 🔎 Search & Filter
- Search contracts by keywords
- Filter contracts based on:
  - Risk level (Low / Medium / High)
  - Date
  - Contract type
- Quick access to analyzed results

---

### 📊 Reports & Analytics
- Dashboard analytics for contract insights
- Download detailed PDF reports
- Organized and structured report format

---

## 🛠️ Tech Stack

Frontend:
- React (Vite)
- Axios

Backend:
- Django
- Django REST Framework (DRF)

AI / ML:
- Scikit-learn
- SpaCy

Database:
- SQLite (Development)
- PostgreSQL (Production-ready)

---

## ⚙️ Setup Instructions

### 🔧 Backend Setup

cd backend  
python -m venv venv  
venv\Scripts\activate   (Windows)  
pip install -r requirements.txt  
python manage.py migrate  
python manage.py runserver  

---

### 💻 Frontend Setup

cd frontend  
npm install  
npm run dev  

---

## 🧩 System Architecture

User Login (Email OTP)  
        ↓  
Upload Contract  
        ↓  
Text Extraction  
        ↓  
Clause Segmentation  
        ↓  
ML Risk Classification  
        ↓  
NER Processing  
        ↓  
Store Results (Database)  
        ↓  
Search / Filter / Dashboard  
        ↓  
PDF Report Generation  

---

##  Key Highlights

- Implemented Email OTP Authentication system
- Built scalable REST APIs using Django REST Framework
- Developed ML model for contract risk classification
- Generated structured PDF reports using ReportLab
- Added advanced search and filter functionality
- Integrated full-stack architecture (React + Django)


## 📁 Project Structure

contract-risk-analyzer/

backend/
- accounts/        (Authentication & OTP logic)
- analysis/        (Risk analysis APIs)
- contracts/       (Contract handling)
- services/        (ML model & training data)
- config/

frontend/
- pages/           (Login, Dashboard, etc.)
- components/
- services/        (API integration)

README.md

---

## 👨‍💻 Author

Vinay S
---

## ⭐ Why This Project Stands Out

- Combines AI + Full Stack Development
- Real-world Legal Tech use case
- Includes Authentication, ML, APIs, Search/Filter, and Reporting
- Strong project for Backend / Full Stack roles
