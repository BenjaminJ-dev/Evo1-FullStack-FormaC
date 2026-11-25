package cl.elvolcan.exception;
public class NegocioException extends RuntimeException {
 public final int status; public final String codigo;
 public NegocioException(int status,String codigo,String mensaje) { super(mensaje); this.status=status; this.codigo=codigo; }
}