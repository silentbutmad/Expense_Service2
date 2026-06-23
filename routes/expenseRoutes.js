import express from "express"
const router = express.Router()
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createPersonalTransaction,
  getAllPersonalTransactions,
  getExpenseSummary,
  getTransactionById,
  getTransactionsByPerson,
  updateTransaction,
  deleteTransaction,
  createReminder,
  createBusinessTransaction,
  getAllBusinessTransactions,
} from '../controller/expenseController.js'

// Personal Transaction routes
router.post('/addpersonalTransaction', verifyToken, createPersonalTransaction)
router.get('/allPersonalTransactions', verifyToken, getAllPersonalTransactions)
router.get('/summary', verifyToken, getExpenseSummary)
router.get('/transaction/:id', verifyToken, getTransactionById)
router.get('/transactions/person/:name', verifyToken, getTransactionsByPerson)
router.put('/transaction/:id', verifyToken, updateTransaction)
router.delete('/transaction/:id', verifyToken, deleteTransaction)

// Reminder route
router.post('/reminder', verifyToken, createReminder)

// Business Transaction routes
router.post('/addBusinessTransaction', verifyToken, createBusinessTransaction)
router.get('/allBusinessTransactions', verifyToken, getAllBusinessTransactions)

export default router