/**
 * Original SQL Queries for Filters extracted from legacy Python logic.
 */

export const GET_BRANCHES_QUERY = `
    SELECT branch as id, ltrim(rTRIM(a_name)) as name 
    FROM sys_branch 
    WHERE status = 0
`;

export const GET_SECTIONS_QUERY = (addedCondition: string) => `
    SELECT section as id, ltrim(rTRIM(a_name)) as name 
    FROM sys_section 
    WHERE ${addedCondition || '1 = 1'}
`;

export const GET_GROUPS_QUERY = (sectionCondition: string, addedCondition: string) => `
    SELECT distinct sys_group.itemgroup as id, ltrim(rTRIM(sys_group.a_name)) as name 
    FROM sys_item
    INNER JOIN sys_group ON sys_group.section = sys_item.section AND sys_item.itemgroup = sys_group.itemgroup
    WHERE ${sectionCondition || '1=1'} AND ${addedCondition || '1=1'}
`;

export const GET_DEPARTMENTS_QUERY = (sectionCondition: string, groupCondition: string, addedCondition: string) => `
    SELECT distinct sys_subgroup.department as id, ltrim(rTRIM(sys_subgroup.a_name)) as name 
    FROM sys_item
    INNER JOIN sys_subgroup ON sys_subgroup.department = sys_item.department
    WHERE ${sectionCondition || '1=1'} ${groupCondition || ''} AND ${addedCondition || '1=1'}
`;

export const GET_SUPPLIERS_QUERY = (sectionCondition: string, groupCondition: string, departmentCondition: string, groupListStr: string, sectionListStr: string, departmentListStr: string) => `
    SELECT distinct sys_supplier.supplierno as id, ltrim(rTRIM(sys_supplier.a_name)) as name 
    FROM sys_item
    INNER JOIN sys_item_suppliers ON sys_item.itemean = sys_item_suppliers.itemean
    INNER JOIN sys_supplier ON sys_supplier.supplierno = sys_item_suppliers.supplierno
    WHERE 1=1 ${sectionCondition} ${groupCondition} ${departmentCondition}
    AND sys_item.section IN (${sectionListStr})
    AND sys_item.itemgroup IN (${groupListStr})
    AND sys_item.department IN (${departmentListStr})
`;
