import { TestBed } from '@angular/core/testing';

import { BoutiqueDashboardService } from './boutique-dashboard.service';

describe('BoutiqueDashboardService', () => {
  let service: BoutiqueDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoutiqueDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
