import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { AuditService } from '@app/features/audit/audit.service';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatIconRegistry,
  MatSelect
} from '@root/node_modules/@angular/material';
import { FormControl } from '@root/node_modules/@angular/forms';
import { ReplaySubject, Subject } from '@root/node_modules/rxjs';
import { take, takeUntil } from '@root/node_modules/rxjs/internal/operators';
import { Department } from '@app/models/department.model';
import { DomSanitizer } from '@root/node_modules/@angular/platform-browser';

@Component({
  selector: 'gpn-create-audit',
  templateUrl: './create-audit.component.html',
  styleUrls: ['./create-audit.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateAuditComponent implements OnInit, OnDestroy, AfterViewInit {
  public departmentCtrl: FormControl = new FormControl();
  public departmentFilterCtrl: FormControl = new FormControl();
  public filteredDepartments: ReplaySubject<Department[]> = new ReplaySubject<
    Department[]
  >(1);
  @ViewChild('selectDepartment', { static: false }) selectDepartment: MatSelect;

  private departments: Department[] = [
    { name: 'ГПН №1', _id: '1' },
    { name: 'ГПН №2', _id: '2' },
    { name: 'ГПН №3', _id: '3' }
  ];

  private _onDestroy = new Subject<void>();

  constructor(
    private auditservice: AuditService,
    public dialogRef: MatDialogRef<CreateAuditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {}

  ngOnInit() {
    this.filteredDepartments.next(this.departments.slice());
    this.departmentFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDepartments();
      });
  }

  ngAfterViewInit(): void {
    this.setInitialValue();
  }

  private setInitialValue() {
    this.filteredDepartments
      .pipe(
        take(1),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.selectDepartment.compareWith = (a: Department, b: Department) =>
          a._id === b._id;
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterDepartments() {
    if (!this.departments) {
      return;
    }
    let search = this.departmentFilterCtrl.value;
    if (!search) {
      this.filteredDepartments.next(this.departments.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDepartments.next(
      this.departments.filter(
        department => department.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  CloseForm() {
    this.dialogRef.close();
  }

  CreateAudir() {}
}
