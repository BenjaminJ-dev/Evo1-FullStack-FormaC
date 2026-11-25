package cl.elvolcan.repository;
import cl.elvolcan.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PedidoRepository extends JpaRepository<Pedido,Long> { @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select e from Pedido e where e.id = :id")
 java.util.Optional<Pedido> bloquear(@org.springframework.data.repository.query.Param("id") Long id); }