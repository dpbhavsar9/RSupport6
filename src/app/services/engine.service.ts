import { OnInit, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import * as crypto from 'crypto-js';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec } from '@angular/common/http';
import * as moment from 'moment';

@Injectable()
export class EngineService implements OnInit {

  changeProj = new Subject<any>();
  changeComp = new Subject<any>();
  closeMod = new Subject<any>();
  openbadge = new Subject<any>();

  //loginUrl = 'http://192.168.0.168:82/token';
  //baseUrl = 'http://192.168.0.168:82/api/';
  
  
  baseUrl = 'http://rsapi.rlmc.in/api/';
  loginUrl = 'http://rsapi.rlmc.in/token';

  //loginUrl = "http://localhost:3979/token"; 
  //baseUrl = 'http://localhost:3979/api/';

  
  URL: string;
  users: any;
  excel: any;
  excelData: any[] = [];
  excelHeaders: any[] = [];
  excelOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Your title',
    useBom: true,
    noDownload: false,
    headers: []
  };
  userRole: string;
  isClient: string;
  currentRoute: string;

  private subject = new Subject<any>();
  constructor(private httpC: HttpClient,
    private _cookieService: CookieService, private router: Router) 
    {
   
   }

  ngOnInit() {
  }


  isAuthenticated(): boolean {
    try {
      const Decrypt = crypto.AES.decrypt(this._cookieService.get('response').toString(), this._cookieService.get('Oid') + 'India');
      const decryptData = Decrypt.toString(crypto.enc.Utf8);
      const Oid = JSON.parse(decryptData).Oid.toString();
      if (this._cookieService.get('Oid') !== Oid) {
        return false;
      }
      return JSON.parse(decryptData).LoggedIn;
    } catch (err) {
      this.router.navigate(['']);
      return false;
    }
  }

  isEditAuthenticated(): boolean {
    try {
      const Decrypt = crypto.AES.decrypt(this._cookieService.get('response').toString(), this._cookieService.get('Oid') + 'India');
      const decryptData = Decrypt.toString(crypto.enc.Utf8);
      const Oid = JSON.parse(decryptData).Oid.toString();
      if (this._cookieService.get('Oid') !== Oid) {
        return false;
      }
      const userRole = JSON.parse(decryptData).UserRole;
      if (userRole === 'User') {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      this.router.navigate(['']);
      return false;
    }
  }

  isMasterAuthenticated(): boolean {
    try {
      const Decrypt = crypto.AES.decrypt(this._cookieService.get('response').toString(), this._cookieService.get('Oid') + 'India');
      const decryptData = Decrypt.toString(crypto.enc.Utf8);
      const Oid = JSON.parse(decryptData).Oid.toString();
      if (this._cookieService.get('Oid') !== Oid) {
        return false;
      }
      const userRole = JSON.parse(decryptData).UserRole;
      if (userRole === 'User') {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      this.router.navigate(['']);
      return false;
    }
  }

  validateUser() {
    const Decrypt = crypto.AES.decrypt(this._cookieService.get('response').toString(), this._cookieService.get('Oid') + 'India');
    const decryptData = Decrypt.toString(crypto.enc.Utf8);
    const Oid = JSON.parse(decryptData).Oid.toString();
    if (this._cookieService.get('Oid') !== Oid) {
      this._cookieService.removeAll();
      this.router.navigate(['']);
    } else {
      return true;
    }
  }
  // Authorization completed


  getCookieData() {
    const cookieData = crypto.AES.decrypt(this._cookieService.get('response'), this._cookieService.get('Oid') + 'India');
    this.userRole = JSON.parse(cookieData.toString(crypto.enc.Utf8)).UserRole;
  }
  updateDashboardState(dashboardState: string) {
    this.subject.next({ dashboardState: dashboardState });
  }
  getDashboardState(): Observable<any> {
    return this.subject.asObservable();
  }
  changeProject() {
    this.changeProj.next(0);
  }
  getChangeProject(): Observable<any> {
    return this.changeProj.asObservable();
  }
  changeCompany(val: any) {
    this.changeComp.next(val);
  }
  getchangeCompany(): Observable<any> {
    return this.changeComp.asObservable();
  }
  closeModal() {
    this.closeMod.next(1);
  }
  getCloseModal() {
    return this.closeMod.asObservable();
  }
  changeTicketBadge(val: any){
    this.openbadge.next(val)
  }
  getTicketBadge(){
    return this.openbadge.asObservable();
  }

  setHeaders() {
  /*  const _headers = new HttpHeaders();
    this.headers = _headers.append('Access-Control-Allow-Origin', '*')
                           .append('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
                           .append('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
                           .append('Allow', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')                         
                           .append('Content-Type', 'application/json; charset=utf-8')
                           .append('Authorization', this._cookieService.get('token'));  */                   
  }

  login(userName: string, password: string): Promise<any> {
    const body = new HttpParams({ encoder: new HttpFormEncodingCodec() })
      .append('grant_type', 'password')
      .append('username', userName)
      .append('password', password)
      .toString();
    return this.httpC.post(this.loginUrl, body).toPromise();
  }  
  logout() {
    this._cookieService.removeAll();
  }

  checkRefreshToken(){

    const expire = Number(this._cookieService.get('expires_in'));
    const time = this._cookieService.get('time');

    var curr = moment();
    var time_ = new Date(time);
    var time_momObj = moment(time_);

    var duration = moment.duration(curr.diff(time_momObj));
    var hours = duration.asSeconds();
   
    let difference = (expire-hours);
    
    if(difference>1 && difference<5){    
      const body = new HttpParams({ encoder: new HttpFormEncodingCodec() })
      .append('refresh_token',this._cookieService.get('refresh_token'))
      .append('grant_type', 'refresh_token')
      .toString();
     this.httpC.post(this.loginUrl, body).toPromise().then(res=>{
      this._cookieService.put('token','bearer '+res["access_token"]);
      this._cookieService.put('refresh_token',res["refresh_token"]);
      this._cookieService.put('expires_in',res["expires_in"]);
      this._cookieService.put('time',moment().format());
  
    }).catch(err=>{
      
    });
    }
    else if(difference < 0) {
      this._cookieService.removeAll();
      this.router.navigate(['/']);
    }
    else
    {

    }

  }

  getData(url: string, id?: any): Promise<any> {
    this.checkRefreshToken();
    const httpOptions = {
     headers: new HttpHeaders({
       'Authorization': this._cookieService.get('token')
     })
   };
    this.URL = this.baseUrl + url;
    return this.httpC.get(this.URL, httpOptions).toPromise();
  }

  postData(url: any, data: any): Promise<any> {
    this.checkRefreshToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        'Allow': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Content-Type':  'application/json',
        'Accept':  'application/json',
        'Authorization': this._cookieService.get('token')
      })
    };
    this.URL = this.baseUrl + url;
    const body = JSON.stringify(data);
    return  this.httpC.post(this.URL, body, httpOptions).toPromise();
  }

  updateData(url: any, data: any): Promise<any> {
    this.checkRefreshToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        'Allow': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Content-Type':  'application/json',
        'Accept':  'application/json',
        'Authorization': this._cookieService.get('token')
      })
    };
    this.URL = this.baseUrl + url;
    const body = JSON.stringify(data);
    return this.httpC.put(this.URL, body, httpOptions).toPromise();
  }


  downloadExcel(excelData, excelName) {
    this.excelOptions.title = excelName;
    if (excelData.length > 0) {
      this.excelOptions.headers = Object.keys(excelData[0]);
    }
    this.excelData = excelData;
    this.excel = new Angular5Csv(this.excelData, excelName, this.excelOptions);
  }

  uploadFile(fileItem: File, data, filename): Promise<any> {  
    const url = this.baseUrl + 'Upload/UploadFiles';
    const formData: FormData = new FormData();
    formData.append('TicketID', data.TicketID);
    formData.append('TicketNo', data.TicketNo);
    formData.append('TicketBacklogID', data.TicketBacklogID);
    formData.append('FileName', filename);
    formData.append('By', this._cookieService.get('Oid'));
    formData.append('fileItem', fileItem, filename);
    
    return this.httpC.post(url, formData).toPromise();
  }
}

export class HttpFormEncodingCodec implements HttpParameterCodec {
  encodeKey(k: string): string { return encodeURIComponent(k).replace(/%20/g, '+'); }

  encodeValue(v: string): string { return encodeURIComponent(v).replace(/%20/g, '+'); }

  decodeKey(k: string): string { return decodeURIComponent(k.replace(/\+/g, ' ')); }

  decodeValue(v: string) { return decodeURIComponent(v.replace(/\+/g, ' ')); }
}                                        