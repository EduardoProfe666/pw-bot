# PW Api Bot 🤖
Este es un proyecto con Nest y Telegraf para gestionar un Bot de Telegram donde los 
estudiantes pueden interactuar con el sistema realizando ciertas funcionalidades. Tb sirve
como Back para la [Aplicación Web](https://github.com/EduardoProfe666/pw-ui). 

## Funcionalidades 👾
- Autenticación/Autorización basada en roles
- Exportación de reportes en Pdf y Excel
- Envío de Correo
- Gestión de datos de estudiantes, evaluaciones y notas
- Bot de telegram con las siguientes funcionalidades:
  - Ver las notas del usuario
  - Ver las observaciones del profesor en las evaluaciones
  - Ver Ranking del Aula
  - Conocer si está convalidado o no
  - Envío de correo para resetear la contraseña de la aplicación web
  - Obtener reportes:
    - Ranking del Aula en Pdf
    - Listado de Notas y Evaluaciones en Pdf

## Despliegue 🚀
El proyecto se encuentra actualmente desplegado en Render, y el bot de telegram se encuentra
funcional en el [siguiente enlace](https://t.me/pw_g31_bot)

## Levantando el proyecto 🎈

> [!INFO]
> El proyecto usa pnpm como administrador de paquetes, pero puedes usar el de tu preferencia.

Primero instala las dependencias:
```bash
$ pnpm install
```

Luego configura las variables de entorno, para ello crea un `.env` con la misma estructura de `.env.example`
y rellena los campos que hacen falta.

Por último, para compilar y correr el proyecto en local:
```bash
## development
$ pnpm run start

## watch mode
$ pnpm run start:dev

## production mode
$ pnpm run start:prod
```
