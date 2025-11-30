import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() enterClass: string = '';
  @Input() leaveClass: string = '';

  private observer: IntersectionObserver;

  constructor(private el: ElementRef) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateIn();
          } else {
            this.animateOut();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  ngOnInit() {
    this.observer.observe(this.el.nativeElement);
    
    // Initially hide the element
    this.el.nativeElement.style.opacity = '0';
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private animateIn() {
    const element = this.el.nativeElement;
    
    // Remove leave classes
    if (this.leaveClass) {
      this.leaveClass.split(' ').forEach(className => {
        element.classList.remove(className);
      });
    }
    
    // Add enter classes
    if (this.enterClass) {
      this.enterClass.split(' ').forEach(className => {
        element.classList.add(className);
      });
    }
  }

  private animateOut() {
    const element = this.el.nativeElement;
    
    // Remove enter classes
    if (this.enterClass) {
      this.enterClass.split(' ').forEach(className => {
        element.classList.remove(className);
      });
    }
    
    // Add leave classes
    if (this.leaveClass) {
      this.leaveClass.split(' ').forEach(className => {
        element.classList.add(className);
      });
    }
  }
}