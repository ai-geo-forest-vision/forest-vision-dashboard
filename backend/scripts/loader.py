"""Functions for loading and processing street data."""

import csv
import re
from typing import List, Tuple

from scripts.streetside import Coordinate, generate_rectangles
from scripts.tree_generation import AreaType, Rectangle


def parse_street_coordinates(csv_path: str) -> List[Tuple[Coordinate, Coordinate]]:
    """
    Parse street data from CSV file and extract coordinate pairs.

    Args:
        csv_path: Path to the CSV file containing street data

    Returns:
        List of coordinate pairs (start point, end point) for each street segment
    """
    coordinate_pairs = []

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Extract coordinates from LINESTRING
            linestring = row["shape"]
            coords_match = re.findall(r"-?\d+\.\d+", linestring)
            if (
                len(coords_match) >= 4
            ):  # Ensure we have at least 2 points (4 coordinates)
                # Convert coordinates to floats
                coords = [float(x) for x in coords_match]

                # Create Coordinate objects for start and end points
                # Note: CSV has (longitude, latitude) format
                coord1 = Coordinate(lat=coords[1], lon=coords[0])
                coord2 = Coordinate(lat=coords[3], lon=coords[2])

                coordinate_pairs.append((coord1, coord2))

    return coordinate_pairs


def generate_street_rectangles(
    csv_path: str, offset_meters: float = 1.0, width_meters: float = 1.0
) -> List[Rectangle]:
    """
    Generate rectangles for street segments from CSV data.

    Args:
        csv_path: Path to the CSV file containing street data
        offset_meters: Offset distance from the street centerline in meters
        width_meters: Width of the rectangles in meters

    Returns:
        List of Rectangle objects representing areas along the streets
    """
    coordinate_pairs = parse_street_coordinates(csv_path)
    rectangles = []

    for coord1, coord2 in coordinate_pairs:
        # Generate two rectangles for each street segment
        rect1, rect2 = generate_rectangles(
            coord1=coord1,
            coord2=coord2,
            offset_meters=offset_meters,
            width_meters=width_meters,
            area_type=AreaType.STREET_SIDE,
        )
        rectangles.extend([rect1, rect2])

    return rectangles
