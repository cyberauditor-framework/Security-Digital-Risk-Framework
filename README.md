# Portal - Security Digital Risk Framework

## Estructura del Proyecto

El proyecto está organizado en los siguientes componentes principales:

- **db-load-json**: Genera archivos JSON a partir de datos obtenidos de Interpres.
- **api-f**: Framework API que ofrece endpoints para cargar datos en PostgreSQL y consultar información.
- **api**: API en desarrollo que consumirá los servicios de api-f.
- **front**: Interfaz de usuario desarrollada en React.

## Requisitos Previos

- Node.js (versión 18 o superior)
- PostgreSQL (versión 14 o superior)
- Git

## Cómo Clonar el Repositorio

```bash
git clone https://github.com/cyberauditor-framework/portal.git
cd portal
```

## Componentes del Sistema

### db-load-json

Este componente se encarga de generar archivos JSON que posteriormente serán cargados en la base de datos PostgreSQL. Obtiene la información realizando peticiones a Interpres.

#### Configuración

1. Navegue al directorio db-load-json:
   ```bash
   cd db-load-json
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Configure el archivo `.env` con las credenciales y URLs necesarias (puede usar `.env.example` como referencia).

#### Ejecución

Para generar los archivos JSON:

```bash
npm run seed
```

Esto creará los archivos JSON en el directorio `../db-json/common`.

### api-f (Framework API)

Esta API proporciona los endpoints para cargar datos en la base de datos PostgreSQL y consultar información almacenada.

#### Estructura

- **controllers/**: Contiene la lógica de negocio para cada entidad (campañas, técnicas, tácticas, etc.).
- **models/**: Define las operaciones de acceso a datos para cada entidad.
- **routes/**: Define los endpoints de la API.
- **middlewares/**: Contiene middleware para manejo de errores, autenticación, etc.
- **persistence/**: Gestiona la conexión con la base de datos.

#### Configuración

1. Navegue al directorio api-f:
   ```bash
   cd api-f
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Configure el archivo `.env` con las credenciales de la base de datos y otras configuraciones (puede usar `.env.example` como referencia).

#### Ejecución

Para iniciar el servidor API:

```bash
npm run start
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

El servidor se iniciará en el puerto especificado en el archivo `.env` (por defecto 3000).

#### Endpoints Disponibles

La API proporciona los siguientes endpoints principales:

- **Verificación de salud**: `GET /`
- **Carga inicial de datos**: `POST /load-init-data`
- **API v1 (prefijo `/api/v1`)**:
  - `GET /techniques`: Obtener todas las técnicas
  - `GET /techniques/:mitreId`: Obtener una técnica por su ID de MITRE
  - `GET /techniques/:mitreId/tactics`: Obtener una técnica con sus tácticas asociadas
  - `GET /techniques/:mitreId/detections`: Obtener una técnica con sus detecciones
  - `GET /techniques/:mitreId/platforms`: Obtener una técnica con sus plataformas
  - `GET /techniques/:mitreId/software`: Obtener una técnica con su software asociado
  - `GET /techniques/:mitreId/threat-groups`: Obtener una técnica con sus grupos de amenazas
  - `GET /tactics`: Obtener todas las tácticas
  - `GET /tactics/:mitreId`: Obtener una táctica por su ID de MITRE
  - `GET /campaigns`: Obtener todas las campañas
    - Filtros por países:
      - `GET /campaigns?countries=US`: Filtrar campañas por un país (EE.UU.)
      - `GET /campaigns?countries=US&countries=CN`: Filtrar campañas por múltiples países (EE.UU. y China)
    - Filtros por industrias:
      - `GET /campaigns?industries=financial`: Filtrar campañas por una industria (financiera)
      - `GET /campaigns?industries=financial&industries=healthcare`: Filtrar campañas por múltiples industrias (financiera y salud)
    - Filtros combinados:
      - `GET /campaigns?countries=US&industries=financial`: Filtrar campañas por país e industria
  - `GET /campaigns/:id`: Obtener una campaña por ID
  - `GET /campaigns/:id/techniques`: Obtener una campaña con sus técnicas
  - `GET /campaigns/:id/software`: Obtener una campaña con su software
  - `GET /campaigns/:id/threat-groups`: Obtener una campaña con sus grupos de amenazas
  - `GET /campaigns/:id/vulnerabilities`: Obtener una campaña con sus vulnerabilidades
  - `GET /detections`: Obtener todas las detecciones
  - `GET /detections/:id`: Obtener una detección por ID
  - `GET /detections/:id/techniques`: Obtener una detección con sus técnicas
  - `GET /threat-groups`: Obtener todos los grupos de amenazas
  - `GET /threat-groups/:mitreId`: Obtener un grupo de amenazas por ID de MITRE
  - `GET /threat-groups/:mitreId/techniques`: Obtener un grupo de amenazas con sus técnicas
  - `GET /software`: Obtener todo el software
  - `GET /software/:mitreId`: Obtener software por ID de MITRE
  - `GET /software/:mitreId/techniques`: Obtener software con sus técnicas
  - `GET /platforms`: Obtener todas las plataformas
  - `GET /platforms/:id`: Obtener una plataforma por ID
  - `GET /vulnerabilities`: Obtener todas las vulnerabilidades
  - `GET /vulnerabilities/:id`: Obtener una vulnerabilidad por ID
  - `GET /integrations`: Obtener todas las integraciones
  - `GET /integrations/:id`: Obtener una integración por ID
  - `GET /security-standards`: Obtener todos los estándares de seguridad
  - `GET /security-standards/:id`: Obtener un estándar de seguridad por ID

### api

Este componente está en desarrollo y está diseñado para consumir los servicios proporcionados por api-f.

#### Configuración

1. Navegue al directorio api:
   ```bash
   cd api
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

#### Ejecución

```bash
npm run start
```

### front (Interfaz de Usuario)

La interfaz de usuario desarrollada en React proporciona una visualización intuitiva de los datos de ciberseguridad.

#### Configuración

1. Navegue al directorio front:
   ```bash
   cd front
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

#### Ejecución

Para desarrollo:

```bash
npm run dev
```

Para compilar para producción:

```bash
npm run build
```

Para previsualizar la versión compilada:

```bash
npm run preview
```

## Flujo de Trabajo Completo

1. **Generación de datos**:
   - Ejecute `npm run seed` en el directorio `db-load-json` para generar los archivos JSON.

2. **Carga de datos en la base de datos**:
   - Inicie la API: `npm run start` en el directorio `api-f`.
   - Realice una petición POST a `/load-init-data` para cargar los datos en la base de datos.

3. **Consulta de datos**:
   - Utilice los endpoints de la API para consultar la información almacenada.

4. **Visualización**:
   - Ejecute la interfaz de usuario para visualizar y gestionar los datos.
