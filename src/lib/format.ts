export const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n);

export const formatPercent = (n: number, digits = 1) =>
  `${n.toFixed(digits)}%`;

export const formatDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const formatDateTime = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const maskPhone = (p: string) => p.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");
export const maskEmail = (e: string) => {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}***@${d}`;
};
