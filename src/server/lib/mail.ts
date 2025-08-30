import nodemailer from 'nodemailer'

type Mail = { to:string; subject:string; html:string; text?:string }
type SMS = { to:string; message:string }

export async function sendMail(m: Mail) {
  if (process.env.DEV_MODE || !process.env.SMTP_HOST) {
    console.log('[MAIL DEV NO-OP]', {to:m.to, subject:m.subject})
    return
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@schnittwerk.ch',
    to: m.to,
    subject: m.subject,
    html: m.html,
    text: m.text,
  })
}

export async function sendSMS(sms: SMS) {
  if (process.env.DEV_MODE || !process.env.TWILIO_ACCOUNT_SID) {
    console.log('[SMS DEV NO-OP]', {to:sms.to, message:sms.message})
    return
  }
}

export const emailTemplates = {
  bookingConfirmation: (customerName: string, serviceName: string, date: string, time: string) => ({
    subject: 'Terminbestätigung - Schnittwerk',
    html: `
      <h2>Terminbestätigung</h2>
      <p>Liebe/r ${customerName},</p>
      <p>Ihr Termin wurde erfolgreich gebucht:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Datum:</strong> ${date}</li>
        <li><strong>Uhrzeit:</strong> ${time}</li>
      </ul>
      <p>Wir freuen uns auf Ihren Besuch!</p>
      <p>Ihr Schnittwerk Team</p>
    `,
    text: `Terminbestätigung - ${serviceName} am ${date} um ${time}`
  }),
  
  bookingReminder: (customerName: string, serviceName: string, date: string, time: string) => ({
    subject: 'Terminerinnerung - Schnittwerk',
    html: `
      <h2>Terminerinnerung</h2>
      <p>Liebe/r ${customerName},</p>
      <p>Wir erinnern Sie an Ihren morgigen Termin:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Datum:</strong> ${date}</li>
        <li><strong>Uhrzeit:</strong> ${time}</li>
      </ul>
      <p>Bis morgen!</p>
      <p>Ihr Schnittwerk Team</p>
    `,
    text: `Terminerinnerung - ${serviceName} morgen um ${time}`
  }),
  
  earlierAppointmentAvailable: (customerName: string, serviceName: string, date: string, time: string) => ({
    subject: 'Früherer Termin verfügbar - Schnittwerk',
    html: `
      <h2>Früherer Termin verfügbar</h2>
      <p>Liebe/r ${customerName},</p>
      <p>Ein früherer Termin ist verfügbar geworden:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Datum:</strong> ${date}</li>
        <li><strong>Uhrzeit:</strong> ${time}</li>
      </ul>
      <p>Melden Sie sich schnell, wenn Sie interessiert sind!</p>
      <p>Ihr Schnittwerk Team</p>
    `,
    text: `Früherer Termin verfügbar - ${serviceName} am ${date} um ${time}`
  })
}
