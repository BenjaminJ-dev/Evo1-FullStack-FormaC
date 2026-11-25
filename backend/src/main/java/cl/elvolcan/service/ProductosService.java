package cl.elvolcan.service;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.*;
import cl.elvolcan.dto.Contratos.*;
import cl.elvolcan.exception.NegocioException;
import cl.elvolcan.security.ActorActual;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service @Transactional
public class ProductosService {
 private final ProductoRepository productos; private final InventarioRepository inventarios; private final ActorActual actor;
 public ProductosService(ProductoRepository p,InventarioRepository i,ActorActual a){productos=p;inventarios=i;actor=a;}
 public static ProductoVista vista(Producto p){return new ProductoVista(p.getId(),p.getNombre(),p.getDescripcion(),p.getPrecio(),p.getActivo());}
 @Transactional(readOnly=true) public List<ProductoVista> listar(boolean todos){if(todos)actor.exigir(Rol.ADMINISTRADOR);return productos.findAll().stream().filter(p->todos||p.getActivo()).map(ProductosService::vista).toList();}
 @Transactional(readOnly=true) public ProductoVista obtener(String id){return productos.findById(id).filter(Producto::getActivo).map(ProductosService::vista).orElseThrow(()->new NegocioException(404,"NO_EXISTE","Producto no disponible."));}
 public ProductoVista crear(CrearProducto d){actor.exigir(Rol.ADMINISTRADOR);return insertar(d);}
 public ProductoVista insertar(CrearProducto d){
  if(productos.existsById(d.id()))throw new NegocioException(409,"ID_DUPLICADO","Identificador existente.");
  var p=new Producto();p.setId(d.id());p.setNombre(d.nombre().trim());p.setDescripcion(d.descripcion().trim());p.setPrecio(d.precio());p.setActivo(true);productos.saveAndFlush(p);
  var i=new Inventario();i.setProducto(p);i.setStockFisico(d.stock());inventarios.save(i);return vista(p);
 }
 public ProductoVista editar(String id,EditarProducto d){actor.exigir(Rol.ADMINISTRADOR);var p=bloquear(id);p.setNombre(d.nombre().trim());p.setDescripcion(d.descripcion().trim());p.setPrecio(d.precio());return vista(p);}
 public void desactivar(String id){actor.exigir(Rol.ADMINISTRADOR);bloquear(id).setActivo(false);}
 private Producto bloquear(String id){return productos.bloquear(id).orElseThrow(()->new NegocioException(404,"NO_EXISTE","Producto inexistente."));}
}