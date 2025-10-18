import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError, timeout } from 'rxjs/operators';
import { TabConfig, TableColumn } from './tile.model';

@Injectable({
  providedIn: 'root',
})
export class TileService {
  // cache removed — always fetch fresh data from backend
  private tabConfigs: TabConfig[] = [
    { id: 'overview', title: 'Overview', visible: true, icon: 'bi-info-circle', order: 1 },
    { id: 'team', title: 'Team', visible: true, icon: 'bi-people', order: 2 },
    { id: 'analytics', title: 'Analytics', visible: true, icon: 'bi-graph-up', order: 3 },
    { id: 'documents', title: 'Documents', visible: false, icon: 'bi-folder', order: 4 },
    { id: 'settings', title: 'Settings', visible: true, icon: 'bi-gear', order: 5 },
  ];

  constructor(private http: HttpClient) {}
  // Fetch team data for a tile from backend
  GetTeamData(tileId: string): Observable<any> {
    const url = `http://localhost:8000/team?id=${tileId}`;
    return this.http.get<any>(url);
  }

  // Fetch analytics data for a tile from backend
  GetAnalyticsData(tileId: string): Observable<any> {
    const url = `http://localhost:8000/analytics?id=${tileId}`;
    return this.http.get<any>(url);
  }

  // Fetch documents data for a tile from backend
  GetDocumentsData(tileId: string): Observable<any> {
    const url = `http://localhost:8000/documents?id=${tileId}`;
    return this.http.get<any>(url);
  }

  // Fetch settings data for a tile from backend
  GetSettingsData(tileId: string): Observable<any> {
    const url = `http://localhost:8000/settings1?id=${tileId}`;
    return this.http.get<any>(url);
  }

  // Fetch overview data for a tile from backend
  GetOverviewData(tileId: string): Observable<any> {
    const url = `http://localhost:8000/overview?id=${tileId}`;
    return this.http.get<any>(url);
  }

  // Column configurations for each tab
  private columnConfigs: { [key: string]: TableColumn[] } = {
    overview: [
      { key: 'taskName', label: 'Task Name', sortable: true, width: '25%' },
      { key: 'assignee', label: 'Assignee', sortable: true, width: '15%' },
      { key: 'status', label: 'Status', sortable: true, width: '15%' },
      { key: 'progress', label: 'Progress', sortable: true, width: '15%' },
      { key: 'dueDate', label: 'Due Date', sortable: true, width: '15%' },
      { key: 'priority', label: 'Priority', sortable: true, width: '15%' }
    ],
    team: [
      { key: 'name', label: 'Name', sortable: true, width: '20%' },
      { key: 'role', label: 'Role', sortable: true, width: '20%' },
      { key: 'department', label: 'Department', sortable: true, width: '15%' },
      { key: 'email', label: 'Email', sortable: true, width: '25%' },
      { key: 'joinDate', label: 'Join Date', sortable: true, width: '10%' },
      { key: 'status', label: 'Status', sortable: true, width: '10%' }
    ],
    analytics: [
      { key: 'metric', label: 'Metric', sortable: true, width: '25%' },
      { key: 'current', label: 'Current', sortable: true, width: '15%' },
      { key: 'previous', label: 'Previous', sortable: true, width: '15%' },
      { key: 'change', label: 'Change', sortable: true, width: '15%' },
      { key: 'trend', label: 'Trend', sortable: true, width: '15%' },
      { key: 'target', label: 'Target', sortable: true, width: '15%' }
    ],
    documents: [
      { key: 'fileName', label: 'File Name', sortable: true, width: '25%' },
      { key: 'type', label: 'Type', sortable: true, width: '15%' },
      { key: 'size', label: 'Size', sortable: true, width: '15%' },
      { key: 'modified', label: 'Last Modified', sortable: true, width: '20%' },
      { key: 'owner', label: 'Owner', sortable: true, width: '15%' },
      { key: 'actions', label: 'Actions', sortable: false, width: '10%' }
    ],
    settings: [
      { key: 'setting', label: 'Setting', sortable: true, width: '30%' },
      { key: 'value', label: 'Value', sortable: true, width: '25%' },
      { key: 'description', label: 'Description', sortable: true, width: '30%' },
      { key: 'lastModified', label: 'Last Modified', sortable: true, width: '15%' }
    ]
  };

  // Get visible tabs for a tile
  getVisibleTabs(): TabConfig[] {
    return this.tabConfigs
      .filter(tab => tab.visible)
      .sort((a, b) => a.order - b.order);
  }

  // Get all tabs (for admin purposes)
  getAllTabs(): TabConfig[] {
    return [...this.tabConfigs].sort((a, b) => a.order - b.order);
  }

  // Get columns for a specific tab
  getColumnsForTab(tabId: string): TableColumn[] {
    return this.columnConfigs[tabId] || [];
  }

  // Update tab visibility
  updateTabVisibility(tabId: string, visible: boolean): void {
    const tab = this.tabConfigs.find(t => t.id === tabId);
    if (tab) {
      tab.visible = visible;
    }
  }

  // Different API calls for each tab
  getTabData(tileId: string, tabId: string, forceRefresh: boolean = false): Observable<any> {
    // Always fetch from backend (no in-memory caching)

    let apiCall: Observable<any> | null = null;
    switch (tabId) {
      case 'overview':
        apiCall = this.GetOverviewData(tileId);
        break;
      case 'team':
        apiCall = this.GetTeamData(tileId);
        break;
      case 'analytics':
        apiCall = this.GetAnalyticsData(tileId);
        break;
      case 'documents':
        apiCall = this.GetDocumentsData(tileId);
        break;
      case 'settings':
        apiCall = this.GetSettingsData(tileId);
        break;
      default:
        apiCall = null;
    }

    if (apiCall) {
      // Normalize responses: backend may return { data: [...] } or directly an array
      return apiCall.pipe(
        timeout(10000), // fail if backend takes >10s
        map((response: any) => {
          if (response == null) {
            return { data: [], lastUpdated: new Date().toLocaleTimeString(), totalCount: 0 };
          }
          if (response.data !== undefined) {
            return response;
          }
          if (Array.isArray(response)) {
            return { data: response, lastUpdated: new Date().toLocaleTimeString(), totalCount: response.length };
          }
          // If it's an object without `data`, try to infer — wrap in array
          return { data: [response], lastUpdated: new Date().toLocaleTimeString(), totalCount: 1 };
        }),
        catchError((err) => {
          // convert errors into a consistent empty response so callers still complete
          console.error('Error fetching tab data for', tabId, err);
          return of({ data: [], lastUpdated: new Date().toLocaleTimeString(), totalCount: 0 });
        })
      );
    }

    // fallback to mock data if tabId is unknown
    const mockDataGenerators: { [key: string]: () => any[] } = {
      overview: () => [],
      team: () => [],
      analytics: () => [],
      documents: () => [],
      settings: () => []
    };
    const dataGenerator = mockDataGenerators[tabId];
    const data = dataGenerator ? dataGenerator() : [];
    return of({
      data: data,
      lastUpdated: new Date().toLocaleTimeString(),
      totalCount: data.length
    }).pipe(delay(800));
  }
  
}
