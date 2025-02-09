import json
import random
from pathlib import Path
from typing import Dict, List

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scripts.tree_generation import (AreaType, Rectangle, Tree,
                                     generate_trees_for_rectangles)
from services.getAsphaultConversionResults import plan_asphalt_conversion
from schemas.species import Species, SPECIES_DATA


class TreeQueryParams(BaseModel):
    """Query parameters for tree generation"""

    percentage: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Percentage of parking lots to consider (0.0 to 1.0)",
    )
    trees_per_square_meter: float = Field(
        default=1.0,
        gt=0.0,
        description="Density of trees (trees per square meter)",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "percentage": 0.5,
                    "trees_per_square_meter": 0.01,
                }
            ]
        }
    }


class AsphaltConversionParams(BaseModel):
    """Parameters for asphalt conversion planning"""

    asphalt_sqft: float = Field(
        gt=0.0, description="Total square feet of asphalt to remove"
    )
    species_distribution: Dict[Species, float] = Field(
        description="Distribution of tree species as {species_name: fraction}, must sum to 1.0"
    )
    spacing_sqft_per_tree: float = Field(
        default=100.0, gt=0.0, description="Square feet allocated per tree"
    )
    cost_removal_per_sqft: float = Field(
        default=10.0, gt=0.0, description="Cost to remove asphalt per square foot"
    )
    maintenance_years: int = Field(
        default=5, gt=0, description="Number of years of maintenance to account for"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "asphalt_sqft": 1000.0,
                    "species_distribution": {
                        Species.COAST_LIVE_OAK: 0.5,
                        Species.MONTEREY_PINE: 0.3,
                        Species.REDWOOD: 0.2,
                    },
                    "spacing_sqft_per_tree": 100.0,
                    "cost_removal_per_sqft": 10.0,
                    "maintenance_years": 5,
                }
            ]
        }
    }


app = FastAPI(
    title="Forest Vision API",
    description="API for generating and managing tree locations in parking lots",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_rectangles_from_json() -> List[Rectangle]:
    """
    Load rectangle data from JSON file in the datasets directory.

    Returns:
        List of Rectangle objects converted from the JSON data.
    """
    parking_lots_path = Path("./datasets/parking-lot-coordinates.json")
    print(f"Loading data from {parking_lots_path.absolute()}")
    with open(parking_lots_path, "r") as f:
        data = json.load(f)
    print(f"Loaded parking lot {len(data)} rectangles from JSON")

    rectangles = [
        Rectangle(
            top_right_lat=item["latitude"],
            top_right_long=item["longitude"],
            width_meters=item["width"],
            length_meters=item["length"],
            area_type=AreaType.PARKING_LOT,
        )
        for item in data
    ]

    street_side_path = Path("./datasets/coordinates-small.json")
    print(f"Loading data from {street_side_path.absolute()}")
    with open(street_side_path, "r") as f:
        street_side_data = json.load(f)
    print(f"Loaded street side {len(street_side_data)} rectangles from JSON")
    # Merge datasets
    data.extend(street_side_data)
    # Convert JSON objects to Rectangle models
    rectangles.extend(
        [
            Rectangle(
                top_right_lat=item["latitude"],
                top_right_long=item["longitude"],
                width_meters=item["width"],
                length_meters=item["length"],
                area_type=AreaType.STREET_SIDE,
            )
            for item in data
        ]
    )
    return rectangles


@app.get("/trees/", response_model=List[Tree])
async def get_trees(params: TreeQueryParams = Depends()) -> List[Tree]:
    """
    Get tree locations based on predefined parking lot data.

    Args:
        params: Query parameters for tree generation.

    Returns:
        List of Tree objects containing the location and type of each tree.
    """
    print("Received request for trees")
    rectangles = load_rectangles_from_json()
    print(f"Loaded {len(rectangles)} rectangles")

    # Calculate how many rectangles to sample
    sample_size = int(len(rectangles) * params.percentage)
    if sample_size < len(rectangles):
        rectangles = random.sample(rectangles, sample_size)
    print(f"Using {len(rectangles)} rectangles after sampling")

    trees = generate_trees_for_rectangles(rectangles, params.trees_per_square_meter)
    print(f"Generated {len(trees)} trees")
    return trees


@app.post("/asphalt-conversion/")
async def calculate_asphalt_conversion(params: AsphaltConversionParams):
    """
    Calculate costs and environmental impact of converting asphalt to tree-planted area.

    Args:
        params: Parameters for the asphalt conversion calculation

    Returns:
        Dictionary containing cost estimates and environmental impact metrics
    """
    return plan_asphalt_conversion(
        asphalt_sqft=params.asphalt_sqft,
        species_distribution=params.species_distribution,
        spacing_sqft_per_tree=params.spacing_sqft_per_tree,
        cost_removal_per_sqft=params.cost_removal_per_sqft,
        maintenance_years=params.maintenance_years,
    )


@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5003)
