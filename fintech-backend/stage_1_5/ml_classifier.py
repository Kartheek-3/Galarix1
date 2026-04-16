from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# simple training dataset
TRAIN_DATA = [
    ("loan emi repayment", "loans"),
    ("insurance fraud claim", "insurance_claims"),
    ("employee salary payroll", "payroll"),
    ("credit card spending", "credit_card_activity"),
    ("subscription billing invoice", "saas_billing"),
    ("investment portfolio returns", "investment_statement"),
]

texts = [x[0] for x in TRAIN_DATA]
labels = [x[1] for x in TRAIN_DATA]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)


def predict_entity(prompt):
    X_test = vectorizer.transform([prompt])
    return model.predict(X_test)[0]