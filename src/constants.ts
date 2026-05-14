import { NavItem, System } from './types';

export const SYSTEMS: System[] = [
  {
    code: 101,
    name: "إدارة المبيعات",
    reports: [
      { id: "sales-summary", name: "ملخص المبيعات", path: "/sales/summary", docType: 1 },
      { id: "sales-detailed", name: "تفاصيل المبيعات", path: "/sales/detailed", docType: 2 },
      { id: "sales-daily", name: "المبيعات اليومية", path: "/sales/daily", docType: 10 },
      { id: "sales-hourly", name: "المبيعات بالساعات", path: "/sales/hourly", docType: 12 },
    ]
  },
  {
    code: 103,
    name: "إدارة المشتريات",
    reports: [
      { id: "purchases-summary", name: "ملخص المشتريات", path: "/purchases/summary", docType: 1 },
      { id: "purchases-returns", name: "مرتجع المشتريات", path: "/purchases/returns", docType: 2050 },
    ]
  },
  {
    code: 106,
    name: "إدارة المخازن والأرصدة",
    reports: [
      { id: "stock-balance", name: "أرصدة المخازن", path: "/stock/balance", docType: 1 },
      { id: "stock-valuation", name: "تقييم المخزون", path: "/stock/valuation", docType: 6 },
    ]
  }
];

export const APP_CONFIG = {
  logo: "/static/images/Gomla-Market.png",
  title: "جملة ماركت - نظام التقارير",
};
