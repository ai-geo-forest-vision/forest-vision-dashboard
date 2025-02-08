from typing import List

from fastapi import FastAPI
from scripts.tree_generation import TreeLocation, generate_trees_for_rectangles

app = FastAPI(
    title="Forest Vision API",
    description="API for generating and managing tree locations in parking lots",
    version="1.0.0",
)


@app.get("/trees/", response_model=List[TreeLocation])
async def get_trees() -> List[TreeLocation]:
    """
    Get all tree locations based on predefined parking lot data.

    Returns:
        List of TreeLocation objects containing the latitude and longitude of each tree.
    """
    # TODO: Load rectangle data from JSON files and convert to Pydantic models
    # TODO: Pass rectangles to generate_trees_for_rectangles
    return []  # Placeholder return until rectangle loading is implemented


@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
