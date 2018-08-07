import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'ngx-alerts';
import { Router } from '@angular/router';
import { EngineService } from '../../../services/engine.service';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss']
})
export class CreateTeamComponent implements OnInit {

  url: any;
  createTeamForm: FormGroup;
  companyList: any[] = [];
  projectList: any[] = [];
  statusList = [
    { value: 'A', viewValue: 'Active' },
    { value: 'C', viewValue: 'Inactive' }
  ];
  //userList: any[] = [];
  
  userList:Array<{
    "UserID": any,
    "UserRole": any,
    "UserName": any
  }> = [];
  selectedUsers: Array<{
    "Oid": any,
    "UserName": any
  }> = [];
  TeamMemberList: Array<{
    "UserID": any,
    "UserRole": any
  }> = [];


  userRoles = [
 
    { value: 'Manager', viewValue: 'Manager' },
    { value: 'User', viewValue: 'User' }
  ];
  usersDataSource = [];
  
  finalUsersList = [];


  constructor(private alertService: AlertService, private router: Router, 
              private engineService: EngineService, private _cookieService: CookieService) { }

  ngOnInit() {

    this.prepareForm();

    this.loadCompanies();

  }

  prepareForm() {

  /*  this.createTeamForm = new FormGroup({
      TeamName: new FormControl(null, Validators.required),
      CompanyID: new FormControl(null, Validators.required),
      ProjectID: new FormControl(null, Validators.required),
      TeamLeader: new FormControl(null, Validators.required),
      Users: new FormControl(null, Validators.required),
      UsersForTeamWithRoles: new FormControl(null, Validators.required),
      TeamMemberList: new FormControl(null),
      Status: new FormControl('A', Validators.required),
      CreatedBy: new FormControl(this._cookieService.get('Oid'))
    });*/

    this.createTeamForm = new FormGroup({
      TeamName: new FormControl(null, Validators.required),
      CompanyID: new FormControl(null, Validators.required),
      ProjectID: new FormControl(null, Validators.required),
      TeamLeader: new FormControl(null, Validators.required),
      Users: new FormControl(null, Validators.required),
      TeamMemberList: new FormControl(null),
      Status: new FormControl('A', Validators.required),
      CreatedBy: new FormControl(this._cookieService.get('Oid'))
    });

  }

  loadCompanies() {
    this.url = 'Company/GetAllCompany';
    this.engineService.getData(this.url)
      .then(res => {
        this.companyList = res;
      })
      .catch(err => {
        this.alertService.danger('Please Login Again !');
      });
  }

  loadProjects() {
    this.userList.length = 0;
    this.selectedUsers.length = 0;

    const company = this.createTeamForm.get('CompanyID').value;
    this.url = 'Project/GetProject/' + company;
    this.engineService.getData(this.url)
      .then(res => {
        this.projectList = res.filter(data => data.ProjectCompany === company);
      })
      .catch(err => {
        this.alertService.danger('Please Login Again !');
      });
  }

  loadUsers() {
    const company = this.createTeamForm.get('CompanyID').value;
    this.url = 'Users/GetAllUser/'+ company;
    this.engineService.getData(this.url).then((res => {
      //this.userList = res.filter(x => x.IsClient === false);
      res.forEach(x=>{
        this.userList.push({UserID: x.Oid,UserName: x.UserName,UserRole: 'User'});
      })
    })).catch(err => {
      this.alertService.danger('Please Login Again !');
    });
  }

  createTeam() {
    this.engineService.validateUser();
    if (this.createTeamForm.status === 'VALID') {

      this.url = 'Team/PostTeam';
      this.engineService.postData(this.url, this.createTeamForm.value).then(response => {
       
          this.alertService.success('Team successfully created!');
          this.router.navigate(['dashboard']);
    
      }).catch(error => {
        this.alertService.danger('Team creation failed!');
      });
    }
  }

  addUser() {
    this.usersDataSource.push({ UserID: '', UserRole: '' });
  }

  removeUser(index) {
    this.usersDataSource.splice(index, 1);
  }

  onUserSelected() {

    this.selectedUsers = this.createTeamForm.get('Users').value;
    this.createTeamForm.patchValue({
          TeamMemberList: this.selectedUsers
    });
    
    // this.selectedUsers.forEach(x =>{
                
    //   if(this.TeamMemberList.length >0)
    //   {
         
    //   }
    //   else
    //   {
    //     this.TeamMemberList.push({UserID: x.Oid, UserRole: 'User'});
    //   }
    // });

    
        
    // for (let i = 0; i < this.finalUsersList.length; i++) 
    // {
    //   const e1 = this.finalUsersList[i].Oid;
    //   let toDelete = true;

    //   for (let j = 0; j < this.selectedUsers.length; j++) 
    //   {
    //     const e2 = this.selectedUsers[j].Oid;
    //     if (e2 === e1) 
    //     {
    //       toDelete = false;
    //     }
    //   }
    //   if (toDelete) 
    //   {
    //     this.finalUsersList.splice(i, 1);
       
    //   }
    // }
    
  
  }

  // onUserRoleSelected() {

  //   let addFlag = true;
  //   for (let i = 0; i < this.finalUsersList.length; i++) {
  //     const element = this.finalUsersList[i].UserID;
  //     if (element === this.createTeamForm.get('UsersForTeamWithRoles').value.Oid) {
  //       addFlag = false;
  //       this.finalUsersList.splice(i, 1);
  //       this.finalUsersList.push(this.createTeamForm.get('UsersForTeamWithRoles').value);
  //     }
  //   }
  //   if (addFlag === true) {
  //     this.finalUsersList.push(this.createTeamForm.get('UsersForTeamWithRoles').value);
  //   }
  //   this.createTeamForm.patchValue({
  //     TeamMemberList: this.finalUsersList
  //   });
  // }



}
