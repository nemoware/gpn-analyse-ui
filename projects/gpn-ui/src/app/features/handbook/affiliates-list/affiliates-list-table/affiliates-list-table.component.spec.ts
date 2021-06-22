import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliatesListTableComponent } from './affiliates-list-table.component';

describe('AffiliatesListTableComponent', () => {
  let component: AffiliatesListTableComponent;
  let fixture: ComponentFixture<AffiliatesListTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AffiliatesListTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliatesListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
