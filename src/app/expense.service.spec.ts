/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExpenseService } from './expense.service';

describe('Service: Expense', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpenseService]
    });
  });

  it('should ...', inject([ExpenseService], (service: ExpenseService) => {
    expect(service).toBeTruthy();
  }));
});
