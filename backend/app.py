import json
import random
from pathlib import Path
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scripts.tree_generation import (AreaType, Rectangle, Tree,
                                     generate_trees_for_rectangles)


class TreeQueryParams(BaseModel):
    """Query parameters for tree generation"""

    percentage: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Percentage of parking lots to consider (0.0 to 1.0)",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "percentage": 0.5,
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
    dataset_path = Path("./datasets/coordinates-small.json")
    print(f"Loading data from {dataset_path.absolute()}")
    with open(dataset_path, "r") as f:
        data = json.load(f)
    print(f"Loaded {len(data)} rectangles from JSON")

    # Convert JSON objects to Rectangle models
    rectangles = [
        Rectangle(
            top_right_lat=item["latitude"],
            top_right_long=item["longitude"],
            width_meters=item["width"],
            length_meters=item["length"],
            area_type=AreaType.PARKING_LOT,  # Always parking lots for now
        )
        for item in data
    ]
    return rectangles


@app.get("/trees/", response_model=List[Tree])
async def get_trees(params: TreeQueryParams = TreeQueryParams()) -> List[Tree]:
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

    trees = generate_trees_for_rectangles(rectangles)
    print(f"Generated {len(trees)} trees")
    return trees


@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5003)
