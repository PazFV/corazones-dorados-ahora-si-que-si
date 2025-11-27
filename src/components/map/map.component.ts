
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  currentRoom = input.required<string>();

  houseLayout = [
    { name: 'Living', label: 'Sala de Estar', area: 'col-span-2 row-span-2' },
    { name: 'Kitchen', label: 'Cocina', area: 'col-span-1 row-span-1' },
    { name: 'Bedroom', label: 'Dormitorio', area: 'col-span-1 row-span-1' },
    { name: 'Bathroom', label: 'Baño', area: 'col-span-1 row-span-1' },
    { name: 'Hallway', label: 'Pasillo', area: 'col-span-1 row-span-1' },
  ];
}
