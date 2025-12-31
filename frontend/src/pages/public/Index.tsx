import { Navbar } from '@/components/common/Navbar';
import { Hero } from '@/components/home/Hero';
import { Cards3 } from '@/components/home/Cards3';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { ServicesTable } from '@/components/home/ServicesTable';
import { About } from '@/components/home/About';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/common/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        <Cards3 />
        
        <section id="why-us">
          <WhyChooseUs />
        </section>
        
        {/* <section id="services">
          <ServicesTable />
        </section> */}
        
        <section id="about">
          <About />
        </section>
        
        <section id="contact">
          <Contact />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;