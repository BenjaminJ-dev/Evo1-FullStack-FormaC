package cl.elvolcan.service;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.*;
import cl.elvolcan.dto.Contratos.*;
import cl.elvolcan.exception.NegocioException;
import cl.elvolcan.security.ActorActual;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service @Transactional
public class UsuariosService {
 private final UsuarioRepository usuarios;private final PasswordEncoder encoder;private final ActorActual actor;
 public UsuariosService(UsuarioRepository u,PasswordEncoder e,ActorActual a){usuarios=u;encoder=e;actor=a;}
 public static UsuarioVista vista(Usuario u){return new UsuarioVista(u.getId(),u.getUsuario(),u.getNombre(),u.getRol());}
 public UsuarioVista registrar(Registro d){
  if(d.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw new NegocioException(400,"PASSWORD_LARGO","La clave excede 72 bytes UTF-8.");
  if(usuarios.existsByUsuario(d.usuario()))throw new NegocioException(409,"USUARIO_EXISTE","Usuario ya registrado.");
  var u=new Usuario();u.setUsuario(d.usuario());u.setNombre(d.nombre().trim());u.setPasswordHash(encoder.encode(d.password()));u.setRol(Rol.CLIENTE);u.setActivo(true);return vista(usuarios.save(u));
 }
 @Transactional(readOnly=true) public List<UsuarioVista> listar(){actor.exigir(Rol.ADMINISTRADOR);return usuarios.findAll().stream().map(UsuariosService::vista).toList();}
 public UsuarioVista actual(){return vista(actor.usuario());}
}