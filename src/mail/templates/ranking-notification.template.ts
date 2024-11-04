import { Injectable } from '@nestjs/common';

@Injectable()
export default class RankingNotificationTemplate {
  constructor(
    public readonly name: string,
    public readonly prevPos: number,
    public readonly actualPos: number,
  ) {}

  private getCubaTime() {
    return new Date().toLocaleString('es-ES', {
      timeZone: 'America/Havana',
      hour12: false,
    });
  }

  getEmail(): string {
    return `
    <html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
  <style>
      body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #e2e8f0, #f3f4f6);
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
      }

      .container {
          background: white;
          border-radius: 12px;
          border: 2px solid #2980b9;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          padding: 40px;
          width: 90%;
          max-width: 600px;
          text-align: center;
      }

      h1 {
          color: #2c3e50;
          font-size: 26px;
      }

      h2 {
          color: #34495e;
          margin-top: 10px;
      }

      .timestamp {
          color: #e67e22;
          font-weight: bold;
          font-size: 18px;
      }

      h3 {
          color: #2980b9;
          margin-top: 20px;
      }

      .position {
          font-size: 20px;
          margin-top: 10px;
      }
      
      .pos{
          font-weight: bold;
      }
      
      .pos.minor{
          color: #e74c3c;
      }
      
      .pos.greater{
          color: #2ac557;
      }

      .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #7f8c8d;
      }

      hr {
          border-top: 1px solid #2980b9;
          margin-top: 20px;
          margin-bottom: 20px;
      }

  </style>
</head>
<body>
<div class="container">
  <h1>¡Actualización del Ranking!</h1>

  <hr/>

  <h2>Hola ${this.name} 👋</h2>

  <h2>Me acaban de informar que a las <span class="timestamp">${this.getCubaTime()}</span>, tu posición ha sido actualizada 🥸</h2>

  <h2>Revisé el VAR y todo está legal 👌</h2>

  <div class="position">
    <h3><span class="pos ${this.prevPos < this.actualPos ? 'greater' : 'minor' }">${this.prevPos}</span> ➡️ <span class="pos ${this.actualPos < this.prevPos ? 'greater' : 'minor' }">${this.actualPos}</span></h3>
    <h3>${this.prevPos < this.actualPos ? "Te tocó perder 🤷‍♂️" : "Congratulaciones 🥸"}</h3>
  </div>

  <div class="footer">¡Sigue participando para subir en el ranking 🤓!</div>
</div>
</body>
</html>
    `;
  }
}
