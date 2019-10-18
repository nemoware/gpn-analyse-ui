import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { AuditService } from '@app/features/audit/audit.service';
import { ActivatedRoute, Router } from '@root/node_modules/@angular/router';
import { Document } from '@app/models/document.model';
import { ViewDocumentComponent } from '@app/features/audit/audit-editor/view-document/view-document.component';

@Component({
  selector: 'gpn-audit-editor',
  templateUrl: './audit-editor.component.html',
  styleUrls: ['./audit-editor.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditEditorComponent implements OnInit, AfterViewInit {
  IdDocument;
  document: Document;
  attributes: Array<{ kind: string; value: string; id: string }> = [];
  editmode: boolean;
  @ViewChild(ViewDocumentComponent, { static: false })
  view_doc: ViewDocumentComponent;
  documentType: string[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.IdDocument = this.activatedRoute.snapshot.paramMap.get('id');
    this.editmode = this.activatedRoute.snapshot.data['editmode'];
  }

  ngAfterViewInit(): void {
    this.auditservice.getDoument(this.IdDocument).subscribe(data => {
      console.log(data);
      this.document = data;
      this.changeDetectorRefs.detectChanges();
    });
  }

  goToAttribute(id: string) {
    this.view_doc.goToAttribute(id);
  }
}
