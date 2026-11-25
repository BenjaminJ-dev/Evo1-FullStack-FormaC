package cl.elvolcan.service;
import cl.elvolcan.entity.*;
import cl.elvolcan.repository.*;
import cl.elvolcan.security.TokenService;
import cl.elvolcan.exception.NegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;
@Service
public class AuthService {
 public record Tokens(String accessToken,String refreshToken,String username,String nombre,String rol) {}
 private final UsuarioRepository usuarios;private final RefreshTokenRepository refresh;private final PasswordEncoder encoder;private final TokenService tokens;private final long days;
 public AuthService(UsuarioRepository u,RefreshTokenRepository r,PasswordEncoder e,TokenService t,@Value("${app.jwt.refresh-days}") long days){usuarios=u;refresh=r;encoder=e;tokens=t;this.days=days;}
 @Transactional public Tokens login(String username,String password){
  var u=usuarios.findByUsuario(username).filter(Usuario::getActivo).filter(x->encoder.matches(password,x.getPasswordHash())).orElseThrow(()->new NegocioException(401,"CREDENCIALES_INVALIDAS","Usuario o contraseña incorrectos."));return emitir(u);
 }
 @Transactional(noRollbackFor=NegocioException.class) public Tokens renovar(String raw){
  var actual=refresh.findByTokenHash(hash(raw)).orElseThrow(()->new NegocioException(401,"REFRESH_INVALIDO","Sesión no válida."));
  var u=actual.getUsuario();var expira=actual.getExpiraEn();refresh.delete(actual);refresh.flush();
  if(!expira.isAfter(Instant.now())||!u.getActivo())throw new NegocioException(401,"REFRESH_INVALIDO","Sesión no válida.");
  return emitir(u);
 }
 @Transactional public void logout(String raw){refresh.findByTokenHash(hash(raw)).ifPresent(refresh::delete);}
 private Tokens emitir(Usuario u){var raw=UUID.randomUUID().toString()+UUID.randomUUID();var t=new RefreshToken();t.setTokenHash(hash(raw));t.setUsuario(u);t.setExpiraEn(Instant.now().plus(days,ChronoUnit.DAYS));refresh.save(t);return new Tokens(tokens.generar(u),raw,u.getUsuario(),u.getNombre(),u.getRol().name());}
 private static String hash(String raw){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
}
