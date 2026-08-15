import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserDownload {
  save(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    link.click();
    URL.revokeObjectURL(url);
  }
}
