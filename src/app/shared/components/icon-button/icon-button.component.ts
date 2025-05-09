import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-button.component.html',
})
export class IconButtonComponent {
  @Input() ariaLabel: string = '';
  @Output() onClick = new EventEmitter<void>();
}