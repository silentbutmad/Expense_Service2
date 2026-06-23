import {prisma} from "../models/db.js";


export const createPersonalTransactionService = async ( user_id,data) => {
  
  const {
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

export const getAllPersonalTransactionsService = async ( user_id,query) => {
  const {
    
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

export const getExpenseSummaryService = async (user_id) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const where = {
    user_id,
    is_deleted: false,
  };

  const [incomeResult, expenseResult, loanResult] = await Promise.all([
    prisma.personalTransaction.aggregate({
      where: { ...where, transaction_type: "RECEIVED" },
      _sum: { amount: true },
    }),
    prisma.personalTransaction.aggregate({
      where: { ...where, transaction_type: "PAID" },
      _sum: { amount: true },
    }),
    prisma.personalTransaction.aggregate({
      where: { ...where, transaction_type: "LOAN" },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = parseFloat(incomeResult._sum.amount || 0);
  const totalExpense = parseFloat(expenseResult._sum.amount || 0);
  const totalLoan = parseFloat(loanResult._sum.amount || 0);

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    total_loan: totalLoan,
    net_balance: totalIncome - totalExpense,
  };
};

export const getTransactionByIdService = async (user_id, id) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const transaction = await prisma.personalTransaction.findFirst({
    where: {
      transaction_id: id,
      user_id,
      is_deleted: false,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
};

export const getTransactionsByPersonService = async (user_id, name) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const transactions = await prisma.personalTransaction.findMany({
    where: {
      user_id,
      is_deleted: false,
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
    orderBy: {
      transaction_date: "desc",
    },
  });

  return transactions;
};

export const updateTransactionService = async (user_id, id, data) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const existingTransaction = await prisma.personalTransaction.findFirst({
    where: {
      transaction_id: id,
      user_id,
      is_deleted: false,
    },
  });

  if (!existingTransaction) {
    throw new Error("Transaction not found");
  }

  const {
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

  const updateData = {
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
    updated_by_user_id: user_id,
  };

  return await prisma.personalTransaction.update({
    where: { transaction_id: id },
    data: updateData,
  });
};

export const createReminderService = async (user_id, data) => {
  const {
    transaction_id,
    channel,
    scheduled_date,
  } = data;

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findFirst({
    where: {
      transaction_id,
      user_id,
      is_deleted: false,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return await prisma.reminder.create({
    data: {
      transaction_id,
      channel,
      scheduled_date: new Date(scheduled_date),
    },
  });
};

export const createBusinessTransactionService = async (user_id, data) => {
  const {
    business_id,
    party_id,
    transaction_type,
    transaction_date,
    due_date,
    items,
    subtotal_amount,
    total_gst_amount,
    total_amount,
  } = data;

  // Generate transaction number
  const lastTransaction = await prisma.transaction.findFirst({
    where: { business_id },
    orderBy: { created_at: "desc" },
    select: { transaction_number: true },
  });

  const nextNumber = lastTransaction 
    ? parseInt(lastTransaction.transaction_number) + 1 
    : 1;

  const transaction = await prisma.transaction.create({
    data: {
      business_id,
      party_id: party_id || null,
      user_id,
      transaction_number: nextNumber.toString(),
      context_type: "BUSINESS",
      transaction_type,
      transaction_date: new Date(transaction_date),
      due_date: due_date ? new Date(due_date) : null,
      subtotal_amount: parseFloat(subtotal_amount),
      total_gst_amount: parseFloat(total_gst_amount),
      total_amount: parseFloat(total_amount),
      created_by_user_id: user_id,
      items: {
        create: items.map(item => ({
          item_id: item.item_id || null,
          description: item.description || null,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
      },
    },
    include: {
      items: true,
      party: true,
    },
  });

  return transaction;
};

export const getAllBusinessTransactionsService = async (user_id, query) => {
  const {
    page = 1,
    limit = 20,
    business_id,
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
    user_id,
    context_type: "BUSINESS",
  };

  if (include_deleted !== "true") {
    where.is_deleted = false;
  }

  if (business_id) {
    where.business_id = business_id;
  }

  if (transaction_type) {
    where.transaction_type = transaction_type;
  }

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
    prisma.transaction.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        transaction_date: "desc",
      },
      include: {
        party: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    }),

    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};