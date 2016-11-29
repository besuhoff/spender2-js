import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GapiService } from '../gapi.service';
import { PaymentMethod, PaymentMethodService } from '../payment-method.service';
import { AuthService } from '../auth.service';
import { WizardService } from '../wizard.service';
import { UserService } from '../user.service';
import { Profile } from '../gapi.service';
import {HttpClientService} from "../http-client.service";
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  private paymentMethods: PaymentMethod[] = [];
  private paymentMethodsListChangedAt: Subscription;
  private profileImageStyle: SafeStyle;

  public getProfile(): Profile {
    return this.authService.getProfile();
  }

  public signOut(): void {
    this.gapiService.load().then(gapi => {
      gapi.auth2.getAuthInstance().signOut().then(() => {
        this.authService.reset();
        this.userService.reset();

        this.router.navigate(['/login']);
      });
    });
  }

  resetWizard() {
    return this.wizardService.reset().subscribe(() => {});
  }

  constructor(
      private gapiService: GapiService,
      private paymentMethodService: PaymentMethodService,
      private authService: AuthService,
      private wizardService: WizardService,
      private userService: UserService,
      private router: Router,
      private httpClientService: HttpClientService,
      private sanitizer: DomSanitizer
      ) {

    this.profileImageStyle = this.sanitizer.bypassSecurityTrustStyle(
      `background-image: url(${this.getProfile().getImageUrl()})`
    );

    this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);

    this.paymentMethodsListChangedAt = this.paymentMethodService.getListChangedAt().subscribe(() => {
      this.paymentMethods = this.paymentMethodService.getAll().filter((item) => !item._isRemoved);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.paymentMethodsListChangedAt && this.paymentMethodsListChangedAt.unsubscribe();
  }
}
