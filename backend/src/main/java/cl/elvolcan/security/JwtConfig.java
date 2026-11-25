package cl.elvolcan.security;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
@Configuration
public class JwtConfig {
 @Bean SecretKey jwtSecretKey(@Value("${app.jwt.secret}") String secret){
  if(secret.getBytes(StandardCharsets.UTF_8).length<32)throw new IllegalStateException("JWT_SECRET requiere al menos 32 bytes");
  return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256");
 }
 @Bean JwtEncoder jwtEncoder(SecretKey key){return new NimbusJwtEncoder(new ImmutableSecret<>(key));}
 @Bean JwtDecoder jwtDecoder(SecretKey key,@Value("${app.jwt.issuer}") String issuer){
  var decoder=NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
  decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));return decoder;
 }
}
