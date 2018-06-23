import { Component, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { EngineService } from '../services/engine.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../master/modal/alert/alert.component';
import * as crypto from 'crypto-js';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {


  title = 'Welcome';
  logoutflag = false;
  rows: any[] = [];
  openTicketCounter = 0;
  userName: string;
  userRole: string;
  UserCustomer: string;
  dashboardState = 'mytickets';
  cloneDashboardState = this.dashboardState;
  subscription: Subscription;
  url: string;
  Oid: string;

  constructor(
    private _cookieService: CookieService,
    private engineService: EngineService,
    public dialog: MatDialog,
    private router: Router,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit() {

    this.spinner.show();
    const Decrypt = crypto.AES.decrypt(this._cookieService.get('response'), this._cookieService.get('Oid') + 'India');

    const cookieData = crypto.AES.decrypt(this._cookieService.get('response'), this._cookieService.get('Oid') + 'India');
    this.Oid = JSON.parse(cookieData.toString(crypto.enc.Utf8)).Oid;
    this.userName = JSON.parse(cookieData.toString(crypto.enc.Utf8)).UserName;
    this.userRole = JSON.parse(cookieData.toString(crypto.enc.Utf8)).UserRole;

    this.url = 'Ticket/GetMyTickets/' + this._cookieService.get('Oid');
    this.engineService.getData(this.url).toPromise().then(res => {
      this.rows = res;
      if (typeof (res) === 'object') {
        res = [];
      }
      this.openTicketCounter = res.filter(data => {
        if (data.TicketStatus.toString() === '1' ||
          data.TicketStatus.toString() === '2' ||
          data.TicketStatus.toString() === '3') {
          return true;
        }
      }).length;
      this.spinner.hide();

      this.subscription = this.engineService.getDashboardState().subscribe(dashboardState => {
        this.dashboardState = dashboardState.dashboardState;
        this.cloneDashboardState = dashboardState.dashboardState;
      });
      this.engineService.getCookieData();
    }).catch();
  }

  updateDashboardState(state: string) {
    this.engineService.updateDashboardState(state);
    this.dashboardState = state;
  }

  logout() {

    const dialogRef = this.dialog.open(AlertComponent, {
      height: 'auto',
      minWidth: '30%',
      data: 'Do you want to Logout ?',
      panelClass: 'ticketDialog',
      hasBackdrop: true,
      closeOnNavigation: true
    });

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (result.toString() === 'Yes') {
          this._cookieService.removeAll();
          this.logoutflag = true;
          this.router.navigate(['/']);
        } else {
          this.logoutflag = false;
        }
        this.canDeactivate();
      });
  }

  changeOfRoutes() {
    this.engineService.currentRoute = this.router.url;
  }

  canDeactivate() {
    if (this._cookieService.get('Oid') !== this.Oid) {
      return true;
    }
    return this.logoutflag;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
