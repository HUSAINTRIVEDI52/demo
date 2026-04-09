import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, ArrowLeft, Heart, Code, Sparkles, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/config/branding';
import { ScrollReveal } from '@/components/premium/ScrollReveal';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About & Contact - {BRAND.name}</title>
        <meta name="description" content="Learn about Make Portfolio and get in touch with our team. We're here to help you build stunning professional portfolios." />
        <link rel="canonical" href="https://makeportfolios.com/about" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />

          <div className="container relative z-10">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </motion.div>

            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8"
              >
                <Heart className="h-4 w-4" />
                <span>Built with passion</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6"
              >
                About{' '}
                <span className="bg-gradient-to-r from-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {BRAND.name}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Empowering professionals to showcase their work beautifully. 
                No coding required, just your creativity.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <ScrollReveal>
          <section className="py-16 md:py-24 border-t border-border/50">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-accent/30 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <Code className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Code Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Build professional portfolios without writing a single line of code.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-accent/30 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Beautiful Themes</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose from stunning, professionally designed themes that make you stand out.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-accent/30 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <Rocket className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Launch Fast</h3>
                    <p className="text-sm text-muted-foreground">
                      Go from zero to live portfolio in under 5 minutes. It's that simple.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Developer Section */}
        <ScrollReveal>
          <section className="py-16 md:py-24 bg-muted/30 border-y border-border/50">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-accent to-emerald-400 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg shadow-accent/25">
                    HT
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl font-display font-bold mb-4"
                >
                  Meet the Developer
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-muted-foreground mb-2"
                >
                  <span className="font-semibold text-foreground">Husain Trivedi</span>
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground max-w-xl mx-auto leading-relaxed"
                >
                  Passionate about creating tools that help professionals showcase their work. 
                  {BRAND.name} was built with the vision of making portfolio creation accessible 
                  to everyone, regardless of technical background.
                </motion.p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Contact Section */}
        <ScrollReveal>
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-display font-bold mb-4"
                  >
                    Get in Touch
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground"
                  >
                    Have questions, feedback, or need support? We'd love to hear from you.
                  </motion.p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Email Card */}
                  <motion.a
                    href="mailto:makeportfolios@gmail.com"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
                  >
                    <div className="h-12 w-12 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                      Email Us
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For general inquiries and support
                    </p>
                    <p className="text-sm font-medium text-accent">
                      makeportfolios@gmail.com
                    </p>
                  </motion.a>

                  {/* WhatsApp Card */}
                  <motion.a
                    href="https://wa.me/918156005352"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300"
                  >
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center mb-4 transition-colors">
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-green-500 transition-colors">
                      WhatsApp
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quick responses for urgent queries
                    </p>
                    <p className="text-sm font-medium text-green-500">
                      +91 8156005352
                    </p>
                  </motion.a>
                </div>

                {/* Response Time Notice */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-sm text-muted-foreground mt-8"
                >
                  We typically respond within 24 hours on business days.
                </motion.p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-accent via-emerald-500 to-teal-500 relative overflow-hidden">
          <motion.div 
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="container relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-6"
              >
                Ready to build your portfolio?
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg bg-background hover:bg-background/90 text-foreground shadow-xl"
                  asChild
                >
                  <Link to="/register">
                    Get Started Free
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/refund-policy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
