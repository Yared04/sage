import sys
import json
import pickle

# Load the pickle model
with open("C:/Users/Yared/Downloads/SAGE prediction Models/rf_model", "rb") as f:
    model = pickle.load(f)

input_data_array = json.loads(sys.stdin.read())
outputs = []

for input_data in input_data_array:
    feature_names = list(input_data.keys())
    values = [input_data[feature] for feature in feature_names]
    result = model.predict([values])
    outputs.append(result.tolist())

# Print the output predictions to stdout
print(json.dumps(outputs))
