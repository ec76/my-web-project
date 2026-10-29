import { Container } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeroSection } from "./hero-section";

const meta = {
  title: "Components/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
  args: {
    eyebrow: "Community resources",
    heading: ["Learn together.", "Share experiences."],
    accent: "Find your next step.",
    introduction:
      "Guides and ideas to help your community move forward together.",
    primaryAction: { label: "Browse resources", href: "#resources" },
    secondaryAction: { label: "Our mission", href: "#mission" },
    panel: {
      label: "Start here",
      heading: ["Ask a question.", "Discover something new."],
      links: [
        { label: "Read the guide", href: "#guide" },
        { label: "Find support", href: "#support" },
      ],
    },
  },
} satisfies Meta<typeof HeroSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
