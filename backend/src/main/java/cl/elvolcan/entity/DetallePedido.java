package cl.elvolcan.entity;
import jakarta.persistence.*;
@org.hibernate.annotations.Check(constraints="cantidad between 1 and 4 and precio_unitario > 0")
@Entity
@Table(uniqueConstraints=@UniqueConstraint(columnNames={"pedido_id","producto_id"}))
public class DetallePedido {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 @ManyToOne(optional=false,fetch=FetchType.LAZY)
 private Pedido pedido;
 @ManyToOne(optional=false,fetch=FetchType.LAZY)
 private Producto producto;
 @Column(nullable=false)
 private int cantidad;
 @Column(nullable=false,length=150)
 private String nombreHistorico;
 @Column(nullable=false,precision=12,scale=0)
 private java.math.BigDecimal precioUnitario;
 @Column(nullable=false)
 private boolean cancelado;
 public DetallePedido() {}
 public Long getId() { return id; }
 public void setId(Long value) { this.id=value; }
 public Pedido getPedido() { return pedido; }
 public void setPedido(Pedido value) { this.pedido=value; }
 public Producto getProducto() { return producto; }
 public void setProducto(Producto value) { this.producto=value; }
 public int getCantidad() { return cantidad; }
 public void setCantidad(int value) { this.cantidad=value; }
 public String getNombreHistorico() { return nombreHistorico; }
 public void setNombreHistorico(String value) { this.nombreHistorico=value; }
 public java.math.BigDecimal getPrecioUnitario() { return precioUnitario; }
 public void setPrecioUnitario(java.math.BigDecimal value) { this.precioUnitario=value; }
 public boolean getCancelado() { return cancelado; }
 public void setCancelado(boolean value) { this.cancelado=value; }
}
