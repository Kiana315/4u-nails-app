import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ServicesTable } from '@/components/home/ServicesTable';


export default function ServicesPublicPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* 直接复用你首页的服务 section */}
      <main>
        <ServicesTable />
      </main>

      <Footer />
    </div>
  );
}