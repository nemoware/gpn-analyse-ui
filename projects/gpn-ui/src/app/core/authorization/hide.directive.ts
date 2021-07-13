import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnInit
} from '@angular/core';
import { AuthorizationData } from '@core/authorization/authorization.data';

@Directive({
  selector: '[gpnHide]'
})
export class HideDirective implements OnInit, AfterViewInit {
  @Input() appPage: string;

  constructor(
    private el: ElementRef,
    private authorizationService: AuthorizationData
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    const res = this.authorizationService.hasAccess(this.appPage);
    if (!res) {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
