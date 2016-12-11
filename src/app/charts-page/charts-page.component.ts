import { Component, OnInit } from '@angular/core';
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";
import {Expense, ExpenseService} from "../expense.service";
import {Income, IncomeService} from "../income.service";
import {ChartService} from "../chart.service";
import * as moment from 'moment';

@Component({
  selector: 'charts-page',
  templateUrl: './charts-page.component.html',
  styleUrls: ['./charts-page.component.css']
})
export class ChartsPageComponent implements OnInit {

  private expenses: Expense[];
  private incomes: Income[];
  private paymentMethods: PaymentMethod[];
  private balanceChart = [];
  private startOfMonth: Date;

  constructor(private paymentMethodService: PaymentMethodService,
              private expenseService: ExpenseService,
              private incomeService: IncomeService,
              private chartService: ChartService) {}

  private _buildChart() {
    if (this.expenses && this.incomes && this.paymentMethods) {
      let chart = this.chartService.buildBalanceChart(this.expenses, this.incomes, this.paymentMethods);
      this.balanceChart = Object.keys(chart).map((currency) => ({ currency, chartData: chart[currency] }));
    }
  }

  hasChart() {
    return this.balanceChart && Object.keys(this.balanceChart).length > 0;
  };

  ngOnInit() {
    this.startOfMonth = moment().startOf('month').toDate();

    this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);

    this.incomes = this.incomeService.getAll().filter((item) => !item._isRemoved && +item.createdAt >= +this.startOfMonth);

    this.expenses = this.expenseService.getAll().filter((item) => !item._isRemoved && +item.createdAt >= +this.startOfMonth);

    this._buildChart();
  }

}
