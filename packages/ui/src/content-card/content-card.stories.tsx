import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentCard } from "./content-card";

const meta = {
  title: "Components/ContentCard",
  component: ContentCard,
  tags: ["autodocs"],
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "THE PROJECT",
    title: "A thoughtful starting point",
    description:
      "A shared card component with a clear label, a heading, and a short description.",
  },
};

export const WithoutEyebrow: Story = {
  args: {
    title: "A thoughtful starting point",
    description: "A card with a heading and description, without a label.",
  },
};

export const LongContent: Story = {
  args: {
    eyebrow: "IN DEPTH",
    title:
      "A longer headline that demonstrates how this card handles more content",
    description:
      "This example uses a longer description to show how the card lays out multiple lines of body copy. It can accommodate details about a project, a recent update, or an idea worth exploring. The content remains readable and comfortably spaced while the shared component keeps its styling consistent across the site.",
  },
};
