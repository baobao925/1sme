import { PageHeader } from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { CheckCircle2, Link2, ShoppingCart, Wallet, BookOpen, ArrowRight, PlayCircle, Settings2, HandCoins } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { 
    icon: Settings2, 
    title: "1. Hoàn tất hồ sơ & thuế", 
    desc: "Để có thể rút tiền thưởng, bạn bắt buộc phải cung cấp thông tin tài khoản ngân hàng và CMND/CCCD hoặc Giấy phép kinh doanh (nếu là doanh nghiệp) để phục vụ cho việc khấu trừ thuế.", 
    to: "/affiliate/profile", 
    cta: "Hoàn thiện hồ sơ" 
  },
  { 
    icon: Link2, 
    title: "2. Tạo Liên kết tiếp thị (Deep link)", 
    desc: "Tìm kiếm sản phẩm phù hợp với đối tượng khách hàng của bạn. Tạo link tiếp thị riêng biệt có chứa Affiliate ID của bạn để hệ thống theo dõi và ghi nhận.", 
    to: "/affiliate/deeplinks", 
    cta: "Tạo link tiếp thị" 
  },
  { 
    icon: ShoppingCart, 
    title: "3. Theo dõi lượt click & chuyển đổi", 
    desc: "Chia sẻ liên kết lên các kênh truyền thông. Bạn có thể theo dõi trực tiếp số click, số đơn hàng được mua thành công qua link của bạn thông qua Last Click attribution.", 
    to: "/affiliate/conversions", 
    cta: "Xem chuyển đổi" 
  },
  { 
    icon: HandCoins, 
    title: "4. Yêu cầu rút tiền", 
    desc: "Khi số dư khả dụng đạt mức tối thiểu (250.000đ đối với cá nhân), bạn có thể gửi yêu cầu rút tiền. Lưu ý: Tiền hoa hồng sẽ được đối soát và rút sau khi kết thúc kỳ hạn hoàn/hủy sự cố (thường 15-30 ngày).", 
    to: "/affiliate/payout", 
    cta: "Đến trang rút tiền" 
  },
];

const GettingStarted = () => (
  <>
    <PageHeader title="Hướng dẫn bắt đầu" subtitle="Trở thành nhà cung cấp và kiếm tiền trên nền tảng 1SME" />

    <div className="bg-gradient-hero text-primary-foreground rounded-xl p-6 mb-8 shadow-medium">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-display font-bold text-xl">Chào mừng đến với Affiliate Hub!</h2>
          </div>
          <p className="text-sm text-primary-foreground/85 max-w-2xl">
            Vuốt ngang các slide để xem quy trình từng bước. Nắm vững 4 bước dưới đây để bắt đầu tạo ra doanh thu đầu tiên của bạn.
          </p>
        </div>
        <div className="hidden md:flex">
          <PlayCircle className="w-16 h-16 opacity-30" />
        </div>
      </div>
    </div>

    <div className="px-10">
      <Carousel className="w-full" opts={{ loop: false }}>
        <CarouselContent>
          {steps.map((s, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Card className="h-full border-border/60 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mb-4">
                      <s.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg leading-tight mb-2">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border">
                      <Link to={s.to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        {s.cta} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-[-2rem] border-primary text-primary hover:bg-primary/20" />
        <CarouselNext className="right-[-2rem] border-primary text-primary hover:bg-primary/20" />
      </Carousel>
    </div>

    <div className="mt-12 bg-card border border-border rounded-xl p-6 shadow-soft">
      <h3 className="font-display font-bold mb-4 flex items-center gap-2">
         <CheckCircle2 className="w-5 h-5 text-success" />
         Các câu hỏi thường gặp
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-muted/40 p-4 rounded-lg">
          <strong className="text-foreground block mb-1">Q: Khi nào hoa hồng được duyệt?</strong> 
          <span className="text-muted-foreground leading-relaxed block">Sau khi hết thời hạn tạm giữ (hold period) do chính sách của từng sản phẩm (thường 7-30 ngày phụ thuộc chính sách hoàn trả của nhà cung cấp).</span>
        </div>
        <div className="bg-muted/40 p-4 rounded-lg">
          <strong className="text-foreground block mb-1">Q: Thuế tính như thế nào?</strong> 
          <span className="text-muted-foreground leading-relaxed block">Hệ thống áp dụng PIT 10% cho cá nhân nếu thu nhập mỗi kỳ ≥ 250.000đ; và VAT 10% đối với Doanh nghiệp.</span>
        </div>
        <div className="bg-muted/40 p-4 rounded-lg">
          <strong className="text-foreground block mb-1">Q: Có yêu cầu kỳ thanh toán thế nào?</strong> 
          <span className="text-muted-foreground leading-relaxed block">Kỳ thanh toán sẽ được khóa số liệu để Admin Sàn tiến hành đối soát. Việc chuyển tiền diễn ra vào ngày 15 và 30 hàng tháng đối với các lệnh khả dụng.</span>
        </div>
        <div className="bg-muted/40 p-4 rounded-lg">
          <strong className="text-foreground block mb-1">Q: Cần trợ giúp thì liên lạc ở đâu?</strong> 
          <span className="text-muted-foreground leading-relaxed block">Sử dụng nút "Khiếu nại của tôi" tại Menu Trợ giúp ở cột bên trái để gửi các yêu cầu trợ giúp chi tiết liên quan đến thanh toán và hoa hồng.</span>
        </div>
      </div>
    </div>
  </>
);

export default GettingStarted;
