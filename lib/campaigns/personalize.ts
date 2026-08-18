export function mergeTemplate(template: string, vars: { name: string; company: string }): string {
  return template
    .replaceAll("{{name}}", vars.name)
    .replaceAll("{{company}}", vars.company);
}
