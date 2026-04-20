import { defineConfig } from "vitepress";

const HOSTNAME = "https://dnlbox.github.io/fhir-capability-analyzer";
const DESCRIPTION =
  "FHIR CapabilityStatement analyzer and comparator. Detect US Core, IPS, AU Core, and UK Core profiles. TypeScript CLI and library. CI-ready.";

export default defineConfig({
  title: "fhir-capability-analyzer",
  description: DESCRIPTION,
  base: "/fhir-capability-analyzer/",
  appearance: 'dark',
  sitemap: { hostname: HOSTNAME + "/" },
  head: [
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "fhir-capability-analyzer" }],
    ["meta", { property: "og:title", content: "fhir-capability-analyzer — FHIR CapabilityStatement analyzer CLI" }],
    ["meta", { property: "og:description", content: DESCRIPTION }],
    ["meta", { property: "og:url", content: HOSTNAME + "/" }],
    ["meta", { name: "twitter:card", content: "summary" }],
    ["meta", { name: "twitter:title", content: "fhir-capability-analyzer — FHIR CapabilityStatement analyzer CLI" }],
    ["meta", { name: "twitter:description", content: DESCRIPTION }],
    ["meta", { name: "google-site-verification", content: "Ffbl73Sm-TtkxrvNsLRS417HB-VjOPRmerHZVfhF0QQ" }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "fhir-capability-analyzer",
        description: DESCRIPTION,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        programmingLanguage: "TypeScript",
        url: HOSTNAME + "/",
        downloadUrl: "https://www.npmjs.com/package/fhir-capability-analyzer",
        license: "https://opensource.org/licenses/MIT",
        codeRepository: "https://github.com/dnlbox/fhir-capability-analyzer",
        author: { "@type": "Person", name: "Daniel Veronez" },
      }),
    ],
  ],
  transformHead({ pageData }) {
    const slug = pageData.relativePath
      .replace(/index\.md$/, "")
      .replace(/\.md$/, ".html");
    return [["link", { rel: "canonical", href: `${HOSTNAME}/${slug}` }]];
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Reference", link: "/reference/cli", activeMatch: "/reference/" },
      { text: "Ecosystem", link: "/ecosystem" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting started", link: "/guide/getting-started" },
            { text: "Analyze a server", link: "/guide/analyze" },
            { text: "Compare two servers", link: "/guide/compare" },
            { text: "Profile detection", link: "/guide/profile-detection" },
            { text: "CI/CD integration", link: "/guide/ci-cd" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "CLI reference", link: "/reference/cli" },
            { text: "Library API", link: "/reference/library-api" },
            { text: "Output formats", link: "/reference/output-formats" },
            { text: "Exit codes", link: "/reference/exit-codes" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/dnlbox/fhir-capability-analyzer" },
      { icon: "npm", link: "https://www.npmjs.com/package/fhir-capability-analyzer" },
    ],
    search: {
      provider: "local",
    },
    editLink: {
      pattern:
        "https://github.com/dnlbox/fhir-capability-analyzer/edit/main/docs/site/:path",
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Daniel Veronez",
    },
  },
});
