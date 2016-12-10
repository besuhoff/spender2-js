import { Component, OnInit, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from "rxjs/Subscription";
import {WizardService} from "../wizard.service";
import {Income, IncomeService} from "../income.service";
import {ChartService} from "../chart.service";
import {IncomeCategory, IncomeCategoryService} from "../income-category.service";
import {PaymentMethod, PaymentMethodService} from "../payment-method.service";

@Component({
  selector: 'income-categories-page',
  templateUrl: './income-categories-page.component.html',
  styleUrls: ['./income-categories-page.component.css']
})
export class IncomeCategoriesPageComponent implements OnInit {

  private loading = false;
  private isLoaded = {};
  private category: IncomeCategory;
  private income: Income[] = [];
  private lastMonthIncome: Income[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private categories: IncomeCategory[] = [];
  private startOfMonth: Date;
  private categoriesChart = [];
  private incomeServiceListChangedAt: Subscription;
  private isNewLoaded: Promise<IncomeCategory>;
  private selectedColors: string[];


  private _initCategories() {
    this.income = this.incomeService.getAll().filter(function(item) { return !item._isRemoved; });
    this.lastMonthIncome = this.income.filter((item) => +item.createdAt >= +this.startOfMonth);

    this.categories = this.incomeCategoryService.getAll().filter(function(item) { return !item._isRemoved; });

    let chart = this.chartService.buildCategoriesChart(this.lastMonthIncome, 'incomeCategory');
    this.categoriesChart = Object.keys(chart).map((currency) => ({ currency, chartData: chart[currency] }));
  }

  private _initCategory() {
    this.category = new IncomeCategory({}, this.injector);
    this.isNewLoaded = null;
  }

  public saveCategory(category) {
    if (category.name) {
      this.isLoaded[category.id] = this.incomeCategoryService.update(category).toPromise().then(() => {
        this._initCategories();
      });
    }
  };

  public addCategory() {
    if (this.category.name) {
      this.isNewLoaded = this.incomeCategoryService.add(this.category).toPromise().then(() => {
        this._initCategories();
        this._initCategory();
      });

      return this.isNewLoaded;
    }
  };

  public deleteCategory(category) {
    this.isLoaded[category.id] = this.incomeCategoryService.delete(category).toPromise().then(() => {
      this._initCategories();
    });
  }

  public updateSelectedColors() {
    this.selectedColors = this.categories.map((c) => c.color);
    if (this.category.color) {
      this.selectedColors.push(this.category.color);
    }
  };

  public hasChart() {
    return this.categoriesChart.length > 0;
  };


  constructor(
    private wizardService: WizardService,
    private incomeService: IncomeService,
    private chartService: ChartService,
    private incomeCategoryService: IncomeCategoryService,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private injector: Injector,
    @Inject('moment') private moment
  ) {

    this.startOfMonth = moment().startOf('month').toDate();

    this.incomeServiceListChangedAt = this.incomeService.getListChangedAt().subscribe(() => {
      this._initCategories();
    });

    this._initCategory();
    this._initCategories();

    this.isLoaded = {};
    this.updateSelectedColors();
  }

  ngOnInit() {
  }

  isHintVisible(): boolean {
    return this.wizardService.isExpenseHintVisible();
  }

  nextStep() {
    this.loading = true;

    return this.wizardService.nextStep().subscribe(() => this.loading = false);
  }

  close() {
    this.loading = true;

    return this.wizardService.close().subscribe(() => this.loading = false);
  }

  ngOnDestroy() {
    this.incomeServiceListChangedAt && this.incomeServiceListChangedAt.unsubscribe();
  }
}
