document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const charSelectView = document.getElementById('char-select-view');
    const charCreateView = document.getElementById('char-create-view');

    const inputAccountId = document.getElementById('login-account-id');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const charSlotContainer = document.getElementById('char-slot-container');

    // 백업/복구 UI
    const btnBackup = document.getElementById('btn-backup');
    const btnRestoreTrigger = document.getElementById('btn-restore-trigger');
    const inputRestoreFile = document.getElementById('input-restore-file');

    // 캐릭터 생성 폼 관련
    const inputCharName = document.getElementById('create-char-name');
    const btnGenderMale = document.getElementById('btn-gender-male');
    const btnGenderFemale = document.getElementById('btn-gender-female');
    const btnAppearancePrev = document.getElementById('btn-appearance-prev');
    const btnAppearanceNext = document.getElementById('btn-appearance-next');
    const appearanceDisplay = document.getElementById('appearance-display');
    const appearancePreview = document.getElementById('appearance-preview');
    const btnCreateSubmit = document.getElementById('btn-create-submit');
    const btnCreateCancel = document.getElementById('btn-create-cancel');

    // 세션에서 마지막 계정 복원
    const lastAccount = sessionStorage.getItem('lastAccount');
    let currentAccountId = lastAccount || null;
    let creatingSlotIndex = null;
    let selectedGender = "남성";
    let selectedAppearance = 1;

    if (lastAccount) {
        loginView.style.display = 'none';
        charSelectView.style.display = 'block';
        renderCharacterSlots();
    }

    // 로그인 로직
    btnLogin.addEventListener('click', () => {
        const accId = inputAccountId.value.trim();
        if (!accId) {
            alert('계정 아이디를 입력하세요.');
            return;
        }
        if (!DB.getAccount(accId)) {
            DB.createAccount(accId);
            alert('새로운 계정이 생성되었습니다!');
        }
        currentAccountId = accId;
        sessionStorage.setItem('lastAccount', accId);
        renderCharacterSlots();
        loginView.style.display = 'none';
        charSelectView.style.display = 'block';
    });

    // 로그아웃 로직
    btnLogout.addEventListener('click', () => {
        currentAccountId = null;
        charSelectView.style.display = 'none';
        loginView.style.display = 'block';
        inputAccountId.value = '';
        sessionStorage.removeItem('lastAccount');
        sessionStorage.removeItem('lastSlot');
    });

    // 캐릭터 슬롯 렌더링
    function renderCharacterSlots() {
        if (!charSlotContainer) return;
        charSlotContainer.innerHTML = '';
        const account = DB.getAccount(currentAccountId);
        if (!account) return;

        account.characters.forEach((char, index) => {
            if (char) {
                // 채워진 슬롯
                const slot = document.createElement('div');
                slot.className = 'char-slot';
                slot.style.display = 'flex';
                slot.style.alignItems = 'center';
                slot.style.gap = '16px';
                const imgUrl = getAppearanceImageURL(char.gender, char.appearance);
                slot.innerHTML = `
                    <img src="${imgUrl}" alt="portrait" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${char.gender === '남성' ? '#3b82f6' : '#ec4899'}; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #f8fafc; font-size: 18px; margin-bottom: 4px;">${char.name} (Lv.${char.level})</div>
                        <div style="color: #94a3b8; font-size: 13px;">직업: ${char.job} | 성별: ${char.gender} | 외형: 타입 ${char.appearance}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" style="padding: 6px 12px; font-size: 13px; border-color: #3b82f6; color: #93c5fd;" onclick="window.startGameFromSlot(${index})">시작</button>
                        <button class="action-btn danger" style="padding: 6px 12px; font-size: 13px;" onclick="window.deleteCharFromSlot(${index})">삭제</button>
                    </div>
                `;
                charSlotContainer.appendChild(slot);
            } else {
                // 빈 슬롯
                const slot = document.createElement('div');
                slot.className = 'char-slot-empty';
                slot.innerHTML = `<span style="color: #64748b; font-size: 14px;">+ 빈 슬롯 (클릭하여 생성)</span>`;
                slot.addEventListener('click', () => openCreateMenu(index));
                charSlotContainer.appendChild(slot);
            }
        });
    }

    // 전역 노출
    window.startGameFromSlot = function(index) {
        sessionStorage.setItem('lastSlot', index);
        window.location.href = 'game.html';
    };

    window.deleteCharFromSlot = function(index) {
        if (confirm('정말로 이 캐릭터를 삭제하시겠습니까?')) {
            DB.deleteCharacter(currentAccountId, index);
            renderCharacterSlots();
        }
    };

    // 캐릭터 생성 UI 관련 로직
    function openCreateMenu(slotIndex) {
        creatingSlotIndex = slotIndex;
        inputCharName.value = '';
        selectedGender = '남성';
        selectedAppearance = 1;
        updateCreateUI();
        
        charSelectView.style.display = 'none';
        charCreateView.style.display = 'block';
    }

    function updateCreateUI() {
        btnGenderMale.classList.toggle('active', selectedGender === '남성');
        btnGenderFemale.classList.toggle('active', selectedGender === '여성');
        btnGenderMale.style.borderColor = selectedGender === '남성' ? '#3b82f6' : '#475569';
        btnGenderMale.style.color = selectedGender === '남성' ? '#93c5fd' : '#94a3b8';
        btnGenderFemale.style.borderColor = selectedGender === '여성' ? '#ec4899' : '#475569';
        btnGenderFemale.style.color = selectedGender === '여성' ? '#fbcfe8' : '#94a3b8';
        appearanceDisplay.textContent = `타입 ${selectedAppearance}`;
        
        if (appearancePreview) {
            appearancePreview.src = getAppearanceImageURL(selectedGender, selectedAppearance);
            appearancePreview.style.borderColor = selectedGender === '남성' ? '#3b82f6' : '#ec4899';
        }
    }

    btnGenderMale.addEventListener('click', () => { selectedGender = '남성'; updateCreateUI(); });
    btnGenderFemale.addEventListener('click', () => { selectedGender = '여성'; updateCreateUI(); });

    btnAppearancePrev.addEventListener('click', () => {
        selectedAppearance = selectedAppearance > 1 ? selectedAppearance - 1 : 3;
        updateCreateUI();
    });
    btnAppearanceNext.addEventListener('click', () => {
        selectedAppearance = selectedAppearance < 3 ? selectedAppearance + 1 : 1;
        updateCreateUI();
    });

    btnCreateCancel.addEventListener('click', () => {
        charCreateView.style.display = 'none';
        charSelectView.style.display = 'block';
    });

    btnCreateSubmit.addEventListener('click', () => {
        const name = inputCharName.value.trim();
        if (!name) {
            alert('캐릭터 이름을 입력하세요!');
            return;
        }
        if (DB.checkNameDuplicate(name)) {
            alert('이미 존재하는 캐릭터 이름입니다. 다른 이름을 선택하세요.');
            return;
        }

        const newChar = createNewCharacter(name, selectedGender, selectedAppearance);
        DB.saveCharacter(currentAccountId, creatingSlotIndex, newChar);
        alert('캐릭터가 생성되었습니다!');
        
        charCreateView.style.display = 'none';
        charSelectView.style.display = 'block';
        renderCharacterSlots();
    });

    // 백업/복구 이벤트 리스너
    if (btnBackup) {
        btnBackup.addEventListener('click', () => {
            const dataStr = DB.exportData();
            if (!dataStr) {
                alert("백업할 데이터가 없습니다.");
                return;
            }
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dragons_knight_backup_${new Date().getTime()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (btnRestoreTrigger && inputRestoreFile) {
        btnRestoreTrigger.addEventListener('click', () => {
            if (confirm("경고: 기존 데이터가 모두 덮어씌워집니다. 진행하시겠습니까?")) {
                inputRestoreFile.click();
            }
        });

        inputRestoreFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const success = DB.importData(event.target.result);
                if (success) {
                    alert("데이터 복구가 완료되었습니다!");
                    // 복구 후 UI 초기화
                    inputAccountId.value = '';
                    loginView.style.display = 'block';
                    charSelectView.style.display = 'none';
                    sessionStorage.removeItem('lastAccount');
                    sessionStorage.removeItem('lastSlot');
                } else {
                    alert("올바르지 않은 세이브 파일입니다.");
                }
                // input 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
                inputRestoreFile.value = '';
            };
            reader.readAsText(file);
        });
    }
});
