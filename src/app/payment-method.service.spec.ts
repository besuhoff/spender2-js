/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PaymentMethodService } from './payment-method.service';

describe('Service: PaymentMethod', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentMethodService]
    });
  });

  it('should ...', inject([PaymentMethodService], (service: PaymentMethodService) => {
    expect(service).toBeTruthy();
  }));
});
