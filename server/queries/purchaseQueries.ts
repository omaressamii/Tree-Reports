/**
 * Original SQL Queries for Purchases extracted from legacy Python logic.
 */

export const PURCHASES_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, supplierCondition: string, productCondition: string, startDate: string, endDate: string) => `
    SELECT 
        ltrim(rTRIM(sys_supplier.a_name)) AS 'المورد', 
        (SELECT ltrim(rTRIM(a_name)) FROM sys_section WHERE sys_section.section = sys_item.section) AS 'القسم',
        (SELECT ltrim(rTRIM(a_name)) FROM sys_group WHERE sys_group.section = sys_item.section AND sys_group.itemgroup = sys_item.itemgroup) AS 'المجموعة الرئيسية', 
        ((sum ( (case when stk_order_purchases.doctype = 2010 then 1 else 0 end) * ( stk_order_items_purchases.actual_qty + isnull ( stk_order_items_purchases.free_qty , 0 ) )) - 
        sum ( (case when stk_order_purchases.doctype = 2050 then 1 else 0 end) * ( stk_order_items_purchases.actual_qty + isnull ( stk_order_items_purchases.free_qty , 0 ) )))) AS 'كمية المشتريات',
        SUM((CASE WHEN stk_order_purchases.doctype = 2010 THEN 1 ELSE -1 END) * (stk_order_items_purchases.actual_qty * stk_order_items_purchases.price)) AS 'صافي القيمة'
    FROM stk_order_purchases
    INNER JOIN stk_order_items_purchases ON stk_order_items_purchases.branch = stk_order_purchases.branch 
        AND stk_order_items_purchases.purchaseno = stk_order_purchases.purchaseno
        AND stk_order_items_purchases.purchasedate = stk_order_purchases.purchasedate
        AND stk_order_items_purchases.doctype = stk_order_purchases.doctype
    INNER JOIN sys_supplier ON sys_supplier.supplierno = stk_order_purchases.supplierno
    INNER JOIN sys_item ON stk_order_items_purchases.itemean = sys_item.itemean
    WHERE 1 = 1 ${branchCondition} ${sectionCondition} ${groupCondition} ${departmentCondition} ${supplierCondition} ${productCondition} 
        AND stk_order_purchases.doctype IN (2010, 2050)
        AND stk_order_purchases.purchasedate BETWEEN '${startDate}' AND '${endDate}' 
        AND stk_order_purchases.posting = 1
    GROUP BY sys_supplier.a_name, sys_item.section, sys_item.itemgroup
    ORDER BY 'صافي القيمة' DESC
`;
