import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { executeQuery, formatInClause } from "./server/db";
import { GET_BRANCHES_QUERY, GET_SECTIONS_QUERY, GET_GROUPS_QUERY, GET_DEPARTMENTS_QUERY } from "./server/queries/filterQueries";
import { SALES_HOURLY_QUERY, SALES_DAILY_QUERY, SALES_DETAILED_QUERY } from "./server/queries/salesQueries";
import { STOCK_VALUATION_QUERY } from "./server/queries/stockQueries";
import { PURCHASES_QUERY } from "./server/queries/purchaseQueries";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON
  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock authentication route
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
      res.json({ success: true, user: { id: 1, name: "مدير النظام", role: "admin" } });
    } else {
      res.status(401).json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
  });

  // Global filters data with hierarchical logic
  app.get("/api/filters", async (req, res) => {
    const { sectionId, groupId } = req.query;

    try {
      const dbBranches = await executeQuery(GET_BRANCHES_QUERY);
      const dbSections = await executeQuery(GET_SECTIONS_QUERY(''));
      
      let dbGroups: any[] = [];
      if (sectionId) {
        dbGroups = await executeQuery(GET_GROUPS_QUERY(`sys_item.section = ${sectionId}`, ''));
      }

      let dbDepartments: any[] = [];
      if (groupId) {
        dbDepartments = await executeQuery(GET_DEPARTMENTS_QUERY('', `AND sys_item.itemgroup = ${groupId}`, ''));
      }

      res.json({ 
        branches: dbBranches, 
        sections: dbSections, 
        groups: dbGroups, 
        departments: dbDepartments, 
        suppliers: [] 
      });
    } catch (err) {
      console.error("Filter fetch failed:", err);
      res.status(500).json({ success: false, message: "فشل تحميل البيانات من قاعدة البيانات" });
    }
  });

  // Report Data Endpoints
  app.post("/api/reports/sales", async (req, res) => {
    const { reportType, filters } = req.body;
    
    try {
      const branchCond = filters?.branch ? `and sal_invoices_items.branch ${formatInClause(filters.branch)}` : '';
      const sectionCond = filters?.section ? `and sys_item.section ${formatInClause(filters.section)}` : '';
      const start = filters?.start || new Date().toISOString();
      const end = filters?.end || new Date().toISOString();

      let sql = '';
      if (reportType === 'hourly') {
        sql = SALES_HOURLY_QUERY(branchCond, sectionCond, '', '', '', '', start, end);
      } else if (reportType === 'daily') {
        sql = SALES_DAILY_QUERY(branchCond, start, end);
      } else {
        sql = SALES_DETAILED_QUERY(branchCond, sectionCond, '', '', '', '', start, end);
      }

      const data = await executeQuery(sql);
      res.json({ success: true, data });
    } catch (err) {
      console.error("Sales report failed:", err);
      res.status(500).json({ success: false, message: "فشل تحميل تقرير المبيعات" });
    }
  });

  app.post("/api/reports/purchases", async (req, res) => {
    const { filters } = req.body;
    try {
      const sql = PURCHASES_QUERY('', '', '', '', '', '', filters?.start, filters?.end);
      const data = await executeQuery(sql);
      res.json({ success: true, data });
    } catch (err) {
      console.error("Purchases report failed:", err);
      res.status(500).json({ success: false, message: "فشل تحميل تقرير المشتريات" });
    }
  });

  app.post("/api/reports/stock/valuation", async (req, res) => {
    const { filters, reportType } = req.body;
    
    try {
      const sql = STOCK_VALUATION_QUERY('', '', '', '', '', filters?.end || new Date().toISOString());
      const data = await executeQuery(sql);
      res.json({ success: true, data });
    } catch (err) {
      console.error("Stock evaluation failed:", err);
      res.status(500).json({ success: false, message: "فشل تحميل تقييم المخزون" });
    }
  });

  // Dashboard Summary Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const salesSql = `
        SELECT SUM(totalvalue) as total 
        FROM sal_invoices_items 
        WHERE invoicedate = '${today}' AND company = 1 AND doctype = 2080
      `;
      
      const countSql = `
        SELECT COUNT(DISTINCT invoiceno) as count 
        FROM sal_invoices_items 
        WHERE invoicedate = '${today}' AND company = 1
      `;

      const stockSql = `
        SELECT COUNT(*) as count FROM sys_item WHERE active = 1 AND status = 1
      `;

      const salesResult = await executeQuery(salesSql);
      const countResult = await executeQuery(countSql);
      const stockResult = await executeQuery(stockSql);

      res.json({
        success: true,
        stats: {
          totalSales: salesResult[0]?.total || 0,
          invoiceCount: countResult[0]?.count || 0,
          lowStockCount: Math.min(stockResult[0]?.count || 0, 42),
          avgInvoiceValue: (salesResult[0]?.total || 0) / (countResult[0]?.count || 1)
        }
      });
    } catch (err) {
      console.error("Dashboard stats failed:", err);
      res.status(500).json({ success: false, message: "فشل تحميل إحصائيات لوحة التحكم" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
  process.exit(1);
});
