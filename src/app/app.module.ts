import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XHRBackend, RequestOptions } from '@angular/http';

import { AppComponent } from './app.component';
import { CategoriesPageComponent } from './categories-page/categories-page.component';
import { ExpensesPageComponent } from './expenses-page/expenses-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { IncomeCategoriesPageComponent } from './income-categories-page/income-categories-page.component';
import { IncomePageComponent } from './income-page/income-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { PaymentMethodsPageComponent } from './payment-methods-page/payment-methods-page.component';
import { TransfersPageComponent } from './transfers-page/transfers-page.component';
import { LayoutComponent } from './layout/layout.component';

import { WizardComponent } from './wizard/wizard.component';
import { SigninComponent } from './signin/signin.component';
import { CopyComponent } from './copy/copy.component';
import { SpinnerComponent } from './spinner/spinner.component';

import { CacheService } from './cache.service';
import { GapiService } from './gapi.service';
import { ChartService } from './chart.service';
import { IncomeService } from './income.service';
import { ExpenseService } from './expense.service';
import { CategoryService } from './category.service';
import { IncomeCategoryService } from './income-category.service';
import { PaymentMethodService } from './payment-method.service';
import { CurrencyService } from './currency.service';
import { LoginService } from './login.service';
import { AuthService } from './auth.service';
import { WizardService } from './wizard.service';
import { UserService } from './user.service';

import { routing, appRoutingProviders } from './app.routing';

import * as moment from 'moment';
import { MomentService } from "./moment.service";
import { AuthGuard } from "./auth-guard";
import {HttpClientService} from "./http-client.service";
import { LoaderComponent } from './loader/loader.component';
import {LoaderService} from "./loader.service";

import { LaddaModule } from 'angular2-ladda';

@NgModule({
  declarations: [
    AppComponent,
    CategoriesPageComponent,
    ExpensesPageComponent,
    HistoryPageComponent,
    IncomeCategoriesPageComponent,
    IncomePageComponent,
    LoginPageComponent,
    PaymentMethodsPageComponent,
    TransfersPageComponent,
    LayoutComponent,
    WizardComponent,
    SigninComponent,
    CopyComponent,
    SpinnerComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    LaddaModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    { provide: MomentService, useValue: moment },
    { provide: 'BACKEND_URL', useValue: 'https://spender-api.pereborstudio.com/' },
    { provide: 'GAPI_CLIENT_ID', useValue: '843225840486-ilkj47kggue9tvh6ajfvvog45mertgfg.apps.googleusercontent.com' },
    GapiService,
    ChartService,
    HttpClientService,
    {
      provide: HttpClientService,
      useFactory: (backend: XHRBackend, options: RequestOptions) => {
        return new HttpClientService(backend, options);
      },
      deps: [XHRBackend, RequestOptions]
    },
    IncomeService,
    ExpenseService,
    CategoryService,
    IncomeCategoryService,
    PaymentMethodService,
    CurrencyService,
    LoginService,
    AuthService,
    WizardService,
    UserService,
    CacheService,
    AuthGuard,
    LoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
