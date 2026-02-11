import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalementsAdminComponent } from './signalements-admin.component';

describe('SignalementsAdminComponent', () => {
  let component: SignalementsAdminComponent;
  let fixture: ComponentFixture<SignalementsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalementsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalementsAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
