function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlightYaml(src) {
  return src
    .split("\n")
    .map((line) => {
      const escaped = escapeHtml(line);
      const commentMatch = escaped.match(/^(\s*#.*)$/);
      if (commentMatch) return `<span class="tok-comment">${escaped}</span>`;

      const kv = escaped.match(/^(\s*(?:- )?)([\w.\/-]+)(:)(\s*)(.*)$/);
      if (kv) {
        const [, indent, key, colon, sp, value] = kv;
        const valueHtml = value
          ? /^["'].*["']$/.test(value)
            ? `<span class="tok-string">${value}</span>`
            : `<span class="tok-value">${value}</span>`
          : "";
        return `${indent}<span class="tok-key">${key}</span><span class="tok-punct">${colon}</span>${sp}${valueHtml}`;
      }

      const listItem = escaped.match(/^(\s*-\s+)(.*)$/);
      if (listItem) {
        const [, indent, rest] = listItem;
        return `${indent}<span class="tok-punct">-</span> <span class="tok-value">${rest}</span>`;
      }

      return escaped;
    })
    .join("\n");
}

export function highlightGroovy(src) {
  return src
    .split("\n")
    .map((line) => {
      const escaped = escapeHtml(line);
      const commentMatch = escaped.match(/^(\s*\/\/.*)$/);
      if (commentMatch) return `<span class="tok-comment">${escaped}</span>`;

      let out = escaped.replace(
        /\b(pipeline|agent|any|stages|stage|steps|sh)\b/g,
        '<span class="tok-key">$1</span>'
      );
      out = out.replace(/('[^']*')/g, '<span class="tok-string">$1</span>');
      return out;
    })
    .join("\n");
}
