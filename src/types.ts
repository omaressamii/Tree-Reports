export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  systemCode: number;
}

export interface System {
  code: number;
  name: string;
  reports: Report[];
}

export interface Report {
  id: string;
  name: string;
  path: string;
  docType: number;
}

export interface FilterOption {
  id: number | string;
  name: string;
}

export interface Filters {
  branches: FilterOption[];
  sections: FilterOption[];
  groups: FilterOption[];
  departments: FilterOption[];
  suppliers: FilterOption[];
}

export interface SelectedFilters {
  branchIds: number[];
  sectionIds: number[];
  groupIds: number[];
  departmentIds: number[];
  supplierIds: number[];
  productIds: string[];
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  totalSales: number;
  totalSalesPrev: number;
  totalQty: number;
  totalQtyPrev: number;
  netProfit: number;
  netProfitPrev: number;
}
