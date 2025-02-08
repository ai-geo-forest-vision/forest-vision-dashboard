# Generate lat and long for tree locations

import random
from enum import Enum
from typing import List, Tuple

import numpy as np
from pydantic import BaseModel

# Constants
TREES_PER_SQUARE_METER = 0.01  # Adjust this value based on desired density


class TreeType(str, Enum):
    """Types of trees that can be planted"""

    OAK = "oak"
    MAPLE = "maple"
    PINE = "pine"
    BIRCH = "birch"
    WILLOW = "willow"


class AreaType(str, Enum):
    """Types of areas that can be converted to green spaces"""

    PARKING_LOT = "parking_lot"
    GARAGE = "garage"
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"


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


def _generate_tree_locations(rectangle: Rectangle) -> List[Tree]:
    """
    Generate tree locations within a rectangle using uniform density
    """
    # Get conversion factors for the rectangle's latitude
    meters_to_lat, meters_to_long = _meters_to_lat_long_conversion(
        rectangle.top_right_lat
    )

    # Calculate number of trees based on area and density
    area = rectangle.width_meters * rectangle.length_meters
    num_trees = int(area * TREES_PER_SQUARE_METER)

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


def generate_trees_for_rectangles(rectangles: List[Rectangle]) -> List[Tree]:
    """
    Generate tree locations for multiple rectangles
    """
    all_trees = []
    for rectangle in rectangles:
        trees = _generate_tree_locations(rectangle)
        all_trees.extend(trees)
    return all_trees
