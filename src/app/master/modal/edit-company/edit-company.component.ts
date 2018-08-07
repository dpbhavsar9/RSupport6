import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'ngx-alerts';
import { Router, ActivatedRoute } from '@angular/router';
import { EngineService } from '../../../services/engine.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss']
})
export class EditCompanyComponent implements OnInit {

  private sub: any;

  url: any;
  editCompanyForm: FormGroup;
  isClientOptions = [
    { value: true, viewValue: 'Yes' },
    { value: false, viewValue: 'No' }];
    statusList = [
      { value: 'A', viewValue: 'Active' },
      { value: 'C', viewValue: 'Inactive' }
    ];

  constructor(private alertService: AlertService,
    public dialogRef: MatDialogRef<EditCompanyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private engineService: EngineService,
    private _cookieService: CookieService) { }


  ngOnInit() {
    this.prepareForm();
  }

  private prepareForm() {
    this.editCompanyForm = new FormGroup({
      'Oid': new FormControl(this.data.Oid),
      'CompanyId': new FormControl(this.data.CompanyID),
      'CompanyName': new FormControl(this.data.CompanyName, Validators.required),
      'IsClient': new FormControl(this.data.IsClient, Validators.required),
      'Add1': new FormControl(this.data.Add1),
      'Add2': new FormControl(this.data.Add2),
      'Add3': new FormControl(this.data.Add3),
      'City': new FormControl(this.data.City),
      'State': new FormControl(this.data.State, Validators.required),
      'Country': new FormControl(this.data.Country, Validators.required),
      'Pincode': new FormControl(this.data.Pincode),
      'LandLineNo': new FormControl(this.data.LandLineNo),
      'UpdatedBy': new FormControl(this.data.UpdatedBy),
      'Status': new FormControl(this.data.Status)
    });
  }

  

  selectionChanged(event: Event) { }

  editCompany() {
    this.engineService.validateUser();
    // console.log(this.editCompanyForm.value);
    this.url = 'Company/PutCompany';
    this.engineService.updateData(this.url, this.editCompanyForm.value).then(() => {
      // this.router.navigate('/company');
      this.alertService.success('Company updated successfully!');
      this
        .dialogRef
        .close();
    }).catch(() => {
      return this.alertService.danger('Company update failed!');
    });
  }

  onNoClick(): void {
    this
      .dialogRef
      .close();
  }
}
