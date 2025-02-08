import json
from pathlib import Path
from typing import List

from fastapi import FastAPI
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
            height_meters=item["height"],
        )
        for item in data
    ]
    return rectangles


@app.get("/trees/", response_model=List[TreeLocation])
async def get_trees() -> List[TreeLocation]:
    """
    Get all tree locations based on predefined parking lot data.

    Returns:
        List of TreeLocation objects containing the latitude and longitude of each tree.
    """
    rectangles = load_rectangles_from_json()
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
