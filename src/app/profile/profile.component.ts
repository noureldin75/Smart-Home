import { Component } from '@angular/core';
import {SideBarComponent} from "../SideBar/SideBar.component";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    SideBarComponent,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  isEditMenuOpen: boolean = false;
  profileData: any = {
    name: 'Youssef Marakby',
    role: 'Home Member',
    bio: 'I love my children',
    email: 'youssefashraf@gamail.com',
    phone: '01021838444',
    address: 'Tosson,Alexandria'
  };
  editFormData: any = {};
  ngOnInit(): void {
    this.resetForm();
  }
  openEditMenu(): void {
    // 1. Copy current profile data to the form data
    this.resetForm();
    // 2. Open the modal
    this.isEditMenuOpen = true;
  }

  closeEditMenu(): void {
    // 1. Close the modal
    this.isEditMenuOpen = false;
    // 2. Reset the form data (discarding unsaved changes)
    this.resetForm();
  }

  resetForm(): void {
    // Creates a shallow copy of the profile data
    this.editFormData = {
      ...this.profileData,
      password: ''
    };
  }

  saveChanges(): void {
    // Logic to save changes and update profileData
    console.log('Saving changes...', this.editFormData);

    // 1. Update the profileData (simulating a successful API call)
    this.profileData.name = this.editFormData.name;
    this.profileData.email = this.editFormData.email;
    this.profileData.phone = this.editFormData.phone;
    // Password update logic would go here (typically sent to a separate endpoint)

    // 2. Close the modal
    this.isEditMenuOpen = false;


  }


}
