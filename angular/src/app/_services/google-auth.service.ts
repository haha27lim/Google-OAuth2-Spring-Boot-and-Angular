import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private static scriptLoaded = false;
  private static initialized = false;
  private static currentCallback: ((response: any) => void) | null = null;

  async initializeGoogleSignIn(clientId: string, callback: (response: any) => void): Promise<void> {
    GoogleAuthService.currentCallback = callback;

    if (!GoogleAuthService.scriptLoaded) {
      await this.loadGoogleScript();
    }

    if (!GoogleAuthService.initialized && typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (GoogleAuthService.currentCallback) {
            GoogleAuthService.currentCallback(response);
          }
        }
      });
      GoogleAuthService.initialized = true;
    }
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (GoogleAuthService.scriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        GoogleAuthService.scriptLoaded = true;
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.body.appendChild(script);
    });
  }

  renderButton(elementId: string, options: any): void {
    const buttonElement = document.getElementById(elementId);
    if (!buttonElement) {
      console.error('Button element not found');
      return;
    }

    try {
      google.accounts.id.renderButton(buttonElement, options);
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  }
} 