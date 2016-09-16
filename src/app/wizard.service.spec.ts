/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WizardService } from './wizard.service';

describe('Service: Wizard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WizardService]
    });
  });

  it('should ...', inject([WizardService], (service: WizardService) => {
    expect(service).toBeTruthy();
  }));
});
