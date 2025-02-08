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