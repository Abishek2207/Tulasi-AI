import json
import re

log_file = r"C:/Users/Admin/.gemini/antigravity/brain/d717db2f-ed86-4064-af88-18dc50fc5c59/.system_generated/logs/transcript_full.jsonl"

found_contents = []
with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        if "export const stripeApi" in line or "export const careerCoachApi" in line:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                if "export const stripeApi" in content:
                    found_contents.append(content)
                    
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    args = tc.get("args", {})
                    for k, v in args.items():
                        if isinstance(v, str) and "export const stripeApi" in v:
                            found_contents.append(v)
            except:
                pass

with open("recovered_apis.txt", "w", encoding="utf-8") as f:
    for c in found_contents:
        f.write("==============================\n")
        f.write(c)
        f.write("\n==============================\n")

print(f"Found {len(found_contents)} matches.")
