import { TestBed } from '@angular/core/testing';

import { APILightServiceService } from './apilight-service.service';

describe('APILightServiceService', () => {
  let service: APILightServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(APILightServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
