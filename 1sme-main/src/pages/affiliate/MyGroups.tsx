import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { affiliateGroups, currentAffiliate, affiliates } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Users, Award, Calendar, Search, LogOut, UserPlus, FileSignature, CheckCircle2, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MyGroups = () => {
  const [tab, setTab] = useState("my-groups");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteGroup, setInviteGroup] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [joinStatus, setJoinStatus] = useState<Record<string, "pending" | "joined">>({});

  // Mock data states
  const [groups, setGroups] = useState(affiliateGroups);

  const myGroups = groups.filter(g => g.memberIds.includes(currentAffiliate.id) && g.status === "active");
  const exploreGroups = groups.filter(g => 
    !g.memberIds.includes(currentAffiliate.id) && 
    g.status === "active" &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.code.toLowerCase().includes(search.toLowerCase()))
  );

  const handleLeave = (groupId: string, name: string) => {
    if(!window.confirm(`Bạn có chắc chắn muốn thoát khỏi nhóm ${name}?`)) return;
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, memberIds: g.memberIds.filter(id => id !== currentAffiliate.id) } : g));
    toast.success(`Đã thoát khỏi nhóm ${name}`);
  };

  const handleJoinReq = (groupId: string) => {
    setJoinStatus(prev => ({ ...prev, [groupId]: "pending" }));
    toast.success("Đã gửi yêu cầu gia nhập! Chờ Admin phê duyệt.");
  };

  const handleInvite = () => {
    if (!inviteEmail) return toast.error("Vui lòng nhập Email hoặc Affiliate ID");
    toast.success(`Đã gửi lời mời đến ${inviteEmail}`);
    setInviteOpen(false);
    setInviteEmail("");
  };

  return (
    <>
      <PageHeader title="Mạng lưới Affiliate" subtitle="Tham gia nhóm để nhận mức hoa hồng thưởng (Boost) và mở rộng mạng lưới." />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger value="my-groups" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Nhóm của tôi ({myGroups.length})</TabsTrigger>
          <TabsTrigger value="explore" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Khám phá nhóm</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups">
          {myGroups.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
              <Users className="w-12 h-12 mb-4 opacity-50" />
              <div className="font-semibold text-foreground mb-1">Bạn chưa tham gia nhóm nào.</div>
              <p className="text-sm max-w-md">Chuyển sang tab "Khám phá nhóm" để tìm kiếm hoặc liên hệ với các Leader Affiliate để được mời vào nhóm.</p>
              <Button variant="outline" className="mt-4" onClick={() => setTab("explore")}>Khám phá ngay</Button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {myGroups.map(g => {
              const members = affiliates.filter(a => g.memberIds.includes(a.id));
              return (
                <div key={g.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-soft transition-all hover:shadow-medium">
                  <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-start justify-between mb-2">
                       <div>
                         <div className="text-xs font-mono text-muted-foreground bg-background inline-block px-1.5 py-0.5 rounded border border-border">{g.code}</div>
                         <h3 className="font-display font-bold text-xl mt-2">{g.name}</h3>
                       </div>
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/15 text-accent rounded-full text-sm font-bold shadow-sm">
                         <Award className="w-4 h-4" /> +{g.commissionBoost}% Hoa hồng
                       </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{g.description}</p>
                  </div>

                  <div className="p-6 pb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1"><Users className="w-3.5 h-3.5" /> Thành viên</div>
                        <div className="font-bold text-foreground text-lg">{members.length}</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Hiệu lực</div>
                        <div className="text-sm font-medium">
                          {g.validFrom ? formatDate(g.validFrom) : "—"} → {g.validTo ? formatDate(g.validTo) : "Vô hạn"}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs font-semibold mb-2 uppercase text-muted-foreground tracking-wider">Danh sách thành viên</div>
                      <div className="flex flex-wrap gap-2">
                        {members.slice(0, 8).map(m => (
                          <span key={m.id} className={cn("px-2.5 py-1 text-xs rounded-full border", m.id === currentAffiliate.id ? "bg-primary/10 border-primary/20 text-primary font-semibold" : "bg-muted border-border text-muted-foreground")}>
                            {m.name} {m.id === currentAffiliate.id && "(Bạn)"}
                          </span>
                        ))}
                        {members.length > 8 && <span className="px-2.5 py-1 bg-muted border border-border text-xs rounded-full text-muted-foreground">+{members.length - 8}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
                    <button onClick={() => handleLeave(g.id, g.name)} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                       <LogOut className="w-4 h-4" /> Thoát nhóm
                    </button>
                    <Button size="sm" onClick={() => { setInviteGroup(g.name); setInviteOpen(true); }} className="gap-2">
                      <UserPlus className="w-4 h-4" /> Mời bạn bè
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="explore">
          <div className="flex items-center gap-3 mb-6 bg-card p-2 rounded-xl shadow-sm border border-border">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhóm theo tên hoặc mã..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exploreGroups.map(g => (
              <div key={g.id} className="bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-medium flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-1.5 py-0.5 border border-border rounded text-[10px] uppercase font-mono text-muted-foreground mb-2">{g.code}</span>
                    <h3 className="font-display font-bold text-lg leading-tight mb-1">{g.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{g.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-[11px] font-bold">
                       <Award className="w-3 h-3" /> +{g.commissionBoost}% HH
                     </span>
                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-[11px] text-muted-foreground">
                       <Users className="w-3 h-3" /> {g.memberIds.length} TV
                     </span>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-border">
                  {joinStatus[g.id] === 'pending' ? (
                    <Button variant="outline" className="w-full gap-2" disabled>
                      <Clock className="w-4 h-4 text-warning" /> Đang chờ duyệt
                    </Button>
                  ) : (
                    <Button variant="default" className="w-full gap-2" onClick={() => handleJoinReq(g.id)}>
                      <FileSignature className="w-4 h-4" /> Xin gia nhập
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {exploreGroups.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                 Không tìm thấy nhóm Affiliate nào phù hợp với từ khóa "{search}".
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời Affiliate vào nhóm</DialogTitle>
            <DialogDescription>
              Bạn đang mời thành viên gia nhập nhóm <strong className="text-foreground">{inviteGroup}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="block">
              <div className="text-xs font-semibold mb-1.5">Email hoặc Affiliate ID người được mời</div>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Ví dụ: AF005 hoặc mail@company.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </label>
            <div className="bg-muted/40 p-3 rounded-lg text-xs text-muted-foreground">
              Lời mời sẽ được gửi đến hộp thư và thông báo trên hệ thống của người này. Admin/Leader của nhóm sẽ có quyền duyệt nếu họ đồng ý tham gia.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Huỷ</Button>
            <Button onClick={handleInvite} className="gap-2"><UserPlus className="w-4 h-4" /> Gửi lời mời</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyGroups;
