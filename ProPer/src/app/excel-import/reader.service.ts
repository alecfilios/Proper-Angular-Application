// We import "Injectable" from @angular/core
import { Injectable,  } from '@angular/core';
import * as XLSX from 'xlsx'; // The import for Excel
// Source: https://angular.io/guide/dependency-injection

@Injectable({
  // declares that this service should be created
  // by the root application injector.
  
  providedIn: 'root'
})
export class ReaderService {
  /* 
  Not initialized in the constructor 
  Avoided using (!) 
  TODO: Might need to check later
  */
  data: string[][] = [];
  warningString: string = "";

  constructor() {
    
  }
  /*
  This methods reads and tranforms the excel file into JSON data. 
  */
  readFile(target: string) {
    /* Binary string */
    const bstr: string = target;
    /* 
    Workbook: read takes our binary string 
    and gives us the workbook type
    */
    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
    /* Worksheet name ( we have only one) */
    const wsname: string = wb.SheetNames[0];
    /* Actual WorkSheet */
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    /* 
    Convert it to JSON format
      header Atrribute:
      >1 to leave the columns as they are
      >can be changed into an array of strings.
    */
    this.data = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
    this.checkData(this.data);
  }



  /* 
  checkData()
  This method is responsible to check whether the file format suits the 
  necessary standards. Although it wont stop on an error. Instead it
  will show a warning notifying the user of what he needs to correct 
  So the idea is that it reads all the data and detects all errors. 
  */
  
  private checkData(data: string[][]) {
    this.warningString = "";
    let maxLength = 0;
    /*
    DATA
    Checking whether the data exists, is undefined, is empty, etc..
    */
    if (data === undefined || data.length == 0 || data == []) {
      //console.log("Data is undefined");
      this.warningString += "Data is undefined";
    }
    /*
    A quite handy function used to determine if the given number is odd or even.
    returns True or False.
    */
    function isOdd(num: number) { return (num % 2) == 1;}
    /*
    This is the main loop for the entirety of the data.
    */
   var rowIndex = 0;
    for(var i:number = 0; i<data.length; i++){
      rowIndex = i+1;
      /* Check if any of the rows is not of odd length.
      Every row's length must be an odd number because it is made of the Name and then pairs of Projects 
      and their percentages. 
      */
      if (!isOdd(data[i].length)){
        if(i==0){
          this.warningString += "\nWarning: Header file has even number of cells.";

        }
        else{
          this.warningString += "\nWarning: Row:"+ rowIndex +" has even number of cells.";

        }
      }
      /*
      HEADER CHECK
      */
      var keyInt:number = 0;
      var keyIntToAlphabet:string = "";
      if(i==0){
        // for every entry in header
        
        for (const [key, value] of Object.entries(data[i])) {
          keyInt = parseInt(key)+1;
          keyIntToAlphabet = (keyInt + 9).toString(36).toUpperCase();
    

          // The first one must be the word Name or maybe name? TODO:check
          if(keyInt==1){
            if (value.trim() !=="Name"){
              //console.log("\nWarning: Cell: "+ keyIntToAlphabet + rowIndex +" must contain the word 'Name'.");
              this.warningString += "\nWarning: Cell: "+ keyIntToAlphabet + rowIndex +" must contain the word 'Name'.";

            } 
            
            /*  header  */
          // All the others must be pairs of {Project Name , % }
          }
          else{
            // The Project names are in the odd columns.
            if(!isOdd(keyInt)){
              if(value.trim() !== "Project Name"){
                //console.log("Warning: Cell: "+ keyIntToAlphabet + rowIndex +" must contain the phrase 'Project Name'.");
                this.warningString += "\nWarning: Cell: "+ keyIntToAlphabet + rowIndex +" must contain the phrase 'Project Name'.";
              }
            }
            // The Percentages are in the even columns. 
            else{
              if(value.trim() !== "%"){
                //console.log("Warning: Cell: "+ keyIntToAlphabet + rowIndex +" must contain the symbol '%'.");
                this.warningString += "\nWarning: Cell: "+ keyIntToAlphabet + rowIndex +" must contain the symbol '%'.";
              }
            }
          }
        }
      }
      /*
      REST OF THE DATA
      */
      else{
        var sumOfPercentages: number = 0;
        for (const [key, value] of Object.entries(data[i])) {
          keyInt = parseInt(key)+1;
          keyIntToAlphabet = (keyInt + 9).toString(36).toUpperCase();

          if (keyInt==1){
            // Check if name contains only Letters and spaces 
            if(!/^[a-zA-Z ]*$/.test(value.trim()) || value.trim().length > 50){
              //console.log("Warning: Cell: "+ keyIntToAlphabet + rowIndex + ", must contain a valid name.");
              this.warningString += "\nWarning: Cell: "+ keyIntToAlphabet + rowIndex + " must contain a valid name."+"Instead it contains:"+ value;
            }
          }
          // A Project Name
          else if ( !isOdd(keyInt)){
            if( value.length > 50){
              //console.log("Warning: Cell: "+ keyIntToAlphabet + rowIndex + " must contain a valid Project name.");
              this.warningString += "\nWarning: Cell: "+ keyIntToAlphabet + rowIndex + " must contain a valid Project name.";

            }
          }
          // It's Percentage
          else{
            if(isNaN(parseInt(value)) || parseInt(value) > 100 || parseInt(value) < 0){
              

              //console.log("Warning: Cell: "+ keyIntToAlphabet + rowIndex + " must contain a valid percentage(%).");
              this.warningString += "\nWarning: Cell: "+ keyIntToAlphabet + rowIndex + " must contain a valid percentage(%).";

            }
            else{
              sumOfPercentages += parseInt(value);
            }
          }
        }
        // The sum of all the percentages
        if (sumOfPercentages > 100){
          //console.log("Warning: Row:"+ rowIndex +" The sum of the percentage(%) is not 100%. Instead it is: "+ sumOfPercentages);
          this.warningString += "\nWarning: Row:"+ rowIndex +" The sum of the percentage(%) exceeds 100%. Instead it is: "+ sumOfPercentages;
        }
        // check if the row has diplucates 
        let hasDuplicates = this.checkForProjectDuplicates(data[i]);
        if (hasDuplicates){
          this.warningString += "\nWarning: Row:"+ rowIndex +" has project names duplicates.";
        }
      }
      if(i!=0 && data[i].length > maxLength){
        maxLength = data[i].length;
      }
    } 
    if (maxLength != data[0].length){
      this.warningString += "\nWarning: header size is not equal to the largest proper list between the users.";
    }
    if (this.checkForDuplicates(this.getCol(data,0))){
      this.warningString += "\nWarning: File has name duplicates.";
    }
    this.warningString = this.warningString.trim();  
  }
  /*
    Getters
  */
  public getData() : string[][] {
    return this.data;
  }
  public getWarningString(): string{
    return this.warningString;
  }  

      /*
    This function returns the column frtom
    */
    getCol(matrix: string[][], col: number){
      var column: string[] = [];
      // For every row (Starting from 1 to avoid the word 'Name')
      for(var i=1; i<matrix.length; i++){
        // keep only the name
        column.push(matrix[i][col]);
        
      }
      return column;
    } 
    checkForDuplicates(array:string[]) {
      let valuesAlreadySeen = []
    
      for (let i = 0; i < array.length; i++) {
        let value = array[i]
        if (valuesAlreadySeen.indexOf(value) !== -1) {
          return true
        }
        valuesAlreadySeen.push(value)
      }
      return false
    }

    checkForProjectDuplicates(array:string[]) {
      let valuesAlreadySeen = []
    
      for (let i = 1; i < array.length; i+=2) {
        let value = array[i]
        if (valuesAlreadySeen.indexOf(value) !== -1) {
          return true
        }
        valuesAlreadySeen.push(value)
      }
      return false
    }
}
