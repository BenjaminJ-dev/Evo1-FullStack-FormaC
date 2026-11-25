package cl.elvolcan.service;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.*;
import cl.elvolcan.dto.Contratos.*;
import cl.elvolcan.security.ActorActual;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
public class InventarioService {
 private final InventarioRepository inventarios;private final DetallePedidoRepository detalles;private final ActorActual actor;
 public InventarioService(InventarioRepository i,DetallePedidoRepository d,ActorActual a){inventarios=i;detalles=d;actor=a;}
 public long comprometido(String id){return detalles.comprometido(id,List.of(EstadoPedido.PENDIENTE,EstadoPedido.EN_CAMINO));}
 @Transactional(readOnly=true) public List<StockVista> listar(){actor.exigir(Rol.OPERADOR,Rol.ADMINISTRADOR);return inventarios.findAll().stream().map(i->{long c=comprometido(i.getProductoId());return new StockVista(i.getProductoId(),i.getProducto().getNombre(),i.getStockFisico(),c,i.getStockFisico()-c);}).toList();}
}