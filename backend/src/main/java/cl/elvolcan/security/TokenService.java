package cl.elvolcan.security;
import cl.elvolcan.entity.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
@Service
public class TokenService {
 private final JwtEncoder encoder; private final String issuer; private final long minutes;
 public TokenService(JwtEncoder encoder,@Value("${app.jwt.issuer}") String issuer,@Value("${app.jwt.access-minutes}") long minutes){this.encoder=encoder;this.issuer=issuer;this.minutes=minutes;}
 public String generar(Usuario u){var now=Instant.now();var claims=JwtClaimsSet.builder().issuer(issuer).issuedAt(now).expiresAt(now.plus(minutes,ChronoUnit.MINUTES)).subject(u.getUsuario()).claim("roles",List.of(u.getRol().name())).build();return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims)).getTokenValue();}
}
