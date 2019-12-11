import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input
} from '@angular/core';
import {
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { ViolationModel } from '@app/models/violation-model';

@Component({
  selector: 'gpn-violations-audit',
  templateUrl: './violations-audit.component.html',
  styleUrls: ['./violations-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViolationsAuditComponent implements OnInit {
  col: string[] = ['document', 'constituent', 'item', 'violation', 'base'];
  dataSource = new MatTableDataSource();
  violations: ViolationModel[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;
  constructor(private auditservice: AuditService) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.sort = this.sort;
    this.refreshData();
  }

  refreshData() {
    this.auditservice.getViolations(this.idAudit).subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
    });
  }
}
