import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environments/environment';

interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  is_past: boolean;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  events: EventItem[] = [];
  isLoading = false;
  showPastEvents = false;
  showCreateModal = false;

  newEvent = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'general'
  };

  private readonly apiBase = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.loadEvents();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadEvents() {
    this.isLoading = true;
    this.http.get<{ events?: EventItem[]; data?: EventItem[] }>(
      `${this.apiBase}/events`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const all = res.events || res.data || [];
        const now = new Date();
        this.events = all.map(e => ({
          ...e,
          is_past: new Date(e.date) < now
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get upcomingEvents(): EventItem[] {
    return this.events.filter(e => !e.is_past).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  get pastEvents(): EventItem[] {
    return this.events.filter(e => e.is_past).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  togglePastEvents() {
    this.showPastEvents = !this.showPastEvents;
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newEvent = { title: '', description: '', date: '', time: '', location: '', category: 'general' };
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createEvent() {
    if (!this.newEvent.title || !this.newEvent.date) return;

    this.http.post(`${this.apiBase}/events`, this.newEvent, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadEvents();
      },
      error: () => {}
    });
  }

  deleteEvent(event: EventItem) {
    if (!confirm(`Supprimer l'événement "${event.title}" ?`)) return;

    this.http.delete(`${this.apiBase}/events/${event.id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => this.loadEvents(),
      error: () => {}
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time || '';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      priere: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      formation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      social: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      conference: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    };
    return colors[category] || colors['general'];
  }

  getDaysUntil(date: string): number {
    const target = new Date(date);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
