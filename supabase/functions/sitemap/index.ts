import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const SITE_URL = "https://makeportfolios.com";

// Static pages with their priority and change frequency
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/login", priority: "0.6", changefreq: "monthly" },
  { path: "/register", priority: "0.7", changefreq: "monthly" },
  { path: "/refund-policy", priority: "0.3", changefreq: "yearly" },
];

// Helper to validate image URLs
function isValidImageUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Helper to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generate image XML entries
function generateImageXml(images: { url: string; title?: string; caption?: string }[]): string {
  return images
    .filter((img) => isValidImageUrl(img.url))
    .map(
      (img) => `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>${
        img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : ""
      }${img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
    </image:image>`
    )
    .join("\n");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date for lastmod
    const today = new Date().toISOString().split("T")[0];

    // Fetch all published portfolios with images
    const { data: portfolios, error: portfoliosError } = await supabase
      .from("portfolios")
      .select("slug, title, updated_at, avatar_url, hero_image_url")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    if (portfoliosError) {
      console.error("Error fetching portfolios:", portfoliosError);
    }

    // Fetch all projects with images for published portfolios
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, title, image_url, portfolio_id, portfolios!inner(slug, published)")
      .eq("published", true)
      .eq("portfolios.published", true);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
    }

    // Group projects by portfolio slug
    const projectsByPortfolio: Record<string, { title: string; image_url: string | null }[]> = {};
    if (projects) {
      for (const project of projects) {
        const portfolio = project.portfolios as { slug: string; published: boolean };
        const slug = portfolio?.slug;
        if (slug) {
          if (!projectsByPortfolio[slug]) {
            projectsByPortfolio[slug] = [];
          }
          projectsByPortfolio[slug].push({
            title: project.title,
            image_url: project.image_url,
          });
        }
      }
    }

    // Fetch all showcase portfolios
    const { data: showcasePortfolios, error: showcaseError } = await supabase
      .from("showcase_portfolios")
      .select("slug, title, updated_at, avatar_url, projects")
      .order("updated_at", { ascending: false });

    if (showcaseError) {
      console.error("Error fetching showcase portfolios:", showcaseError);
    }

    // Build sitemap XML with image extension
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add showcase portfolios with images
    if (showcasePortfolios && showcasePortfolios.length > 0) {
      for (const portfolio of showcasePortfolios) {
        const lastmod = portfolio.updated_at
          ? new Date(portfolio.updated_at).toISOString().split("T")[0]
          : today;

        // Collect images for this showcase portfolio
        const images: { url: string; title?: string; caption?: string }[] = [];

        if (isValidImageUrl(portfolio.avatar_url)) {
          images.push({
            url: portfolio.avatar_url!,
            title: `${portfolio.title} Profile Photo`,
            caption: `Professional photo of ${portfolio.title}`,
          });
        }

        // Parse projects JSON for images
        if (portfolio.projects && Array.isArray(portfolio.projects)) {
          for (const project of portfolio.projects as { title?: string; image_url?: string }[]) {
            if (isValidImageUrl(project.image_url)) {
              images.push({
                url: project.image_url!,
                title: project.title || "Project",
                caption: `Project screenshot: ${project.title || "Portfolio project"}`,
              });
            }
          }
        }

        const imageXml = generateImageXml(images);

        xml += `  <url>
    <loc>${SITE_URL}/showcase/${portfolio.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${imageXml ? imageXml + "\n" : ""}  </url>
`;
      }
    }

    // Add published user portfolios with images
    if (portfolios && portfolios.length > 0) {
      for (const portfolio of portfolios) {
        const lastmod = portfolio.updated_at
          ? new Date(portfolio.updated_at).toISOString().split("T")[0]
          : today;

        // Collect images for this portfolio
        const images: { url: string; title?: string; caption?: string }[] = [];

        if (isValidImageUrl(portfolio.avatar_url)) {
          images.push({
            url: portfolio.avatar_url!,
            title: `${portfolio.title} Profile Photo`,
            caption: `Professional photo of ${portfolio.title}`,
          });
        }

        if (isValidImageUrl(portfolio.hero_image_url)) {
          images.push({
            url: portfolio.hero_image_url!,
            title: `${portfolio.title} Hero Image`,
            caption: `Hero banner for ${portfolio.title}'s portfolio`,
          });
        }

        // Add project images
        const portfolioProjects = projectsByPortfolio[portfolio.slug] || [];
        for (const project of portfolioProjects) {
          if (isValidImageUrl(project.image_url)) {
            images.push({
              url: project.image_url!,
              title: project.title,
              caption: `Project: ${project.title}`,
            });
          }
        }

        const imageXml = generateImageXml(images);

        xml += `  <url>
    <loc>${SITE_URL}/${portfolio.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${imageXml ? imageXml + "\n" : ""}  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log(`Sitemap generated: ${portfolios?.length || 0} portfolios, ${showcasePortfolios?.length || 0} showcases`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);

    // Return a basic sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: corsHeaders,
    });
  }
});
