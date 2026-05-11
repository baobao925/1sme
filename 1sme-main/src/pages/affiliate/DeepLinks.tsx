import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { deepLinks, products, currentAffiliate, buildDeepLink } from "@/lib/mock-data";
import { formatDate, formatNumber, formatPercent, formatVND } from "@/lib/format";
import { Copy, X, ExternalLink, Search, ChevronDown, Layers, Lock, Unlock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Encode deeplink: giấu ref_code & product_id bằng base64 trong 1 token "s"
const encodeDeepLink = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    const ref = u.searchParams.get("ref_code");
    const pid = u.searchParams.get("product_id");
    if (!ref || !pid) return rawUrl;
    const token = btoa(`${ref}|${pid}|${Date.now()}`).replace(/=+$/, "");
    u.search = "";
    u.searchParams.set("s", token);
    return u.toString();
  } catch {
    return rawUrl;
  }
};

const DeepLinks = () => {
  const myLinks = deepLinks.filter(d => d.affiliateId === currentAffiliate.id);
  const myCategories = currentAffiliate.categories;

  const [tab, setTab] = useState<"available" | "mine">("available");
  const [pickedCategories, setPickedCategories] = useState<string[]>(myCategories);
  const [openCatFilter, setOpenCatFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [bulkPicked, setBulkPicked] = useState<Record<string, boolean>>({});
  const [openDetail, setOpenDetail] = useState<string | null>(null);

  const [encode, setEncode] = useState(true);

  // Sản phẩm khả dụng = lọc theo ngành đã chọn (subset của profile categories) + search
  const eligibleProducts = products
    .filter(p => pickedCategories.includes(p.category))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const detailLink = myLinks.find(l => l.id === openDetail);

  const transform = (url: string) => (encode ? encodeDeepLink(url) : url);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(encode ? "Đã copy link bảo mật (đã encode)" : "Đã copy link");
  };

  const copyForProduct = (productId: string) => {
    const p = products.find(x => x.id === productId)!;
    copy(transform(buildDeepLink(p.sku, currentAffiliate.code, p.id)));
  };

  const toggleCat = (c: string) => {
    setPickedCategories(pickedCategories.includes(c)
      ? pickedCategories.filter(x => x !== c)
      : [...pickedCategories, c]);
  };

  const bulkCount = Object.entries(bulkPicked).filter(([id, v]) => v && eligibleProducts.some(p => p.id === id)).length;
  const allSelected = eligibleProducts.length > 0 && bulkCount === eligibleProducts.length;

  const selectAllOnPage = () => {
    const next = { ...bulkPicked };
    eligibleProducts.forEach(p => { next[p.id] = true; });
    setBulkPicked(next);
  };
  const clearAllOnPage = () => {
    const next = { ...bulkPicked };
    eligibleProducts.forEach(p => { next[p.id] = false; });
    setBulkPicked(next);
  };

  const bulkGetLinks = () => {
    // Auto-select tất cả nếu chưa chọn gì
    let ids = Object.entries(bulkPicked).filter(([id, v]) => v && eligibleProducts.some(p => p.id === id)).map(([k]) => k);
    if (ids.length === 0) {
      ids = eligibleProducts.map(p => p.id);
      const next = { ...bulkPicked };
      ids.forEach(id => { next[id] = true; });
      setBulkPicked(next);
    }
    if (ids.length === 0) { toast.error("Không có sản phẩm khả dụng"); return; }
    const urls = ids.map(id => {
      const p = products.find(x => x.id === id)!;
      return transform(buildDeepLink(p.sku, currentAffiliate.code, p.id));
    }).join("\n");
    navigator.clipboard.writeText(urls);
    toast.success(`Đã copy ${ids.length} deep link${encode ? " (đã encode)" : ""} vào clipboard`);
  };

  return (
    <>
      <PageHeader
        title="Liên kết tiếp thị"
        subtitle={`Sản phẩm hiển thị theo ngành hàng đã chọn ở hồ sơ: ${myCategories.join(", ")}`}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        <button onClick={() => setTab("available")}
          className={cn("px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
            tab === "available" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          Sản phẩm khả dụng ({products.filter(p => myCategories.includes(p.category)).length})
        </button>
        <button onClick={() => setTab("mine")}
          className={cn("px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
            tab === "mine" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          Liên kết của tôi ({myLinks.length})
        </button>
      </div>

      {tab === "available" && (
        <>
          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3 shadow-soft">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-muted/40 rounded-md text-sm border border-transparent focus:border-primary outline-none"
                placeholder="Tìm kiếm tên sản phẩm khả dụng..." />
            </div>

            {/* Category dropdown filter */}
            <div className="relative">
              <button onClick={() => setOpenCatFilter(!openCatFilter)}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm flex items-center gap-2 min-w-[200px] justify-between">
                <span className="truncate">
                  {pickedCategories.length === 0 ? "Chọn ngành hàng"
                    : pickedCategories.length === myCategories.length ? "Tất cả ngành hàng"
                    : `${pickedCategories.length} ngành đã chọn`}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {openCatFilter && (
                <div className="absolute top-full mt-1 right-0 z-10 bg-card border border-border rounded-md shadow-large p-2 min-w-[240px]">
                  <div className="text-[11px] uppercase text-muted-foreground px-2 py-1 font-semibold">Ngành hàng đã chọn ở profile</div>
                  {myCategories.map(c => (
                    <label key={c} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer">
                      <input type="checkbox" checked={pickedCategories.includes(c)}
                        onChange={() => toggleCat(c)} className="w-4 h-4 accent-primary" />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setEncode(!encode)}
              title="Mã hoá link để giấu ref_code & affID khi chia sẻ"
              className={cn("px-3 py-2 text-sm font-semibold rounded-md flex items-center gap-2 border transition-colors",
                encode ? "border-success/50 bg-success/10 text-success" : "border-border hover:bg-muted text-muted-foreground")}>
              {encode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {encode ? "Link bảo mật: BẬT" : "Link bảo mật: TẮT"}
            </button>

            {bulkCount > 0 ? (
              <button onClick={clearAllOnPage}
                className="px-3 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-md flex items-center gap-2">
                <X className="w-4 h-4" /> Bỏ chọn
              </button>
            ) : null}

            <button onClick={bulkGetLinks}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2 shadow-sm">
              <Layers className="w-4 h-4" />
              Lấy tất cả link
              <span className="px-2 py-0.5 bg-primary-foreground/20 rounded text-[11px] font-bold">
                {bulkCount}/{eligibleProducts.length}
              </span>
            </button>
          </div>

          {/* Bulk select header bar */}
          <div className="flex items-center justify-between mb-3 px-1 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={allSelected} onChange={() => allSelected ? clearAllOnPage() : selectAllOnPage()}
                className="w-4 h-4 accent-primary" />
              <span className="font-semibold">
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả sản phẩm trong trang"}
              </span>
            </label>
            <div>Đã chọn <strong className="text-foreground">{bulkCount}</strong> / {eligibleProducts.length} sản phẩm</div>
          </div>

          {/* Catalog grid with checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleProducts.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-12 bg-card border border-border rounded-xl">
                Không có sản phẩm phù hợp
              </div>
            )}
            {eligibleProducts.map(p => {
              const checked = bulkPicked[p.id] ?? false;
              return (
                <div key={p.id} className={cn("border rounded-lg p-3 transition-colors bg-card",
                  checked ? "border-primary shadow-glow" : "border-border hover:border-primary/50")}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={checked}
                      onChange={e => setBulkPicked({ ...bulkPicked, [p.id]: e.target.checked })}
                      className="w-4 h-4 accent-primary mt-1.5" />
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0">
                      {p.sku.slice(0, 4)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.vendor} · {p.category}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{formatVND(p.price)}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-bold">{p.commissionRate}% HH</span>
                        {p.commissionType === "Recurring" && <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[11px] font-semibold">Định kỳ</span>}
                      </div>
                      <button onClick={() => copyForProduct(p.id)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                        <Copy className="w-3.5 h-3.5" /> Lấy link
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "mine" && (
        <div className="data-table-wrapper">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-bold">Liên kết của tôi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">URL: <code className="bg-muted px-1 rounded">link_sp?ref_code=AFF_ID&product_id=XXX</code></p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Sản phẩm</th>
                <th className="text-left px-5 py-3 font-semibold">Mã giới thiệu (AFF ID)</th>
                <th className="text-right px-5 py-3 font-semibold">Lượt click</th>
                <th className="text-right px-5 py-3 font-semibold">Đơn CĐ</th>
                <th className="text-right px-5 py-3 font-semibold">Tỉ lệ CĐ</th>
                <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
                <th className="text-left px-5 py-3 font-semibold">Ngày tạo</th>
                <th className="text-center px-5 py-3 font-semibold sticky-action">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {myLinks.map((dl) => {
                const cr = dl.clicks > 0 ? (dl.conversions / dl.clicks) * 100 : 0;
                return (
                  <tr key={dl.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 max-w-[260px] truncate font-medium">{dl.productName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-primary">{dl.refCode}</td>
                    <td className="px-5 py-3 text-right">{formatNumber(dl.clicks)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{dl.conversions}</td>
                    <td className="px-5 py-3 text-right">{formatPercent(cr)}</td>
                    <td className="px-5 py-3 text-center"><StatusBadge status={dl.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(dl.createdAt)}</td>
                    <td className="px-5 py-3 sticky-action">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setOpenDetail(dl.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Xem chi tiết">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => copy(transform(dl.url))} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title={encode ? "Copy link bảo mật" : "Copy link"}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {openDetail && detailLink && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenDetail(null)}>
          <div className="bg-card rounded-xl shadow-large w-full max-w-xl border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h3 className="font-display font-bold">Chi tiết Liên kết</h3>
              <button onClick={() => setOpenDetail(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Sản phẩm</div>
                <div className="font-semibold">{detailLink.productName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">URL gốc <Unlock className="w-3 h-3" /></div>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs break-all">{detailLink.url}</code>
                  <button onClick={() => copy(detailLink.url)} className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" /> URL bảo mật (encoded — giấu ref_code & affID)
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-success/5 border border-success/30 rounded-md text-xs break-all">{encodeDeepLink(detailLink.url)}</code>
                  <button onClick={() => copy(encodeDeepLink(detailLink.url))} className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Lượt click</div>
                  <div className="text-lg font-bold">{formatNumber(detailLink.clicks)}</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Đơn chuyển đổi</div>
                  <div className="text-lg font-bold">{detailLink.conversions}</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Tỉ lệ CĐ</div>
                  <div className="text-lg font-bold">{formatPercent((detailLink.conversions/detailLink.clicks)*100)}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeepLinks;
