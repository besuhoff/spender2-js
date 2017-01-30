import { Component, OnInit, OnDestroy } from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {CacheService} from "../cache.service";

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {

  private itemsLoaded: {
    incomeCategories: boolean,
    categories: boolean,
    expenses: boolean,
    incomes: boolean,
    currencies: boolean,
    paymentMethods: boolean,
    limits: boolean
  } = {
    incomeCategories: false,
    categories: false,
    expenses: false,
    incomes: false,
    currencies: false,
    paymentMethods: false,
    limits: false
  };

  private itemsToLoad: string[];
  private subscriptions: Subscription[] = [];

  constructor(private cacheService: CacheService) {
    this.itemsToLoad = Object.keys(this.itemsLoaded);
  }

  ngOnInit() {
    this.subscriptions = [
      this.cacheService.isIncomeCategoriesLoaded().subscribe((isLoaded) => this.itemsLoaded.incomeCategories = isLoaded),
      this.cacheService.isCategoriesLoaded().subscribe((isLoaded) => this.itemsLoaded.categories = isLoaded),
      this.cacheService.isExpensesLoaded().subscribe((isLoaded) => this.itemsLoaded.expenses = isLoaded),
      this.cacheService.isIncomesLoaded().subscribe((isLoaded) => this.itemsLoaded.incomes = isLoaded),
      this.cacheService.isCurrenciesLoaded().subscribe((isLoaded) => this.itemsLoaded.currencies = isLoaded),
      this.cacheService.isPaymentMethodsLoaded().subscribe((isLoaded) => this.itemsLoaded.paymentMethods = isLoaded),
      this.cacheService.isLimitsLoaded().subscribe((isLoaded) => this.itemsLoaded.limits = isLoaded),
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
