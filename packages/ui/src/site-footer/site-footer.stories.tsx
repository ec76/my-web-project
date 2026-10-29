import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "./site-footer";

const meta = {
  title: "Components/SiteFooter",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <>
        <Box
          component="main"
          sx={{ p: { xs: 2, sm: 4 }, overflowWrap: "anywhere", minWidth: 0 }}
        >
          <h1 id="overview">Overview</h1>
          <h2 id="updates">Updates</h2>
          <h2 id="contact">Contact</h2>
          <p id="accessibility">Example accessibility information.</p>
        </Box>
        <Story />
      </>
    ),
  ],
} satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    brand: "Northfield Studio",
    description: "A fictional space for creative projects and shared ideas.",
    linkGroups: [
      {
        heading: "Explore",
        links: [
          { label: "Overview", href: "#overview" },
          { label: "Updates", href: "#updates" },
        ],
      },
      {
        heading: "Information",
        links: [
          { label: "Contact", href: "#contact" },
          { label: "Accessibility", href: "#accessibility" },
        ],
      },
    ],
    copyright: "© Northfield Studio",
  },
};
export const Minimal: Story = { args: { copyright: "© Northfield Studio" } };
export const WithoutLinkGroups: Story = {
  args: {
    brand: "Northfield Studio",
    description: "A fictional studio.",
    copyright: "© Northfield Studio",
  },
};
export const LongerContent: Story = {
  args: {
    ...Basic.args,
    brand: (
      <strong>Northfield Studio for Creative Projects and Shared Ideas</strong>
    ),
    description:
      "An intentionally longer introduction demonstrating how application-supplied text wraps while leaving space for groups of useful links and additional information.",
    additionalContent: (
      <p>
        This example demonstrates a separate slot for application-provided
        content.
      </p>
    ),
    linkGroups: [
      {
        heading: "Explore projects and studio updates",
        links: [
          {
            label:
              "A longer introduction to the studio and its creative projects",
            href: "#overview",
          },
          { label: "News and recent work from the studio", href: "#updates" },
        ],
      },
      {
        heading: "Get in touch",
        links: [{ label: "Contact the studio", href: "#contact" }],
      },
    ],
  },
};

export const SpanishContent: Story = {
  args: {
    brand: "Estudio de ejemplo para proyectos creativos e ideas compartidas",
    description:
      "Contenido ficticio para comprobar que las descripciones y las etiquetas más extensas siguen siendo legibles y accesibles en pantallas pequeñas.",
    linkGroups: [
      {
        heading: "Explorar proyectos e información general",
        links: [
          {
            label: "Información general sobre nuestros proyectos creativos",
            href: "#overview",
          },
          { label: "Novedades y experiencias compartidas", href: "#updates" },
        ],
      },
      {
        heading: "Información útil y formas de participar",
        links: [
          {
            label: "Información de contacto para nuevas consultas",
            href: "#contact",
          },
          {
            label: "Accesibilidad y opciones para utilizar este sitio",
            href: "#accessibility",
          },
        ],
      },
    ],
    copyright: "© Estudio de ejemplo",
  },
};
const responsive = (
  width: number,
  height: number,
  type: "mobile" | "tablet" | "desktop",
) => ({
  parameters: {
    viewport: {
      options: {
        example: {
          name: `${width}px`,
          styles: { width: `${width}px`, height: `${height}px` },
          type,
        },
      },
    },
  },
  globals: { viewport: { value: "example", isRotated: false } },
});
export const Mobile320: Story = {
  args: SpanishContent.args,
  ...responsive(320, 900, "mobile"),
};
export const Tablet: Story = {
  args: SpanishContent.args,
  ...responsive(768, 1024, "tablet"),
};
export const Desktop: Story = {
  args: SpanishContent.args,
  ...responsive(1280, 900, "desktop"),
};
