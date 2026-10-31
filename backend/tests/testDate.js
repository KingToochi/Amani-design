
import { checkDocumentDate } from "../services/dateService.js";

const testDates = [
  "2026-08-20",
  "2026-07-31",
  "2026-07-15",
  "2026-11-05",
  "invalid-date"
];

testDates.forEach((date) => {
  console.log(`Testing: ${date}`);

  console.log(checkDocumentDate(date));

  console.log("--------------------");
});
