package cl.elvolcan.repository;
import cl.elvolcan.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductoRepository extends JpaRepository<Producto,String> { @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select e from Producto e where e.id = :id")
 java.util.Optional<Producto> bloquear(@org.springframework.data.repository.query.Param("id") String id); }