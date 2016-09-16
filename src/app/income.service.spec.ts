/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IncomeService } from './income.service';

describe('Service: Income', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IncomeService]
    });
  });

  it('should ...', inject([IncomeService], (service: IncomeService) => {
    expect(service).toBeTruthy();
  }));
});
