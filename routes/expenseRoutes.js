import express from "express"
const router = express.Router()
import {createPersonalTransaction ,getAllPersonalTransaction} from '../controller/expenseController.js'

// Personal Transaction CRUD
router.post('/addpersonalTransaction', createPersonalTransaction)
router.get('/getAllPersonal', getAllPersonalTransaction)


//router.get('/summary', expenseController.getExpenseSummary)
//router.get('/:id', expenseController.getExpenseById)
//router.put('/:id', expenseController.updateExpense)
//router.delete('/:id', expenseController.deleteExpense)

// Category management
//router.get('/categories/list', expenseController.getExpenseCategories)
//router.post('/categories', expenseController.createExpenseCategory)

export default router
