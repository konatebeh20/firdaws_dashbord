import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { DashboardService, DashboardStats } from '../../../shared/services/dashboard/dashboard.service';
import { DonationsService, Don } from '../../../shared/services/donations/donations.service';
import { EventsService, Event as MosqueEvent } from '../../../shared/services/events/events.service';
import { DocumentsService, DocumentInfo } from '../../../shared/services/documents/documents.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { YouTubeService, YouTubeVideo } from '../../../shared/services/videos/youtube.service';
import { PrayerTimeService, PrayerTime } from '../../../shared/services/prayer-time/prayer-time.service';

interface FideleView {
  name: string;
  initials: string;
  since: string;
}

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule, MonthlySalesChartComponent],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit, OnDestroy {
  loading = true;

  // ----- Stats cards -----
  stats: DashboardStats | null = null;

  // ----- Prayer times -----
  prayerTimes: PrayerTime[] = [];
  nextPrayerName = '';
  prayerLocation = '';

  // ----- Donations evolution chart -----
  chartData: number[] = [];
  chartCategories: string[] = [];

  // ----- Recent events (upcoming / not finished) -----
  recentEvents: MosqueEvent[] = [];

  // ----- Recent donations (rotate 3 at a time) -----
  private allDonations: Don[] = [];
  visibleDonations: Don[] = [];
  private donationOffset = 0;

  // ----- Documents / Videos / Fidèles -----
  recentDocuments: DocumentInfo[] = [];
  recentVideos: YouTubeVideo[] = [];
  activeFideles: FideleView[] = [];

  private subs: Subscription[] = [];
  private rotationSub?: Subscription;

  private readonly monthLabels = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  constructor(
    private dashboardService: DashboardService,
    private donationsService: DonationsService,
    private eventsService: EventsService,
    private documentsService: DocumentsService,
    private usersService: UsersService,
    private youtubeService: YouTubeService,
    private prayerTimeService: PrayerTimeService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadEvolution();
    this.loadRecentEvents();
    this.loadRecentDonations();
    this.loadDocuments();
    this.loadFideles();
    this.loadVideos();
    this.loadPrayerTimes();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.rotationSub?.unsubscribe();
  }

  // ===================== Loaders =====================

  private loadStats(): void {
    this.subs.push(
      this.dashboardService.getStats().subscribe(stats => {
        this.stats = stats;
        this.loading = false;
      })
    );
  }

  private loadEvolution(): void {
    this.subs.push(
      this.donationsService.getDonationsByMonth().subscribe(months => {
        this.chartData = months.map(m => m.total);
        this.chartCategories = months.map(m => this.formatMonthLabel(m.month));
      })
    );
  }

  private loadRecentEvents(): void {
    this.subs.push(
      this.eventsService.getEvents().subscribe(events => {
        const now = new Date();
        this.recentEvents = events
          .filter(e => {
            // Garder les événements non terminés (date de fin / date > maintenant)
            const ref = e.end_date || e.event_date;
            const finished = ref ? new Date(ref) < now : false;
            return !finished && e.status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 4);
      })
    );
  }

  private loadRecentDonations(): void {
    this.subs.push(
      this.donationsService.getDons().subscribe(dons => {
        this.allDonations = [...dons].sort(
          (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        );
        this.donationOffset = 0;
        this.updateVisibleDonations();
        // Rotation : afficher 3 à la fois, faire défiler les suivants
        this.rotationSub?.unsubscribe();
        if (this.allDonations.length > 3) {
          this.rotationSub = interval(5000).subscribe(() => {
            this.donationOffset = (this.donationOffset + 3) % this.allDonations.length;
            this.updateVisibleDonations();
          });
        }
      })
    );
  }

  private updateVisibleDonations(): void {
    const list = this.allDonations;
    if (!list.length) {
      this.visibleDonations = [];
      return;
    }
    const result: Don[] = [];
    for (let i = 0; i < Math.min(3, list.length); i++) {
      result.push(list[(this.donationOffset + i) % list.length]);
    }
    this.visibleDonations = result;
  }

  private loadDocuments(): void {
    this.subs.push(
      this.documentsService.getAll().subscribe((res: any) => {
        const docs: DocumentInfo[] = res?.data || res?.documents || (Array.isArray(res) ? res : []);
        this.recentDocuments = docs.filter(d => !d.archived).slice(0, 4);
      })
    );
  }

  private loadFideles(): void {
    this.subs.push(
      this.usersService.getUsers().subscribe((res: any) => {
        const users: any[] = res?.users || res?.data || (Array.isArray(res) ? res : []);
        this.activeFideles = users
          .filter(u => u.is_active !== false)
          .slice(0, 4)
          .map(u => {
            const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Fidèle';
            const since = u.created_at ? new Date(u.created_at).getFullYear().toString() : '';
            return {
              name,
              initials: this.initials(name),
              since: since ? `Membre depuis ${since}` : 'Membre',
            };
          });
      })
    );
  }

  private loadVideos(): void {
    this.subs.push(
      this.youtubeService.fetchAllVideos().subscribe(videos => {
        this.recentVideos = (videos || []).slice(0, 4);
      })
    );
  }

  private loadPrayerTimes(): void {
    this.subs.push(
      this.prayerTimeService.loadFallbackData().subscribe({
        next: ({ location, timings }) => {
          this.prayerTimes = this.prayerTimeService.formatPrayerTimes(timings);
          this.prayerLocation = location.label || '';
          if (this.prayerTimes.length) {
            this.nextPrayerName = this.prayerTimeService.getNextPrayer(this.prayerTimes).prayer.name;
          }
        },
        error: () => { this.prayerTimes = []; },
      })
    );
  }

  // ===================== Helpers (template) =====================

  get donationsTotal(): number {
    return this.stats?.donations.total ?? 0;
  }

  get fidelesCount(): number {
    return this.stats?.fideles.total ?? 0;
  }

  get eventsCount(): number {
    return this.stats?.events.total ?? 0;
  }

  get videosCount(): number {
    return this.recentVideos.length
      ? (this.youtubeService.allVideos()?.length ?? this.stats?.videos.total ?? 0)
      : (this.stats?.videos.total ?? 0);
  }

  get annoncesCount(): number {
    return this.stats?.infos.active ?? 0;
  }

  get documentsCount(): number {
    return this.stats?.documents.total ?? 0;
  }

  /** Format compact: 4200000 -> "4.2M", 150000 -> "150K" */
  formatCompact(value: number): string {
    if (value == null) return '0';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
    return value.toString();
  }

  formatAmount(value: number): string {
    return (value ?? 0).toLocaleString('fr-FR');
  }

  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  eventDay(dateStr: string): string {
    if (!dateStr) return '--';
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  eventDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  donationDateLabel(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private formatMonthLabel(ym: string): string {
    // ym = "YYYY-MM"
    const parts = (ym || '').split('-');
    if (parts.length < 2) return ym;
    const monthIdx = parseInt(parts[1], 10) - 1;
    const label = this.monthLabels[monthIdx] || ym;
    return `${label} ${parts[0].slice(2)}`;
  }
}
