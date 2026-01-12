from fastapi import FastAPI
from fastapi import HTTPException
import joblib
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pymongo.errors import ServerSelectionTimeoutError

load_dotenv()

# Load ML artifacts
model = joblib.load("anomaly_model.pkl")
scaler = joblib.load("scaler.pkl")

_mongo_client = None


def _get_mongo_client() -> MongoClient:
    global _mongo_client
    if _mongo_client is not None:
        return _mongo_client

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI is not set")

    tls_insecure = os.getenv("MONGO_TLS_INSECURE", "false").lower() == "true"

    # Atlas (`mongodb+srv://` / `mongodb.net`) requires TLS. Local dev MongoDB often does not.
    use_tls = (
        mongo_uri.startswith("mongodb+srv://")
        or "mongodb.net" in mongo_uri
        or "tls=true" in mongo_uri.lower()
        or "ssl=true" in mongo_uri.lower()
    )

    # Prefer a proper CA bundle (fixes many Windows/SSL chain issues).
    tls_ca_file = None
    try:
        import certifi  # type: ignore

        tls_ca_file = certifi.where()
    except Exception:
        tls_ca_file = None

    base_kwargs = {
        "serverSelectionTimeoutMS": 20000,
        "connectTimeoutMS": 20000,
        "socketTimeoutMS": 20000,
    }

    tls_kwargs = {}
    if use_tls:
        tls_kwargs = {"tls": True, "tlsCAFile": tls_ca_file}

    try:
        _mongo_client = MongoClient(mongo_uri, **base_kwargs, **tls_kwargs)
        _mongo_client.admin.command("ping")
        return _mongo_client
    except Exception:
        if not (use_tls and tls_insecure):
            raise

        # LAST RESORT for local dev only: skip cert verification.
        _mongo_client = MongoClient(
            mongo_uri,
            **base_kwargs,
            tls=True,
            tlsAllowInvalidCertificates=True,
        )
        _mongo_client.admin.command("ping")
        return _mongo_client


def _get_collection():
    client = _get_mongo_client()
    # IMPORTANT: use the same DB where Node stored sensor logs
    db = client["test"]             # ← this matches Atlas
    return db["sensorlogs"]         # ← this matches Atlas

app = FastAPI()

@app.get("/predict")
def predict():
    try:
        collection = _get_collection()
        logs = list(collection.find())
    except ServerSelectionTimeoutError as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "MongoDB connection failed (TLS/handshake). "
                "Verify MONGO_URI, network access/IP allowlist in Atlas, and certificates. "
                f"Details: {str(e)}"
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
