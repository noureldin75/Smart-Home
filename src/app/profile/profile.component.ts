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
  // --- Data State ---
  isEditMenuOpen: boolean = false;


  // Data displayed on the profile card (Source of truth)
  profileData: any = {
    name: 'John Doe',
    role: 'Admin',
    bio: 'Smart home enthusiast and tech lover. Managing the family home automation system.',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Smart Home Lane, San Francisco, CA 94102'
  };
  editFormData: any = {};
  ngOnInit(): void {
    // Initialize the form data with current profile data when component loads
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
      password: '' // Never populate the password field
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

    // In a real application: You would call a service method here (e.g., this.userService.updateProfile(this.editFormData))
  }

}
