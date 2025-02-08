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