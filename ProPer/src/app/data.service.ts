import { Injectable } from '@angular/core';
/**
 * -----Server related stuff--------
 */
// import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {HttpClient} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { MatDialog } from "@angular/material/dialog";
import { DialogComponent } from './dialog/dialog.component';
// ---------------------------------


@Injectable({
  providedIn: 'root'
})
export class DataService {
  sharedData: string[][]= [];
  jsonData: any[] = [];
  ids: any[] = [{}];
  selectedUserIndex: number = 0;

  constructor(private httpClient: HttpClient, private dialog: MatDialog) { 
    // Check if local storage has data inside
    if (localStorage.getItem("data") === null) {
      try {
        this.getIDsFromDB();
        this.getDataFromDB();
        
      }
      catch (error) {
        console.log(error);
        
      }
    }
    else{
      this.getIDsFromDB();
      this.sharedData = JSON.parse(localStorage.getItem("data") || '{}');
    }


  }

    /**
   * ################# ################# ################# ################# ################# #################
   *                                  
   *                                       CONNECTING WITH THE SERVER
   * 
   *  ################# ################# ################# ################# ################# #################
   */

  /**
   * Save
   * @param user 
   * @returns 
  */
  private saveUser(user: any){
    return this.httpClient.post('http://localhost:8080/api/saveUser/', user)
    .pipe(tap((res:any) => res/*this.openDialog(String(res.data))*/));
  }
  /**
   * Get all Data
   * @returns 
   */
   private getData(){
    return this.httpClient.get('http://localhost:8080/api/getData/')
    .pipe(tap((response:any) => response)); 
  }
  /**
   * Delete one by Id
   * @param id 
   * @returns 
   */
   private deleteUser(id:any){
    return this.httpClient.post('http://localhost:8080/api/deleteUser/', {'id':id})
    .pipe(tap((arg:any) => this.openDialog(String(arg.data))))
  }
  /**
   * Delete All
   * @returns 
   */
   private deleteAll(){
    return this.httpClient.post('http://localhost:8080/api/deleteAll/',{})
    .pipe();
  }
  /**
   * Save Many
   * @param users 
   * @returns 
   */
   private saveMany(users: any[]){
    return this.httpClient.post('http://localhost:8080/api/saveMany/',users)
    .pipe(tap((arg:any) => this.openDialog(String(arg.data))))
  }
  /**
   * Get Ids
   * @returns 
   */
   private getIDs(){
    return this.httpClient.get('http://localhost:8080/api/getIDs/')
    .pipe(tap((response:any) => response)); 

  }
  /**
   * Check if Name Exists
   * @param name 
   * @returns 
   */
  checkName(name:string){
    return this.httpClient.post('http://localhost:8080/api/checkName/',{'name':name})
    .pipe(tap((response:any) => response)); 
  }
  /**
   * get the last ID Inserted
   * @returns 
   */
  getLastID(){
    return this.httpClient.get('http://localhost:8080/api/getlastID/')
    .pipe(tap((response:any) => response)); 
  }
  /**
   * ################# ################# ################# ################# ################# #################
   *                                  
   *                                         Helping Methods
   * 
   *  ################# ################# ################# ################# ################# #################
   */
  /**
   * This method transforms the data we want to pass into addManyInDB() in order to add them properly
   */
   setServerData(){
    let allUsers: any[] = [];
    // Clear the DB
    //this.clearDB();
    let isHeader = true;
    for(let row of this.sharedData){
      if(isHeader){
        isHeader=false;
        continue;
      }
      // Create an empty user with the scheme format
      let userSch; //{"name":"","propers": [{}], "mode":""};


      // Check if user already exists in DB
      //console.log(row[0]+": "+this.getUserID(row[0]));//TODO:Delete
      if (this.getUserID(row[0]) != undefined) {
        userSch = {"_id":"","name":"","propers": [{}], "mode":""};
        // if he exists then Update
        userSch.mode = "Update";
        userSch._id = this.getUserID(row[0]);
      }
      else{
        // Create an empty user with the scheme format
        userSch = {"name":"","propers": [{}], "mode":""};
        // Set Save because it's new
        userSch.mode = "Save";
      }

      // For every element in the array of the user's data
      for (let i=0; i <row.length; i++){
        // Set Name
        if (i==0){
          userSch.name = row[0];
          //remove the empty {}
          userSch.propers.pop();
        }
        // Set Proper when a new Project name appears
        else if(isOdd(i)){
          userSch.propers.push({"project":row[i], "percentage":row[i+1]});
        }
        // Percentage Already setted so skip.
        else{
          continue;
        }
      }
      this.addUserInDB(userSch);
      this.getIDsFromDB();

      //allUsers.push(userSch);
      
    }
    this.openDialog("Data inserted succesfully..!!")
    // Add it in the DB.
    //this.addManyInDB(allUsers);
  }

  /**
   * ################# ################# ################# ################# ################# #################
   *                                  
   *                                                 Sunscriptions
   * 
   *  ################# ################# ################# ################# ################# #################
   */

  /**
   * This method adds one user into the server. 
   * @param userSch 
   */
  addUserInDB(userSch:any){
    this.saveUser(userSch)
    .subscribe(
      {
      //next: x => this.getIDsFromDB(),
      error: err => console.error(err),
    });

  }
  /**
   * This method clears the data of the server.
   */
  clearDB(){
    this.deleteAll()
    .subscribe({
      next() {
        
      },
      error() {
      },
      complete() {
      }
    });;
  }

  /**
   * This method connects with the server and returns the whole data the server contains.
   */
  getDataFromDB(){
    this.getData()
    .subscribe({
      next: jsonData => this.jsonData = jsonData,
      error: err => console.error(err),
      complete:() => {
        this.jsonToArray();
        window.location.reload();
      } 
    });
  }
  /**
   * This method transforms the Json data we got from the DB into string[][] data we need for our app
   */
  jsonToArray(){
    let jsonData = this.jsonData;
    let row: string[] = [];
    let finalData: string[][] = [];
    finalData.push(["Name","Project Name","%","Project Name","%","Project Name","%"]);
    // for each row
    for (let json of jsonData){
      // Get id
      this.ids.push(json._id);
      // Get name
      row.push(json.name);
      // Get Propers
      for (let proper of json.propers){
        row.push(proper.project);
        row.push(proper.percentage);
      }
      finalData.push(row);
      row = [];
    }
    this.sharedData = finalData;
    localStorage.setItem("data",JSON.stringify(this.sharedData));
  }
  deleteUserInDB(id:string){
    this.deleteUser(id)
    .subscribe({
      next() {
        
      },
      error() {
      },
      complete() {
        
      }
    });
  }
  /**
   * This method connects with the server and returns the ids in a list
   */
  getIDsFromDB(){
    this.getIDs()
    .subscribe({
      next: ids => this.ids = ids,
      error: err => console.error(err),
    });
  }

  /**
   * 
   */
  userToJson(userArray: string[], id:string, mode:string){
    if (mode == 'Save'){

      let newUserSch:any = {name: userArray[0] ,propers: [],mode: mode};
      return newUserSch
    }
    else if(mode == 'Update'){
      // Make a new user and fill the name and Update
      let newUserSch:any = {_id: id, name: userArray[0] ,propers: [],mode: mode};
      // for every cell in that user's array
      for (let i=1; i<userArray.length; i++){
        // if is odd ( project ) fill both
        if(isOdd(i)){
          newUserSch.propers.push({"project":userArray[i], "percentage":userArray[i+1]});
        }
        // skip for percentage , which is already filled
        else{
          continue;
        }

      }
      return newUserSch
    }


  }


  getUserID(name:string){
    for (let row of this.ids){
      if (name==row.name){
        return row._id;
      }
    }

  }
  /**
   * 
   * @param data 
   */
  openDialog(data:string) {

    this.dialog.open(DialogComponent, {
      data:data,
      disableClose:true,
      autoFocus:true,
      panelClass: 'my-dialog',
    });
}

}


/*
A quite handy function used to determine if the given number is odd or even.
returns True or False.
*/
function isOdd(num: number) { return (num % 2) == 1;}


