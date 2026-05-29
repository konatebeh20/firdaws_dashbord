import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('admin_token', res.token);
          if (res.admin) {
            localStorage.setItem('admin', JSON.stringify(res.admin));
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
  }

  getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('admin_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
