# services/training_data.py

import random

training_data = []

low = [
    "follows standard business practices",
    "includes normal contractual obligations",
    "has no unusual risks",
    "defines routine responsibilities",
    "uses standard payment terms",
    "complies with applicable laws",
]

medium = [
    "may result in penalties under certain conditions",
    "has limited liability depending on scenario",
    "may incur additional charges",
    "shares responsibility between parties",
    "includes conditional obligations",
    "may affect financial outcomes",
]

high = [
    "has unlimited liability for all damages",
    "must compensate for all losses",
    "bears all financial risks",
    "accepts full legal responsibility",
    "has no limitation of liability",
    "covers all damages including indirect losses",
]

subjects = [
    "The vendor", "The client", "The company",
    "The supplier", "The contractor"
]

extras = [
    "as per agreement",
    "under applicable law",
    "as outlined in contract",
    "according to policy",
    "without limitation",
    "in all circumstances"
]

# generate diverse sentences
def generate(data, label, n):
    for _ in range(n):
        s = random.choice(subjects)
        clause = random.choice(data)
        extra = random.choice(extras)

        # multiple formats
        training_data.append((f"{s} {clause} {extra}.", label))
        training_data.append((f"{clause.capitalize()} by {s.lower()} {extra}.", label))
        training_data.append((f"{s} {clause}.", label))

# build dataset (~900 samples)
generate(low, "Low", 100)
generate(medium, "Medium", 100)
generate(high, "High", 100)

# shuffle
random.shuffle(training_data)