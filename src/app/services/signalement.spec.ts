import { TestBed } from '@angular/core/testing';

import { Signalement } from './signalement';

describe('Signalement', () => {
  let service: Signalement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Signalement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
