import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { TabData, TableColumn } from '../tile.model';
import { TileService } from '../tile.service';
@Component({
  selector: 'app-expandable-content',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf],
  templateUrl: './expandable-content.html',
  styleUrls: ['./expandable-content.scss'],
})
export class ExpandableContent implements OnChanges {
  @Input() tileId!: string;
  @Input() isExpanded = false;
  @Input() activeTabData: TabData[] = [];
  @Input() selectedTabId: string = '';
  @Input() showDocuments: boolean = true;

  @Output() tabSelected = new EventEmitter<{ tileId: string; tabId: string }>();
  @Output() tabRefreshed = new EventEmitter<{ tileId: string; tabId: string }>();

  columns: TableColumn[] = [];
  expandedRows: Set<number> = new Set();

  constructor(private tileService: TileService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTabData'] && this.activeTabData.length > 0) {
      // Ensure we have a valid selected tab. Only auto-select and emit if the parent
      // did NOT provide a selectedTabId in the same change cycle. This prevents
      // duplicate tabSelected emissions which were causing duplicate loads.
      const hasValidSelected = !!(
        this.selectedTabId &&
        this.activeTabData.find((tab) => tab.id === this.selectedTabId && tab.visible)
      );

      const selectedTabChangedInThisCycle = !!(changes['selectedTabId'] && changes['selectedTabId'].currentValue);

      if (!hasValidSelected && !selectedTabChangedInThisCycle) {
        const firstVisibleTab = this.activeTabData.find((tab) => tab.visible);
        if (firstVisibleTab) {
          this.selectedTabId = firstVisibleTab.id;
          this.tabSelected.emit({ tileId: this.tileId, tabId: this.selectedTabId });
        }
      }
    }

    // Load columns when tab changes
    if (changes['selectedTabId'] && this.selectedTabId) {
      this.columns = this.tileService.getColumnsForTab(this.selectedTabId);
    }
  }

  onTabClick(tabId: string): void {
    if (tabId !== this.selectedTabId) {
      this.selectedTabId = tabId;
      this.columns = this.tileService.getColumnsForTab(tabId);
      this.tabSelected.emit({ tileId: this.tileId, tabId });
    }
  }

  onRefreshClick(tabId: string, event: Event): void {
    event.stopPropagation();
    this.tabRefreshed.emit({ tileId: this.tileId, tabId });
  }

  getTabContent(tabId: string): any {
    const tab = this.activeTabData.find((t) => t.id === tabId);
    return tab?.data;
  }

  canRefresh(tabId: string): boolean {
    const tab = this.activeTabData.find((t) => t.id === tabId);
    return !!(tab && tab.loaded && !tab.loading);
  }

  hasData(tabId: string): boolean {
    const tab = this.activeTabData.find((t) => t.id === tabId);
    return !!(tab && tab.data && tab.data.length > 0);
  }

  getDataLength(tabId: string): number {
    const tab = this.activeTabData.find((t) => t.id === tabId);
    return tab?.data?.length || 0;
  }

  // Get visible tabs for ngFor
  getVisibleTabs(): TabData[] {
    return this.activeTabData.filter((tab) => tab.visible && (tab.id !== 'documents' || this.showDocuments));
  }

  isTabActive(tabId: string): boolean {
    return this.selectedTabId === tabId;
  }

  // Get column keys for the table
  getColumnKeys(): string[] {
    return this.columns.map((col) => col.key);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // Helper to get the currently selected tab object
  getSelectedTab(): TabData | undefined {
    return this.activeTabData.find((t) => t.id === this.selectedTabId);
  }

  // Refresh the currently selected tab (emits to parent)
  refreshActiveTab(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedTabId) {
      this.tabRefreshed.emit({ tileId: this.tileId, tabId: this.selectedTabId });
    }
  }

  trackByCoverageFn(index: number, item: any): any {
    return item.id || index;
  }

  // Toggle row expansion
  toggleRow(rowId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.expandedRows.has(rowId)) {
      this.expandedRows.delete(rowId);
    } else {
      this.expandedRows.add(rowId);
    }
  }

  isRowExpanded(rowId: number): boolean {
    return this.expandedRows.has(rowId);
  }

  // Check if current tab is analytics
  isAnalyticsTab(): boolean {
    return this.selectedTabId === 'analytics';
  }

}
