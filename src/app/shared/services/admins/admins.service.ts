import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

export interface Admin {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminsService {

  private http = inject(HttpClient);
  private API = `${environment.apiBaseUrl}/admins`;

  // GET ALL
  getAdmins(): Observable<any> {
    return this.http.get(`${this.API}/all`);
  }

  // GET SINGLE
  getAdmin(id: number): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }

  // CREATE
  createAdmin(data: any): Observable<any> {
    return this.http.post(this.API, data);
  }

  // UPDATE
  updateAdmin(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  // DELETE
  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
  
}
