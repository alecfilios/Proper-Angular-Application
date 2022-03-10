import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ExcelService } from './excel.service';
@Component({
  selector: 'app-excel-export',
  templateUrl: './excel-export.component.html',
  styleUrls: ['./excel-export.component.scss']
})
export class ExcelExportComponent implements OnInit {

  constructor(private excelService:ExcelService, private dataService:DataService) { }

  ngOnInit(): void {
  }

  exportAsXLSX():void {
    let data:string[][] = this.excelService.formatData(this.dataService.sharedData);
    
    this.excelService.exportAsExcelFile(data , 'ProperData');
  }
  
}
