/**
 * Original SQL Queries for Sales Reports extracted from the legacy Python system.
 */

export const SALES_HOURLY_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, supplierCondition: string, productCondition: string, startDate: string, endDate: string) => `
    SELECT 
        FORMAT(sal_invoices_items.invoicedate, 'yyyy-MM-dd') 'اليوم', 
        DATEPART(hh, sal_invoices_items.expirydate) AS 'الساعة',
        SUM(sal_invoices_items.totalvalue) AS 'قيمة المبيعات',
        SUM(IIF(sal_invoices_items.doctype = 2080, 1, -1) * sal_invoices_items.qty) "عدد القطع",
        count(invoiceno) 'عدد الفواتير',
        (SELECT trim(sys_branch.a_name) +'-' + convert(char,sys_branch.branch) FROM sys_branch WHERE sal_invoices_items.branch=sys_branch.branch) 'الفرع'
    FROM sal_invoices_items, sys_item
    WHERE (sal_invoices_items.itemean = sys_item.itemean) 
        AND (sal_invoices_items.transtype =201 
        ${branchCondition} ${sectionCondition} ${groupCondition} ${departmentCondition} ${supplierCondition} ${productCondition}
        AND sal_invoices_items.doctype IN (2080, 2030) 
        AND sal_invoices_items.invoicedate BETWEEN '${startDate}' AND '${endDate}')
    GROUP BY sal_invoices_items.branch, FORMAT(sal_invoices_items.invoicedate, 'yyyy-MM-dd'), DATEPART(hh, sal_invoices_items.expirydate)
`;

export const SALES_DAILY_QUERY = (branchCondition: string, startDate: string, endDate: string) => `
    SELECT 
        ltrim(rTRIM(sys_branch.a_name)) الفرع, 
        sal_invoices_items.doctype, 
        FORMAT(sal_invoices_items.invoicedate, 'dd-MM-yyyy') التاريخ,
        SUM(CASE WHEN doctype =2080 THEN 1 ELSE -1 END * (qty*sys_item_units.peices)) AS total_value
    FROM sal_invoices_items
    INNER JOIN sys_branch ON sys_branch.branch = sal_invoices_items.branch
    INNER JOIN sys_item_units on sal_invoices_items.itemean = sys_item_units.itemean and sal_invoices_items.barcode = sys_item_units.barcode
    WHERE ( sal_invoices_items.company =1 and sal_invoices_items.pos_id <> 9999 and sal_invoices_items.doctype in (2080,2030) AND sal_invoices_items.transtype =201
        and sal_invoices_items.invoicedate between '${startDate}' and '${endDate}')
        and sal_invoices_items.branch ${branchCondition}
    GROUP BY sal_invoices_items.branch, sys_branch.a_name, sal_invoices_items.invoicedate, sal_invoices_items.doctype
`;

export const SALES_DETAILED_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, supplierCondition: string, productCondition: string, startDate: string, endDate: string) => `
    SELECT 
        sys_item.section, 
        sys_item.a_name productname, 
        sys_item.department, 
        sys_item.itemean, 
        sal_invoices_items.barcode,
        sum((sal_invoices_items.qty * sal_invoices_items.unitprice) - sal_invoices_items.discountvalue) as total_value
    FROM sal_invoices_items, sys_item, sys_item_units
    WHERE ( sal_invoices_items.company =1  and ( sal_invoices_items.itemean = sys_item.itemean )
        AND ( sal_invoices_items.barcode = sys_item_units.barcode ) 
        and sal_invoices_items.doctype in (2080,2030) 
        ${branchCondition} ${sectionCondition} ${groupCondition} ${departmentCondition} ${supplierCondition} ${productCondition}
        and sal_invoices_items.transtype =201 
        and sal_invoices_items.invoicedate between '${startDate}' and '${endDate}')
    GROUP BY sys_item.section, sys_item.department, sys_item.itemean,sys_item.a_name, sal_invoices_items.barcode
    ORDER BY sys_item.section, sys_item.department, sys_item.itemean,sal_invoices_items.barcode, sys_item.a_name
`;
