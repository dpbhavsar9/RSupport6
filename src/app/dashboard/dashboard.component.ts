import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { EngineService } from '../services/engine.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../master/modal/alert/alert.component';
import * as crypto from 'crypto-js';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

 
  checkPassword = false;
  title = 'Welcome';
  logoutflag = false;
  rows: any[] = [];
  openTicketCounter = 0;
  userName: string;
  userRole: string;
  password: string;
  UserCustomer: string;
  dashboardState = '';
  cloneDashboardState = this.dashboardState;
  subscription: Subscription;
  ticketbadge: Subscription;
  url: string;
  Oid: string;
  typeVar = 'password';
  currPass: any;
  newPass: any;
  passForm: FormGroup;
  changePasswordVisible = false;

  companyDetails: any={
     "id": '',
     "name": ''
  };

  constructor(
    private alertService: AlertService,
    private _cookieService: CookieService,
    private engineService: EngineService,
    public dialog: MatDialog,
    private router: Router,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    
    
    this.engineService.getchangeCompany().subscribe((data) => {
      this.companyDetails.id = data.id;
      this.companyDetails.name = data.name;
      });

    this.passForm = new FormGroup({
      currPass: new FormControl(null, [
        Validators.required,
      ]),
      newPass: new FormControl(null, [
        Validators.required,
      ])
    });

    this.spinner.show();
    const cookieData = crypto.AES.decrypt(this._cookieService.get('response'), this._cookieService.get('Oid') + 'India');
    this.Oid = JSON.parse(cookieData.toString(crypto.enc.Utf8)).Oid;
    this.userName = JSON.parse(cookieData.toString(crypto.enc.Utf8)).UserName;
    this.userRole = JSON.parse(cookieData.toString(crypto.enc.Utf8)).UserRole;
    this.password = JSON.parse(cookieData.toString(crypto.enc.Utf8)).Password;

    // console.log("------- ngONIT -------------"+this.password)

    this.url = 'Ticket/GetMyTickets/' + this._cookieService.get('Oid');
    this.engineService.getData(this.url).then(res => {
      this.rows = res;
     
      this.spinner.hide();

      this.subscription = this.engineService.getDashboardState().subscribe(dashboardState => {
        this.dashboardState = dashboardState.dashboardState;
        this.cloneDashboardState = dashboardState.dashboardState;
      });
      this.ticketbadge = this.engineService.getTicketBadge().subscribe(res=>{
        this.openTicketCounter = res;
      });
      this.engineService.getCookieData();
    }).catch();
  }

  toggleChangePasswordVisible() {
    this.changePasswordVisible = !this.changePasswordVisible;
  }

  resetForm() {
    this.changePasswordVisible = false;
    this.passForm.reset();
    this.passForm.markAsPristine();
    this.passForm.markAsUntouched();
    this.checkPassword = false;
  }

  updateDashboardState(state: string) {
    this.engineService.validateUser();
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

  updateTypeVar() {
    if (this.typeVar === 'password') {
      this.typeVar = 'text';
    } else {
      this.typeVar = 'password';
    }
  }

  submitPass() {
    this.engineService.validateUser();
    const curPass = this.passForm.get('currPass').value;
    const newPass = this.passForm.get('newPass').value;

    
    const data = {
      Oid: this.Oid,
      Pass: newPass
    };
    const url = 'Users/ChangePassword';
    if (curPass === this.password) {
      this.engineService.updateData(url, data).then(res => {
        this.alertService.success('Password Changed SuccessFully');
        this._cookieService.removeAll();
        this.logoutflag = true;
        this.router.navigate(['/']);
      }).catch(err => {
        // console.log('---- Error ----' + err);
      });
    } else {
      this.checkPassword = true;
    }
  }

  focusChanged() {
    this.checkPassword = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  changeProject(){
    this.openTicketCounter = 0;
    this.dashboardState = '';
    this.cloneDashboardState = '';
    
    this.router.navigate(['/dashboard']);
    this._cookieService.remove('ProjectID');
    this._cookieService.remove('ProjectName');
    this.engineService.changeProject();     
  }

  onClick(){
    this.engineService.closeModal();
  }

}
