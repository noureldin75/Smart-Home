import { Component, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('0.8s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class WelcomeComponent {
  showWelcome = true;
  @Output() welcomeComplete = new EventEmitter<void>();

  floatingShapes = Array(15).fill(0).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    animationDelay: Math.random() * 6,
    type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
    color: ['blue', 'pink', 'green', 'purple'][Math.floor(Math.random() * 4)]
  }));

  scrollToHome() {
    this.showWelcome = false;
    setTimeout(() => {
      this.welcomeComplete.emit();
    }, 500);
  }
}