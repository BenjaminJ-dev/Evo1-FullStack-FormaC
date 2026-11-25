package cl.elvolcan.entity;
import jakarta.persistence.*;
@org.hibernate.annotations.Check(constraints="precio > 0")
@Entity

public class Producto {
 @Id @Column(length=40,updatable=false)
 private String id;
 @Column(nullable=false,length=150)
 private String nombre;
 @Column(nullable=false,length=1000)
 private String descripcion;
 @Column(nullable=false,precision=12,scale=0)
 private java.math.BigDecimal precio;
 @Column(nullable=false)
 private boolean activo;
 @Version
 private Long version;
 public Producto() {}
 public String getId() { return id; }
 public void setId(String value) { this.id=value; }
 public String getNombre() { return nombre; }
 public void setNombre(String value) { this.nombre=value; }
 public String getDescripcion() { return descripcion; }
 public void setDescripcion(String value) { this.descripcion=value; }
 public java.math.BigDecimal getPrecio() { return precio; }
 public void setPrecio(java.math.BigDecimal value) { this.precio=value; }
 public boolean getActivo() { return activo; }
 public void setActivo(boolean value) { this.activo=value; }
 public Long getVersion() { return version; }
 public void setVersion(Long value) { this.version=value; }
}
