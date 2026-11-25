package cl.elvolcan.repository;
import cl.elvolcan.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
public interface InventarioRepository extends JpaRepository<Inventario,String> { @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select e from Inventario e where e.productoId = :id")
 java.util.Optional<Inventario> bloquear(@org.springframework.data.repository.query.Param("id") String id); }