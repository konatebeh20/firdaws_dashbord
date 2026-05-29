import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { map, retry, switchMap, catchError } from 'rxjs/operators';

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  quarter?: string;
  city?: string;
  country?: string;
}

// export interface PrayerTimeAPI {
//   Fajr: string; Sunrise: string; Dhuhr: string;
//   Asr: string; Sunset: string; Maghrib: string;
//   Isha: string; Imsak: string; Midnight: string;
// }

export interface PrayerTimingsResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string; 
      Sunrise: string; 
      Dhuhr: string;
      Asr: string;  
      Maghrib: string; 
      Isha: string;
      Imsak: string; 
      Midnight: string;
    };
    date: {
      readable: string;
      hijri: { 
        date: string; 
        month: { 
          en: string; 
          ar: string 
        }; 
          year: string 
        };
    };
    meta: { 
      latitude: number; 
      longitude: number; 
      timezone: string; 
      method: { 
        id: number;
        name: string;
        params: any; 
      } 
    };
  };
}

export interface NominatimResponse {
  address: {
    quarter?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  display_name: string;
}


export interface PrayerTime {
  name: string;
  arabic: string;
  time: string;
}



@Injectable({
  providedIn: 'root',
})
export class PrayerTimeService {

  private readonly ALADHAN_API = 'https://api.aladhan.com/v1';
  private readonly NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';
  private readonly DEFAULT_METHOD = 3; // Ligue Islamique Mondiale (Afrique de l'Ouest)  
  // private readonly DEFAULT_METHOD = 2; // Méthodes de calcul (2 = Université Islamique de Karachi, 3 = Umm al-Qura)
  
  constructor(private http: HttpClient) {}

  /** 
  * Étape 1 — Coordonnées GPS du navigateur 
  */
  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Géolocalisation non supportée par ce navigateur');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos  => { observer.next(pos); observer.complete(); },
        err  => observer.error(err),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  /** 
  * Étape 2 — Reverse geocoding : coordonnées → nom lisible (quartier, commune, ville)  
  */
  reverseGeocode(lat: number, lng: number): Observable<UserLocation> {
    return this.http.get<NominatimResponse>(this.NOMINATIM_API, {
      params: {
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        'accept-language': 'fr'
      },
      headers: { 'User-Agent': 'FirdawsMosqueApp/1.0' } // requis par Nominatim
    }).pipe(
      map(res => {
        const a = res.address;
        const quarter = a.quarter || a.neighbourhood || a.suburb || a.city_district || '';
        const city    = a.city || a.town || a.village || a.state || '';
        const country = a.country || '';
        const label   = [quarter, city, country].filter(Boolean).join(', ') || res.display_name;
        return { lat, lng, label, quarter, city, country };
      }),
      catchError(() => of({
        lat, lng,
        label: `${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°O`,
        city: 'Position inconnue'
      }))
    );
  }

  /**
   * Étape 3 — Obtient les horaires par GPS (le plus précis)
   */
  getPrayerTimesByGPS(lat: number, lng: number, method: number = this.DEFAULT_METHOD): Observable<PrayerTimingsResponse> {
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
    
    return this.http.get<PrayerTimingsResponse>(
      `${this.ALADHAN_API}/timings/${today}`, {
        params: {
          latitude:  lat.toString(),
          longitude: lng.toString(),
          method:    this.DEFAULT_METHOD.toString()
        }
      }
    ).pipe(retry(2));

  }

  /**
  *  Étape 4 — Méthode principale :
  * GPS → reverse geocoding (nom du quartier) + Aladhan (horaires) en parallèle
  */
  loadPrayerData(): Observable<{ location: UserLocation; timings: PrayerTimingsResponse }> {
    return this.getCurrentPosition().pipe(
      switchMap(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        return forkJoin({
          location: this.reverseGeocode(lat, lng),
          timings:  this.getPrayerTimesByGPS(lat, lng)
        });
      })
    );
  }

  /** Étape 5 — Fallback : Abidjan si géoloc refusée */
  loadFallbackData(): Observable<{ location: UserLocation; timings: PrayerTimingsResponse }> {
    const lat = 5.3600, lng = -4.0083;
    return forkJoin({
      location: of({
        lat, lng,
        label: 'Abidjan, Côte d\'Ivoire (position par défaut)',
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      }),
      timings: this.getPrayerTimesByGPS(lat, lng)
    });
  }

  /**
   * Étape 6 — Utilitaires
   */
  formatPrayerTimes(response: PrayerTimingsResponse): PrayerTime[]
  // Array<{ name: string; arabic: string; time: string }> 
  {
    const t = response.data.timings;
    // const timings = response.data.timings;

    return [
      { name: 'Fajr',    arabic: 'الفجر', time: this.cleanTime(t.Fajr) },
      { name: 'Dhuhr',   arabic: 'الظهر', time: this.cleanTime(t.Dhuhr) },
      { name: 'Asr',     arabic: 'العصر', time: this.cleanTime(t.Asr) },
      { name: 'Maghrib', arabic: 'المغرب', time: this.cleanTime(t.Maghrib) },
      { name: 'Isha',    arabic: 'العشاء', time: this.cleanTime(t.Isha) }
    ];
  }

   
  // getNextPrayer(prayerTimes: Array<{ name: string; time: string }>): { name: string; index: number; diff: number } {
  //   const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    
    
  //   let next = prayerTimes[0];
  //   let minDiff = Infinity;

  //   for (const p of prayerTimes) {
  //     const [h, m] = p.time.split(':').map(Number);
  //     const diff = h * 60 + m - nowMin;
  //     if (diff > 0 && diff < minDiff) { minDiff = diff; next = p; }
  //   }

  //   return { prayer: next, diff: minDiff };
  // }

  getNextPrayer(prayerTimes: PrayerTime[]): {
    prayer: PrayerTime;
    diff: number;
  } {

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    let next = prayerTimes[0];
    let minDiff = Infinity;

    for (const p of prayerTimes) {

      const [h, m] = p.time.split(':').map(Number);

      const prayerMin = h * 60 + m;

      let diff = prayerMin - nowMin;

      if (diff < 0) {
        diff += 24 * 60;
      }

      if (diff < minDiff) {
        minDiff = diff;
        next = p;
      }
    }

    return {
      prayer: next,
      diff: minDiff
    };
  }

  formatTimeDiff(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return h > 0 ? `${h}h ${m}min` : `${m} min`;
    
  }

  private cleanTime(time: string): string {
    return time.substring(0, 5); // "HH:MM"
  }  

}
