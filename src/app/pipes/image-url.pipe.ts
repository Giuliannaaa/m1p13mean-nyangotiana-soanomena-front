import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return 'img/png/elementor-placeholder-image.png'; // default fallback
    }

    // clean up potential backslashes from windows paths
    const cleanPath = value.replace(/\\/g, '/');

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('data:image')) {
      return cleanPath;
    }

    // Retirer le slash initial si présent pour éviter http://localhost:5000//uploads/...
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;

    // S'assurer que l'apiUrl n'a pas de slash à la fin
    const apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;

    return `${apiUrl}/${normalizedPath}`;
  }
}
