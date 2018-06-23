import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild
} from '@angular/router';
import { Injectable } from '@angular/core';
import { AlertService } from 'ngx-alerts';
import { NgxSpinnerService } from 'ngx-spinner';
import { EngineService } from './engine.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  status: boolean;
  constructor(
    private engineService: EngineService,
    private router: Router,
    private alertService: AlertService,
    private spinner: NgxSpinnerService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.spinner.show();
    this.status = this.engineService.isAuthenticated();
    if (this.status === true) {
      this.spinner.hide();
      return true;
    } else {
      this.alertService.warning('Please login!');
      this.spinner.hide();
      return false;
    }
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.canActivate(route, state);
  }
}
