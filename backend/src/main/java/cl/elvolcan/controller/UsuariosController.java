package cl.elvolcan.controller;
import cl.elvolcan.service.UsuariosService;
import cl.elvolcan.dto.Contratos.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
@RestController @RequestMapping("/api/v1")
public class UsuariosController {
 private final UsuariosService servicio;public UsuariosController(UsuariosService s){servicio=s;}
 @PostMapping("/auth/registro") public ResponseEntity<UsuarioVista> registrar(@Valid @RequestBody Registro d){return ResponseEntity.status(201).body(servicio.registrar(d));}
 @SecurityRequirement(name="bearerAuth") @GetMapping("/auth/me") public UsuarioVista actual(){return servicio.actual();}
 @SecurityRequirement(name="bearerAuth") @GetMapping("/admin/usuarios") public List<UsuarioVista> todos(){return servicio.listar();}
}