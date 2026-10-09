/**
 * Details shown on the Developer page. Everything here is optional: leave a field empty and
 * the page simply leaves that part out. Add your own name and links before publishing.
 */
export const DEVELOPER: {
  /** Your name, e.g. "Nimal Perera". Empty = the page just says "an engineer". */
  name: string;
  /** Where people can send corrections or say hello, e.g. "mailto:you@example.com" or a profile URL. */
  contactUrl: string;
  contactLabel: string;
  /** Extra links shown as small pills, e.g. { label: "GitHub", href: "https://github.com/you" } */
  links: { label: string; href: string }[];
} = {
  name: "",
  contactUrl: "",
  contactLabel: "Send a correction",
  links: [{ label: "Source on GitHub", href: "https://github.com/WasathTheekshana/salalihini-sandeshaya" }],
};
