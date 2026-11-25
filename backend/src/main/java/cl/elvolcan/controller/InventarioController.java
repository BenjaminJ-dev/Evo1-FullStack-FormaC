package cl.elvolcan.controller;
import cl.elvolcan.service.InventarioService;
import cl.elvolcan.dto.Contratos.StockVista;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
@RestController @RequestMapping("/api/v1/inventario") @SecurityRequirement(name="bearerAuth")
public class InventarioController {
 private final InventarioService servicio;public InventarioController(InventarioService s){servicio=s;}
 @GetMapping public List<StockVista> listar(){return servicio.listar();}
}