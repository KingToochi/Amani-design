
import { compareAddresses } from "../services/addressService.js";

const tests = [
  {
    document: "10C, Nibo St.",
    user: "10C Nibo Street"
  },
  {
    document: "Enugu, 10C Nibo St",
    user: "10C Nibo Street, Enugu"
  },
  {
    document: "15 Nibo Street",
    user: "10C Nibo Street"
  }
];

tests.forEach((test, index) => {
  console.log(`TEST ${index + 1}`);

  console.log(
    compareAddresses(test.document, test.user)
  );
});
