import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Document } from '@app/models/document.model';
import { Helper } from '@app/features/audit/helper';
import { Tag } from '@app/models/legal-document';
import { KindAttribute } from '@app/models/kind-attribute';
import {
  faChevronDown,
  faChevronUp,
  faEdit,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';
import { EditAttributeComponent } from '@app/features/audit/audit-editor/edit-attribute/edit-attribute.component';

@Component({
  selector: 'gpn-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ViewDocumentComponent implements OnInit, AfterViewInit {
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEdit = faEdit;
  faSave = faSave;
  @Input() document: Document;
  @Input() editmode: boolean;
  @Input() documentType: string[];
  changed = false;
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.document) this.loadDoc();
  }

  ngAfterViewInit(): void {}

  loadDoc() {
    const view_doc = document.getElementById('view_doc');
    let result = this.document.analysis.normal_text;
    const words = this.document.analysis.tokenization_maps.words;
    const infoTags: Array<[number, string]> = [];
    const _atr = Helper.json2array(this.document.analysis.attributes);

    for (const _tag of _atr)
      if (_tag.span) {
        for (let i = _tag.span[0]; i < _tag.span[1]; i++)
          infoTags.push([i, this.getClassName(_tag.kind)]);
      }

    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      let classSpan;
      const _tag = infoTags.find(x => x[0] === i);
      if (_tag) classSpan = _tag[1];
      else classSpan = 'span';
      const txtS = `<span class="${classSpan}" id="span_${i}">`;
      const txtE = '</span>';
      result = result.slice(0, word[1]) + txtE + result.slice(word[1]);
      result = result.slice(0, word[0]) + txtS + result.slice(word[0]);
    }

    result = '<span id="top"></span>' + result + '<span id="foot"> </span>';
    view_doc.insertAdjacentHTML('afterbegin', result);
  }

  getClassName(kind: string) {
    let nameClassSpan = 'unknown';
    if (kind.includes('headline')) nameClassSpan = 'headline';
    if (kind in KindAttribute) nameClassSpan = kind;
    return nameClassSpan;
  }

  public goToAttribute(id) {
    const element = document.getElementById(id);
    if (element != null)
      element.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
  }

  getSelectedText(e: MouseEvent) {
    if (!this.editmode || document.getSelection().isCollapsed) return;
    let idStart;
    let idEnd;

    if (document.getSelection().anchorNode.parentElement.id === 'view_doc') {
      idStart = (document.getSelection().anchorNode.nextSibling as HTMLElement)
        .id;
    } else idStart = document.getSelection().anchorNode.parentElement.id;

    if (document.getSelection().focusNode.parentElement.id === 'view_doc') {
      idEnd = (document.getSelection().focusNode.previousSibling as HTMLElement)
        .id;
    } else idEnd = document.getSelection().focusNode.parentElement.id;

    if (Number(idStart.split('_')[1]) > Number(idEnd.split('_')[1])) return;

    const words = this.document.analysis.tokenization_maps.words;
    const wordS = words[idStart.split('_')[1]];
    const wordE = words[idEnd.split('_')[1]];

    const value = this.document.analysis.normal_text.slice(wordS[0], wordE[1]);

    /*this.addNewTag('selected', value, [
      Number(idStart.split('_')[1]),
      Number(idEnd.split('_')[1])
    ]);*/

    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: '600px',
      data: {
        top: e.pageY,
        left: e.pageX,
        value: value,
        documentType: this.documentType
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.changed = true;
        for (const elem of this.getArrayNodes(idStart, idEnd)) {
          elem.classList.forEach(c => {
            elem.classList.remove(c);
          });
          elem.classList.add(result.type);
        }
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  getArrayNodes(idS: string, idE: string): Array<Element> {
    const nodes: Array<Element> = [];
    const elementS = document.getElementById(idS);
    const elementE = document.getElementById(idE);
    let elem: Element = elementS;
    nodes.push(elementS);
    while (elem !== elementE) {
      elem = elem.nextElementSibling;
      nodes.push(elem);
    }
    return nodes;
  }

  addNewTag(kind: string, value: string, span: Array<number>) {
    const tag: Tag = { kind, value, span };
    // this.contract.tags.push(tag);
  }

  editMode() {
    this.router.navigate(['audit/edit/', this.document._id]);
  }

  saveChanges() {}
}
