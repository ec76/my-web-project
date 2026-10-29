import type { ComponentPropsWithRef, ElementType } from "react";

export type SiteLinkRendererProps = ComponentPropsWithRef<"a"> & {
  href: string;
};
export type SiteLinkRenderer = ElementType<SiteLinkRendererProps>;

export interface SiteNavigationLink {
  label: string;
  href: string;
  active?: boolean;
}
