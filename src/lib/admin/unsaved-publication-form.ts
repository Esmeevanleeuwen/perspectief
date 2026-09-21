/** Check legacy text forms before publishing their saved revision. No DOM globals at import time. */
export function hasUnsavedPublicationForm(root: Document | Element): boolean {
  const fields = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    ".admin-editor-grid input, .admin-editor-grid textarea, .admin-editor-grid select",
  );
  return Array.from(fields).some(field => {
    if (field.disabled) return false;
    if (field.tagName === "SELECT") {
      const select = field as HTMLSelectElement;
      const options = Array.from(select.options);
      const defaults = options.filter(option => option.defaultSelected).map(option => option.value);
      if (!select.multiple && defaults.length === 0 && options.length) defaults.push(options[0].value);
      // Read current option flags directly, including immediately after a native form reset.
      return JSON.stringify(options.filter(option => option.selected).map(option => option.value)) !== JSON.stringify(defaults);
    }
    if (field.tagName === "INPUT") {
      const input = field as HTMLInputElement;
      if (["hidden", "file", "submit", "button", "reset"].includes(input.type)) return false;
      if (["checkbox", "radio"].includes(input.type)) return input.checked !== input.defaultChecked;
    }
    const input = field as HTMLInputElement | HTMLTextAreaElement;
    return input.value !== input.defaultValue;
  });
}
