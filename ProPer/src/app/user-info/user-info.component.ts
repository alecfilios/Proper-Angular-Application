import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss',
  ]
})
export class UserInfoComponent implements OnInit {

  constructor(private dataService: DataService) { 
  }

  ngOnInit(): void {

  }
  getData(): string[][]{
    return this.dataService.sharedData;
  }
}
