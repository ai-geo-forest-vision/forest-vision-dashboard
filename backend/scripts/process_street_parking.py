import pandas as pd
import json
from pathlib import Path
from typing import List, Tuple

from streetside import Coordinate, generate_rectangles
from tree_generation import AreaType

# Constants for street dimensions
STREET_WIDTH = 3.0  # meters (typical width for street side planting strip)
PARKING_SPACE_LENGTH = 5.5  # meters (typical parallel parking space length)

def parse_linestring(linestring: str) -> List[Tuple[float, float]]:
    """Parse a LINESTRING from the CSV into a list of coordinates."""
    # Remove LINESTRING and parentheses, then split into coordinate pairs
    coords_str = linestring.replace('LINESTRING (', '').replace(')', '').split(',')
    
    # Parse each coordinate pair
    coords = []
    for coord in coords_str:
        lon, lat = map(float, coord.strip().split())
        coords.append((lat, lon))  # Note: CSV has them as lon,lat but we want lat,lon
    
    return coords

def process_street_parking(csv_path: str, json_output: str):
    """Process street parking data and generate rectangles for tree planting."""
    print(f"Processing street parking data from {csv_path}")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    
    # Initialize list for all rectangles
    all_rectangles = []
    total_spaces = 0
    
    # Process each street segment
    for _, row in df.iterrows():
        if pd.isna(row['shape']) or 'LINESTRING' not in row['shape']:
            continue
            
        # Get parking supply (number of spaces) for this segment
        spaces = row['PRKG_SPLY']
        if pd.isna(spaces) or spaces <= 0:
            continue
            
        total_spaces += spaces
        
        # Parse the linestring coordinates
        coords = parse_linestring(row['shape'])
        if len(coords) < 2:
            continue
            
        # Calculate segment length based on number of parking spaces
        segment_length = spaces * PARKING_SPACE_LENGTH
        
        # Generate rectangles for each coordinate pair
        for i in range(len(coords) - 1):
            start_coord = Coordinate(lat=coords[i][0], lon=coords[i][1])
            end_coord = Coordinate(lat=coords[i+1][0], lon=coords[i+1][1])
            
            # Generate rectangles on both sides of the street
            rect1, rect2 = generate_rectangles(
                coord1=start_coord,
                coord2=end_coord,
                offset_meters=STREET_WIDTH/2,  # Half width to offset from street center
                width_meters=STREET_WIDTH,
                area_type=AreaType.STREET_SIDE
            )
            
            # Add rectangles to the list
            all_rectangles.extend([
                {
                    "latitude": rect1.top_right_lat,
                    "longitude": rect1.top_right_long,
                    "width": rect1.width_meters,
                    "length": rect1.length_meters
                },
                {
                    "latitude": rect2.top_right_lat,
                    "longitude": rect2.top_right_long,
                    "width": rect2.width_meters,
                    "length": rect2.length_meters
                }
            ])
    
    print(f"Processed {total_spaces} parking spaces")
    print(f"Generated {len(all_rectangles)} potential planting areas")
    
    # Save to JSON
    with open(json_output, 'w') as f:
        json.dump(all_rectangles, f, indent=4)
    
    print(f"Saved rectangle data to {json_output}")

if __name__ == "__main__":
    csv_path = Path("../datasets/On_Street_Parking.csv")
    json_output = Path("../datasets/street-parking-coordinates.json")
    
    process_street_parking(str(csv_path), str(json_output)) 