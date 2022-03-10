import { Component, OnInit } from '@angular/core';


import { DataService } from '../data.service';
import { ReaderService } from './reader.service';

@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss'],
  
})
export class ExcelImportComponent implements OnInit {

  // The empty alert message ready to alert the user. 
  AlertMessage: string = '';
  data: string[][]=[];
  waitIconBool = true;
  successIconBool = false;
  errorIconBool = false;
  warningIconBool = false;
  // Reader Service
  constructor(private readerService: ReaderService,private dataService: DataService) {  
    
  }

  ngOnInit(): void {
  }
  
  onFileChange(event: any){
    this.AlertMessage='';
    const target :DataTransfer = <DataTransfer>(event.target); 
    /* Import error: file chooser cancelled.
    Check if the user tried to upload less than 1 file. */
    if (target.files.length == 0){
      this.showResult('Error: Upload error: no file found.', false, false, false, true, "red", "1px solid black");
      throw new Error('File was null or the file chooser was closed');
    } 
    /* Import error: too many files
    Check if the user tried to upload more than 1 file. */
    else if (target.files.length !== 1){
      this.showResult('Error: Upload error: too many files uploaded.', false, false, false, true, "red", "1px solid black");
      throw new Error('Cannot use multiple files');
      
    } 
    /* CHEAT SHEET:
    
    .xls      application/vnd.ms-excel
    .xlt      application/vnd.ms-excel
    .xla      application/vnd.ms-excel
    .xlsx     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    .xltx     application/vnd.openxmlformats-officedocument.spreadsheetml.template
    .xlsm     application/vnd.ms-excel.sheet.macroEnabled.12
    .xltm     application/vnd.ms-excel.template.macroEnabled.12
    .xlam     application/vnd.ms-excel.addin.macroEnabled.12
    .xlsb     application/vnd.ms-excel.sheet.binary.macroEnabled.12

    Source:
    https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
    */


    // Import error: file type
    else if(target.files[0].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
      this.showResult('Error: This file type is not supported.\n Please try with an Excel file.', false, false, false, true, "red", "1px solid black");
      throw new Error('Cannot use this type of file');
    } 
    /* because readAsBinaryString() returns void we need to first 
    get the binary string with onload()
    which will trigger when the file is loaded. */
    // Create file reader object 
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) =>{
      /*
      Call the Service
      */
      this.readerService.readFile(e.target.result);
     
      this.data = this.readerService.getData();
      this.AlertMessage = this.readerService.getWarningString();
      if(this.AlertMessage != ""){
        this.showResult(this.AlertMessage, false, false, true, false, "#FF8C00", "1px solid black");
      }
      else{
        this.showResult('Document uploaded succesfully.', false, true, false, false, "green", "1px solid black");
        this.setData(); // Set all the data
      }
      
    }
    /* to read the file as a binary string 
    when file reading is complete the result 
    attribute will contain the raw binary data
    from the file. 
    */
   reader.readAsBinaryString(target.files[0]);
   
  }
  getData(): string[][]{
    return this.dataService.sharedData;
  }
  setData(){
    this.dataService.sharedData = this.data; // Current shared Data
    localStorage.setItem("data",JSON.stringify(this.dataService.sharedData)); // LOCAL STORAGE
    this.dataService.setServerData(); // DB
  }

  showResult(AlertMessage:string, waitIconBool:boolean, successIconBool:boolean, warningIconBool:boolean,
    errorIconBool:boolean, alertTextColor:string, TextborderColor:string){
    this.AlertMessage = AlertMessage;
    this.waitIconBool = waitIconBool;
    this.successIconBool = successIconBool;
    this.warningIconBool = warningIconBool;
    this.errorIconBool = errorIconBool;
    document.getElementById("alertTextID")?.style.setProperty("color", alertTextColor);
  }
}


