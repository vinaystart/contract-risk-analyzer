#  AI Contract Risk Analyzer

##  Overview

AI-powered system to analyze legal contracts and detect risky clauses using NLP and Machine Learning.

---

##  Features

* Upload contracts (PDF, DOCX, TXT)
* Clause extraction
* Named Entity Recognition (SpaCy)
* Risk classification (Low / Medium / High)
* Confidence score for predictions
* Risk highlighting in UI
* AI insights generation
* Dashboard analytics
* PDF report download
* Search + filters

---

## Tech Stack

* Backend: Django + DRF
* Frontend: React (Vite)
* AI/ML: Scikit-learn, SpaCy
* Database: SQLite (Dev) / PostgreSQL (Prod)

---

##  Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

##  Architecture

Upload → Parse → Extract Clauses → ML Classification → NER → Store → Display

---

##  Demo

(Add your video link here)

---

##  Screenshots

(Add your screenshots here)

---

##  Author

Vinay S
