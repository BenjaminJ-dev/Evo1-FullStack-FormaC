package cl.elvolcan.service;
import cl.elvolcan.repository.*;
import cl.elvolcan.entity.*;
import cl.elvolcan.security.ActorActual;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.math.BigDecimal;
@Service
public class IndicadoresService {
 private final ProductoRepository productos;private final PedidoRepository pedidos;private final UsuarioRepository usuarios;private final ActorActual actor;private final InventarioService inventario;
 public IndicadoresService(ProductoRepository p,PedidoRepository pe,UsuarioRepository u,ActorActual a,InventarioService i){productos=p;pedidos=pe;usuarios=u;actor=a;inventario=i;}
 @Transactional(readOnly=true) public Map<String,Object> obtener(){actor.exigir(Rol.ADMINISTRADOR);var lista=pedidos.findAll();Map<String,Object> r=new LinkedHashMap<>();r.put("productosActivos",productos.findAll().stream().filter(Producto::getActivo).count());r.put("clientesRegistrados",usuarios.findAll().stream().filter(u->u.getRol()==Rol.CLIENTE).count());for(var e:EstadoPedido.values())r.put(e.name(),lista.stream().filter(p->p.getEstado()==e).count());r.put("stockDisponible",inventario.listar().stream().mapToLong(i->i.disponible()).sum());r.put("montoPedidosEntregados",lista.stream().filter(p->p.getEstado()==EstadoPedido.ENTREGADO).map(p->PedidosService.vista(p).total()).reduce(BigDecimal.ZERO,BigDecimal::add));r.put("nota","El monto entregado no representa pagos cobrados.");return r;}
}