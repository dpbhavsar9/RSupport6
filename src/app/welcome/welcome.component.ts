import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  title = 'R-Support';
  signupForm: FormGroup;
  constructor(private router: Router) {}

  ngOnInit() {
    // tslint:disable-next-line:no-unused-expression
  }

  signupUser() {
    // console.log(this.signupForm);
  }

  toLogin() {
    this.router.navigate(['']);
  }
}
