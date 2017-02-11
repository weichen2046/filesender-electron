/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EnvironConfigService } from './environ-config.service';

describe('EnvironConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironConfigService]
    });
  });

  it('should ...', inject([EnvironConfigService], (service: EnvironConfigService) => {
    expect(service).toBeTruthy();
  }));
});
