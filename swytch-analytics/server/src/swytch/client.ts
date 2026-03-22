import { exec } from "swytchcode-runtime";
import path from "path";

const swytchExec = (toolId: string, input: Record<string, unknown>) =>
    exec(toolId, input, {
        cwd: path.resolve(__dirname, "../../.."),
        env: Object.fromEntries(
            Object.entries(process.env).filter(([, v]) => v !== undefined)
        ) as Record<string, string>,
    });

export default swytchExec;