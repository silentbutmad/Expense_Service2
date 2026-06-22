import {prisma} from "../models/db.js";

export const createPersonalTransaction = async (req, res) => {
  try {
    const {
      user_id,
      transaction_type,
      amount,
      name,
      email,
      category,
      remark,
      payment_mode,
      loan_type,
      transaction_date,
      due_date,
      phone_number,
    } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    if (!transaction_type) {
      return res.status(400).json({
        success: false,
        message: "transaction_type is required (EXPENSE, INCOME, or LOAN)",
      });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    if (!payment_mode) {
      return res.status(400).json({
        success: false,
        message: "payment_mode is required",
      });
    }

    if (!transaction_date) {
      return res.status(400).json({
        success: false,
        message: "transaction_date is required",
      });
    }

    // Validate transaction type specific fields
    if (transaction_type === "EXPENSE") {
      // Expense specific validation (all fields already validated above)
    } else if (transaction_type === "INCOME") {
      // Income specific validation (all fields already validated above)
    } else if (transaction_type === "LOAN") {
      if (!loan_type) {
        return res.status(400).json({
          success: false,
          message: "loan_type is required for LOAN transactions (BORROW or LENT)",
        });
      }
      if (loan_type !== "BORROW" && loan_type !== "LENT") {
        return res.status(400).json({
          success: false,
          message: "loan_type must be either BORROW or LENT",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction_type. Must be EXPENSE, INCOME, or LOAN",
      });
    }

    // Validate payment_mode
    const validPaymentModes = ["CASH", "UPI", "OTHER"];
    if (!validPaymentModes.includes(payment_mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment_mode. Must be CASH, UPI, or OTHER",
      });
    }

    // Create the transaction
    const transaction = await prisma.personalTransaction.create({
      data: {
        user_id,
        transaction_type,
        amount: parseFloat(amount),
        name: name.trim(),
        email: email ? email.trim() : null,
        category: category ? category.trim() : null,
        remark: remark ? remark.trim() : null,
        payment_mode,
        loan_type: transaction_type === "LOAN" ? loan_type : null,
        transaction_date: new Date(transaction_date),
        due_date: due_date ? new Date(due_date) : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Personal transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error in createPersonalTransaction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export const getAllPersonalTransaction = async (req, res) => {
  try {
    const user_id = req.params.user_id || req.query.user_id;
    const { page = 1, limit = 20, transaction_type, start_date, end_date, include_deleted = false } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      context_type: "PERSONAL",
      user_id,
    };

    if (!include_deleted || include_deleted === "false") {
      where.is_deleted = false;
    }

    if (transaction_type) {
      where.transaction_type = transaction_type;
    }

    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date.gte = new Date(start_date);
      if (end_date) where.transaction_date.lte = new Date(end_date);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { transaction_date: "desc" },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in getAllExpensesofPersonal:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

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