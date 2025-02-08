import json
import random
from pathlib import Path
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel, Field


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


from scripts.tree_generation import (Rectangle, TreeLocation,
                                     generate_trees_for_rectangles)

app = FastAPI(
    title="Forest Vision API",
    description="API for generating and managing tree locations in parking lots",
    version="1.0.0",
)


def load_rectangles_from_json() -> List[Rectangle]:
    """
    Load rectangle data from JSON file in the datasets directory.

    Returns:
        List of Rectangle objects converted from the JSON data.
    """
    dataset_path = Path("./datasets/coordinates-small.json")
    with open(dataset_path, "r") as f:
        data = json.load(f)

    # Convert JSON objects to Rectangle models
    rectangles = [
        Rectangle(
            top_right_lat=item["latitude"],
            top_right_long=item["longitude"],
            width_meters=item["width"],
            length_meters=item["length"],
        )
        for item in data
    ]
    return rectangles


@app.get("/trees/", response_model=List[TreeLocation])
async def get_trees(params: TreeQueryParams = TreeQueryParams()) -> List[TreeLocation]:
    """
    Get tree locations based on predefined parking lot data.

    Args:
        params: Query parameters for tree generation.

    Returns:
        List of TreeLocation objects containing the latitude and longitude of each tree.
    """
    rectangles = load_rectangles_from_json()

    # Calculate how many rectangles to sample
    sample_size = int(len(rectangles) * params.percentage)
    if sample_size < len(rectangles):
        rectangles = random.sample(rectangles, sample_size)

    return generate_trees_for_rectangles(rectangles)


@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
