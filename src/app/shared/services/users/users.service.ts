import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  id: number;
  username: string; // Le backend utilise 'username'
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
}



@Injectable({
  providedIn: 'root',
})
export class UsersService {
  
  private http = inject(HttpClient);
  private API = `${environment.apiBaseUrl}/users`;

  // GET ALL
  getUsers(): Observable<any> {
    console.log('🔵 Appel API:', `${this.API}/all`);
    return this.http.get(`${this.API}/all`);
  }

  // GET SINGLE
  getUser(id: number): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }

  // // GET BY IA
  // getCurrentUser(): Observable<any> {
  //   return this.http.get(`${this.API}/me`);
  // }

  // // User par email
  // getUserByEmail(email: string): Observable<any> {
  //   return this.http.get(`${this.API}/email/${email}`);
  // }

  // // Recherche IA / smart search
  // searchUsers(query: string): Observable<any> {
  //   return this.http.get(`${this.API}/search/${query}`);
  // }

  // CREATE
  createUser(data: any): Observable<any> {
    console.log('🔵 Appel API POST:', this.API, data);
    return this.http.post(`${this.API}`, data);
  }

  // UPDATE
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data);
  }

  // DELETE
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
