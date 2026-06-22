import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import expenseRoutes from './routes/expenseRoutes.js'


dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "expense-service" })
})

// Expense routes
app.use('/expenses', expenseRoutes)

app.listen(5000, () => {
  console.log("Expense Service running on port 5000")
})