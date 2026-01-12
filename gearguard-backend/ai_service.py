from fastapi import FastAPI
import joblib
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Load ML artifacts
model = joblib.load("anomaly_model.pkl")
scaler = joblib.load("scaler.pkl")

# Connect to MongoDB Atlas
client = MongoClient(os.getenv("MONGO_URI"))

# IMPORTANT: use the same DB where Node stored sensor logs
db = client["test"]             # ← this matches Atlas
collection = db["sensorlogs"]   # ← this matches Atlas

app = FastAPI()

@app.get("/predict")
def predict():
    logs = list(collection.find())

    if len(logs) == 0:
        return {"message": "No sensor data found"}

    # Convert Mongo docs → ML dataframe
    data = pd.DataFrame([
        {
            "temperature": float(l.get("temperature", 0)),
            "vibration": float(l.get("vibration", 0)),
            "power": float(l.get("powerUsage", 0)),       # Mongo → ML mapping
            "runtime": float(l.get("runtimeHours", 0)),  # Mongo → ML mapping
            "equipment": str(l.get("equipment", ""))
        }
        for l in logs
    ])

    # Scale exactly like training
    X = scaler.transform(data[["temperature","vibration","power","runtime"]])

    # Predict anomalies
    preds = model.predict(X)

    data["risk"] = preds == -1   # -1 means anomaly

    risky = data[data["risk"] == True]

    return risky.to_dict(orient="records")
