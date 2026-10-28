import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test/render-with-providers";
import { ContentCard } from "./content-card";

describe("ContentCard", () => {
  it("renders the supplied heading, label, and description in an article", () => {
    renderWithProviders(
      <ContentCard
        eyebrow="THE PROJECT"
        title="A thoughtful starting point"
        description="A shared component for project updates."
      />,
    );

    const card = within(screen.getByRole("article"));
    expect(
      card.getByRole("heading", {
        level: 2,
        name: "A thoughtful starting point",
      }),
    ).toBeVisible();
    expect(card.getByText("THE PROJECT")).toBeVisible();
    expect(
      card.getByText("A shared component for project updates."),
    ).toBeVisible();
  });

  it("reflects updated content when its props change", () => {
    const { rerender } = renderWithProviders(
      <ContentCard
        eyebrow="DRAFT"
        title="First draft"
        description="In progress"
      />,
    );

    rerender(
      <ContentCard
        eyebrow="PUBLISHED"
        title="Ready to read"
        description="The finished project"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Ready to read" }),
    ).toBeVisible();
    expect(screen.getByText("PUBLISHED")).toBeVisible();
    expect(screen.getByText("The finished project")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "First draft" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("DRAFT")).not.toBeInTheDocument();
    expect(screen.queryByText("In progress")).not.toBeInTheDocument();
  });
});
