<template>
  <div class="card flex flex-start">
    <SidebarDrawer v-model:visible="visible" />
    <Button icon="pi pi-bars" @click="visible = true"></Button>
  </div>
  <Card style="overflow: hidden">
    <template #header>
      <img
        alt="user header"
        style="height: auto; width: 60%"
        src="https://saberpunto.com/wp-content/uploads/Tecnicas-de-Diseno-de-Pruebas.png"
      />
    </template>
    <template #title>Prueba tecnica: </template>
    <template #subtitle>Tienda</template>
    <template #content>
      <p class="m-0">
        Consultas avanzadas de ventas y productos. Puedes buscar por ID de venta, usuario o
        producto. Información de los horarios y usuarios. Escritura, lectura, actualizaciones y
        eliminación (CRUD). Opciones exclusivas para administradores. Base de datos: MySQL, Node.js.
        Frontend: Vue 3, PrimeVue, Pinia, Axios.
      </p>
    </template>
    <template #footer>
      <Button class="mr-2" severity="contrast" @click="openGithub">
        <i class="pi pi-github mr-2"></i>
        Ir al proyecto en GitHub
      </Button>
      <Button class="ml-2" disabled="true" severity="secondary" @click="visible = true">
        <i class="pi pi-globe mr-2"></i>
        Ver en vivo (TODO)
      </Button>
    </template>
  </Card>
  <Card style="overflow: hidden">
    <template #title>
      <Tag severity="info" class="mr-2">Documento Explicativo</Tag>
    </template>
    <template #content>
      <Divider align="left">
        <b>Secciones del Proyecto</b>
      </Divider>
      <Panel header="Backend" toggleable collapsed>
        <ul>
          <li class="m-0">
            Para la elaboracion de estre proyecto se inicio con la creación del backend, usando
            express y mysql2 de node para el manejo de la capa de backend que comunica con la base
            de datos relacional alojada en un servidor local con apache y phpmyadmin.
          </li>
          <li>
            Se crearon las tablas de usuarios, productos y ventas, con sus respectivas relaciones.
          </li>
          <li>
            Un usuario tiene relación uno a muchos con los productos que crea y actualiza, también con las ventas que realiza y con sus horarios de trabajo.
            Cada venta está relacionada con un solo usuario, pero puede tener muchos registros en la tabla sale_items.
            La tabla sale_items es la intermedia que conecta una venta con sus productos: cada registro de sale_items corresponde a un solo producto vendido en esa venta, pero una venta puede tener varios productos, y por lo tanto varios registros en sale_items.
            Por su parte, un producto puede aparecer en muchos sale_items, ya que se puede vender en distintas ventas.
            <img
              style="width: 50%;"
              src="../assets/db-diagram.png"
              alt="Database Schema"
            />
          </li>
          <li>
            Se implementó el CRUD para cada una de estas tablas, permitiendo la creación, lectura,
            actualización y eliminación.
          </li>
          <li>Todas las transacciones estan cifradas por un algoritmo AES de CryptoJS.</li>
          <li>
            Testeé las consultas y operaciones con Postman para asegurarme de que todo funcionara
            correctamente.
          </li>
          <li>
            <img style="width: 50%;" src="../assets/routes.png"></img>
          </li>
        </ul>
      </Panel>
      <Panel header="Frontend" toggleable collapsed>
        <ul>
          <li>
            Se desarrolló el frontend utilizando Vue 3, PrimeVue para los componentes de interfaz y
            Pinia para el manejo del estado.
          </li>
          <li>
            Las transacciones de escritura y edicion viajasn cifradas hacia el back con el algoritmo
            AES
          </li>
          <li> se usa un guard para proteger las rutas del frontend, si un usario no esta autenticado se manda a login</li>
          <li>
            La interfaz es responsiva, se usan loadings y toast para mejor experiencia de usuario.
          </li>
          <li>
            Se cuenta con tema claro exclusivamente por la limitación de tiempo, pero se puede dejar como todo: tema oscuro
          </li>
        </ul>
      </Panel>
      <Divider align="left">
        <b>Autenticación y Seguridad</b>
      </Divider>
      <Panel header="Tokens y Validaciones" toggleable collapsed>
        <ul>
          <li>
            Empece con el login y el registro, en este ultimo se pide solo un correo, contraseña y
            el role que se asignara al usuario, como metodo de prueba no esta protegida la
            auto-asignacion de admin.
          </li>
          <li>El login requiere el correo y contraseña con el que se relaizo el registro.</li>
          <li>
            Por tiempos de dearrollo, opte por no integrar una opcion de recuperación pero se queda
            como TODO.
          </li>
          <li>
            Los inputs de ambos estan tipeados para permitir solo inputs de tipo correo y
            contraseña.
          </li>
          <li>
            Para la autenticación se hizo uso de un generador de tokens como jsonwebtoken, con una
            tiempo de expiracion de 24 horas.
          </li>
          <li>
            Se valida que todos los parametros hayan lllegado, que sea un rol valido y por ultimo
            reliaza la consulta usando mysql.createPool para las transacciones con la base de datos
            relacional en mysql.
          </li>
          <li>
            Se configuró un middleware que verifica el token en cada solicitud que requiera
            auqtenticacion
          </li>
          <li>
            El guard se configuron en el archivo de rutas del frontend, permitiendo solo la vista
            del login o registrar si no hay un token valido.
          </li>
          <li>
            en el back se hashea la password con bcrypt y es la que se escribe en la base de datos.
            Antes de hashearla es desecnriptada con el mismo algoritmo AES que se usa para las
            transacciones desde el frontend.
          </li>
          <li>
            El usuario y token es almacenado en localStorage del navegador, y se verifica en cada
            carga de la pagina. si encuentra un token valido entonces se actulaiza el estado de auth
            y se redirige al dashboard.
          </li>
          <li>
            Al hacer click en cerrar sesion se elimina el token y el usuario del localStorage y el
            guard entra en accion
          </li>
        </ul>
      </Panel>
      <Divider align="left">
        <b>Vistas y Navegación</b>
      </Divider>
      <Panel header="Dashboard y Navegación" toggleable collapsed>
        <ul>
          <li>
            Se creearon vistas con raiz en un Dashboar, que es la página actual, y la cual cuenta
            con un boton en la parte superior izquierda, dicho boton permite deplegar un componente
            nativo de PrimeVue llamado Drawe.
          </li>
          <li>
            En este se muestran las vistas disponibles, al dar click en cualquier opcion nos llevara
            a la vista corresponiente, para cada vista se siguio un mismo estilo de listas con un
            buscador e información refrente al usuario en la parte superior.
          </li>
        </ul>
      </Panel>
      <Panel header="Vista de Usuarios" toggleable collapsed>
        <ul>
          <li>
            La vista de Usuarios permite la consulta para todos los dos roles, pero la creación,
            edición y eliminación de dichos elementos solo esta permitida para administradores.
          </li>
          <li>
            La opción de eliminación tiene algunas excepciones como que no puedes eliminar tu propia
            cuenta, si una cuenta tiene ventas asociadas esta no podra eliminarse.
          </li>
          <li>
            La edición permite cambiar email, la contraseña y el rol del usuario. Si no se cambia
            ningun campo mostrará un mensaje infromativo que indica que no se ha enviado ningun
            cambio.
          </li>
          <li>
            En el lado del backen se actualizan solo los campos modificados que lelgan como un
            array.
          </li>
          <li>El buscador obtiene resultados por el email y el rol del usuario</li>
        </ul>
      </Panel>
      <Panel header="Vista de Productos y Carrito" toggleable collapsed>
        <ul>
          <li>
            En la vista de Productos se tienen las mismas funcionalidades de la vista de Usuarios y
            además permite agregar un producto al carrito, que usa Pinia para manejar su estado
            reactivo, y crear una nueva venta de los productos agregados.
          </li>
          <li>Cada click en el boton de carrito, agrega un elemento.</li>
          <li>
            El stock se actualiza tras cada venta, si el stock es 0 no se puede agregar al carrito.
          </li>
          <li>
            En la parte del header de la tabla se encuentra el boton para lanzar un Dialog que
            muestra el estdo actual del carrito.
          </li>
          <li>
            Si no hay elmentos en el carrito muestra un mensade de carrito vacio, si hay elmentos
            muestra la cantidad, id y precio unitario y el totral.
          </li>
          <li>El buscador filtra por nombre del producto</li>
          <li>
            En la parte inferior del modal estan los botones que permiten vaciar el carrito, cerrar
            el modal y pagar el carrito, si se paga entonces en el back se hacen tres cosas
            importantes, se actuliza el stock del producto, se crea un registro de ventas y otro en
            los productos de productos de las ventas.
          </li>
        </ul>
      </Panel>
      <Panel header="Vista de ventas" toggleable collapsed>
        <ul>
          <li>
            Esta vista muestra todas las ventas ordenadas desde la mas nueva a la mas antigua y con
            la funcionalidad de paginación permitiendo 10 vistas por pagina.
          </li>
          <li>
            No se permiten la operaciones de edicion ni eliminacion, pero podria agregarse una
            opcion de solicitud de cancelacion.
          </li>
          <li>
            el filtro de busqueda toma enc uenta los campos de id de la venta, usuario, producto
          </li>
        </ul>
      </Panel>
      <Panel header="Vista de Horarios" toggleable collapsed>
        <ul>
          <li>
            Esta vista muestra los horarios de los usuarios, con la posibilidad de crear, editar y
            eliminar horarios, pero estas operaciones solo son para administradores.
          </li>
          <li>El buscador filtra por el nombre del usuario y el dia de la semana usando el buscador.</li>
        </ul>
      </Panel>
    </template>
    <template #footer>
      <img
        alt="user header"
        style="width: 100%; height: auto; margin-top: 10px"
        src="https://i0.wp.com/www.offixfiscal.com.mx/wp-content/uploads/2021/05/development-4536630_1280.png?resize=1080%2C675&ssl=1"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import SidebarDrawer from '@/components/SidebarDrawer.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import Panel from 'primevue/panel'
import { ref } from 'vue'

const visible = ref(false)

function openGithub() {
  window.open('https://github.com/rvv3nd/tienda/tree/main', '_blank')
}
</script>

<style scoped></style>
