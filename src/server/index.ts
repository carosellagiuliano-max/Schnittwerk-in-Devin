import app from './app'
const PORT = Number(process.env.PORT) || 3000
app.listen(PORT, '127.0.0.1', () => console.log(`API → http://127.0.0.1:${PORT}`))
