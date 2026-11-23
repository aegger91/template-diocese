import { getLanguage, tokens } from "./content";

/** CSS custom properties for <html>, built from content/tokens.json and the language's display font. */
export function tokenStyle(lang: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens.color)) vars[`--token-${name}`] = value;
  const display = getLanguage(lang).displayFont;
  vars["--token-font-heading"] = tokens.font.heading;
  vars["--token-font-body"] = tokens.font.body;
  vars["--token-font-display"] = tokens.font.display[display] ?? tokens.font.display.none;
  vars["--token-radius"] = tokens.radius;
  vars["--token-container"] = tokens.container;
  return vars;
}
