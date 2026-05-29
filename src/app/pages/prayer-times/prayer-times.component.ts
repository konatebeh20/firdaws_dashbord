import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

import { PrayerTimeService, PrayerTime, PrayerTimingsResponse, UserLocation } from '../../shared/services/prayer-time/prayer-time.service';

@Component({
  selector: 'app-prayer-times',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './prayer-times.component.html',
  styleUrls: ['./prayer-times.component.css']
})
export class PrayerTimesComponent implements OnInit, OnDestroy {

  prayerTimes: PrayerTime[] = [];
  nextPrayer: PrayerTime | null = null;
  nextPrayerTimeDiff = '';

  isLoading = true;
  errorMessage: string | null = null;
  isDefaultLocation = false;

  // locationError = false;
  // currentLocationName = "Mosquée Cité Bel Aire";
  // locationInfo: string = 'Chargement...';

  
  locationLabel  = '';
  locationQuarter = '';
  hijriDate = '';
  methodName = '';
  
  private intervalId: any;  

  constructor(private prayerService: PrayerTimeService) {}

  ngOnInit() {
    this.loadPrayerTimes();
  }

   ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadPrayerTimes() {
    this.isLoading = true;
    this.errorMessage = null;
    this.isDefaultLocation = false;
    if (this.intervalId) clearInterval(this.intervalId);

    this.prayerService.loadPrayerData().subscribe({
      next: data => this.applyData(data),
      error: () => {
        this.isDefaultLocation = true;
        this.prayerService.loadFallbackData().subscribe({
          next:  data => this.applyData(data),
          error: ()   => {
            this.isLoading = false;
            this.errorMessage = 'Impossible de charger les horaires. Vérifiez votre connexion.';
          }
        });
      }
    });
    
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       const lat = position.coords.latitude;
    //       const lng = position.coords.longitude;
          
    //       // 1. On récupère les horaires exactes au GPS (Quartier/Zone pris en compte)
    //       this.prayerService.getPrayerTimesByCoords(lat, lng).subscribe({
    //         next: (times) => {
    //           this.prayerTimes = times;
    //           this.updateNextPrayer();
    //           this.isLoading = false;
    //         },
    //         error: () => this.initWithFallback()
    //       });

    //       // 2. En parallèle, on récupère le nom lisible de la commune/zone
    //       this.prayerService.getLocationName(lat, lng).subscribe({
    //         next: (name) => {
    //           this.currentLocationName = name; // Affichera par exemple : "Cocody, Abidjan"
    //         },
    //         error: () => {
    //           this.currentLocationName = "Votre Position";
    //         }
    //       });
    //     },
    //     (error) => {
    //       this.locationError = true;
    //       this.initWithFallback();
    //     }
    //   );
    // } else {
    //   this.initWithFallback();
    // }
  }

   private applyData(data: { location: UserLocation; timings: PrayerTimingsResponse }) {

    this.prayerTimes    = this.prayerService.formatPrayerTimes(data.timings);
    this.locationLabel   = data.location.label;
    this.locationQuarter = data.location.quarter || data.location.city || '';
    this.methodName  = data.timings.data.meta.method?.name || '';

    const h = data.timings.data.date.hijri;
    this.hijriDate = `${h.date} · ${h.month.ar} ${h.year}`;

    // this.hijriDate   = `${d.date.hijri.date} · ${d.date.hijri.month.ar} ${d.date.hijri.year}`;

    // const t = data.timings.data.timings;
    // const d = data.timings.data;
    
    this.isLoading   = false;
    this.updateNextPrayer();

    this.intervalId = setInterval(() => this.updateNextPrayer(), 60000);
  }

  updateNextPrayer() {
    if (!this.prayerTimes.length) return;

    const { prayer, diff } = this.prayerService.getNextPrayer(this.prayerTimes);
    this.nextPrayer       = prayer;
    this.nextPrayerTimeDiff = this.prayerService.formatTimeDiff(diff);

    // const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    // const { name, diff } = this.prayerTimesService.getNextPrayer(this.prayerTimes);

    // let next: PrayerTime | null = null;
    // let minDiff = Infinity;

    // for (const p of this.prayerTimes) {
    //   const [h, m] = p.time.split(':').map(Number);
    //   const diff = h * 60 + m - nowMin;
    //   if (diff > 0 && diff < minDiff) { minDiff = diff; next = p; }
    // }

    // if (!next) {
    //   next = this.prayerTimes[0];
    //   const [h, m] = next.time.split(':').map(Number);
    //   minDiff = 24 * 60 - nowMin + h * 60 + m;
    // }

    
    // this.nextPrayer = this.prayerTimes.find(p => p.name === name) || null;
    // // this.nextPrayer = next;
    // this.nextPrayerTimeDiff = this.prayerTimesService.formatTimeDiff(diff);
    // // this.nextPrayerTimeDiff = `${Math.floor(minDiff / 60)}h ${minDiff % 60}min`;
  }

  refresh() {
    this.loadPrayerTimes();
  }

  get todayDate(): string {
    return new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }


  // private initWithFallback() {
  //   this.updateNextPrayer();
  //   this.isLoading = false;
  // }

  // loadPrayerTimes() {
  //   this.isLoading = true;
  //   this.errorMessage = null;
  //   this.isDefaultLocation = false;
    
  //   this.prayerTimesService.getPrayerTimes().subscribe({
  //     next: data => this.applyData(data),
  //     error: () => {
  //       // Géoloc refusée ou échouée → fallback Abidjan
  //       this.isDefaultLocation = true;
  //       this.prayerService.loadFallbackData().subscribe({
  //         next:  data  => this.applyData(data),
  //         error: ()    => {
  //           this.isLoading = false;
  //           this.error = 'Impossible de charger les horaires. Vérifiez votre connexion.';
  //         }
  //       });
  //     }
  //   });

  //   this.prayerTimesService.getPrayerTimes().subscribe({
  //     next: (response: PrayerTimesResponse) => {
  //       this.prayerTimes = this.prayerTimesService.formatPrayerTimes(response);
        
  //       // Extraire les infos de localisation
  //       const meta = response.data.meta;
  //       this.locationInfo = `${meta.latitude.toFixed(4)}°, ${meta.longitude.toFixed(4)}°`;
        
  //       this.updateNextPrayer();
  //       this.startTimer();
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Erreur chargement horaires:', error);
  //       this.errorMessage = 'Impossible de charger les horaires. Vérifiez votre connexion.';
  //       this.isLoading = false;
        
  //       // Fallback sur des horaires par défaut
  //       this.setDefaultPrayerTimes();
  //     }
  //   });
  // }

 
  // private clean(t: string): string { return t.split(' ')[0]; }

  // setDefaultPrayerTimes() {
  //   this.prayerTimes = [
  //     { name: "Fajr", arabic: "الفجر", time: "05:30" },
  //     { name: "Dhuhr", arabic: "الظهر", time: "13:30" },
  //     { name: "Asr", arabic: "العصر", time: "16:45" },
  //     { name: "Maghrib", arabic: "المغرب", time: "19:15" },
  //     { name: "Isha", arabic: "العشاء", time: "21:00" }
  //   ];
  //   this.locationInfo = 'Abidjan (fallback)';
  //   this.updateNextPrayer();
  //   this.startTimer();
  // }



  // // updateNextPrayer() {
  // //   const now = new Date();
  // //   const nowMin = now.getHours() * 60 + now.getMinutes();
  // //   let next = this.prayerTimes[0];
  // //   let nextMin = Infinity;
    
  // //   for (let p of this.prayerTimes) {
  // //     let [h, m] = p.time.split(':').map(Number);
  // //     let pm = h * 60 + m;
  // //     if (pm > nowMin && pm - nowMin < nextMin - nowMin) {
  // //       next = p;
  // //       nextMin = pm;
  // //     }
  // //   }
    
  // //   // If no prayer is left today, the next one is Fajr tomorrow
  // //   let diff = 0;
  // //   if (nextMin === Infinity) {
  // //     next = this.prayerTimes[0];
  // //     let [h, m] = next.time.split(':').map(Number);
  // //     let pm = h * 60 + m;
  // //     diff = (24 * 60 - nowMin) + pm;
  // //   } else {
  // //     diff = nextMin - nowMin;
  // //   }
    
  // //   const hh = Math.floor(diff / 60);
  // //   const mm = diff % 60;
    
  // //   this.nextPrayer = next;
  // //   this.nextPrayerTimeDiff = `${hh}h ${mm}min`;
  // // }


  // startTimer() {
  //   if (this.intervalId) {
  //     clearInterval(this.intervalId);
  //   }
    
  //   this.intervalId = setInterval(() => {
  //     this.updateNextPrayer();
  //   }, 60000); // Met à jour toutes les minutes
  // }
}
