import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The pre-qualification is a six-step form with a rail that re-renders on every answer,
   * which is exactly the shape the compiler is for. Automatic memoisation there beats
   * hand-placed useMemo we would otherwise have to remember to keep correct.
   */
  reactCompiler: true,
};

export default withPayload(nextConfig);
