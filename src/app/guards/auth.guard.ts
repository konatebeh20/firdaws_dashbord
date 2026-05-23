import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasToken = !!localStorage.getItem('authToken');

  if (!hasToken) {
    router.navigate(['/signin']);
    return false;
  }

  return true;
};
