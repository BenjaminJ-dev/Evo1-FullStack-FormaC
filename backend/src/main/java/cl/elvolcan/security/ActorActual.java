package cl.elvolcan.security;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.UsuarioRepository;
import cl.elvolcan.exception.NegocioException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
@Component
public class ActorActual {
 private final UsuarioRepository usuarios;
 public ActorActual(UsuarioRepository usuarios) { this.usuarios=usuarios; }
 public Usuario usuario() {
  var a=SecurityContextHolder.getContext().getAuthentication();
  if(a==null || !a.isAuthenticated()) throw new NegocioException(401,"SIN_SESION","Autenticacion requerida.");
  return usuarios.findByUsuario(a.getName()).filter(Usuario::getActivo).orElseThrow(()->new NegocioException(401,"SIN_SESION","Autenticacion requerida."));
 }
 public Usuario exigir(Rol... roles) { var u=usuario(); for(var r:roles) if(u.getRol()==r)return u; throw new NegocioException(403,"SIN_PERMISO","Rol no autorizado."); }
}