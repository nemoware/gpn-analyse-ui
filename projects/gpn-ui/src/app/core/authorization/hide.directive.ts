import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthGroup } from '@app/models/permissions';
import { AuthorizationData } from '@core/authorization/authorization.data';

@Directive({
  selector: '[gpnGide]',
  providers: [AuthorizationData]
})
export class HideDirective implements OnInit {

  @Input('HideComponent') permission: AuthGroup;

  constructor(private el: ElementRef, private authorizationService: AuthorizationData) { }
  ngOnInit() {
    if (!this.authorizationService.hasPermission(this.permission)) {
      this.el.nativeElement.style.display = 'none';
    }
  }
}