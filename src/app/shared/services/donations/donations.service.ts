import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Don {
  id?: number;
  donateur: string;
  phone?: string;
  type: 'Sadaqah' | 'Zakat' | 'Projet' | 'Fitr';
  canal: 'Physique' | 'En ligne';
  montant: number;
  date?: string;
}

// interface ApiResponse {
//   status: string;
//   dons: Don[];
//   total: number;
// }

// interface ApiPostResponse {
//   status: string;
//   message: string;
//   don: Don;
// }


@Injectable({
  providedIn: 'root',
})
export class DonationsService {
  private apiUrl = `${environment.apiBaseUrl}/dons`;

  constructor(private http: HttpClient) { }

  // GET : Récupérer tous les dons
  getDons(): Observable<Don[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('📦 Réponse API Dons:', response);
        // La réponse peut être un tableau direct ou { dons: [] } ou { data: [] }
        if (Array.isArray(response)) {
          return response;
        } else if (response.dons) {
          return response.dons;
        } else if (response.data) {
          return response.data;
        }
        return [];
      })
    );
  }

  // POST : Enregistrer un nouveau don
  createDon(don: Don): Observable<Don> {
    console.log('📝 Envoi du don:', don);

    return this.http.post<any>(this.apiUrl, don).pipe(
      map(response => {
        console.log('✅ Réponse création:', response);
        // Retourne le don créé
        if (response.don) {
          return response.don;
        }
        if (response.data) {
          return response.data;
        }
        return response;
      })
    );
  }
}
