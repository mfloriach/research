import { truncateAddress, truncateText } from "./utils";

describe("truncateAddress", () => {
  it("keeps short values whole", () => {
    expect(truncateAddress("0xabc")).toBe("0xabc");
  });

  it("middle-truncates a wallet, keeping prefix and suffix", () => {
    expect(
      truncateAddress("0x0000000000000000000000000000000000000007"),
    ).toBe("0x0000000000…00000007");
  });
});

describe("truncateText", () => {
  it("keeps short values whole", () => {
    expect(truncateText("short")).toBe("short");
  });
});
