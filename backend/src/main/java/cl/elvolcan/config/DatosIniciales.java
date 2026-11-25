package cl.elvolcan.config;
import cl.elvolcan.dto.Contratos.CrearProducto;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.*;
import cl.elvolcan.service.ProductosService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
@Component
public class DatosIniciales implements CommandLineRunner {
 private final ProductosService productos;private final ProductoRepository repo;private final UsuarioRepository usuarios;private final PasswordEncoder encoder;private final String adminPassword;private final String operadorPassword;
 public DatosIniciales(ProductosService p,ProductoRepository r,UsuarioRepository u,PasswordEncoder e,@Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String a,@Value("${BOOTSTRAP_OPERADOR_PASSWORD:}") String o){productos=p;repo=r;usuarios=u;encoder=e;adminPassword=a;operadorPassword=o;}
 @Override @Transactional public void run(String... args){
  inicial("5KG","Ideal para uso residencial",6000,25);inicial("11KG","Cilindro estandar para el hogar",11000,30);inicial("15KG","Para hogares de mayor consumo",14500,20);inicial("45KG","Uso comercial",40000,8);
  cuenta("admin",Rol.ADMINISTRADOR,adminPassword);cuenta("operador",Rol.OPERADOR,operadorPassword);
 }
 private void inicial(String id,String descripcion,int precio,int stock){if(!repo.existsById(id))productos.insertar(new CrearProducto(id,"Cilindro GLP "+id,descripcion,BigDecimal.valueOf(precio),stock));}
 private void cuenta(String nombre,Rol rol,String password){if(password.isBlank()||usuarios.existsByUsuario(nombre))return;if(password.length()<6)throw new IllegalArgumentException("La clave inicial debe tener al menos seis caracteres");var u=new Usuario();u.setUsuario(nombre);u.setNombre(nombre);u.setRol(rol);u.setActivo(true);u.setPasswordHash(encoder.encode(password));usuarios.save(u);}
}