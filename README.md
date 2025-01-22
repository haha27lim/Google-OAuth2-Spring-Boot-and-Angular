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

