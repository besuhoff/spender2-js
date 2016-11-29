import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XHRBackend, RequestOptions } from '@angular/http';

import * as moment from 'moment';
import 'moment/locale/ru';
import {MomentModule} from 'angular2-moment';
import 'chart.js';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { LaddaModule } from 'angular2-ladda';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

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
import { LoaderComponent } from './loader/loader.component';
import { ColorpickerComponent } from './colorpicker/colorpicker.component';
import { DatetimeComponent } from './datetime/datetime.component';
import { ChartsPageComponent } from './charts-page/charts-page.component';

import { AuthGuard } from "./auth-guard";
import {HttpClientService} from "./http-client.service";
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
import {LoaderService} from "./loader.service";

import { routing, appRoutingProviders } from './app.routing';
import { LoginFormComponent } from './login-form/login-form.component';

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
    LoaderComponent,
    ColorpickerComponent,
    DatetimeComponent,
    ChartsPageComponent,
    LoginFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    LaddaModule.forRoot({
      style: 'slide-right',
      spinnerColor: '#2D2B29'

    }),
    NgbModule.forRoot(),
    ChartsModule,
    MomentModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    { provide: 'moment', useValue: moment },
    { provide: 'BACKEND_URL', useValue: 'https://spender-api.pereborstudio.com/' },
    { provide: 'GAPI_CLIENT_ID', useValue: '843225840486-ilkj47kggue9tvh6ajfvvog45mertgfg.apps.googleusercontent.com' },
    GapiService,
    ChartService,
    HttpClientService,
    {
      provide: HttpClientService,
      useFactory: (backend: XHRBackend, options: RequestOptions, gapiService: GapiService) => {
        return new HttpClientService(backend, options, gapiService);
      },
      deps: [XHRBackend, RequestOptions, GapiService]
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
  entryComponents: [WizardComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
