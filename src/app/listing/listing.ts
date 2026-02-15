import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { Router, RouterModule } from '@angular/router';
import { TabConfig, TabData, Tile } from '../tile.model';
import { TileService } from '../tile.service';
import { ExpandableContent } from '../expandable-content/expandable-content';


@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [RouterModule, ExpandableContent],
  templateUrl: './listing.html',
  styleUrls: ['./listing.scss']
})
export class Listing implements OnInit {
  tiles: Tile[] = [
    {
      id: 'item1',
      title: 'Project Alpha',
      description: 'Development Team • Created: 2024-01-15',
      badgeNumber: 42,
      badgeClass: 'bg-primary',
      createdDate: '2024-01-15',
      team: 'Development Team',
      showDocuments: true
    },
    {
      id: 'item2',
      title: 'Marketing Campaign',
      description: 'Marketing Team • Created: 2024-02-01',
      badgeNumber: 128,
      badgeClass: 'bg-success',
      createdDate: '2024-02-01',
      team: 'Marketing Team',
      showDocuments: false
    },
    {
      id: 'item3',
      title: 'Research Project',
      description: 'R&D Department • Created: 2024-01-20',
      badgeNumber: 76,
      badgeClass: 'bg-warning text-dark',
      createdDate: '2024-01-20',
      team: 'R&D Department',
      showDocuments: true
    }
  ];

  expandedTileId: string | null = null;
  tileTabData: Map<string, TabData[]> = new Map();
  activeTabs: Map<string, string> = new Map();
  allTabConfigs: TabConfig[] = [];

  constructor(private router: Router, private tileService: TileService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.allTabConfigs = this.tileService.getAllTabs();
  }

  // In the toggleTile method, update this part:
toggleTile(tileId: string): void {
  if (this.expandedTileId === tileId) {
    this.expandedTileId = null;
  } else {
    this.expandedTileId = tileId;
    
    // Initialize tab data for this tile if not exists
    if (!this.tileTabData.has(tileId)) {
      const visibleTabs = this.tileService.getVisibleTabs();
      const tabData: TabData[] = visibleTabs.map((tabConfig: TabConfig) => ({
        ...tabConfig,
        loading: false,
        loaded: false
      }));
      this.tileTabData.set(tileId, tabData);
    }
    
    // Set first visible tab as active if not set
    if (!this.activeTabs.has(tileId)) {
      const visibleTabs = this.getTileTabData(tileId).filter(tab => tab.visible);
      if (visibleTabs.length > 0) {
        const firstTabId = visibleTabs[0].id;
        this.activeTabs.set(tileId, firstTabId);
        
        // Auto-load the first tab when expanding
        this.loadTabData(tileId, firstTabId, false);
      }
    } else {
      // If we already have an active tab, ensure it's loaded
      const activeTabId = this.activeTabs.get(tileId);
      if (activeTabId) {
        this.loadTabData(tileId, activeTabId, false);
      }
    }
  }
}

  isTileExpanded(tileId: string): boolean {
    return this.expandedTileId === tileId;
  }

  onTabSelected(event: { tileId: string, tabId: string }): void {
    const { tileId, tabId } = event;
    this.activeTabs.set(tileId, tabId);
    this.loadTabData(tileId, tabId, false);
  }

  onTabRefreshed(event: { tileId: string, tabId: string }): void {
    const { tileId, tabId } = event;
    this.loadTabData(tileId, tabId, true);
  }

  private loadTabData(tileId: string, tabId: string, forceRefresh: boolean = false): void {
    const tabData = this.tileTabData.get(tileId);
    const tab = tabData?.find(t => t.id === tabId);
    
    if (tab && (forceRefresh || !tab.loaded) && !tab.loading) {
  tab.loading = true;

      if (forceRefresh) {
        // cache removed in TileService; calling getTabData with forceRefresh for compatibility
      }

      this.tileService.getTabData(tileId, tabId, forceRefresh)
        .pipe(finalize(() => {
          tab.loading = false;
          try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
        }))
        .subscribe({
          next: (response) => {
            tab.loading = false; // defensive clear
            tab.loaded = true;
            // The service returns an object { data: [...], lastUpdated, totalCount }
            // Store the actual data array on the tab so templates that expect an array work correctly.
            tab.data = response?.data || [];
            tab.lastUpdated = response?.lastUpdated;
            // Under zoneless change detection we need to run detectChanges to update the UI
            try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
          },
          error: (error) => {
            tab.loading = false; // defensive clear
            console.error('[Listing] loadTabData ERROR', { tileId, tabId, error });
            try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
          }
        });
    }
  }

  getTileTabData(tileId: string): TabData[] {
    return this.tileTabData.get(tileId) || [];
  }

  getActiveTab(tileId: string): string {
    return this.activeTabs.get(tileId) || '';
  }

  navigateToDetail(tileId: string): void {
    this.router.navigate(['/detail', tileId]);
  }

  // Method to toggle tab visibility (for admin purposes)
  toggleTabVisibility(tabId: string): void {
    this.tileService.updateTabVisibility(tabId, !this.allTabConfigs.find(t => t.id === tabId)?.visible);
    
    // Refresh all expanded tiles to update their tab data
    this.tileTabData.clear();
    this.activeTabs.clear();
    
    if (this.expandedTileId) {
      const currentExpanded = this.expandedTileId;
      this.expandedTileId = null;
      setTimeout(() => this.toggleTile(currentExpanded));
    }
  }

  // (per-tile visibility is handled via `tile.showDocuments` property passed into ExpandableContent)

  ngOnDestroy(): void {
    this.tileTabData.clear();
    this.activeTabs.clear();
  }
  
}
