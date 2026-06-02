import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import fs from "node:fs/promises";

const HOSTNAME = "https://dnlbox.github.io/fhir-capability-analyzer";
const DESCRIPTION =
  "FHIR CapabilityStatement analyzer and comparator. Detect US Core, IPS, AU Core, and UK Core profiles. TypeScript CLI and library. CI-ready.";

export default defineConfig({
  site: HOSTNAME,
  base: "/fhir-capability-analyzer",
  legacy: {
    collections: true,
  },
  integrations: [
    starlight({
      title: "fhir-capability-analyzer",
      description: DESCRIPTION,
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/dnlbox/fhir-capability-analyzer",
        },
        {
          icon: "npm",
          label: "npm",
          href: "https://www.npmjs.com/package/fhir-capability-analyzer",
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/dnlbox/fhir-capability-analyzer/edit/main/docs/site/",
      },
      customCss: [
        "./src/theme/tokens/theme-blue.css",
        "./src/theme/styles/base.css",
        "./src/styles/custom.css",
      ],
      sidebar: [
        {
          label: "Guide",
          autogenerate: { directory: "guide" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
        {
          label: "Ecosystem",
          link: "/ecosystem/",
        },
      ],
      head: [
        {
          tag: "meta",
          attrs: { property: "og:type", content: "website" },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:site_name",
            content: "fhir-capability-analyzer",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:title",
            content: "fhir-capability-analyzer — FHIR CapabilityStatement analyzer CLI",
          },
        },
        {
          tag: "meta",
          attrs: { property: "og:description", content: DESCRIPTION },
        },
        {
          tag: "meta",
          attrs: { property: "og:url", content: HOSTNAME + "/" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:card", content: "summary" },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:title",
            content: "fhir-capability-analyzer — FHIR CapabilityStatement analyzer CLI",
          },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:description", content: DESCRIPTION },
        },
        {
          tag: "meta",
          attrs: {
            name: "google-site-verification",
            content: "Ffbl73Sm-TtkxrvNsLRS417HB-VjOPRmerHZVfhF0QQ",
          },
        },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          content: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "fhir-capability-analyzer",
            description: DESCRIPTION,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            programmingLanguage: "TypeScript",
            url: HOSTNAME + "/",
            downloadUrl:
              "https://www.npmjs.com/package/fhir-capability-analyzer",
            license: "https://opensource.org/licenses/MIT",
            codeRepository:
              "https://github.com/dnlbox/fhir-capability-analyzer",
            author: { "@type": "Person", name: "Daniel Veronez" },
          }),
        },
      ],
      expressiveCode: {
        themes: ["dark-plus", "github-light"],
      },
    }),
    {
      name: "copy-sitemap",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          try {
            await fs.copyFile(
              new URL("sitemap-index.xml", dir),
              new URL("sitemap.xml", dir)
            );
          } catch (err) {
            console.error("Failed to copy sitemap-index.xml to sitemap.xml:", err);
          }
        },
      },
    },
  ],
});
