import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  /**
   * The pie chart
   */
  chart:Chart | undefined;
  selectedProjectIndex: string = "";
  projects: string[] = [];
  percentages: number[]= [];
  percentagesStr: string[] = [];
  /**
  * Selector
  */
  SelectDisabled: boolean = true;
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

  hasFreeTime:boolean = false;



  constructor(private dataService: DataService ) {}
  ngOnInit(): any {}

  /** 
   * ##################################################################################################################################
   *                                                    Make the pie chart
   * ##################################################################################################################################
   */
  makePieChart(){
    if(this.dataService.selectedUserIndex>=0){
      this.hasFreeTime = false;
      var name:string = "";
      this.projects = [];
      this.percentages = [];
      this.percentagesStr = [];
      var sum: number = 0;
      var colors: string[] = ["#001233","#023e7d","#2d4162","#0359b5","#17233a","#233e6c","#3d5c8f","#182439","#002855","#3761a9"]
      ;
     
      for (const [key, value] of Object.entries(this.dataService.sharedData[this.dataService.selectedUserIndex+1])) {
        if (parseInt(key)==0){
          name = value.trim();
        }
        else if(isOdd(parseInt(key))){
          this.projects.push(value.trim()); 
        }
        else{
          sum+=parseInt(value);
          this.percentages.push(parseInt(value));
          this.percentagesStr.push(value);
        }
      }
      if (sum<100){
        this.hasFreeTime = true;
        this.projects.unshift("Free time");
        this.percentages.unshift(100-sum);
        this.percentagesStr.unshift(String(100-sum));
        colors.unshift("#ffffff");
      }
      
      // Pie chart ------------------------------------
      //$('#myChart').remove(); // this is my <canvas> element
      //$('divChart').append('<canvas id="myChart" ></canvas>');
      if (!(this.chart == undefined)){
        this.chart.destroy();
      }
      this.chart = new Chart("myChart", {
        // The type of chart we want to create
        type: 'pie',
        // The data for our dataset
        data: {
          labels: this.projects, // Project Names
          datasets: [{
              label: name,
              backgroundColor: colors,
              borderColor: '#08133A',
              hoverBackgroundColor: "#9EC2ED",
              hoverBorderWidth: 5,
              data: this.percentages
              
          }]
        },
        // Configuration options go here
        options: {
          
        }
      });
      //--------------------------------------------------
    }
    else{
      // Pie chart ------------------------------------
      if (!(this.chart == undefined)){
        this.chart.destroy();
      }
      //--------------------------------------------------
    }
    this.addButtonDisabled = false;
    this.SelectDisabled = false;
    
  }
    /** 
   * ##################################################################################################################################
   *                                               Interactions
   * ##################################################################################################################################
   */
    /**
   * --------------------------------------------------------------------------------------------------------------------------
   *                                               On Select
   * --------------------------------------------------------------------------------------------------------------------------
   */
  onSelectProject(index:string){
    //If the selection is disabled it does nothing
    if (this.SelectDisabled){
      return;
    }
    if (this.projects[parseInt(index)]!= "Free time"){
      // If it is enabled it enables the delete button as well and keeps the user as the selected user.
      this.editButtonDisabled = false;
      this.deleteButtonDisabled = false; //Disabled
      this.selectedProjectIndex = index;    
    }


  }
  /**
   * --------------------------------------------------------------------------------------------------------------------------
   *                                                  Add
   * --------------------------------------------------------------------------------------------------------------------------
   */
  addProject(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = true; // Add Disabled 
    this.editButtonDisabled = true; // Edit Disabled
    this.deleteButtonDisabled = true; // Delete Disabled

    // Make the support buttons appear
    this.confirmAddButton = true; //Appear
    this.cancelAddButton = true; //Appear

    // Disable select mode on Projects but keep the user selected
    this.selectedProjectIndex = '';
    this.SelectDisabled = true;

    // Add a new element in the project list with it's percentage
    this.projects.unshift("New User Name");
    this.percentagesStr.unshift("0");
    // DB
    this.dataService.getIDsFromDB();
    // Let's detect the changes that above function made to the model which Angular is not aware of.
    setTimeout(this.applyAddChanges,0, true);
    
  }
  /**
   * Apply the changes in the html and make the li editable or not depending on the state.
   * @param isEditable 
   */
   applyAddChanges(isEditable:boolean){
    // Make both new Project and it's percentage editable
    const span1 = document.getElementById("projectID");
    if (span1) span1.contentEditable = String(isEditable);
    const span2 = document.getElementById("percentageID");
    if (span2) span2.contentEditable = String(isEditable);
  }

  confirmAdd(){
    var spans = document.querySelectorAll("ul#propers li span");
    // Keep their current text
    var span1Text = spans.item(0).innerHTML.replace(/&nbsp;/g,'').replace(/<br>/g,'').trim();
    var span2Text = spans.item(1).innerHTML.replace(/&nbsp;/g,'').replace(/<br>/g,'').trim();
    // If the spans are already created (which they are), then get their values
    if (!span1Text || !span2Text){
      if (!span1Text){
        spans.item(0).innerHTML = "Insert project name";
      }
      if(!span2Text ){
        spans.item(1).innerHTML = "0";
      }
      setTimeout(this.applyAddChanges,0, true);
      return;      
    }
    // Init the new Project name the user left and the Percentage
    var newProjectText:string = span1Text
    var newPercentagetext:string = span2Text
    // If those values fulfill the requirements 
    if (this.checkNameValidity(newProjectText,-1) && newProjectText?.length <= 50 && !isNaN(parseInt(newPercentagetext)) && parseInt(newPercentagetext) <= 100 && parseInt(newPercentagetext) >= 0){
      var sum = 0;
      if ( this.hasFreeTime ){
        sum = this.percentages.slice(1).reduce((a, b) => a + b, 0) + parseInt(newPercentagetext);
      }
      else{
        sum = this.percentages.reduce((a, b) => a + b, 0) + parseInt(newPercentagetext);
      }
      // check the sum too and then.. 
      if (sum<=100){
        // Apply the visual changes and make the spans uneditable
        this.applyAddChanges(false);
        // (un)Hide the neccessary buttons
        this.addButtonDisabled = false; // Add enabled
        this.editButtonDisabled = true; // Edit enabled
        this.deleteButtonDisabled = true; // Delete enabled

        this.confirmAddButton = false; // Confirm Disappear
        this.cancelAddButton = false; // Cancel Disappear

        // Enable project selection
        this.SelectDisabled = false; 
        
        // Update the shared Data aka global
        this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(1,0,newProjectText);
        this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(2,0,newPercentagetext);
        // DB
        let tempUserArray = this.dataService.sharedData[this.dataService.selectedUserIndex+1];
        let tempid = this.dataService.getUserID(tempUserArray[0].trim());
        this.dataService.addUserInDB(this.dataService.userToJson(tempUserArray, tempid, 'Update'));      
        // Local Storage
        localStorage.setItem("data",JSON.stringify(this.dataService.sharedData));
        this.makePieChart();
        setTimeout(this.applyAddChanges,0, false);

      }


    }
    else{
      /* TODO: Error message */
    }
  }
  cancelAdd(){
        // (un)Hide the neccessary buttons
        this.addButtonDisabled = false; // Re-enable the add button
       
        this.confirmAddButton = false; // Confirm Dissapear
        this.cancelAddButton = false; // cancel Dissappear
    
        this.SelectDisabled = false; // Enable Project Selection
        // ---------------------------------
        this.projects.shift();
        this.percentagesStr.shift();
        // Apply the changes visually and disable editing
        setTimeout(this.applyAddChanges,0, false);
  }

    /**
   * --------------------------------------------------------------------------------------------------------------------------
   *                                                  Delete
   * --------------------------------------------------------------------------------------------------------------------------
   */
  deleteProject(){
   
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = true; // Add Disabled
    this.editButtonDisabled = true; // Edit enabled
    this.deleteButtonDisabled = true; // Delete Disabled
    
    this.confirmDeleteButton = true; // Confirm Appear
    this.cancelDeleteButton = true; // Cancel Appear
    this.SelectDisabled = true; // Disable selection
    // DB
    this.dataService.getIDsFromDB();
  }
  confirmDelete(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = false; // Add enabled
  
    this.confirmDeleteButton = false; // Confirm Disappear
    this.cancelDeleteButton = false; // Cancel Disappear

    this.SelectDisabled = false; // Enable selection
    if(this.hasFreeTime){
      var removed = 2*parseInt(this.selectedProjectIndex)-1;
      this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice((2*parseInt(this.selectedProjectIndex))-1,2);

    }
    else{
      var removed = 2*parseInt(this.selectedProjectIndex)+1;      
      this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice((2*parseInt(this.selectedProjectIndex))+1,2);
    }
    // DB
    let tempUserArray = this.dataService.sharedData[this.dataService.selectedUserIndex+1];
    let tempid = this.dataService.getUserID(tempUserArray[0].trim());
    this.dataService.addUserInDB(this.dataService.userToJson(tempUserArray, tempid, 'Update'));
    // Local Storage
    localStorage.setItem("data",JSON.stringify(this.dataService.sharedData));
    this.makePieChart();
    setTimeout(this.applyAddChanges,0, false);
  }
  cancelDelete(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = false; // Add enabled
    this.editButtonDisabled = false; // Edit enabled
    this.deleteButtonDisabled = false; // Delete enabled
    this.confirmDeleteButton = false; // Confirm Disappear
    this.cancelDeleteButton = false; // Cancel Disappear
    this.SelectDisabled = false; // Enable selection
  }

      /**
   * --------------------------------------------------------------------------------------------------------------------------
   *                                                  Edit
   * --------------------------------------------------------------------------------------------------------------------------
   */
  editProject(){
     // (un)Hide the neccessary buttons
     this.addButtonDisabled = true; // Add Disabled
     this.editButtonDisabled = true; // Edit Disable
     this.deleteButtonDisabled = true; // Delete Disabled
 
     this.confirmEditButton = true; // Confirm Appear
     this.cancelEditButton = true; // Cancel Appear
     
     this.SelectDisabled = true; // Disable selection
    // DB
    this.dataService.getIDsFromDB();
     setTimeout(this.applyEditChanges,0, true, parseInt(this.selectedProjectIndex));
    }
  /**
 * Apply the changes in the html and make the li editable or not depending on the state.
 * @param isEditable 
 */
    applyEditChanges(isEditable:boolean, index:number){
    // Make both new Project and it's percentage editable
    var spans = document.querySelectorAll("ul#propers li span");
    var index1:number = 2 * index;
    var index2:number = 2 * index+1;

    spans.item(index1).setAttribute("contentEditable", String(isEditable));
    spans.item(index2).setAttribute("contentEditable", String(isEditable));
    var span2Text = spans.item(index2).innerHTML;
    if(span2Text=="" || span2Text==undefined || span2Text== null){
      spans.item(index2).setAttribute("innerHTML", "0");
    }
    
  }
  confirmEdit(){
    // Keep the index as a number
    var index = parseInt(this.selectedProjectIndex);
    // Find all spans
    var spans = document.querySelectorAll("ul#propers li span");
    // Keep the indexes we are interested in from the list of projects-precentages
    var index1:number = 2 * index;
    var index2:number = 2 * index+1;
    // Keep their current text
    var span1Text = spans.item(index1).innerHTML.replace(/&nbsp;/g,'').replace(/<br>/g,'').trim();
    var span2Text = spans.item(index2).innerHTML.replace(/&nbsp;/g,'').replace(/<br>/g,'').trim();
    if (!span1Text || !span2Text){
      if (!span1Text){
        spans.item(index1).innerHTML = "Insert project name";
      }
      if(!span2Text ){
        spans.item(index2).innerHTML = "0";
      }
      setTimeout(this.applyEditChanges,0, true, parseInt(this.selectedProjectIndex));
      return;
    }
    // check for validity of the span texts
    if(this.checkNameValidity(span1Text,index) && !isNaN(parseInt(span2Text)) && parseInt(span2Text) <= 100 && parseInt(span2Text) >= 0 &&
    span1Text.length <= 50){
      // init a sum
      var sum = 0;
      if( this.hasFreeTime ){
        sum = this.percentages.slice(1).reduce((a, b) => a + b, 0) - this.percentages[parseInt(this.selectedProjectIndex)] + parseInt(span2Text);
      }
      else{
        sum = this.percentages.reduce((a, b) => a + b, 0) - this.percentages[parseInt(this.selectedProjectIndex)] + parseInt(span2Text);
      }     
      if (sum<=100 && sum>=0){
        // (un)Hide the neccessary buttons
        this.addButtonDisabled = false; // Add enabled
        this.deleteButtonDisabled = false; // Delete enabled
        this.editButtonDisabled = false; // Delete enabled


        this.confirmEditButton = false; // Confirm Disappear
        this.cancelEditButton = false; // Cancel Disappear
        this.SelectDisabled = false; // Enable selection

        // Update the shared Data aka global
        if(this.hasFreeTime){
          var editedIndex = (2*parseInt(this.selectedProjectIndex))-1;
          this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(editedIndex,1,span1Text);
          this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(editedIndex+1,1,span2Text);

        }
        else{
          var editedIndex = (2*parseInt(this.selectedProjectIndex))+1;      
          this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(editedIndex,1,span1Text);
          this.dataService.sharedData[this.dataService.selectedUserIndex+1].splice(editedIndex+1,1,span2Text);

        }
        var hadFreetime = this.hasFreeTime;
        // Local Storage
        localStorage.setItem("data",JSON.stringify(this.dataService.sharedData));
        // Refresh the pie chart
        this.makePieChart();
        // Make a new selection (check if there is a free time first tho)
        if(!hadFreetime && this.hasFreeTime){
          this.onSelectProject(String(parseInt(this.selectedProjectIndex)+1));
        }
        if(hadFreetime && !this.hasFreeTime){
          this.onSelectProject(String(parseInt(this.selectedProjectIndex)-1));
        }
        // Apply the changes
        setTimeout(this.applyEditChanges,0, false, parseInt(this.selectedProjectIndex));
        // DB
        let tempUserArray = this.dataService.sharedData[this.dataService.selectedUserIndex+1];
        let tempid = this.dataService.getUserID(tempUserArray[0].trim());
        this.dataService.addUserInDB(this.dataService.userToJson(tempUserArray, tempid, 'Update'));
        return;
      }

    }
    setTimeout(this.applyEditChanges,0, true, parseInt(this.selectedProjectIndex));
  }
  cancelEdit(){
    // (un)Hide the neccessary buttons
    this.addButtonDisabled = false; // Add enabled
    this.editButtonDisabled = false; // Delete enabled
    this.deleteButtonDisabled = false; // Delete enabled
    this.confirmEditButton = false; // Confirm Disappear
    this.cancelEditButton = false; // Cancel Disappear
    this.SelectDisabled = false; // Enable selection
    setTimeout(this.applyEditChanges,0, false, parseInt(this.selectedProjectIndex));
  }

  /**
   * --------------------------------------------------------------------------------------------------------------------------
   *                                                  Tools
   * --------------------------------------------------------------------------------------------------------------------------
   */
  makeString(num:number){ return String(num);}

  checkNameValidity(newProjectName: string, index:number): boolean{
    var found:boolean = false; 
    for (var i:number=0; i<this.projects.length; i++){
      if (i==index){
        continue;
      }
      if (this.projects[i].trim()==newProjectName.trim()){
        return false;
      }
    }
    return true;
  }
}
/*
A quite handy function used to determine if the given number is odd or even.
returns True or False.
*/
function isOdd(num: number) { return (num % 2) == 1;}


