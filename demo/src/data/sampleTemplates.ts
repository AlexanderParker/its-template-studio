import type { ItsTemplate } from "its-template-editor";
import { BASE_SCHEMA_URL, HTML_TYPES_URL, JSON_TYPES_URL, STANDARD_TYPES_URL, YAML_TYPES_URL } from "./instructionTypes";

export interface SampleTemplate {
  id: string;
  label: string;
  template: ItsTemplate;
}

export const sampleTemplates: SampleTemplate[] = [
  {
    id: "product-launch",
    label: "Product launch copy",
    template: {
      $schema: BASE_SCHEMA_URL,
      version: "1.0.0",
      extends: [STANDARD_TYPES_URL],
      metadata: {
        name: "Product launch copy",
        description: "Landing page copy for a new product, with an optional specifications table.",
        author: "ITS Template Studio",
      },
      variables: {
        product: { name: "wireless gaming headset", brand: "AuralTech" },
        featureCount: 5,
        includeSpecs: true,
        tone: "enthusiastic",
      },
      content: [
        {
          type: "text",
          text: "# ",
          id: "t-heading-hash",
        },
        {
          type: "placeholder",
          id: "p-headline",
          instructionType: "title",
          config: {
            description: "Create a launch headline for the ${product.brand} ${product.name}",
            displayName: "Launch headline",
            style: "catchy",
            length: "short",
          },
        },
        {
          type: "text",
          text: "\n\n",
          id: "t-gap-1",
        },
        {
          type: "placeholder",
          id: "p-intro",
          instructionType: "paragraph",
          config: {
            description: "Introduce the ${product.name} by ${product.brand} and why it matters to buyers",
            displayName: "Introduction",
            tone: "${tone}",
            length: "medium",
          },
        },
        {
          type: "text",
          text: "\n\n## Key features\n\n",
          id: "t-features-heading",
        },
        {
          type: "placeholder",
          id: "p-features",
          instructionType: "list",
          config: {
            description: "List ${featureCount} standout features of the ${product.name}",
            displayName: "Feature list",
            format: "bullet_points",
            itemCount: "${featureCount}",
          },
        },
        {
          type: "conditional",
          id: "c-specs",
          condition: "includeSpecs == true",
          content: [
            {
              type: "text",
              text: "\n\n## Specifications\n\n",
              id: "t-specs-heading",
            },
            {
              type: "placeholder",
              id: "p-specs",
              instructionType: "table",
              config: {
                description: "Create a realistic specifications table for the ${product.name}",
                displayName: "Spec table",
                format: "markdown",
                columns: 2,
                rows: 6,
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: "blog-post",
    label: "Blog post brief",
    template: {
      $schema: BASE_SCHEMA_URL,
      version: "1.0.0",
      extends: [STANDARD_TYPES_URL],
      metadata: {
        name: "Blog post brief",
        description: "A blog post that adapts its depth to the audience, with an optional code example.",
        author: "ITS Template Studio",
      },
      variables: {
        topic: "vector databases",
        audienceLevel: "technical",
        codeLanguage: "python",
      },
      content: [
        {
          type: "text",
          text: "# ",
          id: "t-hash",
        },
        {
          type: "placeholder",
          id: "p-title",
          instructionType: "title",
          config: {
            description: "Write a blog post title about ${topic}",
            displayName: "Post title",
            style: "descriptive",
            length: "medium",
          },
        },
        {
          type: "text",
          text: "\n\n",
          id: "t-gap",
        },
        {
          type: "conditional",
          id: "c-audience",
          condition: "audienceLevel == 'technical'",
          content: [
            {
              type: "placeholder",
              id: "p-technical-intro",
              instructionType: "paragraph",
              config: {
                description: "Explain ${topic} for experienced software engineers, assuming familiarity with data structures",
                displayName: "Technical introduction",
                tone: "professional",
                length: "long",
              },
            },
            {
              type: "text",
              text: "\n\n## Example\n\n",
              id: "t-example-heading",
            },
            {
              type: "placeholder",
              id: "p-code",
              instructionType: "code_block",
              config: {
                description: "Show a minimal, realistic example of using ${topic} in practice",
                displayName: "Code example",
                language: "${codeLanguage}",
              },
            },
          ],
          else: [
            {
              type: "placeholder",
              id: "p-general-intro",
              instructionType: "paragraph",
              config: {
                description: "Explain ${topic} in plain language for a curious general reader, avoiding jargon",
                displayName: "Plain-language introduction",
                tone: "friendly",
                length: "medium",
              },
            },
          ],
        },
        {
          type: "text",
          text: "\n\n> ",
          id: "t-quote-marker",
        },
        {
          type: "placeholder",
          id: "p-quote",
          instructionType: "quote",
          config: {
            description: "A quote relevant to ${topic}",
            displayName: "Pull quote",
            includeAttribution: true,
          },
        },
        {
          type: "text",
          text: "\n\n## In summary\n\n",
          id: "t-summary-heading",
        },
        {
          type: "placeholder",
          id: "p-summary",
          instructionType: "summary",
          config: {
            description: "Summarise the key points a reader should remember about ${topic}",
            displayName: "Closing summary",
            length: "standard",
          },
        },
      ],
    },
  },
  {
    id: "project-readme",
    label: "Project README",
    template: {
      $schema: BASE_SCHEMA_URL,
      version: "1.0.0",
      extends: [STANDARD_TYPES_URL],
      metadata: {
        name: "Project README",
        description: "A README skeleton with an optional quick-start section.",
        author: "ITS Template Studio",
      },
      variables: {
        project: { name: "example-toolkit", homepage: "https://example.com" },
        language: "python",
        includeQuickStart: true,
      },
      content: [
        {
          type: "text",
          text: "# ${project.name}\n\n",
          id: "t-title",
        },
        {
          type: "placeholder",
          id: "p-blurb",
          instructionType: "paragraph",
          config: {
            description: "Describe what the ${language} project ${project.name} does and who it is for",
            displayName: "Project blurb",
            tone: "professional",
            length: "short",
          },
        },
        {
          type: "text",
          text: "\n\nDocumentation: ${project.homepage}\n\n## Features\n\n",
          id: "t-links",
        },
        {
          type: "placeholder",
          id: "p-features",
          instructionType: "list",
          config: {
            description: "List the main capabilities of ${project.name}",
            displayName: "Capability list",
            format: "dashes",
            itemCount: 4,
          },
        },
        {
          type: "conditional",
          id: "c-quickstart",
          condition: "includeQuickStart == true",
          content: [
            {
              type: "text",
              text: "\n\n## Quick start\n\n",
              id: "t-quickstart-heading",
            },
            {
              type: "placeholder",
              id: "p-quickstart",
              instructionType: "code_block",
              config: {
                description: "Show how to install and run ${project.name} in a few commands",
                displayName: "Quick start snippet",
                language: "bash",
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: "api-response",
    label: "API response docs (JSON types)",
    template: {
      $schema: BASE_SCHEMA_URL,
      version: "1.0.0",
      extends: [JSON_TYPES_URL],
      metadata: {
        name: "API response documentation",
        description: "Documents a REST endpoint with generated JSON example responses, using the JSON type library.",
        author: "ITS Template Studio",
      },
      variables: {
        api: { baseUrl: "https://api.example.com/v2", version: "2.4.0" },
        resource: { name: "orders", idField: "orderId" },
        includeErrorExample: true,
      },
      content: [
        {
          type: "text",
          text: "# ${resource.name} API (v${api.version})\n\n## GET ${api.baseUrl}/${resource.name}\n\nReturns a paginated collection of ${resource.name}.\n\n### Example response\n\n",
          id: "t-endpoint-heading",
        },
        {
          type: "placeholder",
          id: "p-collection-response",
          instructionType: "json_object",
          config: {
            description:
              "A paginated API response for ${resource.name} with a data array of three items keyed by ${resource.idField}, plus page, pageSize and total fields",
            displayName: "Collection response",
            indent: "two_spaces",
          },
        },
        {
          type: "text",
          text: "\n\n### Allowed status values\n\n",
          id: "t-status-heading",
        },
        {
          type: "placeholder",
          id: "p-status-values",
          instructionType: "json_array",
          config: {
            description: "An array of five plausible status strings for ${resource.name}",
            displayName: "Status values",
            itemCount: 5,
            indent: "compact",
          },
        },
        {
          type: "conditional",
          id: "c-error-example",
          condition: "includeErrorExample == true",
          content: [
            {
              type: "text",
              text: "\n\n### Error response\n\nReturned with HTTP status 404 when the resource does not exist.\n\n",
              id: "t-error-heading",
            },
            {
              type: "placeholder",
              id: "p-error-response",
              instructionType: "json_object",
              config: {
                description:
                  "An error response object with error.code set to not_found and a human-readable error.message about a missing ${resource.name} resource",
                displayName: "Error response",
                indent: "two_spaces",
              },
            },
          ],
        },
        {
          type: "text",
          text: "\n\n### Response schema\n\n",
          id: "t-schema-heading",
        },
        {
          type: "placeholder",
          id: "p-response-schema",
          instructionType: "json_schema",
          config: {
            description: "A JSON Schema describing the paginated ${resource.name} response above",
            displayName: "Response schema",
            draft: "2020-12",
            indent: "two_spaces",
          },
        },
      ],
    },
  },
  {
    id: "ci-pipeline",
    label: "CI pipeline config (YAML types)",
    template: {
      $schema: BASE_SCHEMA_URL,
      version: "1.0.0",
      extends: [YAML_TYPES_URL],
      metadata: {
        name: "CI pipeline configuration",
        description: "Generates a CI pipeline document with an optional deploy stage, using the YAML type library.",
        author: "ITS Template Studio",
      },
      variables: {
        project: { name: "example-storefront", language: "node", repository: "https://git.example.com/acme/example-storefront" },
        includeDeployStage: true,
      },
      content: [
        {
          type: "text",
          text: "# CI configuration for ${project.name}\n# Repository: ${project.repository}\n\n",
          id: "t-header-comment",
        },
        {
          type: "placeholder",
          id: "p-pipeline-document",
          instructionType: "yaml_document",
          config: {
            description:
              "A CI pipeline for the ${project.language} project ${project.name} with build and test jobs, caching dependencies between runs",
            displayName: "Pipeline document",
            indentSize: 2,
            useAnchors: false,
          },
        },
        {
          type: "conditional",
          id: "c-deploy-stage",
          condition: "includeDeployStage == true",
          content: [
            {
              type: "text",
              text: "\n\n# Deploy stage, appended to the jobs mapping above\n\n",
              id: "t-deploy-comment",
            },
            {
              type: "placeholder",
              id: "p-deploy-stage",
              instructionType: "yaml_block",
              config: {
                description: "A deploy job for ${project.name} that runs only on the main branch and depends on the test job",
                displayName: "Deploy stage",
                indentSize: 2,
              },
            },
          ],
        },
        {
          type: "text",
          text: "\n\n# Frontmatter for the pipeline documentation page\n\n",
          id: "t-frontmatter-comment",
        },
        {
          type: "placeholder",
          id: "p-frontmatter",
          instructionType: "yaml_frontmatter",
          config: {
            description: "Frontmatter for a docs page about the ${project.name} pipeline with title, description and tags fields",
            displayName: "Docs frontmatter",
            fieldCount: 3,
          },
        },
      ],
    },
  },
  {
    id: "product-card",
    label: "Product card fragment (HTML types)",
    template: {
      $schema: BASE_SCHEMA_URL,
      version: "1.0.0",
      extends: [HTML_TYPES_URL],
      metadata: {
        name: "Product card fragment",
        description: "Builds an HTML product card fragment that slots into surrounding markup, using the HTML type library.",
        author: "ITS Template Studio",
      },
      variables: {
        product: { name: "Solar Garden Lantern", url: "https://www.example.com/products/solar-garden-lantern" },
        includeSpecifications: true,
        includeEnquiryForm: false,
      },
      content: [
        {
          type: "text",
          text: '<section class="product-card">\n  <h2><a href="${product.url}">${product.name}</a></h2>\n\n',
          id: "t-card-open",
        },
        {
          type: "placeholder",
          id: "p-summary",
          instructionType: "html_fragment",
          config: {
            description: "A short marketing summary of the ${product.name} as one paragraph element with a class attribute",
            displayName: "Product summary",
            rootElement: "p",
            includeClasses: true,
          },
        },
        {
          type: "text",
          text: "\n\n  <h3>Key features</h3>\n\n",
          id: "t-features-heading",
        },
        {
          type: "placeholder",
          id: "p-features",
          instructionType: "html_list",
          config: {
            description: "Four key features of the ${product.name} focused on benefits for the buyer",
            displayName: "Feature list",
            listType: "unordered",
            itemCount: 4,
          },
        },
        {
          type: "conditional",
          id: "c-specifications",
          condition: "includeSpecifications == true",
          content: [
            {
              type: "text",
              text: "\n\n  <h3>Specifications</h3>\n\n",
              id: "t-specs-heading",
            },
            {
              type: "placeholder",
              id: "p-spec-table",
              instructionType: "html_table",
              config: {
                description:
                  "A two-column specifications table for the ${product.name} listing dimensions, weight, battery life and materials",
                displayName: "Specifications table",
                columns: 2,
                includeHeader: true,
              },
            },
          ],
        },
        {
          type: "conditional",
          id: "c-enquiry-form",
          condition: "includeEnquiryForm == true",
          content: [
            {
              type: "text",
              text: "\n\n  <h3>Ask about this product</h3>\n\n",
              id: "t-enquiry-heading",
            },
            {
              type: "placeholder",
              id: "p-enquiry-fields",
              instructionType: "html_form_fields",
              config: {
                description: "Name, email and message fields for an enquiry about the ${product.name}",
                displayName: "Enquiry fields",
                fieldCount: 3,
                includeLabels: true,
              },
            },
          ],
        },
        {
          type: "text",
          text: "\n</section>",
          id: "t-card-close",
        },
      ],
    },
  },
];
