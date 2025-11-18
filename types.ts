export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  XML_READY = 'XML_READY',
  PREVIEW_READY = 'PREVIEW_READY',
}

export enum ProcessStep {
  GENERATE_XML = 'GENERATE_XML',
  VALIDATE_TOPOLOGY = 'VALIDATE_TOPOLOGY',
  GENERATE_PREVIEW = 'GENERATE_PREVIEW',
}

export interface CustomComponent {
  id: string;
  name: string;
  content: string;
}

export interface ComponentDetails {
  id: string;
  name: string;
  type: string;
  attributes: Array<{ name: string; value: string }>;
}