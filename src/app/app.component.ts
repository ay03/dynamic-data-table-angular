import { Component } from '@angular/core';
import { TableDemoComponent } from './table-demo/table-demo.component';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TableDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'excel-table-app';
}
