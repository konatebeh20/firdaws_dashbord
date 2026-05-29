import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


export interface Event {
  id?: number;
  title: string;
  description: string;
  event_date: string;   // backend: event_date
  end_date: string;      // backend: end_date
  location: string;
  category: string;
  status: string;
  image_url?: string;
  max_participants?: number;
  current_participants?: number;
  created_by?: number;
  created_at?: string;
}

// Interface pour la réponse du backend
interface BackendEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  end_date: string | null;
  location: string;
  category: string;
  status: string;
  image_url: string | null;
  max_participants: number | null;
  current_participants: number;
  created_by: number;
  created_at: string;
}



@Injectable({
  providedIn: 'root',
})
export class EventsService {
  
  private base = `${environment.apiBaseUrl}/events`;

  constructor(
    private http: HttpClient
  ) {}


  // Convertit backend → frontend
  private toFrontend(backend: BackendEvent): Event {
    return {
      id: backend.id,
      title: backend.title,
      description: backend.description || '',
      event_date: backend.event_date,
      end_date: backend.end_date || backend.event_date,
      location: backend.location || 'Mosquée',
      category: backend.category || 'autre',
      status: backend.status || 'published',
      image_url: backend.image_url || undefined,
      max_participants: backend.max_participants || undefined,
      current_participants: backend.current_participants || 0,
      created_by: backend.created_by,
      created_at: backend.created_at
    };
  }

  // Convertit frontend → backend
  private toBackend(frontend: Partial<Event>): any {
    return {
      title: frontend.title,
      description: frontend.description,
      event_date: frontend.event_date,
      end_date: frontend.end_date || null,
      location: frontend.location || 'Mosquée',
      category: frontend.category,
      status: 'published'
    };
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<{ data: BackendEvent[] }>(this.base).pipe(
      timeout(10000),
      map(res => {
        const data = res.data || [];
        return data.map(item => this.toFrontend(item));
      }),
      catchError(error => {
        console.error('Erreur API events:', error);
        return of([]);
      })
    );
  }

  getEvent(id: number): Observable<Event | null> {
    return this.http.get<{ data: BackendEvent }>(`${this.base}/${id}`).pipe(
      timeout(10000),
      map(res => res.data ? this.toFrontend(res.data) : null),
      catchError(() => of(null))
    );
  }

  createEvent(data: Partial<Event>): Observable<Event | null> {
    const backendData = this.toBackend(data);
    return this.http.post<{ data: BackendEvent }>(this.base, backendData).pipe(
      timeout(10000),
      map(res => res.data ? this.toFrontend(res.data) : null),
      catchError(error => {
        console.error('Erreur création:', error);
        return of(null);
      })
    );
  }

  updateEvent(id: number, data: Partial<Event>): Observable<Event | null> {
    const backendData = this.toBackend(data);
    return this.http.put<{ data: BackendEvent }>(`${this.base}/${id}`, backendData).pipe(
      timeout(10000),
      map(res => res.data ? this.toFrontend(res.data) : null),
      catchError(error => {
        console.error('Erreur mise à jour:', error);
        return of(null);
      })
    );
  }

  deleteEvent(id: number): Observable<boolean> {
    return this.http.delete(`${this.base}/${id}`).pipe(
      timeout(10000),
      map(() => true),
      catchError(error => {
        console.error('Erreur suppression:', error);
        return of(false);
      })
    );
  }

  
}
