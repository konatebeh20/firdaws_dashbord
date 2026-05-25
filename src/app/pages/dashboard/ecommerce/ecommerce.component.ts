import { Component } from '@angular/core';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';

@Component({
  selector: 'app-ecommerce',
  imports: [
    MonthlySalesChartComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent {}
