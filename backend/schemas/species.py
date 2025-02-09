from enum import Enum
from typing import Dict, TypedDict


class Species(str, Enum):
    """Types of trees that can be planted"""
    COAST_LIVE_OAK = "coast_live_oak"
    MONTEREY_PINE = "monterey_pine"
    REDWOOD = "redwood"
    CALIFORNIA_BUCKEYE = "california_buckeye"
    WESTERN_SYCAMORE = "western_sycamore"
    LONDON_PLANE = "london_plane"


class SpeciesData(TypedDict):
    planting_cost: float
    maintenance_cost: float
    co2_per_year: float
    water_requirement: float
    growth_rate: float
    max_height: float
    max_crown_spread: float


SPECIES_DATA: Dict[str, SpeciesData] = {
    Species.COAST_LIVE_OAK: {
        "planting_cost": 350,
        "maintenance_cost": 50,
        "co2_per_year": 20,
        "water_requirement": 800,
        "growth_rate": 1.5,
        "max_height": 70,
        "max_crown_spread": 70
    },
    Species.MONTEREY_PINE: {
        "planting_cost": 300,
        "maintenance_cost": 40,
        "co2_per_year": 25,
        "water_requirement": 600,
        "growth_rate": 2.0,
        "max_height": 100,
        "max_crown_spread": 40
    },
    Species.REDWOOD: {
        "planting_cost": 400,
        "maintenance_cost": 60,
        "co2_per_year": 30,
        "water_requirement": 1000,
        "growth_rate": 3.0,
        "max_height": 200,
        "max_crown_spread": 30
    },
    Species.CALIFORNIA_BUCKEYE: {
        "planting_cost": 250,
        "maintenance_cost": 35,
        "co2_per_year": 15,
        "water_requirement": 400,
        "growth_rate": 1.0,
        "max_height": 40,
        "max_crown_spread": 30
    },
    Species.WESTERN_SYCAMORE: {
        "planting_cost": 320,
        "maintenance_cost": 45,
        "co2_per_year": 18,
        "water_requirement": 700,
        "growth_rate": 1.8,
        "max_height": 80,
        "max_crown_spread": 60
    },
    Species.LONDON_PLANE: {
        "planting_cost": 280,
        "maintenance_cost": 40,
        "co2_per_year": 20,
        "water_requirement": 600,
        "growth_rate": 1.5,
        "max_height": 75,
        "max_crown_spread": 50
    }
} 