import React from 'react';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const StartPage = () => {
    return (
        <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
            <Header />
            <main>
                <Hero />
                <section id="features">
                    <Features />
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default StartPage;
