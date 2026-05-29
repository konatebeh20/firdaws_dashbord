import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  users: UserInfo[] = [
    { id: 1, name: "Ahmed Benali", email: "ahmed@mosquee.ma", role: "Modérateur" }, 
    { id: 2, name: "Fatima Zahra", email: "fatima@mosquee.ma", role: "Admin contenu" }
  ];

  deleteUser(id: number) {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  addUser() {
    const name = prompt("Nom de l'utilisateur");
    if (name) {
      this.users.push({
        id: Date.now(),
        name,
        email: "email@exemple.com",
        role: "Admin"
      });
    }
  }
}

