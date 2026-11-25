package cl.elvolcan.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="refresh_tokens")
public class RefreshToken {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true,length=64) private String tokenHash;
 @ManyToOne(optional=false) private Usuario usuario;
 @Column(nullable=false) private Instant expiraEn;
 public Long getId(){return id;}
 public String getTokenHash(){return tokenHash;}
 public void setTokenHash(String v){tokenHash=v;}
 public Usuario getUsuario(){return usuario;}
 public void setUsuario(Usuario v){usuario=v;}
 public Instant getExpiraEn(){return expiraEn;}
 public void setExpiraEn(Instant v){expiraEn=v;}
}
