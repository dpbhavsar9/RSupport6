import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
  errorMessage: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Static message
    // this.errorMessage = this.route.snapshot.data['message'];

    // Dynamic Message

    this.route.data.subscribe((data: Data) => {
      this.errorMessage = data['message'];
    });
  }
}
