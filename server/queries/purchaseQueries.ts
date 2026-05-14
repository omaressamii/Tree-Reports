/**
 * Original SQL Queries for Purchases extracted from legacy Python logic.
 */

export const PURCHASES_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, supplierCondition: string, productCondition: string, startDate: string, endDate: string) => `
    SELECT 
        ltrim(rTRIM(sys_branch.a_name)) الفرع, 
        (Select a_name from sys_itemclass where sys_item.itemclass = sys_itemclass.itemclass) AS 'التقسيم السلعي',
        (SELECT ltrim(rTRIM(a_name)) FROM sys_section WHERE sys_section.section=sys_item.section) AS القسم ,
        (SELECT ltrim(rTRIM(a_name)) FROM sys_group WHERE sys_group.section=sys_item.section AND sys_group.itemgroup=sys_item.itemgroup) AS 'المجموعة الرئيسية', 
        (SELECT ltrim(rTRIM(a_name)) FROM sys_subgroup WHERE sys_subgroup.department=sys_item.department) AS 'المجموعة الفرعية',
        sys_supplier.supplierno, 
        sys_supplier.a_name مورد, 
        ltrim(rTRIM(stk_order_items_purchases.itemean)) 'كود الصنف', 
        sys_item_units.barcode الباركود,
        SYS_ITEM.a_name 'اسم المنتج', 
        ((sum ( (case when stk_order_purchases.doctype = 2010 then 1 else 0 end) * ( stk_order_items_purchases.actual_qty + isnull ( stk_order_items_purchases.free_qty , 0 ) )) - 
        sum ( (case when stk_order_purchases.doctype = 2050 then 1 else 0 end) * ( stk_order_items_purchases.actual_qty + isnull ( stk_order_items_purchases.free_qty , 0 ) )))) AS 'صافي كمية المشتريات'
    FROM stk_order_purchases
    INNER JOIN stk_order_items_purchases ON stk_order_items_purchases.section = stk_order_purchases.section
        AND stk_order_items_purchases.branch = stk_order_purchases.branch AND stk_order_items_purchases.purchaseno = stk_order_purchases.purchaseno
        AND stk_order_items_purchases.purchasedate = stk_order_purchases.purchasedate
        and ( stk_order_items_purchases.transtype = stk_order_purchases.transtype ) and ( stk_order_items_purchases.doctype = stk_order_purchases.doctype )
    INNER JOIN SYS_BRANCH ON SYS_BRANCH.BRANCH = stk_order_purchases.BRANCH
    INNER JOIN sys_supplier ON sys_supplier.supplierno = stk_order_purchases.supplierno
    INNER JOIN sys_item_units ON sys_item_units.barcode = stk_order_items_purchases.barcode
    INNER JOIN sys_item ON stk_order_items_purchases.itemean = sys_item.itemean
    WHERE 1 = 1 ${branchCondition} ${sectionCondition} ${groupCondition} ${departmentCondition} ${supplierCondition} ${productCondition} 
        AND stk_order_purchases.doctype IN (2010, 2050)
        and stk_order_purchases.purchasedate BETWEEN '${startDate}' AND '${endDate}' 
        and stk_order_purchases.posting = 1
    GROUP BY sys_branch.a_name, sys_item.itemclass, sys_item.section,sys_item.itemgroup,sys_item.department,
        stk_order_items_purchases.itemean, sys_item_units.barcode, SYS_ITEM.a_name, sys_supplier.supplierno, sys_supplier.a_name
`;
