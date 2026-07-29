import type { ItsTemplate } from "its-template-editor";
import { BASE_SCHEMA_URL, STANDARD_TYPES_URL } from "./instructionTypes";

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
];
