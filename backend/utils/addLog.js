export function addLog(doc, action, by, note = "") {
  doc.logs.push({ action, by, note });
  return doc;
}
