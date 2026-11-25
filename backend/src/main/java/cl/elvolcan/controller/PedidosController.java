package cl.elvolcan.controller;
import cl.elvolcan.service.PedidosService;
import cl.elvolcan.dto.Contratos.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.net.URI;
import java.util.List;
@RestController @RequestMapping("/api/v1") @SecurityRequirement(name="bearerAuth")
public class PedidosController {
 private final PedidosService servicio;public PedidosController(PedidosService s){servicio=s;}
 @PostMapping("/pedidos") public ResponseEntity<PedidoVista> crear(@Valid @RequestBody CrearPedido d){var p=servicio.crear(d);return ResponseEntity.created(URI.create("/api/v1/pedidos/"+p.id())).body(p);}
 @GetMapping("/pedidos") public List<PedidoVista> todos(){return servicio.listar(false);}
 @GetMapping("/mis-pedidos") public List<PedidoVista> propios(){return servicio.listar(true);}
 @GetMapping("/pedidos/{id}") public PedidoVista obtener(@PathVariable Long id){return servicio.obtener(id);}
 @PatchMapping("/pedidos/{id}/estado") public PedidoVista avanzar(@PathVariable Long id,@Valid @RequestBody CambiarEstado d){return servicio.avanzar(id,d.estado());}
 @PatchMapping("/pedidos/{id}/cancelacion") public PedidoVista cancelar(@PathVariable Long id){return servicio.cancelar(id,null);}
 @PatchMapping("/pedidos/{id}/detalles/{detalleId}/cancelacion") public PedidoVista cancelarItem(@PathVariable Long id,@PathVariable Long detalleId){return servicio.cancelar(id,detalleId);}
}