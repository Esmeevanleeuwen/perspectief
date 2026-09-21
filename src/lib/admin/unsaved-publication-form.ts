/** Legacy forms are uncontrolled; changing presentation must not publish unsaved text. */
export function hasUnsavedPublicationForm(root: ParentNode): boolean {
  const fields = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    ".admin-editor-grid input, .admin-editor-grid textarea, .admin-editor-grid select",
  );
  return Array.from(fields).some(field => {
    if (field.tagName === "SELECT") {
      const select = field as HTMLSelectElement;
      const defaults = Array.from(select.options).filter(option => option.defaultSelected).map(option => option.value);
      const original = defaults.length ? defaults : select.options.length ? [select.options[0].value] : [];
      return JSON.stringify(Array.from(select.selectedOptions).map(option => option.value)) !== JSON.stringify(original);
    }
    if (field.tagName === "INPUT") {
      const input = field as HTMLInputElement;
      if (["hidden", "file", "submit", "button"].includes(input.type)) return false;
      if (["checkbox", "radio"].includes(input.type)) return input.checked !== input.defaultChecked;
    }
    return field.value !== (field as HTMLInputElement | HTMLTextAreaElement).defaultValue;
  });
}
