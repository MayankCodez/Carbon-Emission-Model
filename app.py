from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

model = joblib.load("carbon_emission_model.pkl")

app = Flask(__name__)
CORS(app)  

@app.route("/")
def home():
    return "Carbon Emission Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        country = data.get("country")
        sector = data.get("sector")
        year = data.get("year")
        month = data.get("month")

        if country is None or sector is None or year is None or month is None:
            return jsonify({
                "error": "Invalid input! Expected keys: country, sector, year, month"
            }), 400

        features_array = np.array([country, sector, year, month]).reshape(1, -1)

        prediction = model.predict(features_array)

        return jsonify({
            "prediction": float(prediction[0]),
            "features_used": {
                "country": country,
                "sector": sector,
                "year": year,
                "month": month
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
