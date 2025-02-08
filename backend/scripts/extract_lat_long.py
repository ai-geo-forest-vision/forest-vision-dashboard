import pandas as pd
import json

STREET_SIDE_WIDTH_CONSTANT = 1 # meters
STREET_SIDE_LENGTH_CONSTANT = 2 # meters
# PARKING_LOT_WIDTH_LENGTH_CONSTANT = 18 # meters

def extract_lat_lon_to_json(csv_file, json_output):
    # Read CSV
    df = pd.read_csv(csv_file)
    df.columns = df.columns.str.lower()  # Convert column names to lowercase

    # Identify possible latitude/longitude columns
    lat_columns = [col for col in df.columns if "lat" in col.lower()]
    lon_columns = [col for col in df.columns if "long" in col.lower()]

    # Ensure matching latitude and longitude columns
    if not lat_columns or not lon_columns:
        raise ValueError("No latitude/longitude columns found in the CSV file.")

    # Extract lat/lon values (using first detected pair)
    coordinates = df[[lat_columns[0], lon_columns[0]]].dropna()
    coordinates.rename(columns={lat_columns[0]: "latitude", lon_columns[0]: "longitude"}, inplace=True)
    coordinates = coordinates.to_dict(orient="records")

    # Add width and length to each record
    for record in coordinates:
        record["width"] = STREET_SIDE_WIDTH_CONSTANT
        record["length"] = STREET_SIDE_LENGTH_CONSTANT

    # Save as JSON
    with open(json_output, "w") as json_file:
        json.dump(coordinates, json_file, indent=4)

    print(f"✅ Extracted {len(coordinates)} coordinates and saved to {json_output}")

# Example usage
csv_file = "../datasets/Parking_Meters.csv"  # Change to your CSV file
# csv_file = "../datasets/Off_street_Parking.csv"
json_output = "../datasets/coordinates.json"
# json_output = "../datasets/parking-lot-coordinates.json"
extract_lat_lon_to_json(csv_file, json_output)
