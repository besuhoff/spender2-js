/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import {AuthGuard} from './auth-guard';

describe('AuthGuard', () => {
  it('should create an instance', () => {
    expect(new AuthGuard()).toBeTruthy();
  });
});
