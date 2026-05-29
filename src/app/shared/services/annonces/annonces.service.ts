import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Annonce {
  id?: number;
  title: string;
  content: string;
  priority: string;
  status: string;
  is_published?: boolean;
  publish_date?: string;
  published_at?: string;
  created_at: string;
}


@Injectable({
  providedIn: 'root',
})
export class AnnoncesService {
  private base = `${environment.apiBaseUrl}/annonces`;

  constructor(private http: HttpClient) {}

  getAnnonces(): Observable<Annonce[]> {
    return this.http.get<any>(this.base).pipe(
      timeout(10000),
      map((res: any) => {
        // La réponse peut être un tableau direct ou { data: [...] }
        const data = Array.isArray(res) ? res : (res.data || []);
        return data;
      }),
      catchError((error) => {
        console.error('Erreur API:', error);
        // Fallback sur données mockées
        return of([]);
      })
    );
  }


  createAnnonce(data: Partial<Annonce>): Observable<Annonce> {
    return this.http.post<Annonce>(this.base, data).pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur création:', error);
        throw error;
      })
    );
  }



  updateAnnonce(id: number, data: Partial<Annonce>): Observable<Annonce> {
    return this.http.put<Annonce>(`${this.base}/${id}`, data).pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur mise à jour:', error);
        throw error;
      })
    );
  }

  deleteAnnonce(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`).pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur suppression:', error);
        throw error;
      })
    );
  }






  // updateAnnonce(id: number, data: Partial<Annonce>): Observable<Annonce> {
  //   const backendData = this.toBackend(data);
  //   return this.http.put<BackendInfo>(`${this.base}/${id}`, backendData).pipe(
  //     timeout(10000),
  //     map((res: any) => {
  //       const updated = res.data || res;
  //       return this.toFrontend(updated);
  //     }),
  //     catchError((error) => {
  //       console.error('Erreur mise à jour:', error);
  //       throw error;
  //     })
  //   );
  // }

  // // deleteAnnonce(id: number): Observable<any> {
  // //   return this.http.delete(`${this.base}/${id}`);
  // // }

  // deleteAnnonce(id: number): Observable<any> {
  //   return this.http.delete(`${this.base}/${id}`).pipe(
  //     timeout(10000),
  //     catchError((error) => {
  //       console.error('Erreur suppression:', error);
  //       throw error;
  //     })
  //   );
  // }

  // Données mockées pour le fallback
  // Données mockées pour le fallback
private getMockAnnonces(): Annonce[] {
  return [
    {
      id: 1,
      title: 'Fermeture exceptionnelle',
      content: 'La mosquée sera fermée le jeudi 1er mai en raison de travaux.',
      priority: 'important',
      status: 'published',
      publish_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Collecte de fonds',
      content: 'Collecte pour la rénovation des toits.',
      priority: 'normal',
      status: 'published',
      publish_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];
}

  // private getMockAnnonces(): Annonce[] {
  //   return [
  //     {
  //       id: 1,
  //       title: 'Fermeture exceptionnelle',
  //       content: 'La mosquée sera fermée le jeudi 1er mai en raison de travaux.',
  //       priority: 'important',
  //       status: 'published',
  //       publish_date: new Date().toISOString(),
  //       created_at: new Date().toISOString()
  //     },
  //     {
  //       id: 2,
  //       title: 'Collecte de fonds',
  //       content: 'Collecte pour la rénovation des toits.',
  //       priority: 'normal',
  //       status: 'published',
  //       publish_date: new Date().toISOString(),
  //       created_at: new Date().toISOString()
  //     }
  //   ];
  // }

}
