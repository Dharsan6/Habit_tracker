import os
import json
import time
import logging
import requests
import boto3
import pandas as pd
from sklearn.linear_model import LogisticRegression
import numpy as np

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── Config (set these as env vars or replace directly for local dev) ──────────
AWS_REGION          = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY      = os.getenv("AWS_ACCESS_KEY_ID", "<your-access-key-id>")
AWS_SECRET_KEY      = os.getenv("AWS_SECRET_ACCESS_KEY", "<your-secret-access-key>")
PREDICT_QUEUE_URL   = os.getenv("PREDICT_QUEUE_URL", "https://sqs.us-east-1.amazonaws.com/<account-id>/lifetrack-predict-queue")
SPRING_CALLBACK_URL = os.getenv("SPRING_CALLBACK_URL", "http://localhost:8080/api/ml/callback")
POLL_INTERVAL_SEC   = int(os.getenv("POLL_INTERVAL_SEC", "5"))

# ── SQS client ────────────────────────────────────────────────────────────────
sqs = boto3.client(
    "sqs",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
)

# ── ML Model (trained on synthetic data) ─────────────────────────────────────
# In production, load a pre-trained model from a file (joblib.load)
# Here we train a simple Logistic Regression on synthetic data at startup

def build_model():
    """
    Train a Logistic Regression on synthetic habit completion data.
    Features: [completion_rate, last7_rate, last30_rate]
    Label: 1 = will complete today, 0 = won't
    """
    # Synthetic training data: [completion_rate, last7_rate, last30_rate]
    X = np.array([
        [0.9, 0.85, 0.88],  # high consistency → will complete
        [0.8, 0.71, 0.75],
        [0.7, 0.57, 0.65],
        [0.5, 0.42, 0.48],
        [0.3, 0.28, 0.30],  # low consistency → won't complete
        [0.2, 0.14, 0.18],
        [0.1, 0.00, 0.08],
        [0.6, 0.57, 0.60],
        [0.75, 0.71, 0.73],
        [0.4, 0.28, 0.35],
    ])
    y = np.array([1, 1, 1, 0, 0, 0, 0, 1, 1, 0])

    model = LogisticRegression()
    model.fit(X, y)
    log.info("Logistic Regression model trained.")
    return model

model = build_model()

# ── Rule-based Recommendation (pandas) ───────────────────────────────────────

def get_recommendation(data: dict) -> str:
    """
    Simple rule-based recommendation using pandas DataFrame.
    Rules are evaluated in priority order.
    """
    df = pd.DataFrame([data])

    df["completion_rate"] = df["totalCompletions"] / df["totalDays"].replace(0, 1)
    df["last7_rate"]      = df["last7Days"] / 7
    df["last30_rate"]     = df["last30Days"] / 30

    rate      = df["completion_rate"].iloc[0]
    last7     = df["last7_rate"].iloc[0]
    category  = df["category"].iloc[0].lower() if df["category"].iloc[0] else ""

    if rate >= 0.8 and last7 >= 0.8:
        return "🔥 You're on fire! Keep the streak going."
    elif rate >= 0.6 and last7 < 0.5:
        return "📉 You've been slipping lately. Try scheduling a fixed time."
    elif rate < 0.4:
        return "💡 Consider reducing frequency or breaking this habit into smaller steps."
    elif "fitness" in category or "exercise" in category:
        return "🏃 Pair this with a morning routine for better consistency."
    elif "read" in category or "study" in category:
        return "📚 Try the 2-minute rule: just start for 2 minutes."
    else:
        return "✅ Steady progress! Consistency beats intensity."

# ── Feature extraction ────────────────────────────────────────────────────────

def extract_features(data: dict) -> np.ndarray:
    total     = data.get("totalDays", 1) or 1
    comp_rate = data.get("totalCompletions", 0) / total
    last7     = data.get("last7Days", 0) / 7
    last30    = data.get("last30Days", 0) / 30
    return np.array([[comp_rate, last7, last30]])

# ── Process one SQS message ───────────────────────────────────────────────────

def process_message(body: str):
    data = json.loads(body)
    request_id = data.get("requestId")
    habit_id   = data.get("habitId")

    log.info("Processing requestId=%s habitId=%s", request_id, habit_id)

    # Run prediction
    features    = extract_features(data)
    prediction  = model.predict(features)[0]
    probability = round(float(model.predict_proba(features)[0][1]), 4)

    # Run recommendation
    recommendation = get_recommendation(data)

    # Build result payload
    result = {
        "requestId":      request_id,
        "habitId":        habit_id,
        "willComplete":   bool(prediction),
        "probability":    probability,
        "recommendation": recommendation,
    }

    log.info("Result: %s", result)

    # Send result back to Spring Boot
    resp = requests.post(SPRING_CALLBACK_URL, json=result, timeout=10)
    resp.raise_for_status()
    log.info("Callback sent. status=%s", resp.status_code)

# ── Main polling loop ─────────────────────────────────────────────────────────

def poll():
    log.info("Flask ML worker started. Polling SQS every %ds...", POLL_INTERVAL_SEC)

    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=PREDICT_QUEUE_URL,
                MaxNumberOfMessages=5,       # process up to 5 at a time
                WaitTimeSeconds=10,          # long polling — reduces empty receives
                VisibilityTimeout=30,
            )

            messages = response.get("Messages", [])

            if not messages:
                log.debug("No messages. Waiting...")
                time.sleep(POLL_INTERVAL_SEC)
                continue

            for msg in messages:
                try:
                    process_message(msg["Body"])

                    # Delete from queue only after successful processing
                    sqs.delete_message(
                        QueueUrl=PREDICT_QUEUE_URL,
                        ReceiptHandle=msg["ReceiptHandle"],
                    )
                    log.info("Message deleted from SQS.")

                except Exception as e:
                    # Leave message in queue — it will become visible again after VisibilityTimeout
                    log.error("Failed to process message: %s", e)

        except Exception as e:
            log.error("SQS polling error: %s", e)
            time.sleep(POLL_INTERVAL_SEC)

if __name__ == "__main__":
    poll()
