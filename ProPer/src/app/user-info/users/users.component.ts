import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataService } from 'src/app/data.service';

export * from './users.component';
import * as $ from 'jquery';
import { data } from 'jquery';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: string[] = []; // The first column of the data are the names of the users
  selectedUser?: string;
  /**
   * Selector
   */
  userSelectDisabled: boolean = true;
  /**
   * Buttons
   */
  addButtonDisabled:boolean = true;
  editButtonDisabled:boolean = true;
  deleteButtonDisabled:boolean = true;
  /**
   * Support Buttons, Note: Using NgIf
   */
  confirmAddButton:boolean = false;
  cancelAddButton:boolean = false;
  confirmDeleteButton:boolean = false;
  cancelDeleteButton:boolean = false;
  confirmEditButton:boolean = false;
  cancelEditButton:boolean = false;
  /**
   * Event for to call info.component.ts method
   */
  @Output() myEvent = new EventEmitter(); 
  /**
   * Constructor
   * @param dataService 
   */
  constructor(private dataService: DataService) { }
  
  ngOnInit(): void {      
    // Local Storage
    //this.dataService.sharedData = JSON.parse(localStorage.getItem("data") || '{}');
    if(this.dataService.sharedData.length > 0){
      this.makeList();
    }
  }
    /** 
   * #####################################################################################################################
   *                                                  LIST MAKE
   * #####################################################################################################################
   */ 
  /**
   * Keeps the first column of the data, which is the list of the names.
   * It also skips the first row that includes the word 'Name'.
   */
  makeList(): void{
    /*
    This function returns the column frtom
    */
    const getCol = (matrix: string[][], col: number) =>{
      var column: string[] = [];
      // For every row (Starting from 1 to avoid the word 'Name')
      for(var i=1; i<matrix.length; i++){
        // keep only the name
        column.push(matrix[i][col]);
        
      }
      return column;
   }
   // Result:
   this.users = getCol(this.dataService.sharedData, 0);

   // Enable the add button and the selection of the list elements.
   this.addButtonDisabled = false;
   this.userSelectDisabled = false;
  }
    /** 
   * #####################################################################################################################
   *                                                  SELECT USER
   * #####################################################################################################################
   */ 
  /**
   * This method triggers when an li is selected.
   * @param user 
   * @returns void
   */
  onSelect(user: string): void{
    //If the selection is disabled it does nothing
    if (this.userSelectDisabled){
      return;
    }
    // If it is enabled it enables the delete button as well and keeps the user as the selected user.
    this.editButtonDisabled = false;
    this.deleteButtonDisabled = false; //Disabled
    this.selectedUser = user;
    // If the user is the word none then it disables the delete button again and it calls the info.component with -1 as index.
    if(this.selectedUser == "none"){
      this.deleteButtonDisabled = true; // Delete Disabled
      this.editButtonDisabled = true; //Disabled
      this.dataService.selectedUserIndex = -1;
      this.myEvent.emit(null)
    }
    // In any other user name it calls the info.component by changing the index of the sleected user (+1 cause of the name skip)
    for (var i:number=0; i<this.users.length; i++){
      if(this.users[i].trim()==user.trim()){
        this.dataService.selectedUserIndex = i;
        this.myEvent.emit(null)
        break;
      }
    }
  }
  /** 
   * #####################################################################################################################
   *                                                  BUTTONS
   * #####################################################################################################################
   */ 

  /** 
   * -------------------------------------------------------------------------------------------------------------------
   *                                                Add a new User
   * -------------------------------------------------------------------------------------------------------------------
   */
  addUser(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = true; //Disabled
    this.deleteButtonDisabled = true; // Delete Disabled

    this.confirmAddButton = true; //Appear
    this.cancelAddButton = true; //Appear


    // Deselect and then disable select mode 
    this.onSelect("none"); 
    this.userSelectDisabled = true;
    // Add a new element in the users list
    this.users.unshift("New User");

    // Let's detect the changes that above function made to the model which Angular is not aware of.
    setTimeout(this.applyAddChanges,0, true);

  }
  /**
   * Apply the changes in the html and make the li editable or not depending on the state.
   * @param isEditable 
   */
  applyAddChanges(isEditable:boolean){
    document.getElementsByTagName("ul")[0].getElementsByTagName("li")[0].contentEditable = String(isEditable);
  }

  confirmAdd(){

    if(this.checkNameValidity($('li:first').text().trim()) && /^[a-zA-Z ]*$/.test($('li:first').text().trim()) && $('li:first').text().trim().length <= 50){
      // (un)Hide the neccessary buttons
      this.addButtonDisabled = false; //Disabled

      this.confirmAddButton = false; //Dissapear
      this.cancelAddButton = false; //Dissappear

      this.userSelectDisabled = false; //False
      //-------------------------------------
      // Update the user list with the current name in the editable li
      this.users[0] = $('li:first').text().trim();
      // Update the global shared data
      this.dataService.sharedData.splice(1, 0, [this.users[0]]);
      // Local Storage
      localStorage.setItem("data",JSON.stringify(this.dataService.sharedData));
      //DB
      this.dataService.addUserInDB(this.dataService.userToJson(this.dataService.sharedData[1], "", 'Save'));

      // Apply the changes visually
      setTimeout(this.applyAddChanges,0, false);

    }
    else{
      // Apply the changes visually
      setTimeout(this.applyAddChanges,0, true);
    }

  }

  cancelAdd(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = false; //Disabled

    this.confirmAddButton = false; //Dissapear
    this.cancelAddButton = false; //Dissappear

    this.userSelectDisabled = false; //False
    // ---------------------------------
    this.users.shift();
    // Apply the changes visually
    setTimeout(this.applyAddChanges,0, false);
  }

  /** 
   * -------------------------------------------------------------------------------------------------------------------
   *                                                Delete a User
   * -------------------------------------------------------------------------------------------------------------------
   */
  deleteUser(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = true; // Add Disabled
    this.editButtonDisabled = true; // Edit enabled
    this.deleteButtonDisabled = true; // Delete Disabled
    
    this.confirmDeleteButton = true; // Confirm Appear
    this.cancelDeleteButton = true; // Cancel Appear
    this.userSelectDisabled = true; // Disable selection


    
  }

  confirmDelete(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = false; // Add enabled
    this.confirmDeleteButton = false; // Confirm Disappear
    this.cancelDeleteButton = false; // Cancel Disappear
    this.userSelectDisabled = false; // Enable selection

    let deletedUser = this.users.splice(this.dataService.selectedUserIndex,1);
    this.dataService.sharedData.splice(this.dataService.selectedUserIndex+1,1);
    
    // DB
    let tempID = this.dataService.getUserID(deletedUser[0]);//this.dataService.ids[this.dataService.selectedUserIndex]._id;
    this.dataService.deleteUserInDB(tempID);
    // Local Storage
    localStorage.setItem("data",JSON.stringify(this.dataService.sharedData));
    // Select none
    this.onSelect("none"); 
    
    
  }
  cancelDelete(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = false; // Add enabled
    this.editButtonDisabled = false; // Edit enabled
    this.deleteButtonDisabled = false; // Delete enabled
    this.confirmDeleteButton = false; // Confirm Disappear
    this.cancelDeleteButton = false; // Cancel Disappear
    this.userSelectDisabled = false; // Enable selection
  }
  /** 
   * -------------------------------------------------------------------------------------------------------------------
   *                                               Edit a User
   * -------------------------------------------------------------------------------------------------------------------
   */
  /**
   * 
   */
  backupName:string = "";
  editUser(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = true; // Add Disabled
    this.editButtonDisabled = true; // Edit Disable
    this.deleteButtonDisabled = true; // Delete Disabled

    this.confirmEditButton = true; // Confirm Appear
    this.cancelEditButton = true; // Cancel Appear
    
    this.userSelectDisabled = true; // Disable selection
    //DB
    this.dataService.getIDsFromDB();
    document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].contentEditable = String(true);



  }


  
  confirmEdit(){
    if(this.checkNameValidity(document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].innerHTML) &&
     /^[a-zA-Z ]*$/.test(document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].innerHTML) &&
     document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].innerHTML.length <= 50){
      // (un)Hide the neccessary buttons
      this.addButtonDisabled = false; // Add enabled
      this.deleteButtonDisabled = false; // Delete enabled
      this.editButtonDisabled = false; // Delete enabled


      this.confirmEditButton = false; // Confirm Disappear
      this.cancelEditButton = false; // Cancel Disappear
      this.userSelectDisabled = false; // Enable selection
      // Update the user list with the current name in the editable li
      this.users[this.dataService.selectedUserIndex] = String(this.selectedUser);
      // Update the global shared data
      this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(0,1,document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].innerHTML.trim());
      //this.dataService.sharedData[this.dataService.selectedUserIndex+1][0] = String(this.selectedUser);
      document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].contentEditable = String(false);
      // DB
      let tempUserArray = this.dataService.sharedData[this.dataService.selectedUserIndex+1];
      let tempid = this.dataService.getUserID(this.users[this.dataService.selectedUserIndex]);
      this.dataService.addUserInDB(this.dataService.userToJson(tempUserArray, tempid, 'Update'));
    }
    else
    {
      document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].contentEditable = String(true);

    }
    // Local Storage
    localStorage.setItem("data",JSON.stringify(this.dataService.sharedData));
  }
  cancelEdit(){
     // (un)Hide the neccessary buttons
     this.addButtonDisabled = false; // Add enabled
     this.editButtonDisabled = false; // Delete enabled
     this.deleteButtonDisabled = false; // Delete enabled
     this.confirmEditButton = false; // Confirm Disappear
     this.cancelEditButton = false; // Cancel Disappear
     this.userSelectDisabled = false; // Enable selection

     document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].contentEditable = String(false);
     document.getElementsByTagName("ul")[0].getElementsByTagName("li")[this.dataService.selectedUserIndex].innerHTML = this.users[this.dataService.selectedUserIndex];

  }
// ####################################################################################################################
  checkNameValidity(newUserName: string): boolean{
    var found:boolean = false;
    for (var i:number=0; i<this.users.length; i++){
      if (this.users[i].trim()==newUserName.trim()){
        return false;
      }
    }
    return true;
  }


  /**
   * ####################################################################################################################
   *                                          SERVER 
   *                                     server related stuff
   * ####################################################################################################################
   */
   onRefreshbutton(){
     this.dataService.getDataFromDB();
   }

  

  // ####################################################################################################################

  
  
}




