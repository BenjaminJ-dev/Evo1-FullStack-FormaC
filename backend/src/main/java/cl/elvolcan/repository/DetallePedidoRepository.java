package cl.elvolcan.repository;
import cl.elvolcan.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
public interface DetallePedidoRepository extends JpaRepository<DetallePedido,Long> {
 @Query("select coalesce(sum(d.cantidad),0) from DetallePedido d where d.producto.id=:id and d.cancelado=false and d.pedido.estado in :estados")
 long comprometido(@Param("id") String id,@Param("estados") Collection<EstadoPedido> estados);
}