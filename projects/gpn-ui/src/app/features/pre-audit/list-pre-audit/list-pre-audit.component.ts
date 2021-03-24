import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';

@Component({
  selector: 'gpn-list-pre-audit',
  templateUrl: './list-pre-audit.component.html',
  styleUrls: ['./list-pre-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPreAuditComponent implements OnInit {
  documents: Object[];

  constructor(private preAuditService: PreAuditService) {}

  ngOnInit() {}

  uploadFiles(event) {
    this.documents = [];
    const files = event.target.files;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const that = this;
      reader.onload = () => {
        // console.log(reader.result);
        that.documents.push({
          base64Content: reader.result
            .toString()
            .replace('data:', '')
            .replace(/^.+,/, ''),
          fileName: file.name
        });
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
    });
  }

  submitFiles() {
    this.preAuditService.postPreAudit(this.documents).subscribe(
      data => console.log(data),
      error => console.log(error)
    );
  }
}
