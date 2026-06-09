import os
import re

file_path = r'frontend/src/app/onboarding/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove step 0 block
step_0_regex = r'\{step === 0 && \(\s*<motion\.div key="step-0".*?</motion\.div>\s*\)\}'
content = re.sub(step_0_regex, '', content, flags=re.DOTALL)

# Remove PROFESSIONAL FLOW block
prof_flow_regex = r'\{\/\* PROFESSIONAL FLOW \*\/\}.*?\{step === 1 && selectedType === "PROFESSIONAL" && \(\s*<motion\.div key="prof-step".*?</motion\.div>\s*\)\}'
content = re.sub(prof_flow_regex, '', content, flags=re.DOTALL)

# Modify step 1 condition
content = content.replace('{step === 1 && selectedType === "STUDENT" && (', '{step === 1 && (')

# Remove 'selectedType' state variable
content = re.sub(r'const \[selectedType, setSelectedType\] = useState.*?\n', '', content)

# Remove Professional Data state variables
prof_data_regex = r'// Professional Data\s*const \[currentRole.*?setTargetSalary\(""\);\n'
content = re.sub(prof_data_regex, '', content, flags=re.DOTALL)

# Fix handleFinish condition (remove if selectedType)
handle_finish_regex = r'if \(selectedType === "STUDENT"\) \{(.*?)\} else if \(selectedType === "PROFESSIONAL"\) \{.*?\}'
match = re.search(handle_finish_regex, content, flags=re.DOTALL)
if match:
    student_payload = match.group(1).strip()
    # Replace the whole if-else block with just the student payload execution
    content = re.sub(handle_finish_regex, student_payload, content, flags=re.DOTALL)

# Remove back button on step 1 (setStep(0))
content = re.sub(r'<button onClick=\{.*?setStep\(0\).*?</button>', '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
