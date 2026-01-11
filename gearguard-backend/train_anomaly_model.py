import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# Load data
data = pd.read_csv("dataset.csv")

# Use only healthy data to train
train_data = data[data["failed"] == 0][["temperature", "vibration", "power", "runtime"]]

# Normalize
scaler = StandardScaler()
X_train = scaler.fit_transform(train_data)

# Train anomaly detector
model = IsolationForest(
    contamination=0.05,   # expected % of failures
    n_estimators=200,
    random_state=42
)
model.fit(X_train)

# Test on all data
X_all = scaler.transform(data[["temperature", "vibration", "power", "runtime"]])
data["anomaly"] = model.predict(X_all)   # -1 = anomaly, 1 = normal

# Convert to failure prediction
data["predicted"] = data["anomaly"].apply(lambda x: 1 if x == -1 else 0)

# Evaluate
print(classification_report(data["failed"], data["predicted"]))

# Show few risky samples
print("\nSample detected risky readings:")
print(data[data["predicted"] == 1].head())
