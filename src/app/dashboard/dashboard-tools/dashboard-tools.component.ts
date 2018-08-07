import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { CookieService } from 'ngx-cookie';
import { AlertService } from 'ngx-alerts';
import { MatDialog } from '@angular/material';
import { AlertComponent } from '../../master/modal/alert/alert.component';
import * as crypto from 'crypto-js';
import { DashboardComponent } from '../dashboard.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { timer } from 'rxjs/internal/observable/timer';
import { Observable } from 'rxjs/internal/Observable';
import { MeslogComponent } from '../../transaction/meslog/meslog.component';
import { ActivatedRoute, Router } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-dashboard-tools',
  templateUrl: './dashboard-tools.component.html',
  styleUrls: ['./dashboard-tools.component.scss']
})
export class DashboardToolsComponent implements OnInit, OnDestroy {

  changeProj: Subscription;
  closeModal: Subscription;
  projectdata: Array<any> = [];
  messageDialog: any;
  
  attachment: Array<any> = [];
  url: string;
  selected = 'Open';
  ticketLogTypeSelector = 'WIP';
  data: any[] = [{ 'TicketStatus': 'Open', 'Count': 0 },
  { 'TicketStatus': 'WIP', 'Count': 0 },
  { 'TicketStatus': 'Hold', 'Count': 0 },
  { 'TicketStatus': 'Close', 'Count': 0 },
  { 'TicketStatus': 'Cancel', 'Count': 0 }
  ];
  manualUpdateFlag = false;
  source: any[] = [{
    'status': 'Open',
    'data': []
  }, {
    'status': 'WIP',
    'data': []
  }, {
    'status': 'Hold',
    'data': []
  }, {
    'status': 'Close',
    'data': []
  }, {
    'status': 'Cancel',
    'data': []
  }];

  collpaseArray: any[] = [];
  isCollapsed = true;
  private timerSubscription: Subscription;
  subscription: Subscription;
  private toggle = 'none';
  projectID = 0;
  projectName = "";
  initialLength = 0;
  updatedLength = 0;

  projectRows: any[] = [];
  projectTemp: any[] = [];
  projectInitialLength = 0;
  projectUpdatedLength = 0;
  public radioModel = 'Desktop';

  dashboardState: string = this.dashboardComponent.dashboardState;

  userRole: string;
  userName: string;
  val = '';
  valSort = '';
  ascSort = 'true';
  rows: any[] = [];
  temp: any[] = [];
  Oid: string;
  allocationType = 'Team';
  searchIn = 'Multiple';
  condensedView = false;
  modalData: any = {};
  chartVisible = false;
  projectVal = '';
  public chartType = 'bar';

  public chartDatasets: Array<any> = [
    // tslint:disable-next-line:max-line-length
    { data: [0, 0, 0], label: 'Status comparison' }
  ];

  public chartLabels: Array<any> = ['Open', 'WIP', 'Hold'];

  public chartColors: Array<any> = [
    {
      backgroundColor: 'rgba(248, 126, 126, 0.8)',
      borderColor: 'rgba(248, 126, 126, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(220,220,220,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(220,220,220,1)'
    },
    {
      backgroundColor: 'rgba(38,192,218,0.8)',
      borderColor: 'rgba(38,192,218,1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(151,187,205,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(151,187,205,1)'
    },
    {
      backgroundColor: 'rgba(151,187,205,0.8)',
      borderColor: 'rgba(151,187,205,1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(151,187,205,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(151,187,205,1)'
    }
  ];

  public chartOptions: any = {
    responsive: true
  };
  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

  constructor(private engineService: EngineService,
    public route : ActivatedRoute,
    private _cookieService: CookieService,
    private alertService: AlertService, 
    public dialog: MatDialog, 
    public router: Router,
    private dashboardComponent: DashboardComponent)
    {
    const cookieData = crypto.AES.decrypt(this._cookieService.get('response'), this._cookieService.get('Oid') + 'India');
    this.Oid = JSON.parse(cookieData.toString(crypto.enc.Utf8)).Oid;
    this.userName = JSON.parse(cookieData.toString(crypto.enc.Utf8)).UserName;

   this.changeProj = this.engineService.getChangeProject().subscribe(res =>{
     this.projectID = 0;
   });

   this.closeModal = this.engineService.getCloseModal().subscribe(res =>{
       this.dialog.closeAll();
    });

    

  }


  ngOnInit() {
    this.dashboardComponent.cloneDashboardState = this.dashboardState;
    this.Oid = this._cookieService.get('Oid');
    const tempProjectID = this._cookieService.get('ProjectID');
    if (tempProjectID == undefined) {
      this.projectID = 0;
      this.projectName = "";
    } else {
      this.projectID = Number(tempProjectID);
      this.projectName = this._cookieService.get('ProjectName');
    }

    const Decrypt = crypto.AES.decrypt(this._cookieService.get('response').toString(), this.Oid + 'India');
    const decryptData = Decrypt.toString(crypto.enc.Utf8);
    this.userRole = JSON.parse(decryptData).UserRole;
    this.userName = JSON.parse(decryptData).UserName;
    this.refreshProjectData();
    if (this.userRole !== 'Administrator') {
      this.refreshData();
      this.subscription = this.engineService.getDashboardState().subscribe(dashboardState => {
        this.dashboardState = dashboardState.dashboardState.toString();
        this.refreshData();
      });
    }

  }

  private subscribeToData(): void {
    const timerVar = timer(10 * 60 * 1000);
    this.timerSubscription = timerVar.subscribe(() => {
      this.refreshData();
    });
  }

  private refreshData(): void {

  
    
   
    if (this.dashboardState === 'byme') {
      this.url = 'Ticket/GetMyTickets/' + this._cookieService.get('Oid');
      this.allocationType = 'Team';
    } else if (this.dashboardState === 'mytickets') {
      this.url = 'Ticket/GetTeamTickets/' + this._cookieService.get('Oid');
    }
    this.engineService.getData(this.url).then(res => {

    this.projectName = this._cookieService.get('ProjectName');

    //console.log("--- dta ----"+JSON.stringify(res))
  
    for(let i in res){

      var offset = moment().utcOffset();

      var createdatelocal = moment.utc(res[i].CreatedDate).utcOffset(offset).format("L LT");
      res[i].CreatedDate = createdatelocal;

      var datemessage = moment.utc(res[i].Message['OperationDate']).utcOffset(offset).format("L LT");
      res[i].Message['OperationDate'] = datemessage;

      if(res[i].AssignDate != null){
        var assigndate = moment.utc(res[i].AssignDate).utcOffset(offset).format("L LT");
        res[i].AssignDate = assigndate;
      }

      if(res[i].CancelDate != null){
        var canceldate = moment.utc(res[i].CancelDate).utcOffset(offset).format("L LT");
        res[i].CancelDate = canceldate;
      }

      if(res[i].CloseDate != null){
        var closedate = moment.utc(res[i].CloseDate).utcOffset(offset).format("L LT");
        res[i].CloseDate = closedate;
      }

      if(res[i].HoldDate != null){
        var holddate = moment.utc(res[i].HoldDate).utcOffset(offset).format("L LT");
        res[i].HoldDate = holddate;
      }

      if(res[i].WIPDate != null){
        var wipdate = moment.utc(res[i].WIPDate).utcOffset(offset).format("L LT");
        res[i].WIPDate = wipdate;
      }
   
      
    }
    
    let count = res.filter(data => {
      if (data.ProjectID.toString() === this._cookieService.get('ProjectID') &&
        (data.TicketStatus.toString() === '1' ||
        data.TicketStatus.toString() === '2' ||
        data.TicketStatus.toString() === '3')) {
        return true;
      }
    }).length;
    this.engineService.changeTicketBadge(count);
     
      this.updateTickets(res);
      this.updateFilter();
      if (!this.manualUpdateFlag) {
        this.subscribeToData();
      }
      this.manualUpdateFlag = false;
    }).catch(err => {
         //this.alertService.danger('Server response error @refreshData');
    });
  }

  toggleChart() {
    this.chartVisible = !this.chartVisible;
  }


  public updateFilter() {
    
    
    const userName = this.userName;
    const allocationType = this.allocationType;
    const val = this.val.toLowerCase();
    const searchIn = this.searchIn;
    let res = this.temp;
    
    if(this.projectName !== "" || this.projectName !== undefined){
      
   
    let lowercase = this.projectName.toLowerCase();
    res = res.filter(function(d) {
          if (d.ProjectName.toLowerCase() == lowercase) {
            
            return true;
          } else {
            return false;
          }
        });    
    }
  
   

    res = res.filter(function (d) {
      if (allocationType === 'OnlyMe' && d.AssignToName.toLocaleLowerCase() === userName.toLocaleLowerCase()) {
        return true;
      } else if (allocationType === 'ExceptMe' && d.AssignToName.toLocaleLowerCase() !== userName.toLocaleLowerCase()) {
        return true;
      } else if (allocationType === 'Team') {
        return true;
      } else {
        return false;
      }
    });

    res = res.filter(function (d) {
      if (searchIn === 'Multiple') {
        if (d.Subject.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.TicketNo.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.TicketDescription.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.TeamName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.ProjectName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.CompanyName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.Priority.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.AssignByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.AssignToName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.CancelByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.CloseByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.CreatedByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.HoldByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else if (d.WIPByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'TicketNo') {
        if (d.TicketNo.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'TicketDescription') {
        if (d.TicketDescription.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'TeamName') {
        if (d.TeamName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'ProjectName') {
        if (d.ProjectName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'CompanyName') {
        if (d.CompanyName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'Priority') {
        if (d.Priority.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'AssignByName') {
        if (d.AssignByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'AssignToName') {
        if (d.AssignToName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'CancelByName') {
        if (d.CancelByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'CloseByName') {
        if (d.CloseByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'CreatedByName') {
        if (d.CreatedByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'HoldByName') {
        if (d.HoldByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      } else if (searchIn === 'WIPByName') {
        if (d.WIPByName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        } else {
          return false;
        }
      }
    });

    res = res.sort((a, b) => {
      switch (this.valSort) {
        case 'TicketNo':
          if (this.ascSort === 'true') {
            if (a.TicketNo < b.TicketNo) {
              return -1;
            } else if (a.TicketNo > b.TicketNo) {
              return 1;
            } else {
              return 0;
            }
          } else {
            if (a.TicketNo < b.TicketNo) {
              return 1;
            } else if (a.TicketNo > b.TicketNo) {
              return -1;
            } else {
              return 0;
            }

          }
        case 'Priority':
          if (this.ascSort === 'true') {
            if (a.Priority < b.Priority) {
              return -1;
            } else if (a.Priority > b.Priority) {
              return 1;
            } else {
              return 0;
            }
          } else {
            if (a.Priority < b.Priority) {
              return 1;
            } else if (a.Priority > b.Priority) {
              return -1;
            } else {
              return 0;
            }
          }
        case 'Subject':
          if (this.ascSort === 'true') {
            if (a.Subject < b.Subject) {
              return -1;
            } else if (a.Subject > b.Subject) {
              return 1;
            } else {
              return 0;
            }
          } else {
            if (a.Subject < b.Subject) {
              return 1;
            } else if (a.Subject > b.Subject) {
              return -1;
            } else {
              return 0;
            }
          }

        case 'TicketDescription':
          if (this.ascSort === 'true') {
            if (a.TicketDescription < b.TicketDescription) {
              return -1;
            } else if (a.TicketDescription > b.TicketDescription) {
              return 1;
            } else {
              return 0;
            }
          } else {
            if (a.TicketDescription < b.TicketDescription) {
              return 1;
            } else if (a.TicketDescription > b.TicketDescription) {
              return -1;
            } else {
              return 0;
            }
          }

        case 'CreatedDate':
          if (this.ascSort === 'true') {
            if (a.CreatedDate < b.CreatedDate) {
              return -1;
            } else if (a.CreatedDate > b.CreatedDate) {
              return 1;
            } else {
              return 0;
            }
          } else {
            if (a.CreatedDate < b.CreatedDate) {
              return 1;
            } else if (a.CreatedDate > b.CreatedDate) {
              return -1;
            } else {
              return 0;
            }
          }


        default:
          // console.log('6');
          if (a.CreatedDate < b.CreatedDate) {
            return -1;
          } else if (a.CreatedDate > b.CreatedDate) {
            return 1;
          } else {
            return 0;
          }
      }
    });

    

    // update the rows
    this.source[0].data = res.filter(x => x.TicketStatus === 1);
    this.source[1].data = res.filter(x => x.TicketStatus === 2);
    this.source[2].data = res.filter(x => x.TicketStatus === 3);
    this.source[3].data = res.filter(x => x.TicketStatus === 4);
    this.source[4].data = res.filter(x => x.TicketStatus === 5);
    this.data[0].Count = this.source[0].data.length;
    this.data[1].Count = this.source[1].data.length;
    this.data[2].Count = this.source[2].data.length;
    this.data[3].Count = this.source[3].data.length;
    this.data[4].Count = this.source[4].data.length;
    
    for(let i =0;i<=4;i++){
      this.source[i].data = this.source[i].data.sort((a,b)=>{

        if (a.Count < b.Count) {
          return 1;
        } else if (a.Count > b.Count) {
          return -1;
        } else {
          return 0;
        }
        
      });
     
    }
      
   
    this.chartDatasets = [
      // tslint:disable-next-line:max-line-length
      { data: [this.data[0].Count, this.data[1].Count, this.data[2].Count], label: 'Status comparison' }
    ];
  }

  updateTickets(tickets: any) {
    // console.log(tickets);
    
    for(let i in tickets){
      
    }

    this.rows = tickets;
    this.temp = tickets;
    // update the rows
    this.source[0].data = this.temp.filter(x => x.TicketStatus === 1);
    this.source[1].data = this.temp.filter(x => x.TicketStatus === 2);
    this.source[2].data = this.temp.filter(x => x.TicketStatus === 3);
    this.source[3].data = this.temp.filter(x => x.TicketStatus === 4);
    this.source[4].data = this.temp.filter(x => x.TicketStatus === 5);
    this.data[0].Count = this.source[0].data.length;
    this.data[1].Count = this.source[1].data.length;
    this.data[2].Count = this.source[2].data.length;
    this.data[3].Count = this.source[3].data.length;
    this.data[4].Count = this.source[4].data.length;
  }

  updateTicketLogTypeSelector(id: number) {
    this.ticketLogTypeSelector = this.data[id].TicketStatus;
  }


  private selectRow(row) {
    this.val = row.TicketNo;
    this.searchIn = 'TicketNo';
    this.condensedView = false;
    this.updateFilter();
  }

  public clearSerchCriteria() {
    this.condensedView = false;
    this.val = '';
    this.searchIn = 'Multiple';
    this.updateFilter();
  }

  private openTicketMessage(index, pindex) {
    this.engineService.validateUser();

    const row = this.source[index].data[pindex];

    row['Count']='0'; 
    
    const data = {
      'CompanyID': row['CompanyID'],
      'ProjectID': row['ProjectID'],
      'TicketID': row['Oid'],
      'TicketNo': row['TicketNo'],
      'TicketStatus': row['TicketStatus'],
    };

    this.messageDialog = this
      .dialog
      .open(MeslogComponent, {
        minWidth: '60%',
        maxWidth: '95%',
        panelClass: 'ticketDialog',
        data: data,
        hasBackdrop: true,
        closeOnNavigation: true
      });

      this.messageDialog
      .afterClosed()
      .subscribe(result => {
       this.manualUpdateFlag = true;
        this.refreshData();
      });
  }

  changePriority(i, p, priority) {
    this.engineService.validateUser();
    const row = this.source[i].data[p];
    const Oid = row['Oid'];
    const by = this._cookieService.get('Oid');
    const data = { Oid: Oid, Priority: priority, By: by };
    this.url = 'Ticket/ChangePriority';
    this.engineService.updateData(this.url, data).then(result => {
      this.manualUpdateFlag = true;
      this.refreshData();
    });
  }

  assignTicket(i, p, assignTo) {
    this.engineService.validateUser();
    const row = this.source[i].data[p];
    const Oid = row['Oid'];
    const by = this._cookieService.get('Oid');
    const data = { Oid: Oid, AssignTo: assignTo, By: by };
    this.url = 'Ticket/AssignTicket';
    this.engineService.updateData(this.url, data).then(result => {
      this.manualUpdateFlag = true;
      this.refreshData();
    });
  }

  processTicket(id, status) {
    this.engineService.validateUser();
    let data;
    let message;
    const by = this._cookieService.get('Oid');
    switch (status) {

      case 1: {
        data = { Oid: id, TicketStatus: status, By: by };
        message = 'Re-open ticket?';
        break;
      }
      case 2: {
        data = { Oid: id, TicketStatus: status, By: by };
        message = 'Take this ticket?';
        break;
      }
      case 3: {
        data = { Oid: id, TicketStatus: status, By: by };
        message = 'Put on Hold?';
        break;
      }
      case 4: {
        data = { Oid: id, TicketStatus: status, By: by };
        message = 'Close this Ticket?';
        break;
      }
      case 5: {
        data = { Oid: id, TicketStatus: status, By: by };
        message = 'Cancel this Ticket?';
        break;
      }
      default:
    }

    this.commonDialog(message).subscribe(res => {
      if (res === 'Yes') {
        this.url = 'Ticket/ChangeStatus';
        this.engineService.updateData(this.url, data).then(result => {
          this.manualUpdateFlag = true;
          this.refreshData();
        });
      }
    });

  }

  commonDialog(message): Observable<any> {

    const dialogRef = this.dialog.open(AlertComponent, {
      height: 'auto',
      width: 'auto',
      minWidth: '300px',
      data: message,
      panelClass: 'ticketDialog',
      hasBackdrop: true,
      closeOnNavigation: true
    });

    return dialogRef.afterClosed();
  }

  public updateModal(data) {

    this.attachment.length = 0;
    
    this.url = "Ticket/GetAttachment/" + data.TicketNo;
    this.engineService.getData(this.url).then(res => {
      
      this.attachment = res;
    });
    // console.log(data);
    this.modalData = data;

  }

  ngOnDestroy() {
    if (this.userRole !== 'Administrator') {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      this.subscription.unsubscribe();
      this.changeProj.unsubscribe();
      this.closeModal.unsubscribe();
    }
    this.dashboardComponent.cloneDashboardState = 'none';
  }

  private refreshProjectData(): void {
   
    this.url = "Project/GetMyProject/"+this._cookieService.get('Oid');
    this.engineService.getData(this.url).then(res => {
       

        //console.log("-------22222------"+JSON.stringify(res));
        
        let result1 = res.pro1;
        let result2 = res.pro2;
       for (let i in result1) {
        this.projectdata.push(result1[i]);
       }
       for(let i in result2) {
        this.projectdata.push(result2[i]);
      }

           
     var obj = {};
     let len = this.projectdata.length;
     for(var i=0; i < len; i++ )
     {
       obj[this.projectdata[i]['Oid']] = this.projectdata[i];
     }
     let projectdata = new Array();
     for ( var key in obj )
     {
       projectdata.push(obj[key]);
     }
    this.updateProjects(projectdata);
    this.updateFilter();
    //  if(obj[key] === undefined)
    //  {
    //   console.log("-------undefined------"+res);
    //   this.updateProjects(this.projectdata);
    //   this.updateFilter();
    //  }
    //  else
    //  {
    //   console.log("-------Value------"+res);
    //   this.updateProjects(projectdata);
    //   this.updateFilter();
    //  }
     
     
      }).catch(err => {
        
        //this.alertService.danger('Server response error @refreshProjectData');
      });
  }

 
  private updateProjects(projects: any) {
    this.projectRows = projects;
    
    this.projectTemp = [...this.projectRows];
    this.projectInitialLength = this.projectTemp.length;
    this.projectUpdatedLength = this.projectTemp.length;
  }

  updateProjectSelection(id: number, name: string, i) {
  
    let data = { 
      id: this.projectRows[i].ProjectCompany, 
      name: this.projectRows[i].CompanyName
    };

    this._cookieService.put('CompanyId', this.projectRows[i].ProjectCompany.toString());
    this._cookieService.put('CompanyName', this.projectRows[i].CompanyName);

    this.engineService.changeCompany(data);
    this.projectID = id;
    this.projectName = name;
    this._cookieService.put('ProjectID', this.projectID.toString());
    this._cookieService.put('ProjectName', this.projectName);

    this.dashboardComponent.updateDashboardState("mytickets");
    
    this.refreshData()
  }



}
