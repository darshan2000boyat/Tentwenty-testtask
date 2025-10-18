import fs from "fs";
import path from "path";

export function calculateStatus(totalHours: number) {
  if (totalHours === 0) return "MISSING";
  if (totalHours < 40) return "INCOMPLETE";
  return "COMPLETED";
}

const filePath = path.join(process.cwd(), "utils/timesheets.json");

export function readTimesheets() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function writeTimesheets(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
