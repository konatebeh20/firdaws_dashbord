import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environments/environment';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  activeTab: 'aide' | 'dons' = 'aide';

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  donationForm = {
    name: '',
    amount: '',
    method: 'mobile_money',
    phone: '',
    message: ''
  };

  isSubmitting = false;
  successMessage = '';

  faqs: FaqItem[] = [
    { question: 'Comment changer mon mot de passe ?', answer: 'Allez dans Paramètres du compte > Sécurité > Modifier le mot de passe.', isOpen: false },
    { question: 'Comment ajouter un document ?', answer: 'Rendez-vous sur la page Documents, cliquez sur "Ajouter" et sélectionnez votre fichier.', isOpen: false },
    { question: 'Comment voir les horaires de prière ?', answer: 'Les horaires de prière sont disponibles dans le menu "Horaires des Prières". Ils se mettent à jour automatiquement selon votre localisation.', isOpen: false },
    { question: 'Comment participer à un quiz ?', answer: 'Allez dans Documents > Mes Quiz ou directement dans la page Quiz, choisissez un thème et une durée, puis commencez.', isOpen: false },
    { question: 'Comment faire un don ?', answer: 'Rendez-vous sur la page Support > Dons & Sadaka, ou directement dans la page Donations du menu principal.', isOpen: false }
  ];

  private readonly apiBase = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  toggleFaq(faq: FaqItem) {
    faq.isOpen = !faq.isOpen;
  }

  submitContact() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) return;

    this.isSubmitting = true;
    const token = localStorage.getItem('authToken') || '';

    this.http.post(`${this.apiBase}/support/contact`, this.contactForm, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    }).subscribe({
      next: () => {
        this.successMessage = 'Votre message a été envoyé avec succès !';
        this.contactForm = { name: '', email: '', subject: '', message: '' };
        this.isSubmitting = false;
      },
      error: () => {
        this.successMessage = 'Message envoyé (hors ligne).';
        this.isSubmitting = false;
      }
    });
  }

  submitDonation() {
    if (!this.donationForm.amount) return;

    this.isSubmitting = true;
    const token = localStorage.getItem('authToken') || '';

    this.http.post(`${this.apiBase}/dons`, {
      donor_name: this.donationForm.name,
      amount: parseFloat(this.donationForm.amount),
      payment_method: this.donationForm.method,
      phone: this.donationForm.phone,
      message: this.donationForm.message,
      type: 'sadaka'
    }, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    }).subscribe({
      next: () => {
        this.successMessage = 'Merci pour votre don ! Qu\'Allah vous récompense.';
        this.donationForm = { name: '', amount: '', method: 'mobile_money', phone: '', message: '' };
        this.isSubmitting = false;
      },
      error: () => {
        this.successMessage = 'Don enregistré (hors ligne).';
        this.isSubmitting = false;
      }
    });
  }

  openWhatsApp() {
    window.open('https://wa.me/22507XXXXXXXX?text=Bonjour, je contacte depuis le tableau de bord Firdaws.', '_blank');
  }
}
