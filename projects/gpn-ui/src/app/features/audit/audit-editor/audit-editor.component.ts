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
import { TreeAttributesComponent } from '@app/features/audit/audit-editor/tree-attributes/tree-attributes.component';
import { AttributeModel } from '@app/models/attribute-model';
import { Helper } from '@app/features/audit/helper';

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
  attributes: Array<AttributeModel>;
  editmode: boolean;
  @ViewChild(ViewDocumentComponent, { static: false })
  view_doc: ViewDocumentComponent;
  @ViewChild(TreeAttributesComponent, { static: false })
  tree: TreeAttributesComponent;
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
      this.document = data;
      console.log(data);
      if (this.document.user) {
        this.attributes = Helper.json2array(this.document.user.attributes);
        console.log('user_atr');
      } else {
        this.attributes = Helper.json2array(this.document.analysis.attributes);
        console.log('analyse_atr');
      }
      this.changeDetectorRefs.detectChanges();
    });
  }

  goToAttribute(id: string) {
    this.view_doc.goToAttribute(id);
  }

  changeAttribute(attributes: AttributeModel[]) {
    this.tree.updateAttributes(attributes);
  }
}
