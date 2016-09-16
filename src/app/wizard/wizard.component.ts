import { Component, OnInit } from '@angular/core';
import {WizardService} from "../wizard.service";

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  private loading: boolean = false;

  constructor(private wizardService: WizardService) { }

  ngOnInit() {
  }

  nextStep() {
    this.loading = true;

    return this.wizardService.nextStep().subscribe(() => this.loading = false);
  }

  close() {
    this.loading = true;

    return this.wizardService.close().subscribe(() => this.loading = false);
  }
}
