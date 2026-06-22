import {prisma} from "../models/db.js";


export const createPersonalTransactionService = async (data) => {
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
  } = data;

  return await prisma.personalTransaction.create({
    data: {
      user_id,
      transaction_type,
      amount: parseFloat(amount),
      name: name.trim(),
      email: email?.trim() || null,
      category: category?.trim() || null,
      remark: remark?.trim() || null,
      payment_mode,
      loan_type: transaction_type === "LOAN" ? loan_type : null,
      transaction_date: new Date(transaction_date),
      due_date: due_date ? new Date(due_date) : null,
    },
  });
};

export const getAllPersonalTransactionsService = async (query) => {
  const {
    user_id,
    page = 1,
    limit = 20,
    transaction_type,
    start_date,
    end_date,
    include_deleted = "false",
  } = query;

  if (!user_id) {
    throw new Error("user_id is required");
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {
    user_id, // MUST be UUID
  };

  // soft delete filter
  if (include_deleted !== "true") {
    where.is_deleted = false;
  }

  // filter by type
  if (transaction_type) {
    where.transaction_type = transaction_type;
  }

  // date filter
  if (start_date || end_date) {
    where.transaction_date = {};

    if (start_date) {
      where.transaction_date.gte = new Date(start_date);
    }

    if (end_date) {
      where.transaction_date.lte = new Date(end_date);
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.personalTransaction.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        transaction_date: "desc",
      },
    }),

    prisma.personalTransaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};