import { Link, type LinkProps } from "@mui/material";
import type { SiteLinkRenderer } from "./site-link";

// Render custom link components as children instead of passing a function through
// MUI's client boundary. The renderer itself can remain a Server Component.
export function SiteAnchor({
  LinkComponent = "a",
  href,
  children,
  sx,
  ...props
}: Omit<LinkProps, "component" | "href"> & {
  href: string;
  LinkComponent?: SiteLinkRenderer;
}) {
  if (LinkComponent === "a")
    return (
      <Link href={href} sx={sx} {...props}>
        {children}
      </Link>
    );
  const { "aria-current": current, ...presentation } = props;
  return (
    <Link
      component="span"
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        {
          "& > a": {
            color: "inherit",
            font: "inherit",
            textDecoration: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: "inherit",
            minWidth: "inherit",
            minHeight: "inherit",
            maxWidth: "100%",
            width: "100%",
            overflowWrap: "anywhere",
          },
        },
      ]}
      {...presentation}
    >
      <LinkComponent href={href} aria-current={current}>
        {children}
      </LinkComponent>
    </Link>
  );
}
