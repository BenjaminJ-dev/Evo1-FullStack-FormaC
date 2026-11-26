package cl.elvolcan.config;
import cl.elvolcan.repository.UsuarioRepository;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import java.util.List;
@Configuration
public class SeguridadConfig {
    @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
    @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){var roles=new JwtGrantedAuthoritiesConverter();roles.setAuthoritiesClaimName("roles");roles.setAuthorityPrefix("ROLE_");var c=new JwtAuthenticationConverter();c.setJwtGrantedAuthoritiesConverter(roles);return c;}
    @Bean SecurityFilterChain seguridad(HttpSecurity http,JwtAuthenticationConverter converter,UsuarioRepository usuarios) throws Exception {
        return http.cors(c->{}).csrf(c->c.disable()).headers(h->h.frameOptions(f->f.sameOrigin())).sessionManagement(c->c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a->a.requestMatchers("/swagger-ui/**","/swagger-ui.html","/v3/api-docs/**","/error","/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/v1/productos/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/v1/auth/registro","/api/v1/auth/login","/api/v1/auth/refresh","/api/v1/auth/logout").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMINISTRADOR").anyRequest().authenticated())
                .oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(jwt->{
                    var auth=converter.convert(jwt);
                    var u=usuarios.findByUsuario(jwt.getSubject()).filter(x->x.getActivo()).orElse(null);
                    if(u==null || !jwt.getClaimAsStringList("roles").contains(u.getRol().name()))throw new org.springframework.security.oauth2.core.OAuth2AuthenticationException("Usuario inactivo o rol modificado");
                    return auth;
                })))
                .exceptionHandling(e->e.accessDeniedHandler((req,res,x)->{res.setStatus(403);res.setContentType("application/problem+json");res.getWriter().write("{\"status\":403,\"code\":\"SIN_PERMISO\"}");})).build();
    }
    @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origin}") String origen){var c=new CorsConfiguration();c.setAllowedOrigins(List.of(origen));c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));c.setAllowedHeaders(List.of("Content-Type","Authorization"));var source=new UrlBasedCorsConfigurationSource();source.registerCorsConfiguration("/api/**",c);return source;}
}
