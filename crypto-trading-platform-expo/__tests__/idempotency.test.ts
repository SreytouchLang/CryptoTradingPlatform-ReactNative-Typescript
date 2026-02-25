import { newIdempotencyKey } from "../src/utils/idempotency";

test("idempotency key is unique-ish", () => {
  const a = newIdempotencyKey("order");
  const b = newIdempotencyKey("order");
  expect(a).not.toEqual(b);
});