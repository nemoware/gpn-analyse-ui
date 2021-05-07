import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePreAuditComponent } from './create-pre-audit.component';

describe('CreatePreAuditComponent', () => {
  let component: CreatePreAuditComponent;
  let fixture: ComponentFixture<CreatePreAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreatePreAuditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePreAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
