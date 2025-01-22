import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { GoogleAuthService } from '../_services/google-auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  private readonly clientId = '${import.meta.env.VITE_GOOGLE_CLIENTID}';

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private googleAuthService: GoogleAuthService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    }

    // Check for token in URL (from OAuth2 redirect)
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.handleOAuthSuccess(params['token']);
      }
    });

    // Initialize Google Sign-In
    await this.initializeGoogleSignIn();
  }

  private async initializeGoogleSignIn(): Promise<void> {
    await this.googleAuthService.initializeGoogleSignIn(
      this.clientId,
      this.handleCredentialResponse.bind(this)
    );
    
    this.googleAuthService.renderButton('googleBtn', {
      theme: "outline",
      size: "large",
      width: 250,
      type: "standard"
    });
  }

  onSubmit(): void {
    const { username, password } = this.form;
    this.authService.login(username, password).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storageService.getUser().roles;
        this.reloadPage();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  handleCredentialResponse(response: any) {
    this.authService.googleLogin(response.credential).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storageService.getUser().roles;
        this.reloadPage();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  handleOAuthSuccess(token: string): void {
    this.authService.validateOAuthToken(token).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storageService.getUser().roles;
        this.reloadPage();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    window.location.reload();
  }
}
