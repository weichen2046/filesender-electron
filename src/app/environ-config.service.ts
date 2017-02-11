import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class EnvironConfigService {

  constructor() { }

  get production(): boolean {
    return environment.production;
  }

}
