const QUEST_DB = {
    // --- 레벨 1 (초보자 평원) ---
    "daily_lv1_1": {
        name: "기초 연금술 재료", type: "delivery", target: "젤로피", requiredCount: 10, client: "cecilia", cycle: "daily", reqLevel: 1,
        desc: "세실리아: 콜록! 폭발성 강한 슬라임 진액이 필요해요! 부작용은... 터져봐야 알겠죠?",
        rewards: { gold: 100, exp: 50, items: [{ id: "세실리아의 수상한 영약", count: 1 }] }
    },
    "daily_lv1_2": {
        name: "초보 모험가의 기본", type: "hunt", target: "파브르", requiredCount: 15, client: "elian", cycle: "daily", reqLevel: 1,
        desc: "엘리안: 별빛의 인도가 함께하기를. 모험가님, 초심을 잃지 않는 것이 중요해요. 시작의 들판에서 파브르들을 정리해 주시겠어요?",
        rewards: { gold: 150, exp: 80 }
    },
    "daily_lv1_3": {
        name: "부드러운 털이 필요해", type: "delivery", target: "토끼풀", requiredCount: 5, client: "marian", cycle: "daily", reqLevel: 1,
        desc: "마리안: 어머, 어서 와요! 루나틱들이 물고 다니는 토끼풀이 요리 장식으로 딱이거든요. 좀 구해다 줄래요?",
        rewards: { gold: 200, exp: 100, items: [{ id: "초보자 체력 포션", count: 3 }] }
    },
    "daily_lv1_4": {
        name: "분홍색 말캉이 토벌", type: "hunt", target: "포링", requiredCount: 20, client: "kael", cycle: "daily", reqLevel: 1,
        desc: "카엘: 킁킁... 초보 사냥꾼이군. 포링 20마리를 잡아와 봐라. 기본 중의 기본이지.",
        rewards: { gold: 150, exp: 120 }
    },
    "weekly_lv1_1": {
        name: "평원의 빛을 거두어라", type: "hunt", target: "엔젤링", requiredCount: 1, client: "seria", cycle: "weekly", reqLevel: 1,
        desc: "세리아: 별의 궤적이 평원의 성스러운 기운을 향하고 있어요... 너무 밝은 빛은 눈을 멀게 하죠. 엔젤링을 잠재워주세요.",
        rewards: { gold: 1000, exp: 500, items: [{ id: "모험가의 증표", count: 1 }] }
    },

    // --- 레벨 10 (페이욘 숲) ---
    "daily_lv10_1": {
        name: "메뚜기 다리 구이?", type: "delivery", target: "메뚜기의 뒷다리", requiredCount: 10, client: "brok", cycle: "daily", reqLevel: 10,
        desc: "브록: 쳇, 풋내기 녀석. 로커 녀석들 다리가 구워 먹으면 꽤 고소하다더군. 10개만 가져와 봐라.",
        rewards: { gold: 300, exp: 200, items: [{ id: "브록의 특제 연마석", count: 1 }] }
    },
    "daily_lv10_2": {
        name: "시끄러운 원숭이들", type: "hunt", target: "쵸코", requiredCount: 20, client: "elian", cycle: "daily", reqLevel: 10,
        desc: "엘리안: 페이욘 숲의 쵸코들이 최근 길을 지나는 상단들을 위협하고 있어요. 그들을 조금 진정시켜 주시겠어요?",
        rewards: { gold: 400, exp: 250 }
    },
    "daily_lv10_3": {
        name: "날카로운 깃털 수집", type: "delivery", target: "새의 깃털", requiredCount: 10, client: "kael", cycle: "daily", reqLevel: 10,
        desc: "카엘: 픽키 녀석들의 깃털은 화살 깃으로 아주 제격이지. 사냥꾼의 기본은 재료 수급이다. 가서 10개만 뽑아와라.",
        rewards: { gold: 350, exp: 250 }
    },
    "daily_lv10_4": {
        name: "숲을 갉아먹는 자들", type: "hunt", target: "로커", requiredCount: 20, client: "gabriel", cycle: "daily", reqLevel: 10,
        desc: "가브리엘: 숲의 생명체들이 지나치게 번식하면 균형이 무너집니다... 하아, 퇴근하고 싶다. 아무튼 로커 좀 처리해 주세요.",
        rewards: { gold: 400, exp: 300, items: [{ id: "중급 체력 포션", count: 2 }] }
    },
    "weekly_lv10_1": {
        name: "거대한 점액질 덩어리", type: "hunt", target: "마스터링", requiredCount: 1, client: "elian", cycle: "weekly", reqLevel: 10,
        desc: "엘리안: 페이욘 숲 깊은 곳에 모든 포링들의 우두머리, 마스터링이 나타났어요. 모험가님의 힘이 필요합니다.",
        rewards: { gold: 2000, exp: 1000, items: [{ id: "모험가의 증표", count: 1 }] }
    },

    // --- 레벨 20 (깊은 늪지대) ---
    "daily_lv20_1": {
        name: "별을 닮은 포자", type: "delivery", target: "버섯 포자", requiredCount: 15, client: "seria", cycle: "daily", reqLevel: 20,
        desc: "세리아: 스포아의 포자에서 희미한 별빛의 흔적이 느껴져요... 제 수정구를 닦는 데 써야겠어요. 15개 부탁할게요.",
        rewards: { gold: 600, exp: 500 }
    },
    "daily_lv20_2": {
        name: "맹독 추출 실험", type: "delivery", target: "맹독 가루", requiredCount: 10, client: "cecilia", cycle: "daily", reqLevel: 20,
        desc: "세실리아: 콜록! 새로운 독... 아니 포션 아이디어가 떠올랐어요! 포이즌 스포아의 맹독 가루를 당장 가져와 주세요!",
        rewards: { gold: 800, exp: 600, items: [{ id: "세실리아의 수상한 영약", count: 2 }] }
    },
    "daily_lv20_3": {
        name: "개구리 알의 은밀한 거래", type: "delivery", target: "개구리 알", requiredCount: 10, client: "shylock", cycle: "daily", reqLevel: 20,
        desc: "샤일록: 키히히! 타라 프로그의 알이 요즘 귀족들 사이에서 미용 재료로 비싸게 팔린다구. 빨리 10개만 챙겨와!",
        rewards: { gold: 1200, exp: 500, items: [{ id: "샤일록의 금화 주머니", count: 1 }] }
    },
    "daily_lv20_4": {
        name: "단단한 껍질 조달", type: "delivery", target: "달팽이 껍질", requiredCount: 15, client: "marian", cycle: "daily", reqLevel: 20,
        desc: "마리안: 엠버나이트 껍질을 우려내면 육수가 아주 진국이랍니다~ 15개만 구해다 줄 수 있을까요?",
        rewards: { gold: 700, exp: 600, items: [{ id: "마리안의 특대 샌드위치", count: 1 }] }
    },
    "weekly_lv20_1": {
        name: "늪지대의 폭군", type: "hunt", target: "토드", requiredCount: 1, client: "kael", cycle: "weekly", reqLevel: 20,
        desc: "카엘: 늪지대 안쪽에 미련할 정도로 거대한 두꺼비 녀석이 자리 잡고 있더군. 진짜 사냥꾼이라면 그 녀석의 목줄을 끊고 와봐라.",
        rewards: { gold: 3000, exp: 1500, items: [{ id: "모험가의 증표", count: 2 }] }
    },

    // --- 레벨 30 (오크 마을) ---
    "daily_lv30_1": {
        name: "돈 냄새나는 털", type: "delivery", target: "고블린의 털", requiredCount: 20, client: "shylock", cycle: "daily", reqLevel: 30,
        desc: "샤일록: 동족이긴 하지만 털갈이하는 녀석들 털이 방한복 재료로 꽤 쏠쏠하다구. 키히히! 20개만 모아와봐!",
        rewards: { gold: 1500, exp: 1000 }
    },
    "daily_lv30_2": {
        name: "마을의 위협 요소 제거", type: "hunt", target: "오크 워리어", requiredCount: 30, client: "elian", cycle: "daily", reqLevel: 30,
        desc: "엘리안: 오크 워리어들이 무리를 지어 마을 경계로 다가오고 있습니다. 용맹한 모험가님의 힘으로 저지해주세요.",
        rewards: { gold: 1200, exp: 1200 }
    },
    "daily_lv30_3": {
        name: "오크의 투지 증명", type: "delivery", target: "오크의 증표", requiredCount: 15, client: "gabriel", cycle: "daily", reqLevel: 30,
        desc: "가브리엘: 미개한 짐승들도 증표를 지니고 다니다니 기가 막히군요. 다 빼앗아서 정화해버립시다. 15개 가져오세요.",
        rewards: { gold: 1400, exp: 1100, items: [{ id: "고급 체력 포션", count: 2 }] }
    },
    "daily_lv30_4": {
        name: "독특한 화장품 성분", type: "delivery", target: "오크의 화장품", requiredCount: 10, client: "cecilia", cycle: "daily", reqLevel: 30,
        desc: "세실리아: 오크 레이디들이 쓴다는 그 화장품! 도대체 무슨 성분인지 너무 궁금해서 미칠 것 같아요! 10개만요!",
        rewards: { gold: 1600, exp: 1200, items: [{ id: "세실리아의 수상한 영약", count: 2 }] }
    },
    "weekly_lv30_1": {
        name: "긍지 높은 전사", type: "hunt", target: "오크 히어로", requiredCount: 1, client: "brok", cycle: "weekly", reqLevel: 30,
        desc: "브록: 오크 마을 안쪽에 진정한 투기를 뿜어내는 녀석이 있다더군. 그 녀석의 무기를 부러뜨리고 와봐라, 풋내기!",
        rewards: { gold: 5000, exp: 3000, items: [{ id: "모험가의 증표", count: 2 }] }
    },

    // --- 레벨 40 (미로 숲) ---
    "daily_lv40_1": {
        name: "무리를 짓는 이빨", type: "hunt", target: "워그", requiredCount: 30, client: "kael", cycle: "daily", reqLevel: 40,
        desc: "카엘: 늑대들은 무리지어 사냥하지. 그들의 협동을 뚫고 30마리를 쓰러뜨려라. 네 직감이 진짜인지 보겠다.",
        rewards: { gold: 2500, exp: 2000 }
    },
    "daily_lv40_2": {
        name: "예리한 발톱 수집", type: "delivery", target: "늑대 발톱", requiredCount: 20, client: "brok", cycle: "daily", reqLevel: 40,
        desc: "브록: 워그 녀석들의 발톱은 검의 장식이나 촉촉한 연마재로 쓸만하지. 20개 가져와.",
        rewards: { gold: 2800, exp: 2200, items: [{ id: "브록의 특제 연마석", count: 2 }] }
    },
    "daily_lv40_3": {
        name: "거대한 낫의 궤적", type: "delivery", target: "사마귀의 낫", requiredCount: 15, client: "seria", cycle: "daily", reqLevel: 40,
        desc: "세리아: 별의 목소리가 맨티스의 낫에 깃든 잔혹한 운명을 속삭여요... 15개를 가져다주시면 제가 정화할게요.",
        rewards: { gold: 3000, exp: 2300 }
    },
    "daily_lv40_4": {
        name: "숲의 포식 식물", type: "hunt", target: "플로라", requiredCount: 35, client: "marian", cycle: "daily", reqLevel: 40,
        desc: "마리안: 어머, 요새 플로라 때문에 길 잃은 여행자들이 고생이 많다네요~ 깔끔하게 35마리만 치워주실래요?",
        rewards: { gold: 2700, exp: 2500, items: [{ id: "마리안의 특대 샌드위치", count: 2 }] }
    },
    "weekly_lv40_1": {
        name: "미로 숲의 지배자", type: "hunt", target: "드래곤 플라이", requiredCount: 1, client: "vander", cycle: "weekly", reqLevel: 40,
        desc: "반더: 크큭... 미로 숲 하늘을 가로지르는 녹색 괴물을 본 적 있나? 녀석이 뿜어내는 바람의 마력이 꽤 진귀할 것 같단 말이지.",
        rewards: { gold: 8000, exp: 5000, items: [{ id: "모험가의 증표", count: 3 }] }
    }
};

window.QUEST_DB = QUEST_DB;
