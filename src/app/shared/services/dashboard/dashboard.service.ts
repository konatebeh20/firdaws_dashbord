import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface DashboardStats {
  fideles: { total: number; active: number };
  donations: { total: number; count: number };
  admins: { total: number; active: number };
  events: { total: number; active: number; archived: number; upcoming: number };
  videos: { total: number; active: number; archived: number };
  documents: { total: number; active: number; archived: number };
  infos: { total: number; active: number; archived: number };
}

const EMPTY_STATS: DashboardStats = {
  fideles: { total: 0, active: 0 },
  donations: { total: 0, count: 0 },
  admins: { total: 0, active: 0 },
  events: { total: 0, active: 0, archived: 0, upcoming: 0 },
  videos: { total: 0, active: 0, archived: 0 },
  documents: { total: 0, active: 0, archived: 0 },
  infos: { total: 0, active: 0, archived: 0 },
};

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiBaseUrl}/tracker`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<any>(`${this.apiUrl}/get_dashboard_stats`).pipe(
      map(response => {
        const data = response?.data ?? {};
        return { ...EMPTY_STATS, ...data } as DashboardStats;
      }),
      catchError(() => of(EMPTY_STATS))
    );
  }
}
