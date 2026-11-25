package cl.elvolcan.controller;
import cl.elvolcan.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
 public record Login(@NotBlank String usuario,@NotBlank String password) {}
 public record Refresh(@NotBlank String refreshToken) {}
 private final AuthService auth;
 public AuthController(AuthService a){auth=a;}
 @PostMapping("/login") public AuthService.Tokens login(@Valid @RequestBody Login d){return auth.login(d.usuario(),d.password());}
 @PostMapping("/refresh") public AuthService.Tokens renovar(@Valid @RequestBody Refresh d){return auth.renovar(d.refreshToken());}
 @PostMapping("/logout") public ResponseEntity<Void> salir(@Valid @RequestBody Refresh d){auth.logout(d.refreshToken());return ResponseEntity.noContent().build();}
}
