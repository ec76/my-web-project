import type { Preview } from "@storybook/react-vite";
import { ThemeProvider } from "@repo/ui/theme-provider";

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
