import re

with open("js/game/ui.js", "r", encoding="utf-8") as f:
    content = f.read()

handle_func = """    const handleJobChange = (jobName) => {
        if (!checkJobChangeCondition()) return;
        const jobData = JOB_DB[jobName];
        window.gameConfirm(`${jobName} - ${jobData.desc}<br><br>정말 전직하시겠습니까?`).then(res => {
            if (res) {
                playerState.skills = {};
                playerState.equippedSkills = [];
                updatePlayerState({ job: jobName, jobLevel: 1, jobExp: 0, skills: playerState.skills, equippedSkills: playerState.equippedSkills });
                
                guildMenu.style.display = 'none';
                
                if (typeof switchTab === 'function') {
                    switchTab('info');
                }
                setTimeout(() => {
                    window.gameAlert(`${jobName}(으)로 전직했습니다!`, 'success', true);
                }, 100);
            }
        });
    };

    if (btnWarrior) {"""

content = content.replace("    if (btnWarrior) {", handle_func)

# We need to replace the event listeners safely. The regex might fail if it spans multiple lines without DOTALL.
# So I'll do it by finding the block.
# Actually, since the block might be slightly different than what I think, I will use DOTALL.
content = re.sub(
    r"if \(btnWarrior\)\s*\{\s*btnWarrior\.addEventListener\('click',\s*\(\)\s*=>\s*\{.*?\guildMenu\.style\.display = 'none';\s*window\.gameAlert\([^)]+\);\s*\}\);\s*\}",
    "if (btnWarrior) { btnWarrior.addEventListener('click', () => handleJobChange('검사')); }",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"if \(btnMage\)\s*\{\s*btnMage\.addEventListener\('click',\s*\(\)\s*=>\s*\{.*?\guildMenu\.style\.display = 'none';\s*window\.gameAlert\([^)]+\);\s*\}\);\s*\}",
    "if (btnMage) { btnMage.addEventListener('click', () => handleJobChange('마법사')); }",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"if \(btnArcher\)\s*\{\s*btnArcher\.addEventListener\('click',\s*\(\)\s*=>\s*\{.*?\guildMenu\.style\.display = 'none';\s*window\.gameAlert\([^)]+\);\s*\}\);\s*\}",
    "if (btnArcher) { btnArcher.addEventListener('click', () => handleJobChange('궁수')); }",
    content,
    flags=re.DOTALL
)

with open("js/game/ui.js", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
