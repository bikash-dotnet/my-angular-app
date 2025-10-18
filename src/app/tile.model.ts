export interface Tile {
  id: string;
  title: string;
  description: string;
  badgeNumber: number;
  badgeClass: string;
  createdDate: string;
  team: string;
  // per-tile flag to control showing the documents tab (default true)
  showDocuments?: boolean;
}

export interface TabConfig {
  id: string;
  title: string;
  visible: boolean;
  icon?: string;
  order: number;
}

export interface TabData extends TabConfig {
  data?: any[];
  loading: boolean;
  loaded: boolean;
  lastUpdated?: string;
  columns?: TableColumn[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}