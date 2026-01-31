import { TestBed } from '@angular/core/testing';

import { Achat } from './achat';

describe('Achat', () => {
  let service: Achat;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Achat);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
