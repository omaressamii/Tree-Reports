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
      // Fallback for preview
      const branches = [
        { id: 101, name: "فرع القاهرة" },
        { id: 102, name: "فرع الجيزة" },
        { id: 103, name: "فرع الإسكندرية" },
        { id: 104, name: "فرع طنطا" }
      ];

      const sections = [
        { id: 1, name: "مواد غذائية" },
        { id: 2, name: "منظفات" },
        { id: 3, name: "مجمدات" }
      ];

      let groups = [
        { id: 10, sectionId: 1, name: "زيوت وسمن" },
        { id: 11, sectionId: 1, name: "أرز ومكرونة" },
        { id: 12, sectionId: 2, name: "مساحيق غسيل" },
        { id: 13, sectionId: 3, name: "لحوم مجمدة" }
      ];

      let departments = [
        { id: 1001, groupId: 10, name: "زيوت نباتية" },
        { id: 1002, groupId: 10, name: "سمن طبيعي" },
        { id: 1101, groupId: 11, name: "أرز بسمتي" },
        { id: 1102, groupId: 11, name: "مكرونة مستوردة" }
      ];

      if (sectionId) groups = groups.filter(g => g.sectionId === Number(sectionId));
      if (groupId) departments = departments.filter(d => d.groupId === Number(groupId));

      res.json({ branches, sections, groups, departments, suppliers: [] });
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
      if (reportType === 'daily') {
        const data = [
          { "الفرع": "فرع القاهرة", "التاريخ": "2026-05-14", "صافي اليومية": 125400, "مرتجعات": 4500 },
          { "الفرع": "فرع الإسكندرية", "التاريخ": "2026-05-14", "صافي اليومية": 98700, "مرتجعات": 2100 }
        ];
        return res.json({ success: true, data });
      }

      if (reportType === 'hourly') {
        const data = Array.from({ length: 24 }, (_, i) => ({
          "الساعة": `${i.toString().padStart(2, '0')}:00`,
          "قيمة المبيعات": Math.floor(Math.random() * 50000),
          "عدد القطع": Math.floor(Math.random() * 1000),
          "عدد الفواتير": Math.floor(Math.random() * 200)
        }));
        return res.json({ success: true, data });
      }

      const data = [
        { "المنتج": "زيت عباد شمس 1 لتر", "كود الصنف": "62214589", "القسم": "مواد غذائية", "الكمية المباعة": 450, "سعر الوحدة": 65, "الإجمالي": 29250, "الضريبة": 4095, "الصافي": 33345 },
        { "المنتج": "أرز مصري 5 كجم", "كود الصنف": "62210023", "القسم": "مواد غذائية", "الكمية المباعة": 120, "سعر الوحدة": 150, "الإجمالي": 18000, "الضريبة": 0, "الصافي": 18000 },
      ];
      res.json({ success: true, data });
    }
  });

  app.post("/api/reports/purchases", async (req, res) => {
    const { filters } = req.body;
    try {
      const sql = PURCHASES_QUERY('', '', '', '', '', '', filters?.start, filters?.end);
      const data = await executeQuery(sql);
      res.json({ success: true, data });
    } catch (err) {
      const data = [
        { "المورد": "يونيليفر مصر", "القسم": "منظفات", "المجموعة الرئيسية": "مساحيق غسيل", "كمية المشتريات": 1500, "صافي القيمة": 45000 },
        { "المورد": "صافولا", "القسم": "مواد غذائية", "المجموعة الرئيسية": "زيوت وسمن", "كمية المشتريات": 2000, "صافي القيمة": 85000 }
      ];
      res.json({ success: true, data });
    }
  });

  app.post("/api/reports/stock/valuation", async (req, res) => {
    const { filters, reportType } = req.body;
    
    try {
      const sql = STOCK_VALUATION_QUERY('', '', '', '', '', filters?.end || new Date().toISOString());
      const data = await executeQuery(sql);
      res.json({ success: true, data });
    } catch (err) {
      if (reportType === 'balance') {
        const data = [
          { "المنتج": "زيت هلا 1 لتر", "كود الصنف": "10020", "فرع القاهرة": 450, "فرع الإسكندرية": 320, "فرع طنطا": 150, "إجمالي": 920 },
          { "المنتج": "أرز الساعة 5 كجم", "كود الصنف": "10055", "فرع القاهرة": 120, "فرع الإسكندرية": 85, "فرع طنطا": 240, "إجمالي": 445 }
        ];
        return res.json({ success: true, data });
      }

      const data = [
        { "المجموعة": "زيوت", "كود الصنف": "10020", "الاسم": "زيت هلا 1 لتر", "الكمية": 1420, "سعر التكلفة": 42.5, "قيمة المخزون": 1420 * 42.5 },
        { "المجموعة": "أرز", "كود الصنف": "10055", "الاسم": "أرز الساعة 5 كجم", "الكمية": 850, "سعر التكلفة": 145, "قيمة المخزون": 850 * 145 }
      ];
      res.json({ success: true, data });
    }
  });

  // Dashboard Summary Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Query for total sales today
      const salesSql = `
        SELECT SUM(totalvalue) as total 
        FROM sal_invoices_items 
        WHERE invoicedate = '${today}' AND company = 1 AND doctype = 2080
      `;
      
      // Query for invoice count
      const countSql = `
        SELECT COUNT(DISTINCT invoiceno) as count 
        FROM sal_invoices_items 
        WHERE invoicedate = '${today}' AND company = 1
      `;

      // Query for low stock items (example limit 10)
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
          lowStockCount: Math.min(stockResult[0]?.count, 42), // Placeholder logic for now
          avgInvoiceValue: (salesResult[0]?.total || 0) / (countResult[0]?.count || 1)
        }
      });
    } catch (err) {
      console.error("Dashboard stats failed, returning demo data:", err);
      // Fallback for demo when DB is unreachable
      res.json({
        success: true,
        stats: {
          totalSales: 842500.5,
          invoiceCount: 1254,
          lowStockCount: 42,
          avgInvoiceValue: 672.4
        }
      });
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
