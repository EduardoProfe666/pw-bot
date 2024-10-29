export default class ForgotPasswordTemplate {
  constructor(
    private readonly uiUrl: string,
    private readonly name: string,
    private readonly resetPasswordUrl: string,
  ) {}

  getEmail(): string{
    return `<!DOCTYPE html>

<html lang="es">
<head>
  <title></title>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" type="text/css" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet"
        type="text/css" />
  <link href="https://fonts.googleapis.com/css2?family=Droid+Serif:wght@100;200;300;400;500;600;700;800;900"
        rel="stylesheet" type="text/css" />
  <style>
      * {
          box-sizing: border-box;
      }

      body {
          margin: 0;
          padding: 0;
      }

      a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: inherit !important;
      }

      #MessageViewBody a {
          color: inherit;
          text-decoration: none;
      }

      p {
          line-height: inherit
      }

      .desktop_hide,
      .desktop_hide table {
          mso-hide: all;
          display: none;
          max-height: 0;
          overflow: hidden;
      }

      .image_block img + div {
          display: none;
      }

      sup,
      sub {
          font-size: 75%;
          line-height: 0;
      }

      @media (max-width: 670px) {

          .desktop_hide table.icons-inner,
          .social_block.desktop_hide .social-table {
              display: inline-block !important;
          }

          .icons-inner {
              text-align: center;
          }

          .icons-inner td {
              margin: 0 auto;
          }

          .mobile_hide {
              display: none;
          }

          .row-content {
              width: 100% !important;
          }

          .stack .column {
              width: 100%;
              display: block;
          }

          .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0;
          }

          .desktop_hide,
          .desktop_hide table {
              display: table !important;
              max-height: none !important;
          }
      }
  </style>
  <!--[if mso ]>
  <style>sup, sub {
    font-size: 100% !important;
  }

  sup {
    mso-text-raise: 10%
  }

  sub {
    mso-text-raise: -10%
  }</style> <![endif]-->
</head>
<body class="body"
      style="background-color: #85a4cd; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
<table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
       style="mso-table-lspace: 0; mso-table-rspace: 0; background-color: #85a4cd;" width="100%">
  <tbody>
  <tr>
    <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation"
             style="mso-table-lspace: 0; mso-table-rspace: 0; background-color: #f3f6fe;" width="100%">
        <tbody>
        <tr>
          <td>
            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack"
                   role="presentation"
                   style="mso-table-lspace: 0; mso-table-rspace: 0; color: #000000; width: 650px; margin: 0 auto;"
                   width="650">
              <tbody>
              <tr>
                <td class="column column-1"
                    style="mso-table-lspace: 0; mso-table-rspace: 0; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                    width="100%">
                  <table border="0" cellpadding="10" cellspacing="0" class="heading_block block-1" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad">
                        <h1
                          style="color: #7747FF; direction: ltr; font-family: 'Droid Serif', Georgia, Times, 'Times New Roman', serif; font-size: 38px; font-weight: 700; letter-spacing: 2px; line-height: 120%; text-align: center; margin: 0;mso-line-height-alt: 45.6px;">
                          <span class="tinyMce-placeholder" style="word-break: break-word;"><a href="${this.uiUrl}"
                                                                                               rel="noopener"
                                                                                               style="text-decoration: none; color: #7747FF;"
                                                                                               target="_blank"
                                                                                               title="PW G-31 App UI"><span
                            class="mce-content-body mce-edit-focus" data-position="10-0-0"
                            data-qa="tinyeditor-root-element" id="254713df-206d-4ef2-bf26-01d2ad127c0a"
                            style="word-break: break-word; position: relative;"><span class="tinyMce-placeholder"
                                                                                      style="word-break: break-word;">PW G-31 App</span></span></a></span>
                        </h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation"
             style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
          <td>
            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack"
                   role="presentation"
                   style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 650px; margin: 0 auto;"
                   width="650">
              <tbody>
              <tr>
                <td class="column column-1"
                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                    width="100%">
                  <div class="spacer_block block-1" style="height:60px;line-height:60px;font-size:1px;"> </div>
                  <div class="spacer_block block-2" style="height:60px;line-height:60px;font-size:1px;"> </div>
                  <table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:10px;text-align:center;width:100%;">
                        <h1
                          style="margin: 0; color: #ffffff; direction: ltr; font-family: 'Roboto Slab', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 2px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 36px;">
                          <strong>Olvidaste tu contraseña? 😂🫵</strong></h1>
                      </td>
                    </tr>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" class="image_block block-4" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="width:100%;">
                        <div align="center" class="alignment" style="line-height:10px">
                          <div style="max-width: 500px;"><img alt="Wrong Password Animation" height="auto"
                                                              src="https://raw.githubusercontent.com/EduardoProfe666/vue-proyectos/refs/heads/main/images/GIF_password.gif"
                                                              style="display: block; height: auto; border: 0; width: 100%;"
                                                              title="Wrong Password Animation" width="500" /></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div class="spacer_block block-5" style="height:20px;line-height:20px;font-size:1px;"> </div>
                  <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-6" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;padding-top:5px;">
                        <div
                          style="color:#3f4d75;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:20px;line-height:120%;text-align:center;mso-line-height-alt:24px;">
                          <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word;">Hola ${this.name} 👋. </span><span
                            style="word-break: break-word;">No te preocupes... la gente es olvidadiza y estúp*** a veces 🥴. </span><span
                            style="word-break: break-word;">Tú no eres la excepción de la regla 😊.</span></p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-7" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;padding-top:5px;">
                        <div
                          style="color:#3f4d75;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:22px;line-height:120%;text-align:center;mso-line-height-alt:26.4px;">
                          <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word;">Toca el botón de abajo para resetear tu contraseña 👇.</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div class="spacer_block block-8" style="height:20px;line-height:20px;font-size:1px;"> </div>
                  <table border="0" cellpadding="10" cellspacing="0" class="button_block block-9" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad">
                        <div align="center" class="alignment"><!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                                       xmlns:w="urn:schemas-microsoft-com:office:word" href="${this.resetPasswordUrl}"
                                       style="height:59px;width:253px;v-text-anchor:middle;" arcsize="17%"
                                       strokeweight="1.5pt" strokecolor="#3F4D75" fillcolor="#ffffff">
                            <w:anchorlock />
                            <v:textbox inset="0px,0px,0px,0px">
                              <center dir="false" style="color:#3f4d75;font-family:Arial, sans-serif;font-size:18px">
                          <![endif]--><a href="${this.resetPasswordUrl}"
                                         style="background-color:#ffffff;border-bottom:2px solid #3F4D75;border-left:2px solid #3F4D75;border-radius:10px;border-right:2px solid #3F4D75;border-top:2px solid #3F4D75;color:#3f4d75;display:inline-block;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:18px;mso-border-alt:none;padding-bottom:10px;padding-top:10px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;"
                                         target="_blank"><span
                            style="word-break: break-word; padding-left: 25px; padding-right: 25px; font-size: 18px; display: inline-block; letter-spacing: normal;"><span
                            style="word-break: break-word;"><span data-mce-style=""
                                                                  style="word-break: break-word; line-height: 36px;">Resetear mi contraseña</span></span></span></a>
                          <!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                      </td>
                    </tr>
                  </table>
                  <div class="spacer_block block-10" style="height:20px;line-height:20px;font-size:1px;"> </div>
                  <table border="0" cellpadding="10" cellspacing="0" class="paragraph_block block-11"
                         role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad">
                        <div
                          style="color:#3f4d75;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                          <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word;">Si no fuiste tan estúp*** como para olvidarte de tu contraseña, no guardarla en tu navegador </span><span
                            style="word-break: break-word;">y solicitar este servicio, simplemente ignora este email.</span><span
                            style="word-break: break-word;"></span></p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div class="spacer_block block-12" style="height:30px;line-height:30px;font-size:1px;"> </div>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation"
             style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #c4d6ec;" width="100%">
        <tbody>
        <tr>
          <td>
            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack"
                   role="presentation"
                   style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 650px; margin: 0 auto;"
                   width="650">
              <tbody>
              <tr>
                <td class="column column-1"
                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                    width="100%">
                  <table border="0" cellpadding="10" cellspacing="0" class="paragraph_block block-1" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad">
                        <div
                          style="color:#3f4d75;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:12px;line-height:120%;text-align:center;mso-line-height-alt:14.399999999999999px;">
                          <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word;">Este link expira en 24 horas. Si continúas teniendo problemas siéntete libre de comunicarte al  </span><span
                            style="word-break: break-word;"> <a href="mailto:go@f*ck.yourself?subject=Go F*ck Yourself 😊&body=Go F*ck Yourself 😊
Go F*ck Yourself 😊
Go F*ck Yourself 😊
Go F*ck Yourself 😊
Go F*ck Yourself 😊" rel="noopener" style="text-decoration: none; color: #ffffff;" target="_blank"
                                                                title="go@f*ck.yourself">go@f*ck.yourself</a>.</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation"
             style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f3f6fe;" width="100%">
        <tbody>
        <tr>
          <td>
            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack"
                   role="presentation"
                   style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 650px; margin: 0 auto;"
                   width="650">
              <tbody>
              <tr>
                <td class="column column-1"
                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                    width="100%">
                  <div class="spacer_block block-1" style="height:40px;line-height:40px;font-size:1px;"> </div>
                  <table border="0" cellpadding="0" cellspacing="0" class="social_block block-2" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad"
                          style="padding: 10px 20px;text-align:center;">
                        <div align="center" class="alignment">
                          <table border="0" cellpadding="0" cellspacing="0" class="social-table" role="presentation"
                                 style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;"
                                 width="104px">
                            <tr>
                              <td style="padding:0 10px 0 10px;"><a href="https://t.me/pw_g31_bot" target="_blank"><img
                                alt="Telegram" height="auto" src="https://raw.githubusercontent.com/EduardoProfe666/vue-proyectos/refs/heads/main/images/telegram2x.png"
                                style="display: block; height: auto; border: 0;" title="PW G-31 Bot" width="32" /></a>
                              </td>
                              <td style="padding:0 10px 0 10px;"><a href="https://ok.ru" target="_blank"><img
                                alt="Web App" height="auto" src="https://raw.githubusercontent.com/EduardoProfe666/vue-proyectos/refs/heads/main/images/odnoklassniki2x.png"
                                style="display: block; height: auto; border: 0;" title="PW G-31 App" width="32" /></a>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <table border="0" cellpadding="10" cellspacing="0" class="heading_block block-3" role="presentation"
                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad">
                        <h3
                          style="color: #7747FF; direction: ltr; font-family: Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 24px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin: 0;mso-line-height-alt: 28.799999999999997px;">
                          <span class="tinyMce-placeholder" style="word-break: break-word;"><a
                            href="${this.uiUrl}" rel="noopener"
                            style="text-decoration: none; color: #7747FF;" target="_blank" title="PW G-31 App UI"><span
                            class="mce-content-body mce-edit-focus" data-position="10-0-0"
                            data-qa="tinyeditor-root-element" id="254713df-206d-4ef2-bf26-01d2ad127c0a"
                            style="word-break: break-word; position: relative;"><span class="tinyMce-placeholder"
                                                                                      style="word-break: break-word;">PW G-31 App</span></span></a></span>
                        </h3>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>
  </tbody>
</table><!-- End -->
</body>
</html>`;
  }
}