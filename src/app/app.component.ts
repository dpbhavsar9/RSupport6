import { Component, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'R-Support';
  constructor(private _cookieService: CookieService) { }
  ngOnDestroy(): void {
    this._cookieService.removeAll();
  }
}
