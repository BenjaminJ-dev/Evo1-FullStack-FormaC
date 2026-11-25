package cl.elvolcan.entity;
import jakarta.persistence.*;
@org.hibernate.annotations.Check(constraints="stock_fisico >= 0")
@Entity

public class Inventario {
 @Id
 private String productoId;
 @OneToOne(optional=false) @MapsId @JoinColumn(name="producto_id")
 private Producto producto;
 @Column(nullable=false)
 private int stockFisico;
 @Version
 private Long version;
 public Inventario() {}
 public String getProductoId() { return productoId; }
 public void setProductoId(String value) { this.productoId=value; }
 public Producto getProducto() { return producto; }
 public void setProducto(Producto value) { this.producto=value; }
 public int getStockFisico() { return stockFisico; }
 public void setStockFisico(int value) { this.stockFisico=value; }
 public Long getVersion() { return version; }
 public void setVersion(Long value) { this.version=value; }
}
