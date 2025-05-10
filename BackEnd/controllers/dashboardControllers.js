const Income = require("../models/Income");
const Expense = require("../models/Expense");

// Import necessary helpers from Mongoose
const { isValidObjectId, Types } = require("mongoose");

// Controller to get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    // Extract user ID from the authenticated request (set by middleware)
    const userId = req.user.id;

    // Convert userId to MongoDB ObjectId type (required for aggregation match)
    const userObjectId = new Types.ObjectId(String(userId));

    // === 1. TOTAL INCOME ===

    // Aggregate total income for the user
    const totalIncome = await Income.aggregate([
      { $match: { userId: userObjectId } }, // Filter incomes by user
      { $group: { _id: null, total: { $sum: "$amount" } } }, // Sum all 'amount'
    ]);

    // Log output to debug data
    console.log("totalIncome", {
      totalIncome,
      userId: isValidObjectId(userId), // Check if ID is a valid ObjectId
    });

    // === 2. TOTAL EXPENSE ===

    // Aggregate total expenses for the user
    const totalExpense = await Expense.aggregate([
      { $match: { userId: userObjectId } }, // Filter expenses by user
      { $group: { _id: null, total: { $sum: "$amount" } } }, // Sum all 'amount'
    ]);

    // === 3. INCOME IN LAST 60 DAYS ===

    // Find income records from the past 60 days
    const last60DaysIncomeTransactions = await Income.find({
      userId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // 60 days ago
    }).sort({ date: -1 }); // Sort newest first

    // Reduce to calculate total income in last 60 days
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // === 4. EXPENSE IN LAST 30 DAYS ===

    // Find expense records from the past 30 days
    const last30DaysExpenseTransaction = await Expense.find({
      userId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days ago
    }).sort({ date: -1 });

    // Reduce to calculate total expense in last 30 days
    const expenseLast30Days = last30DaysExpenseTransaction.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // === 5. RECENT 5 TRANSACTIONS (INCOME + EXPENSE) ===

    // Fetch recent 5 income transactions, tag them with type
    const recentIncomes = await Income.find({ userId })
      .sort({ date: -1 })
      .limit(5);
    const recentIncomesWithType = recentIncomes.map((txn) => ({
      ...txn.toObject(),
      type: "income",
    }));

    // Fetch recent 5 expense transactions, tag them with type
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5);
    const recentExpensesWithType = recentExpenses.map((txn) => ({
      ...txn.toObject(),
      type: "expense",
    }));

    // Combine and sort all 10 recent transactions by date descending
    const lastTransaction = [
      ...recentIncomesWithType,
      ...recentExpensesWithType,
    ].sort((a, b) => b.date - a.date);

    // === 6. FINAL RESPONSE ===

    // Respond with compiled dashboard data
    res.json({
      totalBalance:
        (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0), // Net balance
      totalIncome: totalIncome[0]?.total || 0, // Total income
      totalExpense: totalExpense[0]?.total || 0, // Total expense
      last30DaysExpenses: {
        total: expenseLast30Days,
        transactions: last30DaysExpenseTransaction,
      },
      last60DaysIncomes: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions: lastTransaction,
    });
  } catch (err) {
    // Catch and return server errors
    res.status(500).json({ message: "Server error", err });
  }
};
