import { streams } from "@trigger.dev/sdk/v3";

export const researchStream = streams.define<string>({ id: "research" });
