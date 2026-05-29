import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface PrayerTime {
  name: string;
  arabic: string;
  time: string;
}

interface AladhanTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

@Component({
  selector: 'app-prayer-times',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './prayer-times.component.html',
  styleUrls: ['./prayer-times.component.css']
})
export class PrayerTimesComponent implements OnInit, OnDestroy {
  prayerTimes: PrayerTime[] = [
    { name: "Fajr", arabic: "\u0627\u0644\u0641\u062C\u0631", time: "05:30" },
    { name: "Dhuhr", arabic: "\u0627\u0644\u0638\u0647\u0631", time: "13:30" },
    { name: "Asr", arabic: "\u0627\u0644\u0639\u0635\u0631", time: "16:45" },
    { name: "Maghrib", arabic: "\u0627\u0644\u0645\u063A\u0631\u0628", time: "19:15" },
    { name: "Isha", arabic: "\u0627\u0644\u0639\u0634\u0627\u0621", time: "21:00" }
  ];

  nextPrayer: PrayerTime | null = null;
  nextPrayerTimeDiff = '';
  locationCity = '';
  locationCountry = '';
  currentDate = '';
  isLoading = true;
  errorMsg = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.fetchPrayerTimesViaGeolocation();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchPrayerTimesViaGeolocation() {
    if (!navigator.geolocation) {
      this.fetchPrayerTimesByCity('Abidjan', 'CI');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.fetchPrayerTimesByCoords(lat, lng);
      },
      () => {
        this.fetchPrayerTimesByCity('Abidjan', 'CI');
      },
      { timeout: 5000 }
    );
  }

  fetchPrayerTimesByCoords(lat: number, lng: number) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=2`;

    this.http.get<{ data: { timings: AladhanTimings; meta: { timezone: string } } }>(url)
      .subscribe({
        next: (res) => {
          this.applyTimings(res.data.timings);
          this.locationCity = res.data.meta.timezone.split('/').pop()?.replace(/_/g, ' ') || '';
          this.isLoading = false;
        },
        error: () => {
          this.errorMsg = 'Impossible de charger les horaires. Utilisation des horaires par défaut.';
          this.isLoading = false;
          this.updateNextPrayer();
          this.startInterval();
        }
      });
  }

  fetchPrayerTimesByCity(city: string, country: string) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const url = `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${city}&country=${country}&method=2`;

    this.http.get<{ data: { timings: AladhanTimings } }>(url)
      .subscribe({
        next: (res) => {
          this.applyTimings(res.data.timings);
          this.locationCity = city;
          this.locationCountry = country;
          this.isLoading = false;
        },
        error: () => {
          this.errorMsg = 'Impossible de charger les horaires. Utilisation des horaires par défaut.';
          this.isLoading = false;
          this.updateNextPrayer();
          this.startInterval();
        }
      });
  }

  private applyTimings(timings: AladhanTimings) {
    const map: { key: string; name: string; arabic: string }[] = [
      { key: 'Fajr', name: 'Fajr', arabic: '\u0627\u0644\u0641\u062C\u0631' },
      { key: 'Dhuhr', name: 'Dhuhr', arabic: '\u0627\u0644\u0638\u0647\u0631' },
      { key: 'Asr', name: 'Asr', arabic: '\u0627\u0644\u0639\u0635\u0631' },
      { key: 'Maghrib', name: 'Maghrib', arabic: '\u0627\u0644\u0645\u063A\u0631\u0628' },
      { key: 'Isha', name: 'Isha', arabic: '\u0627\u0644\u0639\u0634\u0627\u0621' }
    ];

    this.prayerTimes = map.map(p => ({
      name: p.name,
      arabic: p.arabic,
      time: timings[p.key].substring(0, 5)
    }));

    this.updateNextPrayer();
    this.startInterval();
  }

  private startInterval() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.updateNextPrayer(), 60000);
  }

  updateNextPrayer() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let next = this.prayerTimes[0];
    let nextMin = Infinity;

    for (const p of this.prayerTimes) {
      const [h, m] = p.time.split(':').map(Number);
      const pm = h * 60 + m;
      if (pm > nowMin && pm < nextMin) {
        next = p;
        nextMin = pm;
      }
    }

    let diff = 0;
    if (nextMin === Infinity) {
      next = this.prayerTimes[0];
      const [h, m] = next.time.split(':').map(Number);
      const pm = h * 60 + m;
      diff = (24 * 60 - nowMin) + pm;
    } else {
      diff = nextMin - nowMin;
    }

    const hh = Math.floor(diff / 60);
    const mm = diff % 60;

    this.nextPrayer = next;
    this.nextPrayerTimeDiff = `${hh}h ${mm}min`;
  }
}
