/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Environment } from './environment.service';

describe('Environment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Environment]
    });
  });

  it('should ...', inject([Environment], (service: Environment) => {
    expect(service).toBeTruthy();
  }));
});
