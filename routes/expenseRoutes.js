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
  updateBusinessTransaction,
  deleteBusinessTransaction,
  getAllBusinessTransactions,
  createBusiness,
  getAllBusinesses,
  createItem,
  getAllItems,
  createParty,
  getAllParties,
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
router.put('/businessTransaction/:id', verifyToken, updateBusinessTransaction)
router.delete('/businessTransaction/:id', verifyToken, deleteBusinessTransaction)

// Business Management routes
router.post('/createBusiness', verifyToken, createBusiness)
router.get('/allBusiness', verifyToken, getAllBusinesses)
router.post('/createItem', verifyToken, createItem)
router.get('/allItems', verifyToken, getAllItems)
router.post('/createParty', verifyToken, createParty)
router.get('/allParties', verifyToken, getAllParties)

export default router