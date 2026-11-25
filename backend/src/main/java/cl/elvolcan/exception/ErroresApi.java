package cl.elvolcan.exception;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.*;
@RestControllerAdvice
public class ErroresApi {
 @ExceptionHandler(NegocioException.class) public ProblemDetail negocio(NegocioException e) { return error(e.status,e.codigo,e.getMessage()); }
 @ExceptionHandler({MethodArgumentNotValidException.class,HttpMessageNotReadableException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class}) public ProblemDetail validar(Exception e) { return error(400,"DATOS_INVALIDOS","Revisa los campos y tipos enviados."); }
 @ExceptionHandler({DataIntegrityViolationException.class,ConcurrencyFailureException.class}) public ProblemDetail conflicto(Exception e) { return error(409,"CONFLICTO","La operacion entra en conflicto con los datos actuales. Actualiza e intenta nuevamente."); }
 private ProblemDetail error(int status,String codigo,String mensaje) { var p=ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(status),mensaje); p.setProperty("code",codigo);return p; }
}