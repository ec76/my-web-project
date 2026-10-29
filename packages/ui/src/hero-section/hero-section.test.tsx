import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test/render-with-providers";
import { HeroSection, type HeroSectionProps } from "./hero-section";

const content: HeroSectionProps = {
  eyebrow: "Start here",
  heading: ["Learn.", "Connect."],
  accent: "Grow together.",
  introduction: "Resources for your community.",
  primaryAction: { label: "Explore resources", href: "#resources" },
  panel: {
    label: "First steps",
    heading: ["Ask a question."],
    links: [
      { label: "Read the guide", href: "#guide" },
      { label: "Share experiences", href: "#experiences" },
    ],
  },
};

describe("HeroSection", () => {
  it("renders supplied content with one H1 and decorative arrows excluded from link names", () => {
    renderWithProviders(<HeroSection {...content} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Learn.Connect.Grow together.",
    );
    expect(screen.getByText(content.eyebrow)).toBeVisible();
    expect(screen.getByText(content.introduction)).toBeVisible();
    expect(screen.getByText(content.panel.label)).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Ask a question." }),
    ).toBeVisible();
    for (const action of [content.primaryAction, ...content.panel.links]) {
      expect(screen.getByRole("link", { name: action.label })).toHaveAttribute(
        "href",
        action.href,
      );
    }
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("renders an optional secondary action with its supplied destination", () => {
    renderWithProviders(
      <HeroSection
        {...content}
        secondaryAction={{ label: "Our mission", href: "#mission" }}
      />,
    );
    expect(screen.getByRole("link", { name: "Our mission" })).toHaveAttribute(
      "href",
      "#mission",
    );
  });
});
