import { forwardRef } from "react";
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test/render-with-providers";
import type { SiteLinkRendererProps } from "../site-link";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders supplied branding, description, labeled link groups, copyright, and additional content", () => {
    renderWithProviders(
      <SiteFooter
        brand="Sample Studio"
        description="Example description"
        linkGroups={[
          {
            heading: "Explore",
            links: [{ label: "Overview", href: "#overview" }],
          },
        ]}
        copyright="Copyright supplied by the app"
        additionalContent={<p>Extra information</p>}
      />,
    );
    const footer = within(screen.getByRole("contentinfo"));
    expect(footer.getByText("Sample Studio")).toBeVisible();
    expect(footer.getByText("Example description")).toBeVisible();
    const nav = within(footer.getByRole("navigation", { name: "Explore" }));
    expect(nav.getByRole("heading", { name: "Explore" })).toBeVisible();
    expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "#overview",
    );
    expect(footer.getByText("Copyright supplied by the app")).toBeVisible();
    expect(footer.getByText("Extra information")).toBeVisible();
  });
  it("omits optional content and empty navigation groups", () => {
    const { rerender } = renderWithProviders(
      <SiteFooter
        brand="Sample Studio"
        description="Optional description"
        additionalContent={<button>Optional action</button>}
        copyright="Optional copyright"
      />,
    );
    rerender(
      <SiteFooter linkGroups={[{ heading: "Empty group", links: [] }]} />,
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/^$/);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Empty group")).not.toBeInTheDocument();
    expect(screen.queryByText("Optional copyright")).not.toBeInTheDocument();
  });
  it("accepts custom brand content and adapted links as single accessible anchors", () => {
    const Adapter = forwardRef<HTMLAnchorElement, SiteLinkRendererProps>(
      function Adapter(props, ref) {
        return <a {...props} ref={ref} />;
      },
    );
    const { container } = renderWithProviders(
      <SiteFooter
        brand={<a href="/">Sample Studio</a>}
        LinkComponent={Adapter}
        linkGroups={[
          {
            heading: "Explore",
            links: [{ label: "Overview", href: "#overview", active: true }],
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Sample Studio" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(container.querySelector("a a")).toBeNull();
  });
});
