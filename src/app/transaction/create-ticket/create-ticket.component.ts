import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'ngx-alerts';
import { Router } from '@angular/router';
import { EngineService } from '../../services/engine.service';
import { CookieService } from 'ngx-cookie';
import { UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { DashboardComponent } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.scss']
})
export class CreateTicketComponent implements OnInit {

  projectId: any;
  projectName: any;
  companyId: any;
  companyName: any;

  checkfilesuccess: boolean = false;
  checkfilefail: boolean = false;
  filenamesuccess: Array<{ name: string }> = [];
  filenamefail: Array<{ name: string }> = [];

  dfiles = [];
  url: any;
  createTicketForm: FormGroup;
  companyList: any[] = [];
  projectList: any[] = [];
  allTicketTypeList: any[] = [];
  ticketTypeList: any[] = [];
  teamList: any[] = [];
  assignToUserList: any[];
  fileToUpload: File = null;
  // tslint:disable-next-line:max-line-length
  priorityList: any[] = [{ value: 'High', viewValue: 'High' }, { value: 'Medium', viewValue: 'Medium' }, { value: 'Low', viewValue: 'Low' }];
  data = {
    TicketID: '',
    TicketNo: '',
    TicketBacklogID: ''
  };
  ticketSaved = false;
  files: UploadFile[] = [];


  constructor(private alertService: AlertService,
    public dash: DashboardComponent,
    private router: Router,
    private engineService: EngineService,
    private _cookieService: CookieService) { }

  ngOnInit() {

    this.projectId = this._cookieService.get('ProjectID');
    this.projectName = this._cookieService.get('ProjectName');
    this.companyId = this._cookieService.get('CompanyId');
    this.companyName = this._cookieService.get('CompanyName');

    this.prepareForm();
    if(this.projectId == undefined)
    {
      this.alertService.warning("Please Select Project");
      
      this.router.navigate(['dashboard']);   
    }
    else{
      this.projectId = this._cookieService.get('ProjectID');
      this.projectName = this._cookieService.get('ProjectName');
      this.companyId = this._cookieService.get('CompanyId');
      this.companyName = this._cookieService.get('CompanyName');
      this.loadTicketType();
      // this.loadTeams();
      this.loadTeams();
    }
  }

  prepareForm() {
    this.createTicketForm = new FormGroup({

      CompanyID: new FormControl(this.companyId , Validators.required),
      ProjectID: new FormControl(this.projectId, Validators.required),
      TicketType: new FormControl(null, Validators.required),
      Priority: new FormControl(null, Validators.required),
      Subject: new FormControl(null, Validators.required),
      TicketDescription: new FormControl(null, Validators.required),
      TeamID: new FormControl(null, Validators.required),
      AssignTo: new FormControl(null),
      CreatedBy: new FormControl(this._cookieService.get('Oid'))
    });
  }

  loadCompany() {
    
    this.url = 'Company/GetAllCompany';
    this.engineService.getData(this.url).then(res => {
        this.companyList = res;
      })
      .catch(err => {
        this.alertService.danger('Please Login Again !');
      });
    // Company Dropdown - end
  }

  loadProjects() {
    const CompanyID = this.createTicketForm.get('CompanyID').value;
   
    // Company Dropdown - start
    this.url = 'Project/GetProject';
    this.engineService.getData(this.url)
      .then(res => {
  
        this.projectList = res.filter(data => data.ProjectCompany === CompanyID);
      })
      .catch(err => {
   
        this.alertService.danger('Please Login Again !');
      });
    // Company Dropdown - end
  }

  loadTeams() {
    const ProjectID = this.createTicketForm.get('ProjectID').value;
    
    this.url = 'Team/GetTeamProject/' + ProjectID;
    this.engineService.getData(this.url)
      .then(res => {
       
        this.teamList = res.filter(data => data.ProjectID == this.projectId && data.Status == 'A');
      })
      .catch(err => {
        this.alertService.danger('Please Login Again !');
      });
  }



  loadTeamMembers() {
    const TeamID = this.createTicketForm.get('TeamID').value;
    
    this.url = 'Users/GetTeamMembers/' + TeamID;
    this.engineService.getData(this.url)
      .then(res => {
      
        this.assignToUserList = res;
      })
      .catch(err => {
      
        this.alertService.danger('Please Login Again !');
      });
  }

  loadTicketType() {
    // TicketType Dropdown - start
    this.url = 'Ticket/GetTicketType';
    this.engineService.getData(this.url)
      .then(res => {
        
        this.allTicketTypeList = res;

    this.ticketTypeList = res.filter(x =>
               x.CompanyID == this.companyId && 
               x.ProjectID == this.projectId)
           }).catch(err => {
        this.alertService.danger('Please Login Again !');
      });
    // TicketType Dropdown - end
  }

  /* dropped(event: UploadEvent) {

    this.files = event.files;

    for (const droppedFile of event.files) {
      
      if (droppedFile.fileEntry.isFile) {

        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
         fileEntry.file(async (file: File) => {
          this.fileToUpload = file;
          const filename = file.name;
          let res = await this.uploadFileToActivity(filename);
          console.log("------Dropped-------")
        });

      } else {

        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;

      }
    }
  }*/

  async handleFileInput(files: FileList) {

    for (let i = 0; i < files.length; i++) {
      const fileItem = files.item(i);
      this.fileToUpload = fileItem;
      const filename = fileItem.name;


      let res = await this.uploadFileToActivity(filename);
    
    }
  }


  async uploadFileToActivity(filename): Promise<any> {

  
    this.filenamesuccess.length = 0;
    this.filenamefail.length = 0;
    
     this.engineService.uploadFile(this.fileToUpload, this.data, filename).then(res => {
     
      if (JSON.stringify(res) === '"Success"') {
        this.filenamesuccess.push({ name: filename });
        this.checkfilesuccess = true;
      }
      else if (JSON.stringify(res) === '"Fail"') {
        this.filenamefail.push({ name: filename });
        this.checkfilefail = true;
      }
      setTimeout(() => {
       
        this.checkfilesuccess = false;
        this.checkfilefail = false;
      }, 6000);

    }).catch(err => {
     
      //this.alertService.danger("Error While Uploading Files");
    });
   
  }

  updateTicketType() {
   
  }

  createTicket() {
    this.engineService.validateUser();
    if (this.createTicketForm.status === 'VALID') {
      // console.log(this.createTicketForm.value);
      this.url = 'Ticket/PostTicket';
      
      this.engineService.postData(this.url, this.createTicketForm.value).then(response => {
        
        
         //const res = response.json();
        const res2 = JSON.parse(response);
        
        this.data.TicketID = res2.TicketID;
        this.data.TicketNo = res2.TicketNo;
        this.data.TicketBacklogID = res2.TicketBacklogID;
        this.ticketSaved = true;
        this.alertService.success('Ticket successfully created!');
         
        
      }).catch(error => {
        this.alertService.danger('Ticket creation failed!');
      });
    }
  }
}
