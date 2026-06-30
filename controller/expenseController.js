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
  updateBusinessTransactionService,
  getAllBusinessTransactionsService,
  deleteBusinessTransactionService,
} from "../services/expenseService.js"

import {
  createBusinessService,
  getAllBusinessesService,
  createItemService,
  getAllItemsService,
  createPartyService,
  getAllPartiesService,
} from "../services/businessServices.js"

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

export const updateBusinessTransaction = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const transaction = await updateBusinessTransactionService(user_id, id, req.body);

    return res.status(200).json({
      success: true,
      message: "Business transaction updated successfully",
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

export const deleteBusinessTransaction = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const result = await deleteBusinessTransactionService(user_id, id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
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

export const createBusiness = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    console.log(req.body)
    const business = await createBusinessService(user_id, req.body);
    

    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      data: business,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBusinesses = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const businesses = await getAllBusinessesService(user_id);

    return res.status(200).json({
      success: true,
      message: "Businesses fetched successfully",
      data: businesses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createItem = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const item = await createItemService(user_id, req.body);

    return res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { business_id } = req.query;
    const items = await getAllItemsService(user_id, business_id);

    return res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createParty = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const party = await createPartyService(user_id, req.body);

    return res.status(201).json({
      success: true,
      message: "Party created successfully",
      data: party,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllParties = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { business_id } = req.query;
    const parties = await getAllPartiesService(user_id, business_id);

    return res.status(200).json({
      success: true,
      message: "Parties fetched successfully",
      data: parties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};