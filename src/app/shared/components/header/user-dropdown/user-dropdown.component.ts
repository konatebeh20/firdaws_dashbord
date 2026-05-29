import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';

interface CurrentUser {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  photo_url?: string;
}

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  currentUser: CurrentUser | null = null;

  constructor(private readonly router: Router) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch {
        this.currentUser = null;
      }
    }
  }

  get displayName(): string {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return this.currentUser?.username || 'Utilisateur';
  }

  get displayEmail(): string {
    return this.currentUser?.email || '';
  }

  get displayRole(): string {
    return this.currentUser?.role || 'user';
  }

  get userInitial(): string {
    const name = this.displayName;
    return name.charAt(0).toUpperCase();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/signin']);
  }
}
