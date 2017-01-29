/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SpeechService } from './speech.service';

describe('Service: Speech', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpeechService]
    });
  });

  it('should ...', inject([SpeechService], (service: SpeechService) => {
    expect(service).toBeTruthy();
  }));
});
