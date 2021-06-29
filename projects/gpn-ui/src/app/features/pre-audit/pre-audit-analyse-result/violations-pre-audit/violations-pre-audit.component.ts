import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { ViolationModel } from '@app/models/violation-model';
import { state, style, trigger } from '@root/node_modules/@angular/animations';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from '@root/node_modules/rxjs';
@Component({
  selector: 'gpn-violations-pre-audit',
  templateUrl: './violations-pre-audit.component.html',
  styleUrls: ['./violations-pre-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [state('expanded', style({ height: '*' }))])
  ]
})
export class ViolationsPreAuditComponent implements OnInit, OnDestroy {
  col: string[] = ['filename', 'org2', 'violation', 'violation_reason', 'note'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  violations: ViolationModel[];
  private destroyStream = new Subject<void>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  _sortingDataAccessor: (data, sortHeaderId: string) => string | number = (
    data,
    sortHeaderId: string
  ): string | number => {
    return this.getAttrValue(sortHeaderId, data);
  };

  getAttrValue(attr, data) {
    switch (attr) {
      case 'violation_type': {
        return data.violation_type;
      }
      case 'document': {
        return data.document.type;
      }
      case 'founding_document': {
        return data.founding_document ? data.founding_document.type : 'null';
      }
      case 'violation_reason': {
        return data.reference ? data.reference.type : 'null';
      }
    }
  }

  ngOnInit() {
    this.auditservice
      .getViolations(this.idAudit)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        if (data) {
          this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
          this.dataSource.sort = this.sort;
          this.dataSource.data = data.filter(x => {
            return x.violation_type;
          });
          this.changeDetectorRefs.detectChanges();
        }
      });
  }

  openDocument(id, attribute?) {
    window.open(
      window.location.origin +
        '/#/audit/edit/' +
        id +
        (attribute ? '?attribute=' + attribute : ''),
      '_blank'
    );
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
