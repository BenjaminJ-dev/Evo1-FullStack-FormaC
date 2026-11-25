package cl.elvolcan.controller;
import cl.elvolcan.service.ProductosService;
import cl.elvolcan.dto.Contratos.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.net.URI;
import java.util.List;
@RestController @RequestMapping("/api/v1")
public class ProductosController {
 private final ProductosService servicio;public ProductosController(ProductosService s){servicio=s;}
 @GetMapping("/productos") public List<ProductoVista> productos(){return servicio.listar(false);}
 @GetMapping("/productos/{id}") public ProductoVista producto(@PathVariable String id){return servicio.obtener(id);}
 @SecurityRequirement(name="bearerAuth") @GetMapping("/admin/productos") public List<ProductoVista> todos(){return servicio.listar(true);}
 @SecurityRequirement(name="bearerAuth") @PostMapping("/admin/productos") public ResponseEntity<ProductoVista> crear(@Valid @RequestBody CrearProducto d){var p=servicio.crear(d);return ResponseEntity.created(URI.create("/api/v1/productos/"+p.id())).body(p);}
 @SecurityRequirement(name="bearerAuth") @PutMapping("/admin/productos/{id}") public ProductoVista editar(@PathVariable String id,@Valid @RequestBody EditarProducto d){return servicio.editar(id,d);}
 @Operation(summary="Desactivar producto sin eliminar historial ni inventario") @SecurityRequirement(name="bearerAuth") @DeleteMapping("/admin/productos/{id}") public ResponseEntity<Void> eliminar(@PathVariable String id){servicio.desactivar(id);return ResponseEntity.noContent().build();}
}