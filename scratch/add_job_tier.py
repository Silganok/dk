import re

with open("js/data/jobs.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('"초보자": {\n        reqLevel: 1,', '"초보자": {\n        tier: 0,\n        reqLevel: 1,')

jobs_t1 = ['"검사"', '"마법사"', '"궁수"', '"도둑"', '"성직자"', '"상인"']
for job in jobs_t1:
    content = content.replace(f'{job}: {{\n        reqLevel: 10,', f'{job}: {{\n        tier: 1,\n        reqLevel: 10,')

with open("js/data/jobs.js", "w", encoding="utf-8") as f:
    f.write(content)
print("jobs.js updated")
