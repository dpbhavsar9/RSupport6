import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EngineService } from '../../services/engine.service';
import { AlertComponent } from '../../master/modal/alert/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CookieService } from 'ngx-cookie';
import * as moment from 'moment';
import { timer } from 'rxjs/internal/observable/timer';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-meslog',
  templateUrl: './meslog.component.html',
  styleUrls: ['./meslog.component.scss']
})
export class MeslogComponent implements OnInit, OnDestroy {

  fileToUpload: File = null;
  files: FileList;

  chatForm: FormGroup;
  url: any;
  message: Array<{
    Oid: any,
    AttachmentFlag: any,
    UserLetter: any,
    CompanyID: any,
    MessageLog: any,
    OperationBy: any,
    OperationDate: any,
    ProjectID: any,
    TicketID: any,
    TicketNo: any,
    TicketStatus: any,
    UserName: any,
    check: any,
    fullMessage: any
  }> = [];
  mesTicketData = {
    TicketID: '',
    TicketNo: '',
    TicketBacklogID: ''
  };
  message_chat: any;
  ticketId: any;
  ticketNo: any;
  subscribe: any;
  ticketStatus: string;
  ticketData: any = [];
  showAttachment = false;

  // tslint:disable-next-line:max-line-length
  constructor(private engineService: EngineService,
    public dialog: MatDialog,
    public  alertService: AlertService,
    public dialogRef: MatDialogRef<MeslogComponent>,
    private _cookieService: CookieService, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.ticketData = {
      'CompanyID': data.CompanyID,
      'ProjectID': data.ProjectID,
      'TicketID': data.TicketID,
      'TicketNo': data.TicketNo,
      'TicketStatus': data.TicketStatus,
    };
    this.ticketStatus = data.TicketStatus.toString();
  }

  ngOnInit() {
    this.ticketId = this.ticketData.TicketID;
    this.ticketNo = this.ticketData.TicketNo;
    
    this.checkMessage(this.ticketId);
    const timerVar = timer(10000, 10000);
    this.subscribe = timerVar.subscribe(t => {
      this.checkMessage(this.ticketId);
    });

    this.chatForm = new FormGroup({
      chatmessage: new FormControl(null, Validators.required)
    });
  }

  toggleShowAttachment() {
    this.showAttachment = !this.showAttachment;
  }

  checkMessage(id) {
    
    this.url = 'Ticket/GetTicketMessage/' + this.ticketId;
    this.engineService.getData(this.url).then(data => {
      this.message.length = 0;
      for (const i in data) {
        if (data[i].hasOwnProperty('Oid')) {

          let MessageLog; 
          const Oid = data[i].Oid;
          const AttachmentFlag = data[i].AttachmentFlag;
          const UserLetter = String(data[i].UserName).slice(0, 1);
          const fullMessage = data[i].MessageLog;
          const CompanyID = data[i].CompanyID;
          const ProjectID = data[i].ProjectID;
          const OperationBy = data[i].OperationBy;
          const OperationDate = moment(data[i].OperationDate);
          const TicketID = data[i].TicketID;
          const TicketNo = data[i].TicketNo;
          const TicketStatus = data[i].TicketStatus;
          const UserName = data[i].UserName;
          let check;
          if (this._cookieService.get('Oid') === OperationBy.toString()) {
                    check = 'self';
          } else {
                    check = 'other';
          }

          if(AttachmentFlag){
            let first = String(data[i].MessageLog).split("T");
            let second = String(first[1]).substr(13,first[1].length);
            MessageLog = first[0] + second;
           }
          else{
            MessageLog = data[i].MessageLog;
          }

          // const startTime = moment(new Date());
          // const endTime = moment(OperationDate);
          // const duration = moment.duration(endTime.diff(startTime));
          // const hours = duration.asHours();
          // const minutes = (duration.asMinutes()) % 60;

          var offset = moment().utcOffset();
          var mesdatelocal = moment.utc(data[i].OperationDate).utcOffset(offset).format("L LT");
           
  
          this.message.push({
            Oid: id,
            AttachmentFlag: AttachmentFlag,
            UserLetter: UserLetter,
            CompanyID: CompanyID,
            MessageLog: MessageLog,
            OperationBy: OperationBy,
            OperationDate: mesdatelocal,
            ProjectID: ProjectID,
            TicketID: TicketID,
            TicketNo: TicketNo,
            TicketStatus: TicketStatus,
            UserName: UserName,
            check: check,
            fullMessage: fullMessage
          });
    
          this.mesTicketData.TicketID = this.ticketData.TicketID;
          this.mesTicketData.TicketNo = this.ticketData.TicketNo;
          this.mesTicketData.TicketBacklogID = Oid;
        } else {
          
        }
      }
     
    }).catch(err => {
     
    });
    
    setTimeout(() => {
       
       this.updateNotificationFlag();
    }, 1000);
  }

  updateNotificationFlag(){

      const data = {
          Userid: this._cookieService.get('Oid'),
          Ticketid: this.mesTicketData.TicketID
        }
        this.url = 'Ticket/PutNotificationUpdate';
        this.engineService.updateData(this.url,data).then(res=>{
          
        }).catch(err=>{
          
        });

  }



  sendMessage() {
    this.engineService.validateUser();
    const data = {
      AttachmentFlag: false,
      MessageLog: this.chatForm.get('chatmessage').value,
      OperationBy: this._cookieService.get('Oid'),
      CompanyID: this.ticketData.CompanyID,
      ProjectID: this.ticketData.ProjectID,
      TicketID: this.ticketData.TicketID,
      TicketNo: this.ticketData.TicketNo,
      TicketStatus: this.ticketData.TicketStatus
    };

    this.url = 'Ticket/PostTicketLog';
    this.engineService.postData(this.url, data).then(res => {
      this.checkMessage(this.ticketId);
    }).catch();

    this.chatForm.reset();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
 
  checkFileAttached(index){
    return this.message[index].AttachmentFlag;
  }

  confirmDownload(message: string){
    
    const fileName = message.slice(14);
    const dialogRef = this.dialog.open(AlertComponent, {
      height: 'auto',
      minWidth: '30%',
      data: 'Download this Attachment ?',
      panelClass: 'ticketDialog',
      hasBackdrop: true,
      closeOnNavigation: true
    });

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (result.toString() === 'Yes') {
          const url = this.engineService.baseUrl + 'Upload/UploadFiles/' + fileName;
          //window.location.href = 'http://rsapi.rlmc.in/api/Upload/UploadFiles/'+fileName;
          window.location.href = url;
        } else {
          
        }
      });
  }

  handleFileInput(files: FileList) {

       this.files = files;
  }


  async uploadFileToActivity(filename): Promise<any> {

    //this.filenamesuccess.length = 0;
    //this.filenamefail.length = 0;
    await this.engineService.uploadFile(this.fileToUpload, this.mesTicketData, filename).then(res => {

      if (JSON.stringify(res) === '"Success"') {
        //this.filenamesuccess.push({ name: filename });
        //this.checkfilesuccess = true;
      }
      else if (JSON.stringify(res) === '"Fail"') {
        //this.filenamefail.push({ name: filename });
        //this.checkfilefail = true;
      }
     
    }).catch(err => {
       //this.alertService.danger("Error While Uploading Files");
    });
   
  }

  async handlefile(){
  
    for (let i = 0; i < this.files.length; i++) {
      const fileItem = this.files.item(i);
      this.fileToUpload = fileItem;
      const filename = fileItem.name;

      let res = await this.uploadFileToActivity(filename);
    }
    this.toggleShowAttachment();
    this.chatForm.reset();
  }

  ngOnDestroy() {
    this.subscribe.unsubscribe();
  }

}
