import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'ngx-alerts';
import { Router } from '@angular/router';
import { EngineService } from '../../../services/engine.service';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss']
})
export class CreateCompanyComponent implements OnInit {
  createCompanyForm: FormGroup;
  isClientOptions;
  isRulesCollapsed: boolean;
  config;
  IsClient: string;
  url: any;

  constructor(private _cookieService: CookieService,
    private alertService: AlertService,
    private router: Router,
    private engineService: EngineService) { }

  ngOnInit() {
    this.createCompanyForm = new FormGroup({
      CompanyName: new FormControl(null, [Validators.required]),
      IsClient: new FormControl(null, [Validators.required]),
      Add1: new FormControl(null),
      Add2: new FormControl(null),
      Add3: new FormControl(null),
      City: new FormControl(null),
      State: new FormControl(null, [Validators.required]),
      Country: new FormControl(null, [Validators.required]),
      Pincode: new FormControl(null),
      LandLineNo: new FormControl(null),
      CreatedBy: new FormControl(this._cookieService.get('Oid'))
    });
    this.config = {
      displayKey: 'description',
      // if objects array passed which key to be displayed defaults to description,
      search: false
    };
    this.isRulesCollapsed = false;
    this.isClientOptions = [{ id: true, data: 'Yes' }, { id: false, data: 'No' }];
  }

  selectionChanged(event: Event) { }

  createCompany() {
    this.engineService.validateUser();
    this.url = 'Company/PostCompany';
    
    this.engineService.postData(this.url, this.createCompanyForm.value).then(response => {
     
       
        this.alertService.success('Company successfully created!');
        this.router.navigate(['dashboard/company']);
  
    }).catch(error => {
      this.alertService.danger('Please Login Again !');
    });
  }
}
