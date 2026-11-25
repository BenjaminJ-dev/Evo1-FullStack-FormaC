package cl.elvolcan.service;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.*;
import cl.elvolcan.dto.Contratos.*;
import cl.elvolcan.exception.NegocioException;
import cl.elvolcan.security.ActorActual;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.util.*;
import java.math.BigDecimal;
import java.time.Instant;
@Service @Transactional(isolation=Isolation.READ_COMMITTED)
public class PedidosService {
 private final PedidoRepository pedidos;private final ProductoRepository productos;private final InventarioRepository inventarios;private final InventarioService stock;private final ActorActual actor;
 public PedidosService(PedidoRepository p,ProductoRepository pr,InventarioRepository i,InventarioService s,ActorActual a){pedidos=p;productos=pr;inventarios=i;stock=s;actor=a;}
 private NegocioException conflicto(String codigo,String mensaje){return new NegocioException(409,codigo,mensaje);}
 // Todas las mutaciones bloquean producto e inventario por ID ascendente antes de consultar reservas.
 private Map<String,Inventario> bloquear(Collection<String> ids){
  Map<String,Inventario> resultado=new LinkedHashMap<>();
  for(String id:new TreeSet<>(ids)){
   productos.bloquear(id).orElseThrow(()->new NegocioException(404,"NO_EXISTE","Producto inexistente."));
   resultado.put(id,inventarios.bloquear(id).orElseThrow(()->conflicto("SIN_INVENTARIO","Inventario no configurado.")));
  }return resultado;
 }
 public PedidoVista crear(CrearPedido d){
  var usuario=actor.exigir(Rol.CLIENTE);
  if(d.items().isEmpty() || d.items().stream().mapToInt(Linea::cantidad).sum()>4 || d.items().stream().anyMatch(i->i.cantidad()<1))throw new NegocioException(400,"MAXIMO_CILINDROS","Selecciona entre uno y cuatro cilindros.");
  var ids=d.items().stream().map(Linea::productoId).toList();
  if(new HashSet<>(ids).size()!=ids.size())throw new NegocioException(400,"PRODUCTO_DUPLICADO","Agrupa las cantidades por producto.");
  var almacen=bloquear(ids);
  var pedido=new Pedido();pedido.setUsuario(usuario);pedido.setNombre(d.nombre().trim());pedido.setTelefono(d.telefono());pedido.setDireccion(d.direccion().trim());pedido.setFecha(Instant.now());pedido.setEstado(EstadoPedido.PENDIENTE);
  for(var linea:d.items()){
   var inv=almacen.get(linea.productoId());var p=inv.getProducto();
   if(!p.getActivo())throw conflicto("PRODUCTO_INACTIVO","Producto inactivo: "+p.getId());
   if(p.getPrecio().compareTo(linea.precioEsperado())!=0)throw conflicto("PRECIO_CAMBIADO","Actualiza el precio de "+p.getId()+" y confirma nuevamente.");
   if(inv.getStockFisico()-stock.comprometido(p.getId())<linea.cantidad())throw conflicto("SIN_STOCK","Stock insuficiente: "+p.getId());
   var detalle=new DetallePedido();detalle.setPedido(pedido);detalle.setProducto(p);detalle.setCantidad(linea.cantidad());detalle.setNombreHistorico(p.getNombre());detalle.setPrecioUnitario(p.getPrecio());pedido.getItems().add(detalle);
  }
  return vista(pedidos.saveAndFlush(pedido));
 }
 public static PedidoVista vista(Pedido p){
  var items=p.getItems().stream().map(d->new DetalleVista(d.getId(),d.getProducto().getId(),d.getNombreHistorico(),d.getCantidad(),d.getPrecioUnitario(),d.getCancelado())).toList();
  BigDecimal total=p.getItems().stream().filter(d->!d.getCancelado()).map(d->d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()))).reduce(BigDecimal.ZERO,BigDecimal::add);
  return new PedidoVista(p.getId(),p.getUsuario().getUsuario(),p.getNombre(),p.getTelefono(),p.getDireccion(),p.getEstado(),p.getFecha(),items,total);
 }
 @Transactional(readOnly=true) public List<PedidoVista> listar(boolean propios){
  var u=propios?actor.exigir(Rol.CLIENTE):actor.exigir(Rol.OPERADOR,Rol.ADMINISTRADOR);
  return pedidos.findAll().stream().filter(p->!propios||p.getUsuario().getId().equals(u.getId())).sorted(Comparator.comparing(Pedido::getId).reversed()).map(PedidosService::vista).toList();
 }
 private void autorizar(Pedido p,boolean consulta){var u=actor.usuario();if(u.getRol()==Rol.OPERADOR || (consulta&&u.getRol()==Rol.ADMINISTRADOR))return;if(u.getRol()==Rol.CLIENTE&&p.getUsuario().getId().equals(u.getId()))return;throw new NegocioException(403,"SIN_PERMISO","Pedido no autorizado.");}
 @Transactional(readOnly=true) public PedidoVista obtener(Long id){var p=pedidos.findById(id).orElseThrow(()->new NegocioException(404,"NO_EXISTE","Pedido inexistente."));autorizar(p,true);return vista(p);}
 private Pedido bloquearPedido(Long id){return pedidos.bloquear(id).orElseThrow(()->new NegocioException(404,"NO_EXISTE","Pedido inexistente."));}
 public PedidoVista cancelar(Long id,Long detalleId){
  var p=bloquearPedido(id);autorizar(p,false);
  if(p.getEstado()!=EstadoPedido.PENDIENTE)throw conflicto("ESTADO_INVALIDO","Solo se cancela mientras esta pendiente.");
  bloquear(p.getItems().stream().map(d->d.getProducto().getId()).toList());
  var seleccion=p.getItems().stream().filter(d->detalleId==null||d.getId().equals(detalleId)).toList();
  if(seleccion.isEmpty())throw new NegocioException(404,"NO_EXISTE","Detalle inexistente.");
  seleccion.forEach(d->d.setCancelado(true));if(p.getItems().stream().allMatch(DetallePedido::getCancelado))p.setEstado(EstadoPedido.CANCELADO);
  return vista(p);
 }
 public PedidoVista avanzar(Long id,EstadoPedido destino){
  actor.exigir(Rol.OPERADOR);var p=bloquearPedido(id);
  if(!((p.getEstado()==EstadoPedido.PENDIENTE&&destino==EstadoPedido.EN_CAMINO)||(p.getEstado()==EstadoPedido.EN_CAMINO&&destino==EstadoPedido.ENTREGADO)))throw conflicto("ESTADO_INVALIDO","Transicion de estado no permitida.");
  var almacen=bloquear(p.getItems().stream().map(d->d.getProducto().getId()).toList());
  if(destino==EstadoPedido.ENTREGADO)for(var d:p.getItems())if(!d.getCancelado()){
   var inv=almacen.get(d.getProducto().getId());if(inv.getStockFisico()<d.getCantidad())throw conflicto("SIN_STOCK","Stock fisico inconsistente.");inv.setStockFisico(inv.getStockFisico()-d.getCantidad());
  }
  p.setEstado(destino);return vista(p);
 }
}