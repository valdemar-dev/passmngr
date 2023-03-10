const { createHash } = require("crypto");

export default function hash(input) {
  return createHash('sha256').update(input).digest("hex");
}
