import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupVisible = false;
  signupForm: FormGroup;

  constructor(private alertService: AlertService, private router: Router) { }

  ngOnInit() {
    this.signupForm = new FormGroup({
      UserID: new FormControl(null, [
        Validators.required,
        Validators.minLength(6)
      ]),
      UserName: new FormControl(null, [
        Validators.required,
        Validators.minLength(6)
      ]),
      Password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12)
      ]),
      ConfirmPassword: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12)
      ]),
      Email: new FormControl(null, [Validators.required, Validators.email]),
      MobileNo: new FormControl(null, Validators.required),
      Department: new FormControl(null, Validators.required),
      UserRole: new FormControl(null, Validators.required),
      Designation: new FormControl(null, Validators.required),
      UserCompany: new FormControl(null, Validators.required),
      LandLineNo: new FormControl(null)
    });
  }

  signupUser() {
    if (
      this.signupForm.get('password').value !==
      this.signupForm.get('confirmpassword').value
    ) {
      return this.alertService.danger(
        'Password and Confirm Password must match!'
      );
    }
    this.alertService.success('Signup successful!');
    this.router.navigate(['../']);
  }
}
