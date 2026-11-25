package cl.elvolcan.entity;
import jakarta.persistence.*;
@Entity

public class Pedido {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 @ManyToOne(optional=false,fetch=FetchType.LAZY)
 private Usuario usuario;
 @Column(nullable=false,length=150)
 private String nombre;
 @Column(nullable=false,length=9)
 private String telefono;
 @Column(nullable=false,length=300)
 private String direccion;
 @Enumerated(EnumType.STRING) @Column(nullable=false)
 private EstadoPedido estado;
 @Column(nullable=false)
 private java.time.Instant fecha;
 @OneToMany(mappedBy="pedido",cascade=CascadeType.ALL) @OrderBy("id ASC")
 private java.util.List<DetallePedido> items = new java.util.ArrayList<>();
 @Version
 private Long version;
 public Pedido() {}
 public Long getId() { return id; }
 public void setId(Long value) { this.id=value; }
 public Usuario getUsuario() { return usuario; }
 public void setUsuario(Usuario value) { this.usuario=value; }
 public String getNombre() { return nombre; }
 public void setNombre(String value) { this.nombre=value; }
 public String getTelefono() { return telefono; }
 public void setTelefono(String value) { this.telefono=value; }
 public String getDireccion() { return direccion; }
 public void setDireccion(String value) { this.direccion=value; }
 public EstadoPedido getEstado() { return estado; }
 public void setEstado(EstadoPedido value) { this.estado=value; }
 public java.time.Instant getFecha() { return fecha; }
 public void setFecha(java.time.Instant value) { this.fecha=value; }
 public java.util.List<DetallePedido> getItems() { return items; }
 public void setItems(java.util.List<DetallePedido> value) { this.items=value; }
 public Long getVersion() { return version; }
 public void setVersion(Long value) { this.version=value; }
}
