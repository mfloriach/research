import { ipfsGatewayUrl } from "./ipfs-gateway";
import { config } from "./config";

describe("ipfsGatewayUrl", () => {
  it("builds a gateway link from public config", () => {
    expect(ipfsGatewayUrl("bafy123")).toBe(
      `${config.ipfsGatewayUrl}/ipfs/bafy123`,
    );
  });
});
