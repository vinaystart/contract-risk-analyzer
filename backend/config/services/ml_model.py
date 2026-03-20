# services/ml_model.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from .training_data import training_data


# -----------------------------
# PREPARE DATA
# -----------------------------
texts = [t[0] for t in training_data]
labels = [t[1] for t in training_data]

# -----------------------------
# SPLIT DATA (IMPORTANT)
# -----------------------------
X_train_texts, X_test_texts, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, random_state=42
)

# -----------------------------
# VECTORIZER
# -----------------------------
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    stop_words="english",
    max_features=1000
)

X_train = vectorizer.fit_transform(X_train_texts)
X_test = vectorizer.transform(X_test_texts)

# -----------------------------
# MODEL
# -----------------------------
model = LogisticRegression(max_iter=200, random_state=42)
model.fit(X_train, y_train)

# -----------------------------
# EVALUATION (🔥 IMPORTANT)
# -----------------------------
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n🔥 MODEL EVALUATION")
print("Accuracy:", round(accuracy, 2))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# -----------------------------
# PREDICTION FUNCTION
# -----------------------------
def predict_risk_with_confidence(text):

    if not text or not text.strip():
        return "Low", 0.5

    try:
        X_test = vectorizer.transform([text])

        prediction = model.predict(X_test)[0]
        probabilities = model.predict_proba(X_test)[0]

        confidence = float(max(probabilities))

        return prediction, round(confidence, 2)

    except Exception as e:
        print("ML prediction error:", e)
        return "Low", 0.5