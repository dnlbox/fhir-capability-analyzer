import { defineConfig } from "vitepress";

export default defineConfig({
  title: "fhir-capability-analyzer",
  description: "Fetch, analyze, and compare FHIR server CapabilityStatements. Profile detection. CI-ready.",
  base: "/fhir-capability-analyzer/",
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
