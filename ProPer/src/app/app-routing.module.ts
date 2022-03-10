import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importing the necessary routes
import { UserInfoComponent } from './user-info';
import { ExcelImportComponent } from './excel-import';
import { ExcelExportComponent } from './excel-export';

const routes: Routes = [
  { path: 'user-info', component: UserInfoComponent },
  { path: 'excel-import', component: ExcelImportComponent },
  { path: 'excel-export', component: ExcelExportComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
