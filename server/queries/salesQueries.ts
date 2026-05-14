/**
 * Original SQL Queries for Sales Reports extracted from the legacy Python system.
 */

export const SALES_HOURLY_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, supplierCondition: string, productCondition: string, startDate: string, endDate: string) => `
    SELECT 
        DATEPART(hh, sal_invoices_items.expirydate) AS 'الساعة',
        SUM(sal_invoices_items.totalvalue) AS 'قيمة المبيعات',
        SUM(IIF(sal_invoices_items.doctype = 2080, 1, -1) * sal_invoices_items.qty) AS "عدد القطع",
        count(invoiceno) AS 'عدد الفواتير'
    FROM sal_invoices_items, sys_item
    WHERE (sal_invoices_items.itemean = sys_item.itemean) 
        AND (sal_invoices_items.transtype = 201 
        ${branchCondition} ${sectionCondition} ${groupCondition} ${departmentCondition} ${supplierCondition} ${productCondition}
        AND sal_invoices_items.doctype IN (2080, 2030) 
        AND sal_invoices_items.invoicedate BETWEEN '${startDate}' AND '${endDate}')
    GROUP BY DATEPART(hh, sal_invoices_items.expirydate)
    ORDER BY DATEPART(hh, sal_invoices_items.expirydate)
`;

export const SALES_DAILY_QUERY = (branchCondition: string, startDate: string, endDate: string) => `
    SELECT 
        ltrim(rTRIM(sys_branch.a_name)) AS 'الفرع', 
        FORMAT(sal_invoices_items.invoicedate, 'dd-MM-yyyy') AS 'التاريخ',
        SUM(CASE WHEN doctype = 2080 THEN 1 ELSE -1 END * sal_invoices_items.totalvalue) AS 'صافي اليومية',
        SUM(CASE WHEN doctype = 2030 THEN sal_invoices_items.totalvalue ELSE 0 END) AS 'مرتجعات'
    FROM sal_invoices_items
    INNER JOIN sys_branch ON sys_branch.branch = sal_invoices_items.branch
    WHERE ( sal_invoices_items.company = 1 AND sal_invoices_items.pos_id <> 9999 AND sal_invoices_items.doctype IN (2080, 2030) AND sal_invoices_items.transtype = 201
        AND sal_invoices_items.invoicedate BETWEEN '${startDate}' AND '${endDate}')
        ${branchCondition}
    GROUP BY sys_branch.a_name, sal_invoices_items.invoicedate
    ORDER BY sal_invoices_items.invoicedate DESC
`;

export const SALES_DETAILED_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, supplierCondition: string, productCondition: string, startDate: string, endDate: string) => `
    SELECT 
        sys_item.a_name AS 'المنتج', 
        sys_item.itemean AS 'كود الصنف', 
        (SELECT a_name FROM sys_section WHERE sys_section.section = sys_item.section) AS 'القسم',
        SUM(IIF(sal_invoices_items.doctype = 2080, 1, -1) * sal_invoices_items.qty) AS 'الكمية المباعة',
        AVG(sal_invoices_items.unitprice) AS 'متوسط سعر الوحدة',
        SUM(IIF(sal_invoices_items.doctype = 2080, 1, -1) * (sal_invoices_items.qty * sal_invoices_items.unitprice)) AS 'الإجمالي',
        SUM(IIF(sal_invoices_items.doctype = 2080, 1, -1) * sal_invoices_items.taxvalue) AS 'الضريبة',
        SUM(IIF(sal_invoices_items.doctype = 2080, 1, -1) * sal_invoices_items.totalvalue) AS 'الصافي'
    FROM sal_invoices_items
    INNER JOIN sys_item ON sal_invoices_items.itemean = sys_item.itemean
    WHERE ( sal_invoices_items.company = 1 
        AND sal_invoices_items.doctype IN (2080, 2030) 
        ${branchCondition} ${sectionCondition} ${groupCondition} ${departmentCondition} ${supplierCondition} ${productCondition}
        AND sal_invoices_items.transtype = 201 
        AND sal_invoices_items.invoicedate BETWEEN '${startDate}' AND '${endDate}')
    GROUP BY sys_item.itemean, sys_item.a_name, sys_item.section
    ORDER BY 'الصافي' DESC
`;
