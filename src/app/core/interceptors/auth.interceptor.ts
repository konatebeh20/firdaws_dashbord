import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

import { AuthService } from '../../../app/shared/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    // N'attacher le token QUE pour les appels vers notre propre backend.
    // Les API externes (YouTube, Aladhan, etc.) rejettent un header Authorization inattendu.
    if (token && this.isInternalApi(req.url)) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }

  private isInternalApi(url: string): boolean {
    // URL relative -> notre application
    if (!/^https?:\/\//i.test(url)) {
      return true;
    }
    return url.startsWith(environment.apiUrl) || url.startsWith(environment.apiBaseUrl);
  }
}
