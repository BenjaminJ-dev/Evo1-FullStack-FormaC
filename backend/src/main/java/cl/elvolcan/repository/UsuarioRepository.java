package cl.elvolcan.repository;
import cl.elvolcan.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UsuarioRepository extends JpaRepository<Usuario,Long> { java.util.Optional<Usuario> findByUsuario(String usuario); boolean existsByUsuario(String usuario); }