import { Injectable } from '@nestjs/common';

@Injectable()
export default class GradeNotificationTemplate{
  constructor(
    private readonly name: string,
    private readonly assessment: string,
    private readonly grade: number,
    private readonly professorNote: string,
  ) {
  }

  getEmail(): string{
    return `
    <html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
  <style>
      body {
          font-family: 'Arial', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
      }
      .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
      }
      .header {
          background-color: #4CAF50;
          color: white;
          padding: 30px;
          text-align: center;
      }
      .header h1 {
          margin: 0;
          font-size: 28px;
      }
      .content {
          padding: 20px;
      }
      .student-info {
          margin-bottom: 20px;
          text-align: center;
      }
      .evaluation-details {
          border-top: 2px solid #4CAF50;
          padding-top: 20px;
      }
      .note {
          font-size: 36px;
          font-weight: bold;
      }
      .comments {
          margin-top: 10px;
          font-style: italic;
          color: #555;
      }
      .footer {
          text-align: center;
          font-size: small;
          color:#777;
      }
      #first-comment{
          font-weight: bold;
      }
      @media (max-width: 600px) {
          .container {
              margin: 10px;
              padding: 10px;
          }
          .header h1 {
              font-size: 24px;
          }
          .note {
              font-size: 28px;
          }
      }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Notificación de Calificación</h1>
  </div>
  <div class="content">
    <div class="student-info">
      <h2>Hola <span id="studentName">${this.name}</span>👋,</h2>
      <p>El profe me dijo que ya te calificó 🥵.</p>
      <p id="first-comment"></p>
    </div>
    <div class="evaluation-details">
      <h3>Detalles de la Evaluación</h3>
      <p><strong>Nombre de la Evaluación:</strong> <span id="evaluationName">${this.assessment}</span></p>
      <p><strong>Nota:</strong> <span class="note" id="grade">${this.grade}</span></p>
      <p class="comments"><strong>Comentarios del Profesor:</strong> <span id="teacherComments">${this.professorNote}</span></p>
      <p>¡Sigue metiéndole para subir en el ranking 😏!</p>
    </div>
  </div>
  <div class="footer">
    <p>&copy; 2024 PW-System. Todos mis derechos reservados, los tuyos no 🤓.</p>
  </div>
</div>

<script>
  const gradeElement = document.getElementById('grade');
  const firstComment = document.getElementById('first-comment');
  
  const gradeValue = ${this.grade};

  if (gradeValue >= 5) {
    firstComment.innerText = 'Tremendo tanque 🥵';
    gradeElement.style.color = '#4CAF50';
  } else if (gradeValue >= 4) {
    firstComment.innerText = 'Super bien 👌';
    gradeElement.style.color = '#FF9800';
  } else if (gradeValue >= 3) {
    firstComment.innerText = 'El 3 es 3, y lo demás... 🤠';
    gradeElement.style.color = '#ffe200';
  } else if (gradeValue >= 2) {
    firstComment.innerText = 'Te tocó perder 🥲';
    gradeElement.style.color = '#F44336';
  }
</script>
</body>
</html>
    `
  }
}