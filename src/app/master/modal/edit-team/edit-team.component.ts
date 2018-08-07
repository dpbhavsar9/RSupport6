import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { EngineService } from '../../../services/engine.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from 'ngx-alerts';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-edit-team',
  templateUrl: './edit-team.component.html',
  styleUrls: ['./edit-team.component.scss']
})
export class EditTeamComponent implements OnInit {

  url: any;
  updateTeamForm: FormGroup;
  companyList: any[] = [];
  projectList: any[] = [];
  //userList: any[] = [];
  userList: Array<{
    "UserID": any,
    "UserRole": any,
    "UserName": any
  }> = [];
  statusList = [
    { value: 'A', viewValue: 'Active' },
    { value: 'C', viewValue: 'Inactive' }
  ];
  userRoles = [
    { value: 'Administrator', viewValue: 'Administrator' },
    { value: 'Manager', viewValue: 'Manager' },
    { value: 'User', viewValue: 'User' }
  ];
  selectedUsers: Array<{ UserID: any, UserName: any, UserRole: any }> = [];
  //finalUsersList: Array<{ UserID: string, UserName: string, UserRole: string }> = [];

  // tslint:disable-next-line:max-line-length
  constructor(private alertService: AlertService,
    public dialogRef: MatDialogRef<EditTeamComponent>,
    private engineService: EngineService,
    private _cookieService: CookieService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {

    // selectedUser => {Oid:item.Oid, UserName: item.UserName, UserRole: "Administrator"}
    // finalUsersList => {UserID: 9, UserName: "DARSHAN", UserRole: "Administrator"}
    for (let i = 0; i < this.data.TeamMembers.length; i++) {
      const UserID = this.data.TeamMembers[i].UserID;
      const UserName = this.data.TeamMembers[i].UserName;
      const UserRole = this.data.TeamMembers[i].UserRole;
      this.selectedUsers.push({ 'UserID': UserID, 'UserName': UserName, 'UserRole': UserRole });
      //this.finalUsersList.push({ 'UserID': Oid, 'UserName': UserName, 'UserRole': UserRole });
    }
    this.prepareForm();
    this.loadCompanies();
    this.loadUsers();
    this.loadProjects();
  }

  compareFnForSelectedUser(user1: any, user2: any) {
    return user1 && user2 ? user1.UserID === user2.UserID : user1 === user2;
  }

  compareFnForAssignRole(val1: any, val2: any) {
    for (let i = 0; i < val2.length; i++) {
      const element = val2[i];
      // tslint:disable-next-line:max-line-length
      if (val1 && element ? (val1.UserID === element.UserID && val1.UserName === element.UserName && val1.UserRole === element.UserRole) : val1 === element) {
        return true;
      }
    }
    return false;
  }

  prepareForm() {

    /*this.updateTeamForm = new FormGroup({
      Oid: new FormControl(this.data.Oid, Validators.required),
      TeamName: new FormControl(this.data.TeamName, Validators.required),
      CompanyID: new FormControl(this.data.CompanyID, Validators.required),
      ProjectID: new FormControl(this.data.ProjectID, Validators.required),
      TeamLeader: new FormControl(this.data.TeamLeader, Validators.required),
      Users: new FormControl(null, Validators.required),
      UsersForTeamWithRoles: new FormControl(null),
      TeamMemberList: new FormControl(this.data.TeamMembers),
      Status: new FormControl(this.data.Status, Validators.required),
      UpdatedBy: new FormControl(this._cookieService.get('Oid'))
    });*/
    this.updateTeamForm = new FormGroup({
      Oid: new FormControl(this.data.Oid, Validators.required),
      TeamName: new FormControl(this.data.TeamName, Validators.required),
      CompanyID: new FormControl(this.data.CompanyID, Validators.required),
      ProjectID: new FormControl(this.data.ProjectID, Validators.required),
      TeamLeader: new FormControl(this.data.TeamLeader, Validators.required),
      Users: new FormControl(this.selectedUsers, Validators.required),
      TeamMemberList: new FormControl(this.data.TeamMembers),
      Status: new FormControl(this.data.Status, Validators.required),
      UpdatedBy: new FormControl(this._cookieService.get('Oid'))
    });

  }

  loadCompanies() {
    this.userList.length = 0;
    // Company Dropdown - start
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
    this.userList.length = 0;
    const company = this.updateTeamForm.get('CompanyID').value;
    
    // Company Dropdown - start
    this.url = 'Project/GetProject/' + company;
    this.engineService.getData(this.url).then(res => {
        this.projectList = res.filter(data => data.ProjectCompany === company);
      })
      .catch(err => {
        
        this.alertService.danger('Please Login Again !');
      });
    // Company Dropdown - end

  }

  loadUsers() {
    this.userList.length = 0;
    const company = this.updateTeamForm.get('CompanyID').value;
    this.url = 'Users/GetAllUser/'+ company;
    this.engineService.getData(this.url).then((res => {
      //this.userList = res;
      res.forEach(x=>{
        this.userList.push({UserID: x.Oid,UserName: x.UserName,UserRole: 'User'});
      })
    })).catch(err => {
      this.alertService.danger('Please Login Again !');
    });
    
  }

  updateTeam() {
    this.engineService.validateUser();
    if (this.updateTeamForm.status === 'VALID') {

      /*for (let i = 0; i < this.finalUsersList.length; i++) {
        if (this.finalUsersList[i].UserRole === null) {
          return this.alertService.danger('Please select user role');
        }
      }*/

      this.url = 'Team/PutTeam';
      this.engineService.updateData(this.url, this.updateTeamForm.value).then(response => {
    
          this.alertService.success('Team updates successfully!');
          this.dialogRef.close();
      
      }).catch(error => {
        
        this.alertService.danger('Team updation failed!');
      });
    }
  }

  onNoClick(): void {
    this
      .dialogRef
      .close();
  }

  loadChangeProjects(){
    this.selectedUsers.length = 0;
    this.loadProjects();
  }


  onUserSelected() {
    
    this.selectedUsers = this.updateTeamForm.get('Users').value;
    this.updateTeamForm.patchValue({
      TeamMemberList: this.selectedUsers
     });

   /* for (let i = 0; i < this.finalUsersList.length; i++) {
      const e1 = this.finalUsersList[i].UserID;
      let toDelete = true;
      for (let j = 0; j < this.selectedUsers.length; j++) {
        const e2 = this.selectedUsers[j].Oid;
        if (e2 === e1) {
          toDelete = false;
          // break;
        }
      }
      if (toDelete === true) {
        this.finalUsersList.splice(i, 1);
      }
    }*/

   
  }

  onUserRoleSelected(Oid) {
    

   /* let addFlag = true;

    for (let i = 0; i < this.finalUsersList.length; i++) {

      if (Oid === this.finalUsersList[i].UserID) {
        addFlag = false;
        this.finalUsersList.splice(i, 1);
        this.finalUsersList.push(this.updateTeamForm.get('UsersForTeamWithRoles').value);
      }
    }

    if (addFlag === true) {
      this.finalUsersList.push(this.updateTeamForm.get('UsersForTeamWithRoles').value);
    }

    this.updateTeamForm.patchValue({
      TeamMemberList: this.finalUsersList
    });*/

  }

}
