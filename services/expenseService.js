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
    transaction_time,
    due_date,
  } = data;

  // Combine date and time if time is provided
  let finalTransactionDate;
  if (transaction_date && transaction_time) {
    // Parse date (YYYY-MM-DD format) and time (HH:mm format)
    const [year, month, day] = transaction_date.split('-').map(Number);
    const [hours, minutes] = transaction_time.split(':').map(Number);
    
    // Create date in local timezone (no UTC conversion)
    finalTransactionDate = new Date(year, month - 1, day, hours, minutes);
  } else {
    finalTransactionDate = new Date(transaction_date);
  }

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
      transaction_date: finalTransactionDate,
      due_date: due_date ? new Date(due_date) : null,
    },
  });
};

export const getAllPersonalTransactionsService = async (user_id, query) => {
  const {
    page = 1,
    limit = 20,
    transaction_type,
    loan_type,
    payment_mode,
    category,
    name,
    search,
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

  // filter by transaction type
  if (transaction_type) {
    where.transaction_type = transaction_type;
  }

  // filter by loan type
  if (loan_type) {
    where.loan_type = loan_type;
  }

  // filter by payment mode
  if (payment_mode) {
    where.payment_mode = payment_mode;
  }

  // filter by category
  if (category) {
    where.category = category;
  }

  // filter by name (exact match with case-insensitive)
  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive'
    };
  }

  // search filter (name, email, remark)
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        email: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        remark: {
          contains: search,
          mode: 'insensitive'
        }
      }
    ];
  }

  // date range filter
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

  // Format the response to include separate date and time fields
  const formattedTransactions = transactions.map(transaction => ({
    ...transaction,
    transaction_date: transaction.transaction_date.toISOString().split('T')[0], // YYYY-MM-DD
    transaction_time: transaction.transaction_date.toISOString().split('T')[1].substring(0, 5), // HH:mm
  }));

  const totalPages = Math.ceil(total / limitNum);

  return {
    transactions: formattedTransactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1,
  };
};

export const getExpenseSummaryService = async (user_id, query = {}) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const {
    start_date,
    end_date,
    include_business = "false",
    business_id,
  } = query;

  // Base where clause for personal transactions
  const personalWhere = {
    user_id,
    is_deleted: false,
  };

  // Get all business IDs for the user
  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true },
  });

  const businessIds = userBusinesses.map(b => b.business_id);

  // Filter by specific business if provided
  const targetBusinessIds = business_id 
    ? businessIds.filter(id => id === business_id)
    : businessIds;

  if (targetBusinessIds.length === 0 && business_id) {
    throw new Error("Business not found or not authorized");
  }

  // Base where clause for business transactions
  const businessWhere = {
    business_id: { in: targetBusinessIds },
    is_deleted: false,
    context_type: "BUSINESS",
  };

  // Apply date filters if provided
  if (start_date || end_date) {
    const dateFilter = {};
    if (start_date) {
      dateFilter.gte = new Date(start_date);
    }
    if (end_date) {
      dateFilter.lte = new Date(end_date);
    }
    personalWhere.transaction_date = dateFilter;
    businessWhere.transaction_date = dateFilter;
  }

  // Personal transaction aggregations
  const [personalIncomeResult,personalExpenseResult,borrowResult,lentResult,] = await Promise.all([
    prisma.personalTransaction.aggregate({
      where: {
        ...personalWhere,
        transaction_type: "INCOME",
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.personalTransaction.aggregate({
      where: {
        ...personalWhere,
        transaction_type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.personalTransaction.aggregate({
      where: {
        ...personalWhere,
        transaction_type: "LOAN",
        loan_type: "BORROW",
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.personalTransaction.aggregate({
      where: {
        ...personalWhere,
        transaction_type: "LOAN",
        loan_type: "LENT",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const personalIncome = parseFloat(personalIncomeResult._sum.amount || 0);
  const personalExpense = parseFloat(personalExpenseResult._sum.amount || 0);
  
  const totalBorrowed = parseFloat(
    borrowResult._sum.amount || 0
  );

  const totalLent = parseFloat(
    lentResult._sum.amount || 0
  );

  const totalLoan = totalBorrowed - totalLent;


  let businessIncome = 0;
  let businessExpense = 0;

  // Include business transactions if requested
  if (include_business === "true") {
    const [businessIncomeResult, businessExpenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...businessWhere, transaction_type: "SALE" },
        _sum: { total_amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...businessWhere, transaction_type: "EXPENSE" },
        _sum: { total_amount: true },
      }),
    ]);

    businessIncome = parseFloat(businessIncomeResult._sum.total_amount || 0);
    businessExpense = parseFloat(businessExpenseResult._sum.total_amount || 0);
  }

  const totalIncome = personalIncome + businessIncome;
  const totalExpense = personalExpense + businessExpense;

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    total_loan: totalLoan,
    net_balance: totalIncome - totalExpense +totalBorrowed,
    borrowed_amount: totalBorrowed,
    lent_amount: totalLent,
    breakdown: {
      personal: {
        income: personalIncome,
        expense: personalExpense,
      },
      business: {
        income: businessIncome,
        expense: businessExpense,
      },
    },
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

  // Format the response to include separate date and time fields
  const formattedTransaction = {
    ...transaction,
    transaction_date: transaction.transaction_date.toISOString().split('T')[0], // YYYY-MM-DD
    transaction_time: transaction.transaction_date.toTimeString().split(' ')[0].substring(0, 5), // HH:mm
  };

  return formattedTransaction;
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
    transaction_time,
    due_date,
  } = data;

  // Combine date and time if time is provided
  let finalTransactionDate;
  if (transaction_date && transaction_time) {
    // Parse date (YYYY-MM-DD format) and time (HH:mm format)
    const [year, month, day] = transaction_date.split('-').map(Number);
    const [hours, minutes] = transaction_time.split(':').map(Number);
    
    // Create date in local timezone (no UTC conversion)
    finalTransactionDate = new Date(year, month - 1, day, hours, minutes);
  } else {
    finalTransactionDate = new Date(transaction_date);
  }

  const updateData = {
    transaction_type,
    amount: parseFloat(amount),
    name: name.trim(),
    email: email?.trim() || null,
    category: category?.trim() || null,
    remark: remark?.trim() || null,
    payment_mode,
    loan_type: transaction_type === "LOAN" ? loan_type : null,
    transaction_date: finalTransactionDate,
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
    items = [],
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

export const deleteBusinessTransactionService = async (user_id, transaction_id) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // Verify transaction exists and belongs to user's business
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

  // Soft delete
  await prisma.transaction.update({
    where: { transaction_id },
    data: {
      is_deleted: true,
      updated_by_user_id: user_id,
    },
  });

  return { success: true, message: "Transaction deleted successfully" };
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

  // Format transactions - conditionally include party and items based on transaction type
  const formattedTransactions = transactions.map(transaction => {
    const baseTransaction = {
      transaction_id: transaction.transaction_id,
      transaction_number: transaction.transaction_number,
      business_id: transaction.business_id,
      transaction_type: transaction.transaction_type,
      transaction_date: transaction.transaction_date.toISOString().split('T')[0],
      transaction_time: transaction.transaction_date.toISOString().split('T')[1].substring(0, 5),
      due_date: transaction.due_date ? transaction.due_date.toISOString().split('T')[0] : null,
      subtotal_amount: transaction.subtotal_amount,
      total_gst_amount: transaction.total_gst_amount,
      total_amount: transaction.total_amount,
      is_deleted: transaction.is_deleted,
      created_at: transaction.created_at,
    };

    // For EXPENSE transactions, only include basic fields (no party and items)
    if (transaction.transaction_type === "EXPENSE") {
      return {
        ...baseTransaction,
        // Add minimal fields for expense
      };
    }

    // For SALE and other transactions, include party and items
    return {
      ...baseTransaction,
      party: transaction.party,
      items: transaction.items,
    };
  });

  return {
    transactions: formattedTransactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};