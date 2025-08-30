type Mail = { to:string; subject:string; html:string; text?:string }
export async function sendMail(m: Mail) {
  if (process.env.DEV_MODE || !process.env.SMTP_HOST) {
    console.log('[MAIL DEV NO-OP]', {to:m.to, subject:m.subject})
    return
  }
  // TODO: echte SMTP-Anbindung für PROD
}
