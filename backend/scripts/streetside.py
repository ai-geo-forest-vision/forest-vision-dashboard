import math

from geopy.distance import geodesic
from geopy.point import Point
from pydantic import BaseModel
from tree_generation import AreaType, Rectangle


# Define the Coordinate class
class Coordinate(BaseModel):
    """Represents a geographical coordinate (latitude, longitude)"""

    lat: float
    lon: float

    def to_geopy_point(self) -> Point:
        """Convert this coordinate to a geopy Point."""
        return Point(self.lat, self.lon)


# Function to calculate the midpoint between two points
def midpoint(coord1: Coordinate, coord2: Coordinate) -> Coordinate:
    """Calculate the midpoint between two coordinates."""
    mid_lat = (coord1.lat + coord2.lat) / 2
    mid_lon = (coord1.lon + coord2.lon) / 2
    return Coordinate(lat=mid_lat, lon=mid_lon)


# Function to calculate the perpendicular offset
def perpendicular_offset(
    coord1: Coordinate, coord2: Coordinate, offset_meters: float
) -> Coordinate:
    """Calculate a point offset perpendicularly from the midpoint of a line."""
    # Calculate the bearing of the line
    bearing = math.atan2(
        math.radians(coord2.lon - coord1.lon), math.radians(coord2.lat - coord1.lat)
    )

    # Calculate the perpendicular bearing
    perpendicular_bearing = bearing + math.pi / 2

    # Calculate the midpoint
    mid = midpoint(coord1, coord2)

    # Calculate the offset point
    offset_point = geodesic(meters=offset_meters).destination(
        mid.to_geopy_point(), perpendicular_bearing
    )

    return Coordinate(lat=offset_point.latitude, lon=offset_point.longitude)


# Function to generate rectangles
def generate_rectangles(
    coord1: Coordinate,
    coord2: Coordinate,
    offset_meters: float,
    width_meters: float,
    area_type: AreaType,
) -> tuple[Rectangle, Rectangle]:
    """Generate two rectangles parallel to the line segment defined by coord1 and coord2."""
    # Calculate the perpendicular offsets
    offset1 = perpendicular_offset(coord1, coord2, offset_meters)
    offset2 = perpendicular_offset(coord1, coord2, -offset_meters)

    # Calculate the length of the line in meters
    length_meters = geodesic(coord1.to_geopy_point(), coord2.to_geopy_point()).meters

    # Generate the rectangles
    rectangle1 = Rectangle(
        top_right_lat=offset1.lat,
        top_right_long=offset1.lon,
        width_meters=width_meters,
        length_meters=length_meters,
        area_type=area_type,
    )

    rectangle2 = Rectangle(
        top_right_lat=offset2.lat,
        top_right_long=offset2.lon,
        width_meters=width_meters,
        length_meters=length_meters,
        area_type=area_type,
    )

    return rectangle1, rectangle2
