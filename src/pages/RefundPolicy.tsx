import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldX, HelpCircle, Mail } from 'lucide-react';
import { BRAND } from '@/config/branding';

export default function RefundPolicy() {
  const pageTitle = `Refund Policy | ${BRAND.name}`;
  const pageDescription = `${BRAND.name} refund policy. Learn about our no-refunds policy and payment terms for portfolio builder subscriptions.`;
  const pageUrl = 'https://makeportfolios.com/refund-policy';
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-16 md:py-24">
        {/* Back Link */}
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Refund Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
              No Refunds Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-10">
              All purchases made on {BRAND.name} are final and non-refundable. Once a payment is processed and a plan upgrade is activated, we do not offer refunds under any circumstances. This applies to all plans including Starter and Pro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
              Why We Have This Policy
            </h2>
            <div className="text-muted-foreground leading-relaxed pl-10 space-y-3">
              <p>
                Our pricing is designed to be transparent and affordable with one-time payments. The features you unlock are immediately available and cannot be "returned" like physical products.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You have full access to try the Free plan before upgrading</li>
                <li>All features and limitations are clearly described on our pricing page</li>
                <li>Our one-time pricing is significantly lower than subscription-based alternatives</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
              Before You Purchase
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-10">
              We encourage you to:
            </p>
            <ul className="list-disc pl-16 mt-2 text-muted-foreground space-y-2">
              <li>Explore the Free plan fully to understand the platform</li>
              <li>Review all features included in each plan on our pricing section</li>
              <li>Contact us if you have any questions before purchasing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
              Exceptional Circumstances
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-10">
              In rare cases of technical errors (such as duplicate charges or payment processing errors), please contact us immediately with your payment details. We will investigate and resolve legitimate technical issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-10">
              If you have any questions about this policy or need assistance, please reach out to us at:
            </p>
            <div className="mt-4 pl-10">
              <a 
                href={`mailto:${BRAND.supportEmail}`} 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {BRAND.supportEmail}
              </a>
            </div>
          </section>
        </div>

        {/* Help Section */}
        <div className="mt-16 p-6 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Have questions before purchasing?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're here to help! Try the Free plan first or reach out to us with any questions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" asChild>
                  <Link to="/register">Try Free Plan</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${BRAND.supportEmail}`}>Contact Support</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
