/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IncomeCategoryService } from './income-category.service';

describe('Service: IncomeCategory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IncomeCategoryService]
    });
  });

  it('should ...', inject([IncomeCategoryService], (service: IncomeCategoryService) => {
    expect(service).toBeTruthy();
  }));
});
