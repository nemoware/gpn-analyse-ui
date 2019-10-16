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
import { Observable } from '@root/node_modules/rxjs';
import { Helper } from '@app/features/audit/helper';
import { ViewDocumentComponent } from '@app/features/audit/audit-editor/view-document/view-document.component';
import {
  faChevronDown,
  faChevronUp,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'gpn-audit-editor',
  templateUrl: './audit-editor.component.html',
  styleUrls: ['./audit-editor.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditEditorComponent implements OnInit, AfterViewInit {
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEdit = faEdit;
  IdDocument;
  document: Document;
  attributes: Array<{ kind: string; value: string; id: string }> = [];
  editmode: boolean;
  @ViewChild(ViewDocumentComponent, { static: false })
  view_doc: ViewDocumentComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.IdDocument = this.activatedRoute.snapshot.paramMap.get('id');
    this.editmode = this.activatedRoute.snapshot.data['editmode'];
  }

  ngAfterViewInit(): void {
    this.auditservice.getDoument(this.IdDocument).subscribe(data => {
      this.document = data;
      for (const a of Helper.json2array(this.document.analysis.attributes)) {
        this.attributes.push({
          kind: a.kind,
          value: a.value,
          id: 'span_' + (a.span ? a.span[0] : -1)
        });
      }
      this.changeDetectorRefs.detectChanges();
    });
  }

  goToColorText(id: string) {
    this.view_doc.goToColorText(id);
  }

  editMode() {
    this.router.navigate(['audit/edit/', this.IdDocument]);
  }
}
