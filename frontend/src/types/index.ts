import type { MapViewState } from '@deck.gl/core';

export type ViewState = MapViewState;

export interface ForestData {
  id: string;
  coordinates: [number, number];
  properties: {
    name: string;
    area: number;
    treeCount: number;
    healthScore: number;
  };
}

export interface LayerConfig {
  id: string;
  visible: boolean;
  opacity: number;
}

export interface MapStyle {
  name: string;
  url: string;
}

export interface IconMapping {
  [key: string]: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TreeProperties {
  id: string;
  name: string;
  species: string;
  height: number;
  diameter: number;
  age: number;
  healthScore: number;
  lastInspection: string;
  carbonSequestration: number;
  crownDiameter: number; // Added for tree spread visualization
}

export type Species = 
  | 'coast_live_oak'
  | 'monterey_pine'
  | 'redwood'
  | 'california_buckeye'
  | 'western_sycamore'
  | 'london_plane';

export const CALIFORNIA_SPECIES: Record<Species, string> = {
  coast_live_oak: "Coast Live Oak",
  monterey_pine: "Monterey Pine",
  redwood: "Redwood",
  california_buckeye: "California Buckeye",
  western_sycamore: "Western Sycamore",
  london_plane: "London Plane"
};

export interface SpeciesData {
  planting_cost: number;
  maintenance_cost: number;
  co2_per_year: number;
  water_requirement: number;
  growth_rate: number;
  max_height: number;
  max_crown_spread: number;
}

export const SPECIES_DATA: Record<Species, SpeciesData> = {
  coast_live_oak: {
    planting_cost: 350,
    maintenance_cost: 50,
    co2_per_year: 20,
    water_requirement: 800,
    growth_rate: 1.5,
    max_height: 70,
    max_crown_spread: 70
  },
  monterey_pine: {
    planting_cost: 300,
    maintenance_cost: 40,
    co2_per_year: 25,
    water_requirement: 600,
    growth_rate: 2.0,
    max_height: 100,
    max_crown_spread: 40
  },
  redwood: {
    planting_cost: 400,
    maintenance_cost: 60,
    co2_per_year: 30,
    water_requirement: 1000,
    growth_rate: 3.0,
    max_height: 200,
    max_crown_spread: 30
  },
  california_buckeye: {
    planting_cost: 250,
    maintenance_cost: 35,
    co2_per_year: 15,
    water_requirement: 400,
    growth_rate: 1.0,
    max_height: 40,
    max_crown_spread: 30
  },
  western_sycamore: {
    planting_cost: 320,
    maintenance_cost: 45,
    co2_per_year: 18,
    water_requirement: 700,
    growth_rate: 1.8,
    max_height: 80,
    max_crown_spread: 60
  },
  london_plane: {
    planting_cost: 280,
    maintenance_cost: 40,
    co2_per_year: 20,
    water_requirement: 600,
    growth_rate: 1.5,
    max_height: 75,
    max_crown_spread: 50
  }
}; 