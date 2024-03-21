export const USER_ROLES = {
  ADMIN: { role_id: 1, name: "admin" },
  SUPERVISOR: { role_id: 2, name: "supervisor" },
  BROKER: { role_id: 3, name: "broker" },
  PARTY: { role_id: 4, name: "party" },
  SUPPLIER: { role_id: 5, name: "supplier" },
  EMPLOYEE: { role_id: 6, name: "employee" },
  COLLECTION_USER: { role_id: 7, name: "collection user" },
  ACCOUNTANT_USER: { role_id: 8, name: "accountant user" },
  VEHICLE_USER: { role_id: 9, name: "vehicle user" },
  NORMAL_USER: { role_id: 10, name: "normal user" },
  PARNTER_USER: { role_id: 11, name: "partner user" },
  MENDING_USER: { role_id: 12, name: "mending user" },
  FOLDING_USER: { role_id: 13, name: "folding user" },
};

export const ROLE_ID_USER_TYPE_MAP = {
  1: "admin",
  2: "supervisor",
  3: "broker",
  4: "party",
  5: "supplier",
  6: "employee",
  7: "collection user",
  8: "accountant user",
  9: "vehicle user",
  10: "normal user",
  11: "partner user",
  12: "mending user",
  13: "folding user",
};

export const supplierTypeEnum = [
  "purchase/trading",
  "job",
  "yarn",
  "other",
  "re-work",
];

export const SALARY_TYPE_LIST = [
  {
    label: "Work basis",
    value: "Work basis",
  },
  {
    label: "Monthly",
    value: "Monthly",
  },
  {
    label: "Attendance",
    value: "Attendance",
  },
  {
    label: "On production",
    value: "On production",
  },
  {
    label: "Beam pasaria",
    value: "Beam pasaria",
  },
  {
    label: "Beam warper",
    value: "Beam warper",
  },
];
