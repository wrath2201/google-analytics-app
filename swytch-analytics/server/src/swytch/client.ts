import { exec } from "swytchcode-runtime";
import path from "path";

const swytchExec = (toolId: string, input: Record<string, unknown>) =>
    exec(toolId, input, {
        cwd: path.resolve(__dirname, "../../.."),
        env: {
            ...process.env,
            PATH: `/home/lakshay/.local/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH ?? ""}`,
        },
    });

export default swytchExec;