export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

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