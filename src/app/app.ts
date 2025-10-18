import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('my-angular-app');
  expandedItems: Set<string> = new Set();

  constructor(private router: Router) {}

  toggleItem(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  navigateToDetail(itemId: string): void {
    // Navigate to detail page - adjust the route as needed
    this.router.navigate(['/detail', itemId]);
  }
}
