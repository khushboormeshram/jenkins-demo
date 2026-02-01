
import { BackgroundRippleEffectDemo } from '@/components/effects/background-ripple-effectdemo.jsx'
import HeroScrollDemo from '@/components/scroll-screen.jsx'
import Footer from '@/components/footer-section.jsx'
import FAQsSection from '@/components/faq-section.jsx'
import Features from '@/components/features.jsx'
import { NavbarDemo } from '@/components/nav-bardemo.jsx'
export default function Home() {
    return (
        <>
            <NavbarDemo />
            <BackgroundRippleEffectDemo />
            <HeroScrollDemo />
            <Features />
            <FAQsSection />
            <Footer />
        </>
    );
}
