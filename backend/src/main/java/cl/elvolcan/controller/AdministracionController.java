package cl.elvolcan.controller;
import cl.elvolcan.service.IndicadoresService;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.Map;
@RestController @RequestMapping("/api/v1/admin/indicadores") @SecurityRequirement(name="bearerAuth")
public class AdministracionController {
 private final IndicadoresService servicio;public AdministracionController(IndicadoresService s){servicio=s;}
 @GetMapping public Map<String,Object> obtener(){return servicio.obtener();}
}