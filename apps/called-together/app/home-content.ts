import type { HeroSectionProps } from "@repo/ui";

export const heroContent = {
  eyebrow: "Women in spiritual leadership",
  heading: ["Understanding.", "Encouragement."],
  accent: "A shared calling.",
  introduction:
    "Biblical foundations, practical guidance, and stories that help communities support women serving as elders and pastors.",
  primaryAction: { label: "Explore the resource hub", href: "#resource-hub" },
  // No purpose section exists yet; omit the action until its destination exists.
  panel: {
    label: "A place to begin",
    heading: ["Bring your questions.", "Find a way forward."],
    links: [
      { label: "What does Scripture say?", href: "#explore-scripture" },
      {
        label: "How can our church offer support?",
        href: "#practical-guidance",
      },
      { label: "What can we learn from one another?", href: "#their-stories" },
    ],
  },
} satisfies HeroSectionProps;
