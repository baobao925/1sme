import type { StatusType } from "@/components/StatusBadge";

// ==================== TYPES ====================
// Loại Affiliate (chỉ trong nước): Cá nhân hoặc Doanh nghiệp
// KOL/Agency là TAG profile, độc lập với loại pháp lý
export type AffiliateKind = "Cá nhân" | "Doanh nghiệp";
export type AffiliateTag = "KOL" | "Agency" | "Publisher" | "Cá nhân";
export type CommissionType = "CPS" | "Recurring";
export type RecurringEvent = "renew" | "upgrade" | "downgrade";

export interface Affiliate {
  id: string;
  code: string; // AFF ID hệ thống tự sinh, ví dụ AFF-000123
  name: string;
  kind: AffiliateKind;
  tag: AffiliateTag;
  email: string;
  phone: string;
  channels: string[];
  channelLinks?: { facebook?: string; tiktok?: string; youtube?: string; website?: string };
  categories: string[]; // ngành hàng quan tâm (multi)
  status: StatusType; // pending | active | rejected
  joinedAt: string;
  rejectReason?: string;
  contactAddress: string;
  bank: { holder: string; bankName: string; branch: string; account: string };
  tax: {
    idType: "CCCD" | "GPKD"; // CCCD = Cá nhân, GPKD = Doanh nghiệp
    idNumber: string;
    taxCode: string;
    issuer?: string;
  };
  totalCommission: number;
  totalClicks: number;
  totalConversions: number;
}

export interface RecurringRate {
  renew: number;   // %
  upgrade: number; // %
  downgrade: number; // %
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  vendor: string;
  category: string;
  price: number;
  commissionType: CommissionType;
  commissionRate: number; // % cho đơn gốc (first sale)
  recurring?: RecurringRate; // % cho các kỳ recurring (theo loại sự kiện)
  recurringMaxCycles?: number; // optional - mặc định không giới hạn
  cookieTime: number; // days
  holdPeriod: number; // days (theo chính sách hoàn/hủy của sản phẩm)
  refundPolicyDays: number; // số ngày chính sách hoàn/hủy
  status: StatusType; // active
  imageUrl?: string;
}

export interface DeepLink {
  id: string;
  affiliateId: string;
  affiliateName: string;
  productId: string;
  productName: string;
  refCode: string;
  url: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  status: StatusType;
  createdAt: string;
}

export interface ClickEvent {
  id: string;
  clickId: string;
  affiliateId: string;
  affiliateName: string;
  productId: string;
  productName: string;
  orderId?: string; // populate khi đã match thành conversion
  refCode: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  device: "Desktop" | "Mobile" | "Tablet";
  source: string;
  country: string;
  status: "Valid" | "Invalid" | "Bot" | "Self-purchase" | "Duplicate";
}

export interface Conversion {
  id: string;
  orderCode: string;
  affiliateId: string;
  affiliateName: string;
  productId: string;
  productName: string;
  customerMasked: string;
  orderValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: StatusType; // pending | hold | approved | void | paid
  attributionModel: "Last Click";
  recurringEvent?: RecurringEvent | "first";
  clickId: string;
  refCode: string;
  orderedAt: string;
  holdUntil?: string; // ngày hết hold = ngày đơn + refundPolicyDays
}

export interface PayoutRequest {
  id: string;
  code: string;
  affiliateId: string;
  affiliateName: string;
  affiliateKind: AffiliateKind;
  requestedAmount: number;
  availableCommission: number;
  periodCommission: number;
  period: string;
  gross: number;
  taxType: "PIT" | "VAT" | "None";
  taxPayableTotal: number;
  taxAlreadyDeducted: number;
  taxAmount: number;
  serviceFee: number;
  net: number;
  status: StatusType;
  bankAccount: string;
  note?: string;
  rejectReason?: string;
  createdAt: string;
  paidAt?: string; // Ngày thanh toán thực tế
  conversionIds?: string[]; // Các conversion đính kèm
  affiliateCode?: string; // Mã Affiliate
  mappedCommissions?: { orderCode: string; mappedAmount: number; totalAmount: number }[]; // Thêm field map hoa hồng tương ứng
}

// Nhóm Affiliate
export interface AffiliateGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  memberIds: string[];
  commissionBoost?: number; // % cộng thêm cho nhóm
  taxConfig?: { pitRate: number; vatRate: number; pitThreshold: number };
  validFrom?: string;
  validTo?: string;
  status: "active" | "void";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: "Admin" | "System" | "Affiliate";
  action: string;
  object: string;
  before?: string;
  after?: string;
  timestamp: string;
}

export interface ExceptionCase {
  id: string;
  type: "Duplicate Click" | "Suspicious Traffic" | "Self-purchase" | "Refund After Payout" | "Missing Tax Info" | "Payout Failed";
  affiliateName: string;
  description: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  status: "Mở" | "Đang xử lý" | "Đã đóng";
}

// ==================== HELPERS ====================
// Cấu hình thuế chung của hệ thống
export const systemTaxConfig = {
  individual: { rate: 10, threshold: 250_000 },
  enterprise: { rate: 10, threshold: 0 }
};

// Hàm dùng để admin cập nhật thuế (mock realtime effect)
export const updateSystemTaxConfig = (newConfig: typeof systemTaxConfig) => {
  systemTaxConfig.individual = newConfig.individual;
  systemTaxConfig.enterprise = newConfig.enterprise;
};

// Tính thuế khấu trừ theo loại affiliate (theo brief mới + cấu hình động)
export const calcTax = (gross: number, kind: AffiliateKind): { type: "PIT" | "VAT" | "None"; amount: number; rate: number } => {
  if (kind === "Cá nhân") {
    if (gross < systemTaxConfig.individual.threshold) return { type: "None", amount: 0, rate: 0 };
    const rate = systemTaxConfig.individual.rate;
    return { type: "PIT", amount: Math.round(gross * (rate / 100)), rate };
  }
  // Doanh nghiệp
  if (gross < systemTaxConfig.enterprise.threshold) return { type: "None", amount: 0, rate: 0 };
  const rate = systemTaxConfig.enterprise.rate;
  return { type: "VAT", amount: Math.round(gross * (rate / 100)), rate };
};

/**
 * Tính thuế tích lũy trong kỳ (chống lách thuế bằng cách tách nhỏ nhiều lần rút).
 * - taxPayableTotal: thuế phải nộp tính trên TỔNG hoa hồng trong kỳ
 * - taxThisRequest = taxPayableTotal - taxAlreadyDeducted (≥ 0, ≤ requestedAmount)
 */
export const calcCumulativeTax = (
  periodCommission: number,
  alreadyDeducted: number,
  requestedAmount: number,
  kind: AffiliateKind,
) => {
  const total = calcTax(periodCommission, kind);
  const taxPayableTotal = total.amount;
  let taxThisRequest = Math.max(0, taxPayableTotal - alreadyDeducted);
  taxThisRequest = Math.min(taxThisRequest, requestedAmount);
  return { type: total.type, rate: total.rate, taxPayableTotal, taxAlreadyDeducted: alreadyDeducted, taxThisRequest };
};

// Ngưỡng tối thiểu để mở chức năng yêu cầu rút tiền (theo brief mới)
export const MIN_PAYOUT = 250_000;

// ==================== MOCK DATA ====================
export const affiliates: Affiliate[] = [
  { id: "AF001", code: "AFF-000101", name: "Nguyễn Thuỳ Linh", kind: "Cá nhân", tag: "KOL",
    email: "linh.nguyen@kol.vn", phone: "0909123456",
    channels: ["TikTok", "YouTube", "Facebook"],
    channelLinks: { facebook: "https://facebook.com/linh.kol", tiktok: "https://tiktok.com/@linh.kol", youtube: "https://youtube.com/@linhkol" },
    categories: ["CRM", "Hóa đơn điện tử"],
    status: "active", joinedAt: "2025-08-12",
    contactAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
    bank: { holder: "Nguyễn Thuỳ Linh", bankName: "Vietcombank", branch: "Q.1, TP.HCM", account: "0011002233445" },
    tax: { idType: "CCCD", idNumber: "079302001234", taxCode: "8765432109", issuer: "Cục CSQLHC về TTXH" },
    totalCommission: 48_650_000, totalClicks: 12_540, totalConversions: 86 },
  { id: "AF002", code: "AFF-000102", name: "CTY TNHH Digital Growth Media", kind: "Doanh nghiệp", tag: "Agency",
    email: "ops@dgm.agency", phone: "0912334455",
    channels: ["Website", "Email", "LinkedIn"],
    channelLinks: { website: "https://dgm.agency" },
    categories: ["Hóa đơn điện tử", "Kế toán"],
    status: "active", joinedAt: "2025-07-03",
    contactAddress: "Tầng 5, Toà CG, Cầu Giấy, Hà Nội",
    bank: { holder: "CTY TNHH DGM", bankName: "Techcombank", branch: "Cầu Giấy, HN", account: "1900909090" },
    tax: { idType: "GPKD", idNumber: "0312345678", taxCode: "0312345678", issuer: "Sở KHĐT Hà Nội" },
    totalCommission: 124_300_000, totalClicks: 38_900, totalConversions: 211 },
  { id: "AF003", code: "AFF-000103", name: "Trần Quốc Anh", kind: "Cá nhân", tag: "Publisher",
    email: "anh.tran@gmail.com", phone: "0987112233",
    channels: ["Facebook"],
    categories: ["Chữ ký số"],
    status: "pending", joinedAt: "2026-04-22",
    contactAddress: "45 Tây Sơn, Đống Đa, Hà Nội",
    bank: { holder: "Trần Quốc Anh", bankName: "MB Bank", branch: "Đống Đa, HN", account: "0700123456789" },
    tax: { idType: "CCCD", idNumber: "001098000111", taxCode: "" },
    totalCommission: 0, totalClicks: 0, totalConversions: 0 },
  { id: "AF004", code: "AFF-000104", name: "Phạm Văn Hùng", kind: "Cá nhân", tag: "KOL",
    email: "hung.pham@kol.vn", phone: "0938776655",
    channels: ["YouTube"],
    categories: ["CRM"],
    status: "rejected", joinedAt: "2026-03-15", rejectReason: "Thiếu giấy tờ thuế hợp lệ",
    contactAddress: "78 Võ Văn Tần, Q.3, TP.HCM",
    bank: { holder: "Phạm Văn Hùng", bankName: "ACB", branch: "Q.3, TP.HCM", account: "9988776655" },
    tax: { idType: "CCCD", idNumber: "079299005678", taxCode: "" },
    totalCommission: 0, totalClicks: 0, totalConversions: 0 },
  { id: "AF005", code: "AFF-000105", name: "CTY CP LeadMax Marketing", kind: "Doanh nghiệp", tag: "Agency",
    email: "hello@leadmax.vn", phone: "0922446688",
    channels: ["Website", "Google Ads"],
    channelLinks: { website: "https://leadmax.vn" },
    categories: ["CRM", "HRM", "Kế toán"],
    status: "active", joinedAt: "2025-11-20",
    contactAddress: "21 Hai Bà Trưng, Hoàn Kiếm, Hà Nội",
    bank: { holder: "CTY CP LEADMAX", bankName: "BIDV", branch: "Hoàn Kiếm, HN", account: "21010001122334" },
    tax: { idType: "GPKD", idNumber: "0109887766", taxCode: "0109887766", issuer: "Sở KHĐT Hà Nội" },
    totalCommission: 86_120_000, totalClicks: 25_400, totalConversions: 142 },
  { id: "AF006", code: "AFF-000106", name: "Vũ Thu Hà", kind: "Cá nhân", tag: "KOL",
    email: "ha.vu@gmail.com", phone: "0911223344",
    channels: ["TikTok", "Instagram"],
    channelLinks: { tiktok: "https://tiktok.com/@havu", facebook: "https://facebook.com/havu" },
    categories: ["Hóa đơn điện tử"],
    status: "pending", joinedAt: "2026-04-28",
    contactAddress: "12 Đội Cấn, Ba Đình, Hà Nội",
    bank: { holder: "Vũ Thu Hà", bankName: "VPBank", branch: "Ba Đình, HN", account: "1234567890" },
    tax: { idType: "CCCD", idNumber: "001197003344", taxCode: "8123456780" },
    totalCommission: 0, totalClicks: 0, totalConversions: 0 },
];

export const products: Product[] = [
  { id: "P001", sku: "CRM-PRO", name: "CRM Cloud Pro - Gói Doanh nghiệp", vendor: "Vinasoft", category: "CRM",
    price: 12_000_000, commissionType: "Recurring", commissionRate: 8,
    recurring: { renew: 5, upgrade: 8, downgrade: 3 },
    cookieTime: 30, holdPeriod: 15, refundPolicyDays: 15, status: "active" },
  { id: "P002", sku: "CKS-1Y", name: "Chữ ký số doanh nghiệp 1 năm", vendor: "EasyCA", category: "Chữ ký số",
    price: 1_650_000, commissionType: "CPS", commissionRate: 10,
    cookieTime: 30, holdPeriod: 7, refundPolicyDays: 7, status: "active" },
  { id: "P003", sku: "EINV-500", name: "Hóa đơn điện tử - 500 số", vendor: "MeInvoice", category: "Hóa đơn điện tử",
    price: 850_000, commissionType: "CPS", commissionRate: 5,
    cookieTime: 14, holdPeriod: 7, refundPolicyDays: 7, status: "active" },
  { id: "P004", sku: "HRM-STD", name: "HRM Cloud - Gói Standard", vendor: "Vinasoft", category: "HRM",
    price: 6_500_000, commissionType: "Recurring", commissionRate: 8,
    recurring: { renew: 6, upgrade: 8, downgrade: 4 },
    recurringMaxCycles: 12,
    cookieTime: 60, holdPeriod: 30, refundPolicyDays: 30, status: "active" },
  { id: "P005", sku: "EINV-2000", name: "Hóa đơn điện tử - 2000 số", vendor: "MeInvoice", category: "Hóa đơn điện tử",
    price: 2_800_000, commissionType: "CPS", commissionRate: 5,
    cookieTime: 14, holdPeriod: 7, refundPolicyDays: 7, status: "active" },
  { id: "P006", sku: "CKS-3Y", name: "Chữ ký số doanh nghiệp 3 năm", vendor: "EasyCA", category: "Chữ ký số",
    price: 3_900_000, commissionType: "CPS", commissionRate: 10,
    cookieTime: 30, holdPeriod: 7, refundPolicyDays: 7, status: "active" },
  { id: "P007", sku: "CRM-STD", name: "CRM Cloud - Gói Standard", vendor: "Vinasoft", category: "CRM",
    price: 4_500_000, commissionType: "Recurring", commissionRate: 8,
    recurring: { renew: 5, upgrade: 8, downgrade: 3 },
    cookieTime: 30, holdPeriod: 15, refundPolicyDays: 15, status: "active" },
  { id: "P008", sku: "ACC-CLOUD", name: "Phần mềm Kế toán Cloud", vendor: "MISA", category: "Kế toán",
    price: 8_900_000, commissionType: "CPS", commissionRate: 7,
    cookieTime: 30, holdPeriod: 15, refundPolicyDays: 15, status: "active" },
];

// URL helper: link sản phẩm + ref_code (AFF_ID) + product_id
export const buildDeepLink = (productSku: string, affCode: string, productId: string) =>
  `https://b2bmart.vn/p/${productSku.toLowerCase()}?ref_code=${affCode}&product_id=${productId}`;

export const deepLinks: DeepLink[] = [
  { id: "DL001", affiliateId: "AF001", affiliateName: "Nguyễn Thuỳ Linh", productId: "P001", productName: "CRM Cloud Pro - Gói Doanh nghiệp",
    refCode: "AFF-000101", url: buildDeepLink("CRM-PRO", "AFF-000101", "P001"),
    clicks: 3245, uniqueClicks: 2890, conversions: 28, status: "active", createdAt: "2025-09-10" },
  { id: "DL002", affiliateId: "AF001", affiliateName: "Nguyễn Thuỳ Linh", productId: "P003", productName: "Hóa đơn điện tử - 500 số",
    refCode: "AFF-000101", url: buildDeepLink("EINV-500", "AFF-000101", "P003"),
    clicks: 5612, uniqueClicks: 4980, conversions: 41, status: "active", createdAt: "2025-09-12" },
  { id: "DL003", affiliateId: "AF002", affiliateName: "Digital Growth Media", productId: "P003", productName: "Hóa đơn điện tử - 500 số",
    refCode: "AFF-000102", url: buildDeepLink("EINV-500", "AFF-000102", "P003"),
    clicks: 12450, uniqueClicks: 10210, conversions: 98, status: "active", createdAt: "2025-08-01" },
  { id: "DL004", affiliateId: "AF005", affiliateName: "LeadMax Marketing", productId: "P004", productName: "HRM Cloud Standard",
    refCode: "AFF-000105", url: buildDeepLink("HRM-STD", "AFF-000105", "P004"),
    clicks: 8920, uniqueClicks: 7340, conversions: 54, status: "active", createdAt: "2025-12-05" },
  { id: "DL005", affiliateId: "AF001", affiliateName: "Nguyễn Thuỳ Linh", productId: "P007", productName: "CRM Cloud Standard",
    refCode: "AFF-000101", url: buildDeepLink("CRM-STD", "AFF-000101", "P007"),
    clicks: 1820, uniqueClicks: 1650, conversions: 12, status: "active", createdAt: "2026-01-15" },
  { id: "DL006", affiliateId: "AF002", affiliateName: "Digital Growth Media", productId: "P005", productName: "Hóa đơn điện tử - 2000 số",
    refCode: "AFF-000102", url: buildDeepLink("EINV-2000", "AFF-000102", "P005"),
    clicks: 6100, uniqueClicks: 5320, conversions: 47, status: "active", createdAt: "2025-10-20" },
  { id: "DL007", affiliateId: "AF005", affiliateName: "LeadMax Marketing", productId: "P008", productName: "Kế toán Cloud",
    refCode: "AFF-000105", url: buildDeepLink("ACC-CLOUD", "AFF-000105", "P008"),
    clicks: 4250, uniqueClicks: 3780, conversions: 31, status: "void", createdAt: "2025-11-12" },
];

const devices: Array<"Desktop" | "Mobile" | "Tablet"> = ["Desktop", "Mobile", "Tablet"];
const sources = ["Facebook", "TikTok", "YouTube", "Google", "Direct", "Email"];
const countries = ["VN", "VN", "VN", "VN", "VN", "VN"];
const clickStatuses: Array<"Valid" | "Invalid" | "Bot" | "Self-purchase" | "Duplicate"> =
  ["Valid", "Valid", "Valid", "Valid", "Duplicate", "Bot", "Valid", "Self-purchase"];
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Safari/605",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) Chrome/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.4",
];

export const clickEvents: ClickEvent[] = Array.from({ length: 40 }, (_, i) => {
  const dl = deepLinks[i % deepLinks.length];
  const day = (i % 14) + 1;
  return {
    id: `CE${String(i + 1).padStart(4, "0")}`,
    clickId: `clk_${Math.random().toString(36).slice(2, 10)}`,
    affiliateId: dl.affiliateId,
    affiliateName: dl.affiliateName,
    productId: dl.productId,
    productName: dl.productName,
    orderId: i % 4 === 0 ? `ORD-2026${String(2000 + i)}` : undefined,
    refCode: dl.refCode,
    ipAddress: `${10 + (i % 200)}.${(i * 3) % 255}.${(i * 7) % 255}.${(i * 11) % 255}`,
    userAgent: userAgents[i % userAgents.length],
    timestamp: `2026-04-${String(day).padStart(2, "0")}T${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
    device: devices[i % 3],
    source: sources[i % sources.length],
    country: countries[i % countries.length],
    status: clickStatuses[i % clickStatuses.length],
  };
});

const conversionStatuses: StatusType[] = ["pending", "hold", "approved", "void", "paid", "approved", "pending", "hold"];
const recurringEvents: Array<"first" | "renew" | "upgrade" | "downgrade"> = ["first", "first", "renew", "first", "upgrade", "renew", "first", "downgrade"];

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const conversions: Conversion[] = Array.from({ length: 24 }, (_, i) => {
  const dl = deepLinks[i % deepLinks.length];
  const product = products.find(p => p.id === dl.productId)!;
  const recurringEvent = recurringEvents[i % recurringEvents.length];

  // Tính rate theo loại sự kiện
  let rate = product.commissionRate;
  if (product.recurring && recurringEvent !== "first") {
    rate = product.recurring[recurringEvent as RecurringEvent];
  }

  const orderValue = product.price * (1 + (i % 3));
  const commissionAmount = Math.round(orderValue * rate / 100);
  const day = (i % 28) + 1;
  const orderedAt = `2026-04-${String(day).padStart(2, "0")}`;
  return {
    id: `CV${String(i + 1).padStart(4, "0")}`,
    orderCode: `ORD-2026${String(1000 + i)}`,
    affiliateId: dl.affiliateId,
    affiliateName: dl.affiliateName,
    productId: product.id,
    productName: product.name,
    customerMasked: `CTY ${["TNHH", "CP", "TNHH MTV"][i % 3]} ${["AB", "CD", "EF", "GH", "IJ"][i % 5]}***`,
    orderValue,
    commissionRate: rate,
    commissionAmount,
    status: conversionStatuses[i % conversionStatuses.length],
    attributionModel: "Last Click",
    recurringEvent,
    clickId: `clk_${Math.random().toString(36).slice(2, 10)}`,
    refCode: dl.refCode,
    orderedAt,
    holdUntil: addDays(orderedAt, product.refundPolicyDays),
  };
});

// Payout requests - thuế xét theo TỔNG hoa hồng trong kỳ
const buildPayout = (
  id: string, code: string, affId: string, affName: string, kind: AffiliateKind, affCode: string,
  requestedAmount: number, availableCommission: number, periodCommission: number, period: string,
  alreadyDeducted: number,
  status: StatusType, bankAccount: string, createdAt: string, paidAt?: string, conversionIds?: string[],
  note?: string, rejectReason?: string,
  mappedCommissions?: { orderCode: string; mappedAmount: number; totalAmount: number }[]
): PayoutRequest => {
  const cum = calcCumulativeTax(periodCommission, alreadyDeducted, requestedAmount, kind);
  const serviceFee = kind === "Doanh nghiệp" ? 100_000 : 0;
  return {
    id, code, affiliateId: affId, affiliateCode: affCode, affiliateName: affName, affiliateKind: kind,
    requestedAmount, availableCommission, periodCommission, period,
    gross: requestedAmount,
    taxType: cum.type,
    taxPayableTotal: cum.taxPayableTotal,
    taxAlreadyDeducted: cum.taxAlreadyDeducted,
    taxAmount: cum.taxThisRequest,
    serviceFee,
    net: requestedAmount - cum.taxThisRequest - serviceFee,
    status, bankAccount, createdAt, paidAt, conversionIds, note, rejectReason, mappedCommissions
  };
};

export const payoutRequests: PayoutRequest[] = [
  buildPayout("PR101", "PAY-202604-101", "AF001", "Nguyễn Thuỳ Linh", "Cá nhân", "AFF-000101",
    200_000, 200_000, 200_000, "04/2026", 0, "paid",
    "Vietcombank - 0011002233445", "2026-04-08", "2026-04-15", ["CV0001","CV0005"], undefined, undefined,
    [{ orderCode: "ORD-20261001", mappedAmount: 100000, totalAmount: 100000 }, { orderCode: "ORD-20261005", mappedAmount: 100000, totalAmount: 100000 }]
  ),
  buildPayout("PR102", "PAY-202604-102", "AF001", "Nguyễn Thuỳ Linh", "Cá nhân", "AFF-000101",
    300_000, 300_000, 500_000, "04/2026", 0, "paid",
    "Vietcombank - 0011002233445", "2026-04-18", "2026-04-22", ["CV0009","CV0013"], undefined, undefined,
    [{ orderCode: "ORD-20261009", mappedAmount: 150000, totalAmount: 200000 }, { orderCode: "ORD-20261013", mappedAmount: 150000, totalAmount: 300000 }]
  ),
  buildPayout("PR103", "PAY-202604-103", "AF001", "Nguyễn Thuỳ Linh", "Cá nhân", "AFF-000101",
    500_000, 500_000, 1_500_000, "04/2026", 50_000, "pending",
    "Vietcombank - 0011002233445", "2026-04-26", undefined, ["CV0017","CV0021"], undefined, undefined,
    [{ orderCode: "ORD-20261013", mappedAmount: 50000, totalAmount: 300000 }, { orderCode: "ORD-20261017", mappedAmount: 450000, totalAmount: 550000 }]
  ),

  buildPayout("PR002", "PAY-202604-002", "AF002", "Digital Growth Media", "Doanh nghiệp", "AFF-000102",
    42_300_000, 48_900_000, 48_900_000, "04/2026", 0, "processing",
    "Techcombank - 1900909090", "2026-04-15", undefined, ["CV0003","CV0007","CV0011","CV0015"], undefined, undefined,
    [{ orderCode: "ORD-20261003", mappedAmount: 10000000, totalAmount: 12000000 }, { orderCode: "ORD-20261007", mappedAmount: 32300000, totalAmount: 32300000 }]
  ),
  buildPayout("PR003", "PAY-202604-003", "AF005", "LeadMax Marketing", "Doanh nghiệp", "AFF-000105",
    28_750_000, 31_200_000, 31_200_000, "04/2026", 0, "pending",
    "BIDV - 21010001122334", "2026-04-28", undefined, ["CV0004","CV0008"], undefined, undefined,
    [{ orderCode: "ORD-20261004", mappedAmount: 28750000, totalAmount: 31200000 }]
  ),
  buildPayout("PR005", "PAY-202603-007", "AF005", "LeadMax Marketing", "Doanh nghiệp", "AFF-000105",
    9_800_000, 9_800_000, 11_500_000, "03/2026", 0, "failed",
    "BIDV - 21010001122334", "2026-03-15", undefined, ["CV0012"],
    undefined, "Sai số tài khoản, đã yêu cầu cập nhật",
    [{ orderCode: "ORD-20261012", mappedAmount: 9800000, totalAmount: 11500000 }]
  ),
  buildPayout("PR006", "PAY-202604-004", "AF003", "Trần Quốc Anh", "Cá nhân", "AFF-000103",
    220_000, 220_000, 220_000, "04/2026", 0, "rejected",
    "MB Bank - 0700123456789", "2026-04-29", undefined, [],
    undefined, "Số dư dưới ngưỡng tối thiểu 250.000đ — chuyển sang kỳ sau", []
  ),
];

// ==================== AFFILIATE GROUPS ====================
export const affiliateGroups: AffiliateGroup[] = [
  { id: "G001", code: "GRP-VIP", name: "Nhóm VIP KOL", description: "KOL/Influencer hiệu suất cao, hưởng % thưởng thêm",
    memberIds: ["AF001", "AF006"], commissionBoost: 2,
    taxConfig: { pitRate: 10, vatRate: 10, pitThreshold: 250_000 },
    validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", createdAt: "2025-12-20" },
  { id: "G002", code: "GRP-AGENCY", name: "Đại lý chiến lược", description: "Agency có hợp đồng dài hạn",
    memberIds: ["AF002", "AF005"], commissionBoost: 3,
    taxConfig: { pitRate: 10, vatRate: 10, pitThreshold: 250_000 },
    validFrom: "2026-01-01", status: "active", createdAt: "2025-11-10" },
  { id: "G003", code: "GRP-NEW", name: "Affiliate mới", description: "Nhóm mặc định cho affiliate vừa đăng ký",
    memberIds: ["AF003", "AF004"], commissionBoost: 0,
    taxConfig: { pitRate: 10, vatRate: 10, pitThreshold: 250_000 },
    status: "active", createdAt: "2026-01-01" },
];

export const auditLogs: AuditLog[] = [
  { id: "L001", actor: "admin@b2bmart.vn", role: "Admin", action: "Phê duyệt hồ sơ Affiliate", object: "AFF-000101",
    before: "PENDING", after: "ACTIVE", timestamp: "2026-04-29T10:23:00" },
  { id: "L002", actor: "system", role: "System", action: "Tạo conversion (Last Click)", object: "ORD-20261015",
    after: "PENDING", timestamp: "2026-04-29T11:12:00" },
  { id: "L003", actor: "admin@b2bmart.vn", role: "Admin", action: "Duyệt hoa hồng (hết hold)", object: "CV0008",
    before: "HOLD", after: "APPROVED", timestamp: "2026-04-28T15:40:00" },
  { id: "L004", actor: "system", role: "System", action: "Tạo payout batch", object: "PAY-202604-002",
    after: "PROCESSING", timestamp: "2026-04-15T09:00:00" },
  { id: "L005", actor: "AFF-000101", role: "Affiliate", action: "Tạo Deep Link", object: "DL005",
    after: "ACTIVE", timestamp: "2026-01-15T08:30:00" },
  { id: "L006", actor: "admin@b2bmart.vn", role: "Admin", action: "Vô hiệu hoá Deep Link", object: "DL007",
    before: "ACTIVE", after: "VOID", timestamp: "2026-04-20T14:00:00" },
  { id: "L007", actor: "admin@b2bmart.vn", role: "Admin", action: "Từ chối hồ sơ", object: "AFF-000104",
    before: "PENDING", after: "REJECTED", timestamp: "2026-03-16T10:00:00" },
  { id: "L008", actor: "system", role: "System", action: "Cron daily click - thống kê D-1", object: "JOB-CLICK-20260429",
    after: "DONE · 12.840 clicks", timestamp: "2026-04-30T01:00:00" },
];

export const exceptionCases: ExceptionCase[] = [
  { id: "E001", type: "Duplicate Click", affiliateName: "Digital Growth Media",
    description: "Phát hiện 124 click trùng IP trong 5 phút — chỉ tính 1 lần", severity: "medium",
    timestamp: "2026-04-29T10:00:00", status: "Đang xử lý" },
  { id: "E002", type: "Suspicious Traffic", affiliateName: "LeadMax Marketing",
    description: "Bot traffic chiếm 35% tổng click trong ngày", severity: "high",
    timestamp: "2026-04-28T16:30:00", status: "Mở" },
  { id: "E003", type: "Refund After Payout", affiliateName: "Nguyễn Thuỳ Linh",
    description: "Đơn ORD-20251234 bị hoàn sau khi đã trả hoa hồng — clawback", severity: "high",
    timestamp: "2026-04-25T09:15:00", status: "Mở" },
  { id: "E004", type: "Missing Tax Info", affiliateName: "Trần Quốc Anh",
    description: "Chưa cung cấp mã số thuế cá nhân", severity: "low",
    timestamp: "2026-04-22T11:00:00", status: "Đang xử lý" },
  { id: "E005", type: "Self-purchase", affiliateName: "Phạm Văn Hùng",
    description: "Affiliate đặt đơn qua chính link của mình — bị loại khỏi commission", severity: "medium",
    timestamp: "2026-04-20T08:00:00", status: "Đã đóng" },
  { id: "E006", type: "Payout Failed", affiliateName: "LeadMax Marketing",
    description: "Chuyển khoản thất bại - sai số tài khoản", severity: "medium",
    timestamp: "2026-03-15T14:20:00", status: "Đã đóng" },
];

// Daily click chart data (14 days)
export const clickChartData = Array.from({ length: 14 }, (_, i) => ({
  date: `${String(i + 16).padStart(2, "0")}/04`,
  clicks: 800 + Math.round(Math.random() * 1500),
  conversions: 5 + Math.round(Math.random() * 25),
}));

export const revenueChartData = Array.from({ length: 6 }, (_, i) => {
  const months = ["T11", "T12", "T1", "T2", "T3", "T4"];
  return {
    month: months[i],
    commission: 25_000_000 + Math.round(Math.random() * 60_000_000),
    payout: 20_000_000 + Math.round(Math.random() * 50_000_000),
  };
});

export const sourceBreakdown = [
  { name: "Facebook", value: 38 },
  { name: "TikTok", value: 24 },
  { name: "YouTube", value: 15 },
  { name: "Website", value: 12 },
  { name: "Email", value: 7 },
  { name: "Khác", value: 4 },
];

// Current affiliate (logged in mock)
export const currentAffiliate = affiliates[0];
