package cl.elvolcan.entity;
import jakarta.persistence.*;
@Entity
@Table(name="usuarios")
public class Usuario {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 @Column(nullable=false,unique=true,length=80)
 private String usuario;
 @Column(nullable=false,length=150)
 private String nombre;
 @Column(nullable=false)
 private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false)
 private Rol rol;
 @Column(nullable=false)
 private boolean activo;
 public Usuario() {}
 public Long getId() { return id; }
 public void setId(Long value) { this.id=value; }
 public String getUsuario() { return usuario; }
 public void setUsuario(String value) { this.usuario=value; }
 public String getNombre() { return nombre; }
 public void setNombre(String value) { this.nombre=value; }
 public String getPasswordHash() { return passwordHash; }
 public void setPasswordHash(String value) { this.passwordHash=value; }
 public Rol getRol() { return rol; }
 public void setRol(Rol value) { this.rol=value; }
 public boolean getActivo() { return activo; }
 public void setActivo(boolean value) { this.activo=value; }
}
