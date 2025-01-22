To add Google OAuth2 to the project (Spring Boot + Angular), you need to add:

- Backend:

# pom.xml

	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-oauth2-client</artifactId>
	</dependency>

# WebSecurityConfig.java

- add this on public SecurityFilterChain filterChain(HttpSecurity http) throws Exception: 

        .authorizeHttpRequests(auth -> 
          auth.requestMatchers("/api/auth/**").permitAll()
              .requestMatchers("/api/test/**").permitAll()
              .requestMatchers("/oauth2/**").permitAll()
              .anyRequest().authenticated()
        )
        .oauth2Login(oauth2 -> oauth2
            .authorizationEndpoint()
            .baseUri("/oauth2/authorize")
            .and()
            .redirectionEndpoint()
            .baseUri("/oauth2/callback/*")
        );

# Application.properties

spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=email,profile

# OAuth2LoginSuccessHandler.java

Add this to send email on using Google OAuth to login.

- Frontend

# package.json

npm install @abacritt/angularx-social-login

# index.html

add this on html: <script src="https://accounts.google.com/gsi/client" async defer></script>

# auth.service.ts

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'google',
      {
        idToken
      },
      httpOptions
    );
  }

  validateOAuthToken(token: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'oauth2/validate',
      {
        token
      },
      httpOptions
    );
  }


# google-auth.service.ts

add the google-auth.service.ts


# environment.ts and environment.prod.ts

export const environment = {
    googleClientId: '---google-clientId'
  };


# login.component.ts

private readonly clientId = environment.googleClientId;

  constructor(
    private googleAuthService: GoogleAuthService
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
    
    this.googleAuthService.renderButton('googleBtn', {
      theme: "outline",
      size: "large",
      width: 250,
      type: "standard"
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


    <div class="social-login-divider">
      <span>or</span>
    </div>

    <div class="social-login">
      <div id="googleBtn"></div>
    </div>


# register.component.ts

private readonly clientId = environment.googleClientId;

constructor(
    private googleAuthService: GoogleAuthService
) { }

async ngOnInit(): Promise<void> {

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

    <div class="social-login-divider" *ngIf="!isSuccessful">
      <span>or</span>
    </div>

    <div class="social-login" *ngIf="!isSuccessful">
      <div id="googleSignUpBtn" class="google-btn-container">
        <div class="loading-placeholder">Loading Google Sign-In...</div>
      </div>
    </div>