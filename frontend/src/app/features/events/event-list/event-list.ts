import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { Event, EventsByStatus } from '../../../core/models/event.model';

type EventStatus = 'published' | 'draft' | 'cancelled' | 'completed';
type TagSeverity =
  | 'success'
  | 'secondary'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast'
  | null
  | undefined;

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TableModule,
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList implements OnInit {
  groupedResponse = signal<EventsByStatus | null>(null);
  loading = signal(false);
  searchTitle = signal('');
  activeTab = signal<EventStatus>('published');

  readonly statusOrder: EventStatus[] = ['published', 'draft', 'cancelled', 'completed'];
  readonly canCreateEvent = computed(() => this.authService.canManageEvents());

  private initialized = false;
  private requestId = 0;

  constructor(
    public authService: AuthService,
    private eventService: EventService,
  ) {
    effect(() => {
      this.authService.authVersion();

      if (!this.initialized) return;

      this.loadEvents();
    });
  }

  ngOnInit(): void {
    this.initialized = true;
    this.loadEvents();
  }

  loadEvents(): void {
    const currentRequestId = ++this.requestId;
    this.loading.set(true);

    this.eventService.getEventsGrouped().subscribe({
      next: (data) => {
        if (currentRequestId !== this.requestId) return;

        this.groupedResponse.set(data);
        this.ensureValidActiveTab();
        this.loading.set(false);
      },
      error: () => {
        if (currentRequestId !== this.requestId) return;
        this.loading.set(false);
      },
    });
  }

  setActiveTab(status: EventStatus): void {
    this.activeTab.set(status);
    this.searchTitle.set('');
  }

  clearSearch(): void {
    this.searchTitle.set('');
  }

  getItems(status: EventStatus): Event[] {
    const data = this.groupedResponse();
    if (!data) return [];
    return data[status] ?? [];
  }

  getTotal(status: EventStatus): number {
    const data = this.groupedResponse();
    if (!data) return 0;

    const totalsMap: Record<EventStatus, number> = {
      published: data.published_total,
      draft: data.draft_total,
      cancelled: data.cancelled_total,
      completed: data.completed_total,
    };

    return totalsMap[status] ?? 0;
  }

  getFilteredItems(status: EventStatus): Event[] {
    const items = this.getItems(status);
    const term = this.searchTitle().trim().toLowerCase();

    if (!term) return items;

    return items.filter((event) =>
      [event.title, event.description, event.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  readonly activeItems = computed(() => this.getFilteredItems(this.activeTab()));
  readonly activeRawTotal = computed(() => this.getItems(this.activeTab()).length);
  readonly hasSearch = computed(() => this.searchTitle().trim().length > 0);

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      draft: 'secondary',
      published: 'success',
      cancelled: 'danger',
      completed: 'info',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Borradores',
      published: 'Publicados',
      cancelled: 'Cancelados',
      completed: 'Completados',
    };
    return map[status] ?? status;
  }

  shouldUseTable(status: EventStatus): boolean {
    return status === 'cancelled' || status === 'completed';
  }

  getVisibleStatuses(): EventStatus[] {
    return this.statusOrder.filter((status) => this.getTotal(status) > 0);
  }

  ensureValidActiveTab(): void {
    const visibleStatuses = this.getVisibleStatuses();

    if (visibleStatuses.length === 0) return;

    if (!visibleStatuses.includes(this.activeTab())) {
      this.activeTab.set(visibleStatuses[0]);
    }
  }
}