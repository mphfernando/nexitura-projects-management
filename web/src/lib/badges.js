export const stTone = s => s === "Completed" ? "done" : (s === "In Progress" ? "prog" : "not");
export const prTone = p => p === "High" ? "high" : (p === "Medium" ? "med" : "low");
export const catTone = c => c === "Bug" ? "bug" : (c === "UI Issue" ? "ui" : "func");
export const catShort = c => c === "Function Task" ? "Function" : c === "UI Issue" ? "UI" : "Bug";
export const NEXT_STATUS = { "Not Started": "In Progress", "In Progress": "Completed", "Completed": "Not Started" };
