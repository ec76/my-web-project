import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "@mui/material";
import { HeroSection } from "@repo/ui";
import { ThemeProvider } from "./theme-provider";
import { heroContent } from "./home-content";

const meta = {
  title: "Called Together/Hero",
  component: HeroSection,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Container maxWidth="lg">
          <Story />
        </Container>
      </ThemeProvider>
    ),
  ],
  args: heroContent,
} satisfies Meta<typeof HeroSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Desktop: Story = {
  parameters: {
    viewport: {
      options: {
        desktop: {
          name: "1440px",
          styles: { width: "1440px", height: "1000px" },
          type: "desktop",
        },
      },
    },
  },
  globals: { viewport: { value: "desktop", isRotated: false } },
};
export const Mobile: Story = {
  parameters: {
    viewport: {
      options: {
        mobile: {
          name: "320px",
          styles: { width: "320px", height: "1000px" },
          type: "mobile",
        },
      },
    },
  },
  globals: { viewport: { value: "mobile", isRotated: false } },
};
export const LongContent: Story = {
  args: {
    ...heroContent,
    eyebrow: "Mujeres que sirven a sus comunidades en el liderazgo espiritual",
    heading: [
      "Comprensión y fundamentos bíblicos.",
      "Ánimo para nuestras comunidades.",
    ],
    accent: "Un llamado que compartimos con otras personas.",
    introduction:
      "Fundamentos bíblicos, orientación práctica y experiencias compartidas que ayudan a las comunidades a acompañar y apoyar a las mujeres que sirven como ancianas y pastoras en sus iglesias.",
    primaryAction: {
      ...heroContent.primaryAction,
      label: "Explorar todos los recursos para nuestras comunidades",
    },
    panel: {
      label: "Un lugar para comenzar a conversar",
      heading: [
        "Comparte tus preguntas con confianza.",
        "Encuentra un camino para seguir adelante en comunidad.",
      ],
      links: heroContent.panel.links.map((link) => ({
        ...link,
        label: `${link.label} Explore perspectives and practical next steps together.`,
      })),
    },
  },
};
