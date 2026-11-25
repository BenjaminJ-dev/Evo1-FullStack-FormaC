package cl.elvolcan.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import cl.elvolcan.entity.*;
public final class Contratos {
 private Contratos() {}
 public record CrearProducto(@NotBlank @Pattern(regexp="[A-Z0-9_-]{1,40}") String id, @NotBlank @Size(max=150) String nombre, @NotBlank @Size(max=1000) String descripcion, @NotNull @DecimalMin("1") @Digits(integer=12,fraction=0) BigDecimal precio, @NotNull @Min(0) Integer stock) {}
 public record EditarProducto(@NotBlank @Size(max=150) String nombre, @NotBlank @Size(max=1000) String descripcion, @NotNull @DecimalMin("1") @Digits(integer=12,fraction=0) BigDecimal precio) {}
 public record ProductoVista(String id,String nombre,String descripcion,BigDecimal precio,boolean activo) {}
 public record StockVista(String id,String nombre,int total,long comprometido,long disponible) {}
 public record Registro(@NotBlank @Pattern(regexp="[a-zA-Z0-9_]{4,80}") String usuario,@NotBlank @Size(max=150) String nombre,@NotBlank @Size(min=6,max=72) String password) {}
 public record UsuarioVista(Long id,String usuario,String nombre,Rol rol) {}
 public record Linea(@NotBlank String productoId,@NotNull @Min(1) @Max(4) Integer cantidad,@NotNull @DecimalMin("1") @Digits(integer=12,fraction=0) BigDecimal precioEsperado) {}
 public record CrearPedido(@NotBlank @Size(max=150) String nombre,@NotBlank @Pattern(regexp="[0-9]{9}") String telefono,@NotBlank @Size(max=300) String direccion,@NotEmpty @Size(max=4) List<@NotNull @Valid Linea> items) {}
 public record CambiarEstado(@NotNull EstadoPedido estado) {}
 public record DetalleVista(Long id,String cilindro,String nombre,int cantidad,BigDecimal precioUnitario,boolean cancelado) {}
 public record PedidoVista(Long id,String usuario,String nombre,String telefono,String direccion,EstadoPedido estado,Instant fecha,List<DetalleVista> items,BigDecimal total) {}
}