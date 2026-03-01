import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import https from "https";
import { IncomingMessage } from "http";
import axios from "axios";

const db = new Database("finance.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    is_fixed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bills_payable (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'paid')) NOT NULL DEFAULT 'pending',
    category TEXT NOT NULL,
    payment_method TEXT DEFAULT 'boleto',
    card_provider TEXT,
    payment_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bills_receivable (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'received')) NOT NULL DEFAULT 'pending',
    category TEXT NOT NULL,
    payment_method TEXT DEFAULT 'boleto',
    payment_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount_invested REAL NOT NULL,
    current_value REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS monthly_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    month TEXT NOT NULL,
    name TEXT NOT NULL,
    essential_percent REAL NOT NULL,
    leisure_percent REAL NOT NULL,
    investment_percent REAL NOT NULL,
    achieved INTEGER,
    reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month)
  );

  CREATE TABLE IF NOT EXISTS app_options (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add is_fixed column if it doesn't exist
try {
  db.exec("ALTER TABLE transactions ADD COLUMN is_fixed INTEGER DEFAULT 0");
} catch (e) {
  // Column already exists, ignore error
}

// Migration: Add payment_method column to bills_payable if it doesn't exist
try {
  db.exec("ALTER TABLE bills_payable ADD COLUMN payment_method TEXT DEFAULT 'boleto'");
} catch (e) {
  // Column already exists, ignore error
}

// Migration: Add card_provider column to bills_payable if it doesn't exist
try {
  db.exec("ALTER TABLE bills_payable ADD COLUMN card_provider TEXT");
} catch (e) {
  // Column already exists, ignore error
}

// Migration: Add payment_date column to bills_payable if it doesn't exist
try {
  db.exec("ALTER TABLE bills_payable ADD COLUMN payment_date TEXT");
} catch (e) {
  // Column already exists, ignore error
}

// Migration: Add payment_date column to bills_receivable if it doesn't exist
try {
  db.exec("ALTER TABLE bills_receivable ADD COLUMN payment_date TEXT");
} catch (e) {
  // Column already exists, ignore error
}

// Migration: Add investment_id column to bills_payable if it doesn't exist
try {
  db.exec("ALTER TABLE bills_payable ADD COLUMN investment_id TEXT");
} catch (e) {
  // Column already exists, ignore error
}

// Migration: Add secondary_description column to bills_payable if it doesn't exist
try {
  db.exec("ALTER TABLE bills_payable ADD COLUMN secondary_description TEXT");
} catch (e) {
  // Column already exists, ignore error
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC").all().map((t: any) => ({
      ...t,
      isFixed: !!t.is_fixed
    }));
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const { description, amount, type, category, date, isFixed, months = 1 } = req.body;
    
    const insert = db.prepare(
      "INSERT INTO transactions (description, amount, type, category, date, is_fixed) VALUES (?, ?, ?, ?, ?, ?)"
    );

    if (isFixed && months > 1) {
      const startDate = new Date(date);
      for (let i = 0; i < months; i++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(startDate.getMonth() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        insert.run(description, amount, type, category, dateStr, 1);
      }
      res.json({ success: true, count: months });
    } else {
      const info = insert.run(description, amount, type, category, date, isFixed ? 1 : 0);
      res.json({ id: info.lastInsertRowid });
    }
  });

  app.delete("/api/transactions/:id", (req, res) => {
    db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Bills Payable Routes
  app.get("/api/bills-payable", (req, res) => {
    const bills = db.prepare("SELECT * FROM bills_payable ORDER BY due_date ASC").all();
    res.json(bills);
  });

  app.post("/api/bills-payable", (req, res) => {
    const { description, secondaryDescription, amount, dueDate, category, paymentMethod, cardProvider, investmentId, isRepeated, months = 1, installments = 1, paidInstallments = 0, sameDayDue = true } = req.body;
    const userId = "user-123"; // Mock user_id for now
    
    const insert = db.prepare(
      "INSERT INTO bills_payable (id, user_id, description, secondary_description, amount, due_date, category, payment_method, card_provider, investment_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    // Determine total number of bills to create
    // If installments > 1, use that. Otherwise use months if repeated.
    const isInstallment = (paymentMethod === 'credit_card' || paymentMethod === 'installments') && installments > 1;
    const count = isInstallment ? installments : (isRepeated && months > 1 ? months : 1);
    
    const startDate = new Date(dueDate);
    const installmentAmount = isInstallment ? amount / count : amount;
    
    const startIndex = isInstallment ? paidInstallments : 0;

    for (let i = startIndex; i < count; i++) {
      const id = crypto.randomUUID();
      const currentDate = new Date(startDate);
      
      // Calculate due date
      if (sameDayDue) {
        // Same day of month logic
        currentDate.setMonth(startDate.getMonth() + (i - startIndex));
      } else {
        // Just add 30 days for each subsequent bill if not same day
        currentDate.setDate(startDate.getDate() + ((i - startIndex) * 30));
      }
      
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Add installment info to description if applicable
      const desc = isInstallment ? `${description} (${i + 1}/${count})` : description;
      
      insert.run(id, userId, desc, secondaryDescription || null, installmentAmount, dateStr, category, paymentMethod || 'boleto', cardProvider || null, investmentId || null);
    }

    res.json({ success: true, count: count - startIndex });
  });

  app.patch("/api/bills-payable/:id", (req, res) => {
    const { description, secondaryDescription, amount, dueDate, category, paymentMethod, cardProvider, investmentId } = req.body;
    
    const updates = [];
    const params = [];

    if (description) { updates.push("description = ?"); params.push(description); }
    if (secondaryDescription !== undefined) { updates.push("secondary_description = ?"); params.push(secondaryDescription); }
    if (amount) { updates.push("amount = ?"); params.push(amount); }
    if (dueDate) { updates.push("due_date = ?"); params.push(dueDate); }
    if (category) { updates.push("category = ?"); params.push(category); }
    if (paymentMethod) { updates.push("payment_method = ?"); params.push(paymentMethod); }
    if (cardProvider !== undefined) { updates.push("card_provider = ?"); params.push(cardProvider); }
    if (investmentId !== undefined) { updates.push("investment_id = ?"); params.push(investmentId); }

    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE bills_payable SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    
    res.json({ success: true });
  });

  app.patch("/api/bills-payable/:id/status", (req, res) => {
    const { status, paymentDate } = req.body;
    const id = req.params.id;

    // Get current bill status and investment_id
    const bill: any = db.prepare("SELECT * FROM bills_payable WHERE id = ?").get(id);

    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const currentStatus = bill.status;
    const investmentId = bill.investment_id;
    const amount = bill.amount;

    // Update bill status
    db.prepare("UPDATE bills_payable SET status = ?, payment_date = ? WHERE id = ?").run(status, paymentDate || null, id);

    // Update investment value if applicable
    if (investmentId) {
      if (status === 'paid' && currentStatus !== 'paid') {
        // Subtract from investment
        db.prepare("UPDATE investments SET current_value = current_value - ? WHERE id = ?").run(amount, investmentId);
      } else if (status === 'pending' && currentStatus === 'paid') {
        // Add back to investment (refund)
        db.prepare("UPDATE investments SET current_value = current_value + ? WHERE id = ?").run(amount, investmentId);
      }
    }

    res.json({ success: true });
  });

  app.delete("/api/bills-payable/:id", (req, res) => {
    db.prepare("DELETE FROM bills_payable WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Bills Receivable Routes
  app.get("/api/bills-receivable", (req, res) => {
    const bills = db.prepare("SELECT * FROM bills_receivable ORDER BY due_date ASC").all();
    res.json(bills);
  });

  app.post("/api/bills-receivable", (req, res) => {
    const { description, amount, dueDate, category, paymentMethod, isRepeated, months = 1 } = req.body;
    const userId = "user-123"; // Mock user_id for now
    
    const insert = db.prepare(
      "INSERT INTO bills_receivable (id, user_id, description, amount, due_date, category, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    const count = isRepeated && months > 1 ? months : 1;
    const startDate = new Date(dueDate);

    for (let i = 0; i < count; i++) {
      const id = crypto.randomUUID();
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      insert.run(id, userId, description, amount, dateStr, category, paymentMethod || 'boleto');
    }

    res.json({ success: true, count });
  });

  app.patch("/api/bills-receivable/:id/status", (req, res) => {
    const { status, paymentDate } = req.body;
    db.prepare("UPDATE bills_receivable SET status = ?, payment_date = ? WHERE id = ?").run(status, paymentDate || null, req.params.id);
    res.json({ success: true });
  });

  app.patch("/api/bills-receivable/:id", (req, res) => {
    const { description, amount, dueDate, category, paymentMethod } = req.body;
    
    const updates = [];
    const params = [];

    if (description) { updates.push("description = ?"); params.push(description); }
    if (amount) { updates.push("amount = ?"); params.push(amount); }
    if (dueDate) { updates.push("due_date = ?"); params.push(dueDate); }
    if (category) { updates.push("category = ?"); params.push(category); }
    if (paymentMethod) { updates.push("payment_method = ?"); params.push(paymentMethod); }

    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE bills_receivable SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/bills-receivable/:id", (req, res) => {
    db.prepare("DELETE FROM bills_receivable WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Investments Routes
  app.get("/api/investments", (req, res) => {
    const investments = db.prepare(`
      SELECT 
        i.*, 
        (SELECT COALESCE(SUM(amount), 0) FROM bills_payable b WHERE b.investment_id = i.id AND b.status = 'pending') as total_linked_payable 
      FROM investments i 
      ORDER BY i.purchase_date DESC
    `).all();
    res.json(investments);
  });

  app.post("/api/investments", (req, res) => {
    const { name, type, amountInvested, currentValue, purchaseDate } = req.body;
    const userId = "user-123"; // Mock user_id
    const id = crypto.randomUUID();
    
    db.prepare(
      "INSERT INTO investments (id, user_id, name, type, amount_invested, current_value, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, userId, name, type, amountInvested, currentValue, purchaseDate);

    res.json({ id });
  });

  app.patch("/api/investments/:id", (req, res) => {
    const { name, type, amountInvested, currentValue, purchaseDate } = req.body;
    
    const updates = [];
    const params = [];

    if (name) { updates.push("name = ?"); params.push(name); }
    if (type) { updates.push("type = ?"); params.push(type); }
    if (amountInvested) { updates.push("amount_invested = ?"); params.push(amountInvested); }
    if (currentValue) { updates.push("current_value = ?"); params.push(currentValue); }
    if (purchaseDate) { updates.push("purchase_date = ?"); params.push(purchaseDate); }

    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE investments SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    
    res.json({ success: true });
  });

  app.post("/api/investments/:id/redeem", (req, res) => {
    const { amount, date } = req.body;
    const id = req.params.id;

    const investment: any = db.prepare("SELECT * FROM investments WHERE id = ?").get(id);

    if (!investment) {
      res.status(404).json({ error: "Investment not found" });
      return;
    }

    if (amount > investment.current_value) {
      res.status(400).json({ error: "Redeem amount cannot be greater than current value" });
      return;
    }

    // Subtract from investment current value
    db.prepare("UPDATE investments SET current_value = current_value - ? WHERE id = ?").run(amount, id);

    // Add as an income transaction
    db.prepare(
      "INSERT INTO transactions (description, amount, type, category, date, is_fixed) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(`Resgate: ${investment.name}`, amount, 'income', 'Investimentos', date, 0);

    res.json({ success: true });
  });

  app.delete("/api/investments/:id", (req, res) => {
    db.prepare("DELETE FROM investments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Monthly Goals Routes
  app.get("/api/goals/:month", (req, res) => {
    const userId = "user-123";
    const month = req.params.month;
    const goal = db.prepare("SELECT * FROM monthly_goals WHERE user_id = ? AND month = ?").get(userId, month);
    res.json(goal || null);
  });

  app.post("/api/goals", (req, res) => {
    const { month, name, essentialPercent, leisurePercent, investmentPercent } = req.body;
    const userId = "user-123";
    const id = crypto.randomUUID();
    
    try {
      db.prepare(
        "INSERT INTO monthly_goals (id, user_id, month, name, essential_percent, leisure_percent, investment_percent) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(id, userId, month, name, essentialPercent, leisurePercent, investmentPercent);
      res.json({ id });
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: "Goal already exists for this month" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.patch("/api/goals/:id", (req, res) => {
    const { name, essentialPercent, leisurePercent, investmentPercent } = req.body;
    
    const updates = [];
    const params = [];

    if (name) { updates.push("name = ?"); params.push(name); }
    if (essentialPercent !== undefined) { updates.push("essential_percent = ?"); params.push(essentialPercent); }
    if (leisurePercent !== undefined) { updates.push("leisure_percent = ?"); params.push(leisurePercent); }
    if (investmentPercent !== undefined) { updates.push("investment_percent = ?"); params.push(investmentPercent); }

    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE monthly_goals SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    
    res.json({ success: true });
  });

  app.patch("/api/goals/:id/evaluate", (req, res) => {
    const { achieved, reason } = req.body;
    db.prepare("UPDATE monthly_goals SET achieved = ?, reason = ? WHERE id = ?").run(achieved ? 1 : 0, reason || null, req.params.id);
    res.json({ success: true });
  });

  // App Options Routes
  app.get("/api/options", (req, res) => {
    const userId = "user-123";
    let options = db.prepare("SELECT * FROM app_options WHERE user_id = ? ORDER BY type, label").all(userId);
    
    if (options.length === 0) {
      // Seed defaults
      const defaults = [
        { type: 'expense_category', label: 'Alimentação', value: 'Alimentação' },
        { type: 'expense_category', label: 'Transporte', value: 'Transporte' },
        { type: 'expense_category', label: 'Moradia', value: 'Moradia' },
        { type: 'expense_category', label: 'Saúde', value: 'Saúde' },
        { type: 'expense_category', label: 'Lazer', value: 'Lazer' },
        { type: 'expense_category', label: 'Educação', value: 'Educação' },
        { type: 'expense_category', label: 'Outros', value: 'Outros' },
        { type: 'income_category', label: 'Salário', value: 'Salário' },
        { type: 'income_category', label: 'Freelance', value: 'Freelance' },
        { type: 'income_category', label: 'Investimentos', value: 'Investimentos' },
        { type: 'income_category', label: 'Outros', value: 'Outros' },
        { type: 'payment_method', label: 'PIX', value: 'pix' },
        { type: 'payment_method', label: 'Boleto', value: 'boleto' },
        { type: 'payment_method', label: 'Cartão de Crédito', value: 'credit_card' },
        { type: 'payment_method', label: 'Cartão de Débito', value: 'debit_card' },
        { type: 'payment_method', label: 'Transferência', value: 'transfer' },
        { type: 'payment_method', label: 'Dinheiro', value: 'cash' },
        { type: 'credit_card', label: 'Nubank', value: 'Nubank' },
        { type: 'credit_card', label: 'Itaú', value: 'Itaú' },
        { type: 'credit_card', label: 'Bradesco', value: 'Bradesco' },
        { type: 'credit_card', label: 'Santander', value: 'Santander' },
        { type: 'credit_card', label: 'Inter', value: 'Inter' },
        { type: 'credit_card', label: 'C6 Bank', value: 'C6 Bank' },
        { type: 'credit_card', label: 'Outro', value: 'Outro' },
        { type: 'funding_source', label: 'Saldo / Salário', value: 'balance' },
        { type: 'funding_source', label: 'Investimentos', value: 'investment' },
      ];

      const insert = db.prepare("INSERT INTO app_options (id, user_id, type, label, value) VALUES (?, ?, ?, ?, ?)");
      db.transaction(() => {
        for (const opt of defaults) {
          insert.run(crypto.randomUUID(), userId, opt.type, opt.label, opt.value);
        }
      })();
      
      options = db.prepare("SELECT * FROM app_options WHERE user_id = ? ORDER BY type, label").all(userId);
    }

    res.json(options);
  });

  app.post("/api/options", (req, res) => {
    const { type, label, value } = req.body;
    const userId = "user-123";
    const id = crypto.randomUUID();
    
    db.prepare(
      "INSERT INTO app_options (id, user_id, type, label, value) VALUES (?, ?, ?, ?, ?)"
    ).run(id, userId, type, label, value);

    res.json({ id });
  });

  app.patch("/api/options/:id", (req, res) => {
    const { label, value } = req.body;
    
    const updates = [];
    const params = [];

    if (label) { updates.push("label = ?"); params.push(label); }
    if (value) { updates.push("value = ?"); params.push(value); }

    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE app_options SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/options/:id", (req, res) => {
    db.prepare("DELETE FROM app_options WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Image Proxy Route
  app.get("/api/image-proxy", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      res.status(400).send("URL is required");
      return;
    }

    try {
      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      res.setHeader("Content-Type", response.headers["content-type"] || "image/png");
      response.data.pipe(res);
    } catch (error: any) {
      const statusCode = error.response?.status || 500;
      console.error(`Failed to fetch image: ${statusCode} - ${error.message}`);
      res.status(statusCode).send(`Failed to fetch image: ${statusCode}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
