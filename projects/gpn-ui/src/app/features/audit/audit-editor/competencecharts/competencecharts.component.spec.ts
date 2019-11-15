import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetencechartsComponent } from './competencecharts.component';

describe('CompetencechartsComponent', () => {
  let component: CompetencechartsComponent;
  let fixture: ComponentFixture<CompetencechartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencechartsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencechartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
