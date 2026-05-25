import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface PrayerTime {
  name: string;
  arabic: string;
  time: string;
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
    { name: "Fajr", arabic: "الفجر", time: "05:30" },
    { name: "Dhuhr", arabic: "الظهر", time: "13:30" },
    { name: "Asr", arabic: "العصر", time: "16:45" },
    { name: "Maghrib", arabic: "المغرب", time: "19:15" },
    { name: "Isha", arabic: "العشاء", time: "21:00" }
  ];

  nextPrayer: PrayerTime | null = null;
  nextPrayerTimeDiff = '';
  private intervalId: any;

  ngOnInit() {
    this.updateNextPrayer();
    this.intervalId = setInterval(() => {
      this.updateNextPrayer();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateNextPrayer() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let next = this.prayerTimes[0];
    let nextMin = Infinity;
    
    for (let p of this.prayerTimes) {
      let [h, m] = p.time.split(':').map(Number);
      let pm = h * 60 + m;
      if (pm > nowMin && pm - nowMin < nextMin - nowMin) {
        next = p;
        nextMin = pm;
      }
    }
    
    // If no prayer is left today, the next one is Fajr tomorrow
    let diff = 0;
    if (nextMin === Infinity) {
      next = this.prayerTimes[0];
      let [h, m] = next.time.split(':').map(Number);
      let pm = h * 60 + m;
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
