# services/ner.py

import spacy

# -----------------------------
# LOAD MODEL (ONLY ONCE)
# -----------------------------
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print("SpaCy model load error:", e)
    nlp = None


# -----------------------------
# ENTITY EXTRACTION
# -----------------------------
def extract_entities(text):

    if not text or not text.strip() or not nlp:
        return []

    try:
        doc = nlp(text)

        entities = []

        seen = set()  # ✅ remove duplicates

        for ent in doc.ents:

            key = (ent.text.lower(), ent.label_)

            if key not in seen:
                seen.add(key)

                entities.append({
                    "text": ent.text,
                    "label": ent.label_
                })

        return entities

    except Exception as e:
        print("NER error:", e)
        return []