# Generate lat and long for tree locations

import random
from enum import Enum
from typing import List, Tuple

import numpy as np
from pydantic import BaseModel


class TreeType(str, Enum):
    """Types of trees that can be planted"""

    OAK = "coast_live_oak"
    PINE = "monterey_pine"
    REDWOOD = "redwood"
    BUCKEYE = "california_buckeye"
    SYCAMORE = "western_sycamore"
    PLANE = "london_plane"


class AreaType(str, Enum):
    """Types of areas that can be converted to green spaces"""

    PARKING_LOT = "parking_lot"
    GARAGE = "garage"
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"
    STREET_SIDE = "street_side"


class Rectangle(BaseModel):
    """Represents a rectangular area defined by its top-right corner and dimensions"""

    top_right_lat: float
    top_right_long: float
    width_meters: float  # Width in meters
    length_meters: float  # Length in meters
    area_type: AreaType  # Type of area being converted


class Tree(BaseModel):
    """Represents a tree with its location and type"""

    latitude: float
    longitude: float
    tree_type: TreeType


def _meters_to_lat_long_conversion(latitude: float) -> Tuple[float, float]:
    """
    Convert meters to approximate latitude and longitude differences at a given latitude
    Returns (meters_to_lat, meters_to_long) conversion factors
    """
    # Earth's radius in meters
    earth_radius = 6371000

    # Latitude conversion (same everywhere)
    meters_to_lat = 1 / (earth_radius * np.pi / 180)

    # Longitude conversion (varies with latitude)
    meters_to_long = 1 / (earth_radius * np.pi / 180 * np.cos(np.radians(latitude)))

    return meters_to_lat, meters_to_long


def _generate_tree_locations(
    rectangle: Rectangle, trees_per_square_meter: float
) -> List[Tree]:
    """
    Generate tree locations within a rectangle using uniform density

    Args:
        rectangle: Rectangle defining the area
        trees_per_square_meter: Density of trees (trees per square meter)
    """
    # Get conversion factors for the rectangle's latitude
    meters_to_lat, meters_to_long = _meters_to_lat_long_conversion(
        rectangle.top_right_lat
    )

    # Calculate number of trees based on area and density
    area = rectangle.width_meters * rectangle.length_meters
    # Use round instead of int to avoid truncation bias
    num_trees = max(1, round(area * trees_per_square_meter))
    
    print(f"Generating {num_trees} trees for {area}m² {rectangle.area_type} area with density {trees_per_square_meter}")

    # Generate random positions within the rectangle
    random_widths = np.random.uniform(0, rectangle.width_meters, num_trees)
    random_lengths = np.random.uniform(0, rectangle.length_meters, num_trees)

    # Randomly select tree types for each tree
    tree_types = random.choices(list(TreeType), k=num_trees)

    # Convert to lat/long coordinates
    tree_locations = []
    for w, l, tree_type in zip(random_widths, random_lengths, tree_types):
        # Convert meters to lat/long differences
        lat_diff = l * meters_to_lat
        long_diff = w * meters_to_long

        # Calculate final coordinates (note: subtract from top_right_lat since we're going south)
        tree_lat = rectangle.top_right_lat - lat_diff
        tree_long = rectangle.top_right_long - long_diff

        tree_locations.append(
            Tree(latitude=tree_lat, longitude=tree_long, tree_type=tree_type)
        )

    return tree_locations


def generate_trees_for_rectangles(
    rectangles: List[Rectangle], trees_per_square_meter: float = 1.0
) -> List[Tree]:
    """
    Generate tree locations for multiple rectangles

    Args:
        rectangles: List of rectangles to populate with trees
        trees_per_square_meter: Density of trees (trees per square meter), defaults to 1.0
    """
    print(f"\nGenerating trees with density: {trees_per_square_meter} trees/m²")
    total_area = sum(rect.width_meters * rect.length_meters for rect in rectangles)
    expected_trees = round(total_area * trees_per_square_meter)
    print(f"Total area: {total_area}m², Expected trees: {expected_trees}")
    
    all_trees = []
    for rectangle in rectangles:
        trees = _generate_tree_locations(rectangle, trees_per_square_meter)
        all_trees.extend(trees)
    
    print(f"Actually generated {len(all_trees)} trees\n")
    return all_trees
