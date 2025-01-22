package main.java.com.example.spring.login.security.oauth2;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import com.example.spring.login.security.jwt.JwtUtils;
import com.example.spring.login.repository.UserRepository;
import com.example.spring.login.models.User;
import com.example.spring.login.models.ERole;
import com.example.spring.login.models.Role;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashSet;
import java.util.Set;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");


        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(email);
                    newUser.setPassword(""); 

                    Set<Role> roles = new HashSet<>();
                    Role userRole = new Role();
                    userRole.setName(ERole.ROLE_USER);
                    roles.add(userRole);
                    newUser.setRoles(roles);
                    
                    return userRepository.save(newUser);
                });

        String token = jwtUtils.generateTokenFromEmail(email);
        
        String redirectUrl = "http://localhost:4200/login?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
} 
