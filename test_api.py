import requests
import json

url = "http://127.0.0.1:5000/predict"

data = {
    "country": 1,   
    "sector": 2,    
    "year": 2025,
    "month": 9
}

headers = {"Content-Type": "application/json"}

response = requests.post(url, data=json.dumps(data), headers=headers)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
