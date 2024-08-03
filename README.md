# iframe communication

Ejemplo de comunicación entre un iframe que carga un contenido de un dominio diferente al de la ventana que lo aloja.

### Escenario

Supóngase una página servida por el dominio `A.com` que contiene un iframe. El contenido de este iframe es obtenido desde otro dominio diferente `B.com`. Esta página servida por `B.com` pretende leer o alterar una variable o un elemento del DOM de la ventana padre.

![](/doc/image.jpg)


### Problema

Supongamos que la ventana padre tiene declarada una variable:
```javascript
var foo = 5
```

La página cargada en el iframe podría leer o modificar dicha variable a través del objeto *parent*, que hace referencia a la ventana que lo embebe.

```javascript
parent.foo = 3
```

Esto funciona siempre que tanto la ventana padre como el contenido del iframe sean servidos por el mismo dominio, el cual **no es nuestro caso**. Intentar lo anterior en el escenario planteado sería en vano y provocaría un error de *same-origin-policy*. Si el dominio `A.com` me ha servido la página padre, el navegador no permite que una página o script obtenidos de otro dominio como `B.com` accedan o manipulen el contexto de la primera, ya que las implicaciones de seguridad son obvias.


### Solución nativa

La documentación de Mozilla explica:

> *The `window.postMessage()` method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.*

Es decir, el método *postMessage* es el mecanismo moderno y recomendado para comunicar ventanas, pestañas o iframes de manera segura, utilizando un patrón publicador/suscriptor.

#### Ejemplo

![](/doc/ejemplo.gif)

#### Código de la ventana principal:

```html
<h4>Valor escrito en el iframe: <span></span></h4>

<iframe name="mywindow" frameborder="1" style="margin-bottom: 2em;"></iframe>

<form action="http://localhost:3000" method="get" target="mywindow">
    <button type="submit">Cargar iframe</button>
</form>

<script>

  window.addEventListener('message', event => {

    if (event.origin != 'http://localhost:3000') { return }

    console.log("Mensaje de iframe recibido: " + event.data);
    const data = JSON.parse(event.data);
    console.log(data);

    document.querySelector('span').innerHTML = data.inputValue;
  });

</script>
```

#### Código de la página cargada en el iframe

```html
    <input type="text" placeholder="Escribe aquí un valor">
    <button onclick="sendValue()">Enviar al parent</button>

    <script>

      const sendValue = () => {

        const value = document.querySelector('input').value;

        const data = {
          inputValue: value,
          objetoComplejo: {
            campo1: 'campo1',
            campo2: 'campo2'
          }
        };

        window.parent.postMessage(JSON.stringify(data), '*');
      }
      
    </script>
```

### Solución con librería iframeCommunicator

Se encapsula la lógica anterior en una pequeña librería que expone la clase `IframeCommunicator` y permite escribir el código de forma más concisa.


#### Constructor
```javascript
IframeCommunicator(callback)
```

* `callback(e)`: función que se ejecuta cuando un mensaje sea recibido. Este callback posee a su vez un parámetro que contiene la información del mensaje. Este parámetro es opcional. Si se crea un comunicador que únicamente va a enviar mensajes y no a recibirlos no es necesario.

#### Métodos

```javascript
sendMessage(target, message)
```

Envía un mensaje

* `target`: ventana a la que se envía el mensaje.
* `message`: mensaje en texto plano. Debe serializarse antes de enviar si se trata de un objeto.


```javascript
destroyListener()
```

Destruye el listener. Únicamente destruye el listener para la instancia de `IframeCommunicator` llamante. Otros eventListeners suscritos al evento `message` que han sido creados por otras instancias de `IframeCommunicator` o cualquier otro medio no se verán afectados.


#### Ejemplo utilizando la librería

El código javascript del ejemplo visto anteriormente quedaría de la siguiente forma usando la librería:

##### Código en la ventana principal

```javascript
  const iframeCommunicator = new IframeCommunicator(e => {
    console.log('evento recibido!', e)
    document.querySelector('span').innerHTML = e.data.inputValue;
    iframeCommunicator.destroyListener(); // Usado como ejemplo. Esto hará que tras recibir el primer dato ya no recibamos más
  });
```

##### Código en el iframe

```javascript
    const iframeCommunicator = new IframeCommunicator();

    const sendValue = () => {
      const value = document.querySelector('input').value;
      iframeCommunicator.sendMessage(window.parent, {inputValue: value})
    }
```


### Ejecutar el ejemplo

Si se desea ejecutar y probar el ejemplo (se requiere Node instalado):

1. Descargar este repositorio y situarse en su raíz.
2. Instalar dependencias y ejecutar el servidor (será quien sirva el contenido del iframe).

```bash
npm i
npm run start
```
3. Abrir el fichero index.html con el navegador como un simple fichero html local. Dado que no es servido por nadie su dominio será vacío `''`, a diferencia del iframe cuyo dominio será `localhost:3000`. Esto es suficiente para provocar un error de CORS en el navegador.
