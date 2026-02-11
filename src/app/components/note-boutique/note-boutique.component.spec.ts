import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteBoutiqueComponent } from './note-boutique.component';

describe('NoteBoutiqueComponent', () => {
  let component: NoteBoutiqueComponent;
  let fixture: ComponentFixture<NoteBoutiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteBoutiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteBoutiqueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
