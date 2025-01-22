import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { GoogleAuthService } from '../_services/google-auth.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: any = {
    username: null,
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  private readonly clientId = environment.googleClientId;

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
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
    
    this.googleAuthService.renderButton('googleSignUpBtn', {
      theme: "outline",
      size: "large",
      text: "signup_with",
      width: 250,
      type: "standard"
    });
  }

  onSubmit(): void {
    const { username, email, password } = this.form;

    this.authService.register(username, email, password).subscribe({
      next: data => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

  handleCredentialResponse(response: any) {
    this.authService.googleLogin(response.credential).subscribe({
      next: data => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

  handleOAuthSuccess(token: string): void {
    this.authService.validateOAuthToken(token).subscribe({
      next: data => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}
