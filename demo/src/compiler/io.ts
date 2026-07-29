import type { ItsTemplate } from "its-template-editor";
import { isItsTemplateShape } from "its-template-editor";

export function exportTemplate(template: ItsTemplate): void {
  const name = template.metadata?.name ?? "its-template";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug || "its-template"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function importTemplate(file: File): Promise<ItsTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!isItsTemplateShape(parsed)) {
          reject(new Error('Not a valid ITS template: a "version" string and "content" array are required.'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error("The selected file is not valid JSON."));
      }
    };
    reader.readAsText(file);
  });
}

export function exportPrompt(prompt: string): void {
  const blob = new Blob([prompt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "compiled-prompt.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}
