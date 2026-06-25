import {prisma} from "../models/db.js";
import {
  createPersonalTransactionService,
  getAllPersonalTransactionsService,
  getExpenseSummaryService,
  getTransactionByIdService,
  getTransactionsByPersonService,
  updateTransactionService,
  createReminderService,
  createBusinessTransactionService,
  getAllBusinessTransactionsService,
} from "../services/expenseService.js"

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
      transactions: result.transactions,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const summary = await getExpenseSummaryService(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const transaction = await getTransactionByIdService(user_id, id);

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactionsByPerson = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { name } = req.params;
    const transactions = await getTransactionsByPersonService(user_id, name);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const transaction = await updateTransactionService(user_id, id, req.body);

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const transaction = await prisma.personalTransaction.findFirst({
      where: {
        transaction_id: id,
        user_id,
        is_deleted: false,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await prisma.personalTransaction.update({
      where: { transaction_id: id },
      data: {
        is_deleted: true,
        updated_by_user_id: user_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createReminder = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const reminder = await createReminderService(user_id, req.body);

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBusinessTransaction = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const transaction = await createBusinessTransactionService(user_id, req.body);

    return res.status(201).json({
      success: true,
      message: "Business transaction created successfully",
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

export const getAllBusinessTransactions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getAllBusinessTransactionsService(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Business transactions fetched successfully",
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