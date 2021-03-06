import { Component, OnInit, NgZone, ElementRef, Output, EventEmitter } from '@angular/core';
import {LoginService} from "../login.service";
import {AuthService} from "../auth.service";
import {GapiService} from "../gapi.service";
import {HttpClientService} from "../http-client.service";

@Component({
  selector: 'signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @Output()
  public signedIn = new EventEmitter();

  public isLoading: boolean = false;

  constructor(
    authService: AuthService,
    gapiService: GapiService,
    loginService: LoginService,
    httpClientService: HttpClientService,
    zone: NgZone,
    element: ElementRef
  ) {

    let component = this;

    gapiService.load().then(function(gapi) {
      gapi.auth2.getAuthInstance().attachClickHandler(element.nativeElement, {},
        (googleUser) => {
          // Useful data for your client-side scripts:
          let profile = googleUser.getBasicProfile();
          zone.run(() => {
            component.isLoading = true;

            component.signedIn.emit();

            if (loginService.hasForm()) {
              loginService.hideForm();
            }
          });
        },

        (error) => {
          console.log(error);
        });
    });
  }

  ngOnInit() {
  }

}
