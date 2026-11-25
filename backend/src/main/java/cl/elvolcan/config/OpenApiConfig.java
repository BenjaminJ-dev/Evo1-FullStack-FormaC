package cl.elvolcan.config;
import org.springframework.context.annotation.*;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
@Configuration
public class OpenApiConfig {
 @Bean OpenAPI api(){return new OpenAPI().info(new Info().title("Distribuidora de Gas El Volcan").version("2.0").description("API protegida con Bearer JWT; catálogo y registro públicos."))
 .components(new Components().addSecuritySchemes("bearerAuth",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
 .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
 }
}
