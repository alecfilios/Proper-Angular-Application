/* MODULES */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; // Server
import {MatDialogModule} from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTooltipModule} from '@angular/material/tooltip';
/* COMPONENTS */
import { AppComponent } from './app.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { ExcelImportComponent } from './excel-import/excel-import.component';
import { ExcelExportComponent } from './excel-export/excel-export.component';
import { UsersComponent } from './user-info/users/users.component';
import { InfoComponent } from './user-info/info/info.component';
import { DialogComponent } from './dialog/dialog.component';
import { ExcelService } from './excel-export/excel.service';

@NgModule({
  declarations: [
    AppComponent,
    UserInfoComponent,
    ExcelImportComponent,
    ExcelExportComponent,
    UsersComponent,
    InfoComponent,
    DialogComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule
    
  ],
  providers: [ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
