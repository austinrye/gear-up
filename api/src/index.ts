import app from './app.ts'
import 'dotenv/config'

const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'development'

console.log(`Running in ${nodeEnv} mode`)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello, World!' })
})
