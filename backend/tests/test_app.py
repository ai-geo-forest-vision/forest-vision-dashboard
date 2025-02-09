import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_trees():
    """Test the tree generation endpoint with various parameters"""
    # Test with default parameters
    response = client.get("/trees/")
    assert response.status_code == 200
    trees = response.json()
    assert isinstance(trees, list)
    assert len(trees) > 0
    
    # Verify tree structure
    tree = trees[0]
    assert "latitude" in tree
    assert "longitude" in tree
    assert "tree_type" in tree
    
    # Test with custom parameters
    params = {
        "percentage": 0.5,
        "trees_per_square_meter": 0.1
    }
    response = client.get("/trees/", params=params)
    assert response.status_code == 200
    trees = response.json()
    assert isinstance(trees, list)
    assert len(trees) > 0

def test_asphalt_conversion():
    """Test the asphalt conversion planning endpoint"""
    test_data = {
        "asphalt_sqft": 1000.0,
        "species_distribution": {
            "coast_live_oak": 0.5,
            "monterey_pine": 0.3,
            "redwood": 0.2
        },
        "spacing_sqft_per_tree": 100.0,
        "cost_removal_per_sqft": 10.0,
        "maintenance_years": 5
    }
    
    response = client.post("/asphalt-conversion/", json=test_data)
    assert response.status_code == 200
    result = response.json()
    
    # Verify the response structure
    assert "total_trees" in result
    assert "total_cost" in result
    assert "co2_sequestration" in result
    assert "maintenance_cost" in result
    
    # Basic validation of values
    assert result["total_trees"] == int(1000.0 / 100.0)  # area / spacing
    assert result["total_cost"] > 0
    assert result["co2_sequestration"] > 0
    assert result["maintenance_cost"] > 0

def test_invalid_parameters():
    """Test error handling for invalid parameters"""
    # Test invalid percentage
    response = client.get("/trees/", params={"percentage": 2.0})
    assert response.status_code == 422
    
    # Test invalid tree density
    response = client.get("/trees/", params={"trees_per_square_meter": -1})
    assert response.status_code == 422
    
    # Test invalid asphalt conversion parameters
    invalid_data = {
        "asphalt_sqft": -1000.0,  # Invalid negative area
        "species_distribution": {
            "coast_live_oak": 0.5,
            "monterey_pine": 0.3,
            "redwood": 0.2
        }
    }
    response = client.post("/asphalt-conversion/", json=invalid_data)
    assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 