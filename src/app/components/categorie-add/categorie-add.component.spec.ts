import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieAddComponent } from './categorie-add.component';

describe('CategorieAddComponent', () => {
  let component: CategorieAddComponent;
  let fixture: ComponentFixture<CategorieAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorieAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorieAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
