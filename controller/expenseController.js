import {prisma} from "../models/db.js";
import {createPersonalTransactionService,getAllPersonalTransactionsService} from "../services/expenseService.js"

export const createPersonalTransaction = async (req, res) => {
  try {

    const user_id = req.user.user_id;
    const transaction = await createPersonalTransactionService(user_id,req.body);

    return res.status(201).json({
      success: true,
      message: "Personal transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPersonalTransactions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getAllPersonalTransactionsService(user_id,req.query);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { transaction_id: id },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await prisma.transaction.update({
      where: { transaction_id: id },
      data: {
        is_deleted: true,
        updated_by_user_id: req.body.updated_by_user_id || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}