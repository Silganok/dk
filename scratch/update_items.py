import re

with open("js/data/items.js", "r", encoding="utf-8") as f:
    content = f.read()

def replacer(match):
    name = match.group(1)
    props = match.group(2)
    
    if "reqLevel:" in props:
        return match.group(0)

    reqLevel = None
    
    if name in ['"단검"', '"천옷"']:
        reqLevel = 1
    elif name in ['"기사의 롱소드"', '"용병의 대검"', '"사냥꾼의 단궁"', '"사냥꾼의 장궁"', '"마법학도의 완드"', '"마법학도의 스태프"']:
        reqLevel = 10
    elif name in ['"강철 장검"', '"강철 클레이모어"', '"엘븐 숏보우"', '"저격수의 뿔활"', '"수호자의 완드"', '"원소의 스태프"']:
        reqLevel = 20
    elif name in ['"집행자의 룬소드"', '"거인의 츠바이핸더"', '"요정의 바람활"', '"발키리의 장궁"', '"현자의 룬완드"', '"대마법사의 지팡이"']:
        reqLevel = 30
    elif name in ['"기사의 흉갑"', '"사냥꾼의 튜닉"', '"마법사의 로브"']:
        reqLevel = 10
    elif name in ['"미스릴 갑옷"', '"암살자의 슈트"', '"현자의 로브"', '"마력의 망토"']:
        reqLevel = 20
    elif name in ['"티타늄 플레이트"', '"환영의 망토"', '"아크메이지 로브"']:
        reqLevel = 30
    elif name in ['"광전사의 반지"', '"바람의 목걸이"', '"거북이 등껍질 부적"', '"은빛 십자가"']:
        reqLevel = 10
        
    if reqLevel is not None:
        return f'{name}: {{ reqLevel: {reqLevel}, {props}'
    return match.group(0)

content = re.sub(r'(".*?"): \{\s*(name:.*?\}),', replacer, content)

with open("js/data/items.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Items updated")
