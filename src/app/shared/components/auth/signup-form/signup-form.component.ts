
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
  ],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {
  showPassword = false;
  isChecked = false;
  fname = '';
  lname = '';
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fname.trim() || !this.lname.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Tous les champs sont requis.';
      return;
    }

    if (!this.isChecked) {
      this.errorMessage = 'Tu dois accepter les conditions pour créer un compte.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      username: this.email.trim(),
      email: this.email.trim(),
      password: this.password,
      first_name: this.fname.trim(),
      last_name: this.lname.trim(),
      phone: ''
    }).subscribe({
      next: () => {
        this.successMessage = 'Compte créé avec succès. Tu peux te connecter maintenant.';
        this.router.navigate(['/signin']);
      },
      error: (error: Error) => {
        this.errorMessage = error?.message || 'Impossible de créer le compte pour le moment.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
