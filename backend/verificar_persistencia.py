"""Prueba de humo del JAR contra H2 en archivo temporal, sin tocar data/."""
import json, os, secrets, subprocess, tempfile, time, urllib.request, urllib.error
from pathlib import Path
java = str(Path(os.environ['JAVA_HOME']) / 'bin/java.exe')
jar = Path(__file__).resolve().parent / 'target/backend-0.1.0.jar'
with tempfile.TemporaryDirectory(prefix='elvolcan-') as directory:
    env = dict(os.environ)
    password = secrets.token_urlsafe(24)
    env['BOOTSTRAP_ADMIN_PASSWORD'] = password
    env['JWT_SECRET'] = secrets.token_urlsafe(48)
    env['DB_URL'] = 'jdbc:h2:file:' + str(Path(directory) / 'prueba').replace('\\', '/') + ';WRITE_DELAY=0'
    base = 'http://127.0.0.1:18081'
    def request(path, method='GET', data=None, token=None):
        headers = {'Content-Type':'application/json'}
        if token: headers['Authorization']='Bearer '+token
        req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=headers,method=method)
        with urllib.request.urlopen(req,timeout=4) as response:
            body=response.read()
            return response.status,json.loads(body) if body and 'json' in response.headers.get('Content-Type','') else body
    for iteration in range(2):
        with open(Path(directory)/('arranque'+str(iteration)+'.log'),'w') as log:
            proc=subprocess.Popen([java,'-jar',str(jar),'--server.port=18081'],cwd=directory,env=env,stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
            try:
                for attempt in range(90):
                    try:
                        request('/api/v1/productos'); break
                    except (urllib.error.URLError,TimeoutError):
                        if proc.poll() is not None: raise RuntimeError('El backend no arranco; revisar log')
                        time.sleep(.5)
                else: raise RuntimeError('Tiempo agotado al iniciar')
                if iteration==0:
                    assert request('/swagger-ui/index.html')[0]==200
                    assert 'paths' in request('/v3/api-docs')[1]
                    assert len(request('/api/v1/productos')[1])==4
                    token=request('/api/v1/auth/login','POST',{'usuario':'admin','password':password})[1]['accessToken']
                    assert request('/api/v1/admin/productos/5KG','PUT',{'nombre':'Nombre persistido','descripcion':'Descripcion persistida','precio':6500},token)[0]==200
                else:
                    product=request('/api/v1/productos/5KG')[1]
                    assert product['nombre']=='Nombre persistido' and product['precio']==6500
                    assert len(request('/api/v1/productos')[1])==4
                    token=request('/api/v1/auth/login','POST',{'usuario':'admin','password':password})[1]['accessToken']
                    assert request('/api/v1/inventario',token=token)[0]==200
            finally:
                proc.terminate();proc.wait(timeout=20)
    print('OK: JAR, HTTP, Swagger, H2 en archivo y persistencia tras reinicio; semilla no sobrescribe.')
