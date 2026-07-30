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
        description:
          "Documents a REST endpoint whose example response JSON is authored literally in the template, with JSON type placeholders filling the values.",
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
          text: '# ${resource.name} API (v${api.version})\n\n## GET ${api.baseUrl}/${resource.name}\n\nReturns a paginated collection of ${resource.name}.\n\n### Example response\n\n{\n  "data": [\n',
          id: "t-endpoint-heading",
        },
        {
          type: "placeholder",
          id: "p-data-items",
          instructionType: "json_array_items",
          config: {
            description:
              "three ${resource.name} objects, each with a ${resource.idField} string, a status string and a total number",
            displayName: "Data items",
            itemType: "object",
            itemCount: 3,
          },
        },
        {
          type: "text",
          text: '\n  ],\n  "page": 1,\n  "pageSize": 20,\n  "total": ',
          id: "t-pagination",
        },
        {
          type: "placeholder",
          id: "p-total-count",
          instructionType: "json_number",
          config: {
            description: "a plausible total count of ${resource.name} across all pages",
            displayName: "Total count",
            numberType: "integer",
          },
        },
        {
          type: "text",
          text: ',\n  "summary": ',
          id: "t-summary-field",
        },
        {
          type: "placeholder",
          id: "p-summary-value",
          instructionType: "json_value",
          config: {
            description: "a one-line summary string describing the ${resource.name} collection",
            displayName: "Summary value",
            valueType: "string",
          },
        },
        {
          type: "text",
          text: "\n}",
          id: "t-response-close",
        },
        {
          type: "conditional",
          id: "c-error-example",
          condition: "includeErrorExample == true",
          content: [
            {
              type: "text",
              text: '\n\n### Error response\n\nReturned with HTTP status 404 when the resource does not exist.\n\n{\n  "error": {\n    "code": "not_found",\n    "message": ',
              id: "t-error-open",
            },
            {
              type: "placeholder",
              id: "p-error-message",
              instructionType: "json_string",
              config: {
                description: "a human-readable message about a missing ${resource.name} resource",
                displayName: "Error message",
              },
            },
            {
              type: "text",
              text: "\n  }\n}",
              id: "t-error-close",
            },
          ],
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
        description:
          "A CI pipeline whose YAML structure is authored literally in the template, with YAML type placeholders filling the values.",
        author: "ITS Template Studio",
      },
      variables: {
        project: { name: "example-storefront", language: "node", repository: "https://git.example.com/acme/example-storefront" },
        includeDeployStage: true,
      },
      content: [
        {
          type: "text",
          text: "# CI configuration for ${project.name}\n# Repository: ${project.repository}\n\nimage: ",
          id: "t-header-comment",
        },
        {
          type: "placeholder",
          id: "p-build-image",
          instructionType: "yaml_value",
          config: {
            description: "a suitable container image for a ${project.language} project",
            displayName: "Build image",
            valueType: "string",
          },
        },
        {
          type: "text",
          text: "\n\nstages:\n  - build\n  - test\n\nbuild:\n  stage: build\n  script:\n",
          id: "t-build-job",
        },
        {
          type: "placeholder",
          id: "p-build-script",
          instructionType: "yaml_list_items",
          config: {
            description: "commands that install dependencies and build ${project.name}",
            displayName: "Build script",
            indentSpaces: 4,
          },
        },
        {
          type: "text",
          text: "\n\ntest:\n  stage: test\n  script:\n",
          id: "t-test-job",
        },
        {
          type: "placeholder",
          id: "p-test-script",
          instructionType: "yaml_list_items",
          config: {
            description: "commands that run the ${project.name} test suite",
            displayName: "Test script",
            indentSpaces: 4,
          },
        },
        {
          type: "conditional",
          id: "c-deploy-stage",
          condition: "includeDeployStage == true",
          content: [
            {
              type: "text",
              text: "\n\ndeploy:\n  stage: deploy\n  only:\n    - main\n",
              id: "t-deploy-open",
            },
            {
              type: "placeholder",
              id: "p-deploy-fields",
              instructionType: "yaml_block",
              config: {
                description: "the remaining fields of a deploy job for ${project.name} that depends on the test job",
                displayName: "Deploy job fields",
                indentSpaces: 2,
              },
            },
          ],
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
        description:
          "An HTML product card whose markup is authored literally in the template, with HTML type placeholders filling text, items and rows.",
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
          text: '<section class="product-card">\n  <h2><a href="${product.url}">${product.name}</a></h2>\n  <p class="product-card__summary">',
          id: "t-card-open",
        },
        {
          type: "placeholder",
          id: "p-summary",
          instructionType: "html_text",
          config: {
            description: "a short marketing summary of the ${product.name}",
            displayName: "Product summary",
            allowInlineMarkup: true,
          },
        },
        {
          type: "text",
          text: '</p>\n\n  <h3>Key features</h3>\n  <ul class="product-card__features">\n',
          id: "t-features-heading",
        },
        {
          type: "placeholder",
          id: "p-feature-items",
          instructionType: "html_list_items",
          config: {
            description: "four key features of the ${product.name} focused on benefits for the buyer",
            displayName: "Feature items",
            itemCount: 4,
          },
        },
        {
          type: "text",
          text: "\n  </ul>\n",
          id: "t-features-close",
        },
        {
          type: "conditional",
          id: "c-specifications",
          condition: "includeSpecifications == true",
          content: [
            {
              type: "text",
              text: '\n  <h3>Specifications</h3>\n  <table class="product-card__specs">\n    <thead>\n      <tr><th>Specification</th><th>Value</th></tr>\n    </thead>\n    <tbody>\n',
              id: "t-specs-open",
            },
            {
              type: "placeholder",
              id: "p-spec-rows",
              instructionType: "html_table_rows",
              config: {
                description: "rows for the dimensions, weight, battery life and materials of the ${product.name}",
                displayName: "Specification rows",
                rows: 4,
                columns: 2,
              },
            },
            {
              type: "text",
              text: "\n    </tbody>\n  </table>\n",
              id: "t-specs-close",
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
              text: '\n  <h3>Ask about this product</h3>\n  <div class="product-card__enquiry">\n',
              id: "t-enquiry-open",
            },
            {
              type: "placeholder",
              id: "p-enquiry-fields",
              instructionType: "html_form_fields",
              config: {
                description: "name, email and message fields for an enquiry about the ${product.name}",
                displayName: "Enquiry fields",
                fieldCount: 3,
                includeLabels: true,
              },
            },
            {
              type: "text",
              text: "\n  </div>\n",
              id: "t-enquiry-close",
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
