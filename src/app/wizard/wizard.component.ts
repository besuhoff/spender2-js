import { Component, OnInit } from '@angular/core';
import {WizardService} from "../wizard.service";

@Component({
  selector: 'wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  private loading = {
    data: false,
    nextStep: false,
    closing: false
  };
  private wizardService: WizardService;

  constructor() { }

  ngOnInit() {
  }

  init(wizardService: WizardService) {
    this.wizardService = wizardService;
  }

  nextStep() {
    this.loading.data = this.loading.nextStep = true;

    return this.wizardService.nextStep().subscribe(() => this.loading.data = this.loading.nextStep = false);
  }

  close() {
    this.loading.data = this.loading.closing = true;

    return this.wizardService.close().subscribe(() => this.loading.data = this.loading.closing = false);
  }
}
