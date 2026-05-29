import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environments/environment';

interface Donation {
  id: number;
  donor_name: string;
  amount: number;
  type: string;
  canal: string;
  payment_method: string;
  message: string;
  created_at: string;
}

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.css']
})
export class DonationsComponent implements OnInit {
  donations: Donation[] = [];
  isLoading = false;
  showCreateModal = false;

  newDonation = {
    donor_name: '',
    amount: '',
    type: 'sadaka',
    payment_method: 'mobile_money',
    phone: '',
    message: ''
  };

  private readonly apiBase = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.loadDonations();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadDonations() {
    this.isLoading = true;
    this.http.get<{ dons?: Donation[]; data?: Donation[] }>(
      `${this.apiBase}/dons`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.donations = res.dons || res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get totalDonations(): number {
    return this.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  }

  get donationCount(): number {
    return this.donations.length;
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newDonation = { donor_name: '', amount: '', type: 'sadaka', payment_method: 'mobile_money', phone: '', message: '' };
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createDonation() {
    if (!this.newDonation.amount) return;

    this.http.post(`${this.apiBase}/dons`, {
      donor_name: this.newDonation.donor_name,
      amount: parseFloat(this.newDonation.amount),
      type: this.newDonation.type,
      payment_method: this.newDonation.payment_method,
      canal: this.newDonation.payment_method,
      message: this.newDonation.message
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadDonations();
      },
      error: () => {}
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      sadaka: 'Sadaka',
      zakat: 'Zakat',
      projet: 'Projet',
      general: 'Général'
    };
    return labels[type] || type;
  }

  getMethodIcon(method: string): string {
    if (method?.includes('mobile')) return 'bi-phone';
    if (method?.includes('visa') || method?.includes('card')) return 'bi-credit-card';
    return 'bi-cash-coin';
  }
}
