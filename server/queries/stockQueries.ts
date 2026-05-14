/**
 * Original SQL Queries for Stock/Inventory extracted from legacy Python logic.
 */

export const STOCK_VALUATION_QUERY = (branchCondition: string, sectionCondition: string, groupCondition: string, departmentCondition: string, productCondition: string, endDate: string) => `
    WITH ItemBalanceExcept as(
        SELECT 0 AS diff, sys_item.itemclass,sys_item.section, sys_item.itemgroup , sys_item.department, mtod.branch ,sys_item.producerno,sys_item.itemean,
            Convert(Decimal(12,3),Sum(item_qtyin)) AS itembalancevalue 
        FROM stk_mtod mtod, sys_item 
        WHERE (mtod.itemean = sys_item.itemean)
            and ( mtod.transyear = year((SELECT max(sys_closing.close_date) +1 as close_date FROM sys_closing WHERE ( sys_closing.systemcode = 2 ) AND ( sys_closing.doctype = 2913 )
                and ( sys_closing.location = mtod.branch and sys_closing.close_date <'${endDate}') ))
                and mtod.transmonth = month((SELECT max(sys_closing.close_date) +1 as close_date FROM sys_closing WHERE ( sys_closing.systemcode = 2 ) AND ( sys_closing.doctype = 2913 )
                and ( sys_closing.location = mtod.branch and sys_closing.close_date <'${endDate}') ))
                and mtod.company =1 and mtod.sector in (1,4) and mtod.region in (11,41)
            and mtod.branch ${branchCondition}
            ${sectionCondition} ${groupCondition} ${departmentCondition} ${productCondition}
            and mtod.transtype = 201 and mtod.doctype = 0 AND sys_item.status =1 and sys_item.active=1)
        GROUP BY sys_item.producerno,sys_item.itemean,sys_item.itemclass,sys_item.section, sys_item.itemgroup , sys_item.department,mtod.branch
    UNION
        SELECT 1 AS diff, sys_item.itemclass,sys_item.section, sys_item.itemgroup , sys_item.department,stkord.branch ,sys_item.producerno,sys_item.itemean,
            Convert(Decimal(12,3),ISNULL(SUM((case when oi.doctype <2050 then 1 else -1 end) * ((IsNull(oi.actual_qty,0.000) +IsNull(oi.free_qty,0.000)) *
            IsNull(oi.peices,1))),0.000)) AS itembalancevalue 
        FROM stk_order stkord, stk_order_items oi, sys_item
        WHERE (stkord.company = oi.company) AND (stkord.sector = oi.sector) AND (stkord.region = oi.region) AND (stkord.branch = oi.branch) AND (stkord.section = oi.section)
            AND (stkord.transtype = oi.transtype) AND (stkord.doctype = oi.doctype) AND (stkord.orderno = oi.orderno) AND (stkord.orderdate = oi.orderdate) AND
            (oi.itemean = sys_item.itemean) and (stkord.company =1 and stkord.sector in (1,4) and stkord.region in (11,41)
            and stkord.branch ${branchCondition}
            ${sectionCondition} ${groupCondition} ${departmentCondition} ${productCondition}
            and stkord.transtype = 201 and stkord.doctype between 2000 AND 3000 and stkord.orderdate between (SELECT max(sys_closing.close_date) +1 as
            close_date FROM sys_closing WHERE ( sys_closing.systemcode = 2 ) AND ( sys_closing.doctype = 2913 )
            and ( sys_closing.location = stkord.branch and sys_closing.close_date <'${endDate}')) and '${endDate}' AND sys_item.status =1
            and sys_item.active=1 and stkord.posting=1)
        GROUP BY stkord.branch ,sys_item.itemclass,sys_item.section, sys_item.itemgroup , sys_item.department,sys_item.producerno,sys_item.itemean)
    SELECT 'فترة حالية' الفترة, (SELECT a_name FROM sys_itemclass WHERE sys_itemclass.itemclass = ItemBalanceExcept.itemclass) AS 'التقسيم السلعي',
        (SELECT a_name FROM sys_section WHERE sys_section.itemclass = ItemBalanceExcept.itemclass AND sys_section.section = ItemBalanceExcept.section) AS القسم,
        (SELECT sys_group.a_name from sys_group WHERE sys_group.section =ItemBalanceExcept.section AND sys_group.itemgroup =ItemBalanceExcept.itemgroup ) AS 'المجموعة الرئيسية',
        (SELECT sys_subgroup.a_name from sys_subgroup WHERE sys_subgroup.department =ItemBalanceExcept.department ) AS 'المجموعة الفرعية', 
        itemean AS 'كود الصنف',
        (Select a_name FROM sys_item WHERE ItemBalanceExcept.itemean=sys_item.itemean ) AS المنتج,
        (SELECT ltrim(rTRIM(sys_branch.a_name)) +'-' + convert(char,sys_branch.branch) FROM sys_branch WHERE ItemBalanceExcept.branch=sys_branch.branch ) as الفرع,
        SUM(itembalancevalue) AS 'كمية رصيد المخازن',
        (SELECT distinct Convert(decimal(12,3), costprice/peices) FROM sys_item_units WHERE ItemBalanceExcept.itemean=sys_item_units.itemean AND usage=1) AS itemwholeprice
    FROM ItemBalanceExcept
    GROUP BY branch , itemclass,section, itemgroup , department ,itemean
`;
