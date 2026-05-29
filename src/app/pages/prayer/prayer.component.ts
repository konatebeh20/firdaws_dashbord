import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService, User, } from '../../shared/services/users/users.service';
import { AdminsService, Admin } from '../../shared/services/admins/admins.service';


@Component({
  selector: 'app-prayer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prayer.component.html',
  styleUrl: './prayer.component.css',
})
export class PrayerComponent implements OnInit {

  private usersService = inject(UsersService);
  private adminsService = inject(AdminsService);

  isLoading = true;

  isLoadingAdmins = true;
  isLoadingUsers = true;

  isSaving  = false;
  skeletons = Array(3);

  admins: Admin[] = [];
  users: User[] = [];

  showModal = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  newAccount = { 
    username: '', 
    email: '',
    phone: '',
    password: '', 
    role: 'admin',
    accountType: 'admin' // 'admin' ou 'user'
  };

  // newAdmin = { 
  //   username: '', 
  //   email: '',
  //   phone: '',
  //   password: '', 
  //   role: 'admin' 
  // };

  ngOnInit(): void { 
    this.loadAdmins();
    this.loadUsers();
  }

  loadAdmins() {
    this.isLoadingAdmins = true;

    this.adminsService.getAdmins().subscribe({
      next: (res: any) => {
        const dataResponse = res || {};
        if (Array.isArray(dataResponse)) this.admins = dataResponse;
        else if (dataResponse.admins) this.admins = dataResponse.admins;
        else if (dataResponse.data) this.admins = dataResponse.data;
        this.isLoadingAdmins = false;

        // if (Array.isArray(dataResponse)) { 
        //   this.admins  = dataResponse;
        //  }
        //  else if (dataResponse.admins && Array.isArray(dataResponse.admins)) {
        //   this.admins = dataResponse.admins;
        // }
        // else if (dataResponse.data && Array.isArray(dataResponse.data)) {
        //   this.admins = dataResponse.data;
        // }
        // else {
        //   console.warn('Format de réponse inattendu:', dataResponse);
        //   this.admins = [];
        // }

        // if (this.admins.length === 0) {
        //   this.showToast('Aucun administrateur trouvé', 'error');
        // }

      },
      error: (err) => {
        console.error('Erreur de chargement :', err);
        this.isLoadingAdmins = false;
      }
    });
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.usersService.getUsers().subscribe({
      next: (res: any) => {
        const dataResponse = res || {};
        if (Array.isArray(dataResponse)) this.users = dataResponse;
        else if (dataResponse.users) this.users = dataResponse.users;
        this.isLoadingUsers = false;

        // this.users = res.users || [];
        // this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.isLoadingUsers = false;
      }
    });
  }

  createAccount(): void {
    if (!this.newAccount.username || !this.newAccount.email || !this.newAccount.password) {
      this.showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    this.isSaving = true;

    const payload = {
      username: this.newAccount.username,
      email: this.newAccount.email,
      phone: this.newAccount.phone,
      password: this.newAccount.password,
      role: this.newAccount.role
    };

    if (this.newAccount.accountType === 'admin') {
      this.adminsService.createAdmin(payload).subscribe({
        next: () => {
          this.handleCreationSuccess('Administrateur créé avec succès ✓');
          this.loadAdmins();
        },
        error: (err) => this.handleCreationError(err)
      });
    } else {
      this.usersService.createUser(payload).subscribe({
        next: () => {
          this.handleCreationSuccess('Utilisateur public créé avec succès ✓');
          this.loadUsers();
        },
        error: (err) => this.handleCreationError(err)
      });
    }
  }

  private handleCreationSuccess(msg: string) {
    this.showToast(msg, 'success');
    this.closeModal();
    this.isSaving = false;
  }

  private handleCreationError(err: any) {
    this.isSaving = false;
    const msg = err.error?.message || 'Erreur lors de la création';
    this.showToast(msg, 'error');
  }

  deleteAdmin(id: number): void {
    if (!confirm('Supprimer cet utilisateur ?')) { 
      return;
    };

    this.adminsService.deleteAdmin(id).subscribe({
      next: () => {
        this.showToast('Administrateur supprimé');
        this.loadAdmins();
      },
      error: (err: any) => {
        alert('Erreur lors de la suppression');
      },
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Supprimer cet utilisateur public ?')) return;
    this.usersService.deleteUser(id).subscribe({
      next: () => { this.showToast('Utilisateur supprimé'); this.loadUsers(); },
      error: () => this.showToast('Erreur suppression utilisateur', 'error')
    });
  }

  // Ajuste dynamiquement le rôle par défaut selon le type de compte sélectionné
  onAccountTypeChange() {
    this.newAccount.role = this.newAccount.accountType === 'admin' ? 'Admin' : 'User';
  }

  // ─── Utilitaires ──────────────────────────────────────────────────────────

  openModal(): void { this.showModal = true; }
  closeModal(): void { this.showModal = false; this.resetForm(); }

  resetForm() {
    // this.newUser = { username: '', email: '', password: '', role: 'admin' };
    this.newAccount = { username: '', email: '', phone: '', password: '', role: 'Admin', accountType: 'admin' };
  }

  getRoleCount(roleName: string): number {
    const cleanRoleTarget = roleName.toLowerCase().replace(/\s+/g, '');

    const countInAdmins = this.admins.filter(admin => {
      if (!admin.role) return false;
      return admin.role.toLowerCase().replace(/\s+/g, '') === cleanRoleTarget;
    }).length;

    const countInUsers = this.users.filter(user => {
      if (!user.role) return false;
      return user.role.toLowerCase().replace(/\s+/g, '') === cleanRoleTarget;
    }).length;

    // const roleLower = roleName.toLowerCase();

    // const countInAdmins = this.admins.filter(admin => admin.role?.toLowerCase() === roleLower).length;
    // const countInUsers = this.users.filter(user => user.role?.toLowerCase() === roleLower).length;

    return countInAdmins + countInUsers;
    // return this.admins.filter( admin => admin.role?.toLowerCase() === roleLower ).length;
  }

  getRoleClass(role: string): string {
    if (!role) return 'bg-gray-100 text-gray-700';
    
    // Normalisation du rôle pour appliquer le style CSS peu importe l'écriture en BD

    const cleanRole = role.toLowerCase().replace(/\s+/g, '');

    switch (cleanRole) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
      case 'admin':
        return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      case 'comite':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
      case 'user':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // Calcule le total cumulé de tous les comptes enregistrés
  getTotalStaff(): number {
    return this.admins.length + this.users.length;
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }

  editAdmin(admin: Admin): void { alert(`Modifier Admin ${admin.username}`); }
  editUser(user: User) { alert(`Modifier User ${user.username}`); }
  
}
