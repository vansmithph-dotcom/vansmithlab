# -*- coding: utf-8 -*-
"""Generate hero + inline SVG diagrams for the four new Analysis articles."""
import os, html, hashlib

BASE = r"C:\Users\VAN\Documents\GitHub\vansmithlab\public\images\articles"
os.makedirs(BASE, exist_ok=True)

C_RED="#c84a31"; C_INK="#171716"; C_BG="#f2eee6"; C_GRID="#ded7ca"; C_MUT="#777167"
C_CREAM="#fbf8f1"; C_ROSE="#ead3ca"; C_BLUE="#dce5e9"; C_NAVY="#284e78"

def esc(t): return html.escape(t)

def frame(code, title, caption, w=1600, h=900, pad=40):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img">
<rect width="{w}" height="{h}" fill="{C_BG}"/>
<defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="{C_GRID}" stroke-width="1"/></pattern></defs>
<rect x="{pad}" y="{pad}" width="{w-2*pad}" height="{h-2*pad}" fill="url(#grid)" opacity=".46"/>
<rect x="{pad}" y="{pad}" width="{w-2*pad}" height="{h-2*pad}" rx="0" fill="none" stroke="{C_INK}" stroke-width="2"/>
<text x="{pad+38}" y="{pad+56}" fill="{C_RED}" text-anchor="start" font-family="monospace" font-size="15" font-weight="500" letter-spacing="2">VANSMITHLAB / ANALYSIS / {esc(code)}</text>
<text x="{pad+38}" y="{pad+130}" fill="{C_INK}" text-anchor="start" font-family="Georgia" font-size="50" font-weight="500" letter-spacing="0">{esc(title)}</text>
<line x1="{pad+38}" y1="{pad+162}" x2="{w-pad-38}" y2="{pad+162}" stroke="{C_INK}" stroke-width="2"/>
<text x="{pad+38}" y="{h-pad-26}" fill="{C_MUT}" text-anchor="start" font-family="Arial" font-size="19" font-weight="400" letter-spacing="0">{esc(caption)}</text>'''

def box(x,y,wid,hei,fill,stroke=C_INK,sw=2,label=None,label_fill=C_INK,fs=20):
    s=f'<rect x="{x}" y="{y}" width="{wid}" height="{hei}" rx="0" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
    if label:
        s+=f'<text x="{x+wid/2}" y="{y+hei/2+7}" fill="{label_fill}" text-anchor="middle" font-family="Arial" font-size="{fs}" font-weight="500">{esc(label)}</text>'
    return s

def arrow(x1,y1,x2,y2,color=C_RED,sw=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"/>'

def dot(cx,cy,r,fill):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'

def save(article, lang, code, content):
    os.makedirs(os.path.join(BASE, article), exist_ok=True)
    fn = os.path.join(BASE, article, code + "-" + lang + ".svg")
    open(fn,"w",encoding="utf-8").write(content)
    return fn

# ---------------- HEROES (distinct compositions per article) ----------------
def hero_visionaire(lang):
    ten="VISIONAIRE: THE MEDIUM AS AUTHOR"; tr="VISIONAIRE: НОСИТЕЛЬ КАК АВТОР"
    cap="Medium becomes author: paper portfolio to object, giant scale, free poster and public event"
    s=frame("AN-VISIONAIRE-010-HERO", ten if lang=="en" else tr, cap)
    # evolution ladder: portfolio -> object -> scale -> free -> event
    steps = ["PORTFOLIO","OBJECT","GIANT SCALE","FREE POSTER","PUBLIC EVENT"] if lang=="en" else ["ПОРТФЕЛЬ","ОБЪЕКТ","ГИГАНТСКИЙ МАСШТАБ","БЕСПЛАТНЫЙ ПОСТЕР","ПУБЛИЧНОЕ СОБЫТИЕ"]
    x0=120; y=450; w=240; gap=40
    for i,lb in enumerate(steps):
        col=[C_CREAM,C_ROSE,C_BLUE][i%3]
        s+=box(x0,y,w,110,col,C_INK,2,lb,C_INK,18)
        if i<len(steps)-1:
            s+=arrow(x0+w,y+55,x0+w+gap,y+55,C_RED,3)
        x0+=w+gap
    # rising baseline
    s+=f'<path d="M160 640 C500 660 800 600 1100 630 S1400 600 1500 620" fill="none" stroke="{C_NAVY}" stroke-width="3" stroke-linecap="round"/>'
    s+="</svg>"
    return s

def hero_dazed_id(lang):
    ten="CULTURAL RADAR: FROM STREET TO MAINSTREAM"; tr="КУЛЬТУРНЫЙ РАДАР: ОТ УЛИЦЫ К МЕЙНСТРИМУ"
    cap="Street, club and local scene through editorial selection to archive and the mainstream"
    s=frame("AN-DAZEDID-009-HERO", ten if lang=="en" else tr, cap)
    # radar arcs
    cx,cy=800,520
    for r in (140,240,320):
        s+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C_NAVY}" stroke-width="2" stroke-dasharray="6 8" opacity=".5"/>'
    s+=f'<path d="M{cx} {cy} L{cx+320} {cy} A320 320 0 0 1 {cx-40} {cy+317}" fill="none" stroke="{C_RED}" stroke-width="4"/>'
    pts=[("STREET",cx-300,cy-20),("CLUB",cx+240,cy+160),("SELECTION",cx,cy-120),("ARCHIVE",cx-80,cy+230),("MAINSTREAM",cx+280,cy-140)]
    for lb,px,py in pts:
        s+=dot(px,py,10,C_RED)
        s+=f'<text x="{px}" y="{py-16}" fill="{C_INK}" text-anchor="middle" font-family="Arial" font-size="18" font-weight="600">{esc(lb)}</text>'
    s+=f'<text x="{cx}" y="{cy+10}" fill="{C_INK}" text-anchor="middle" font-family="Georgia" font-size="34">{"EDITORIAL RADAR" if lang=="en" else "РЕДАКЦИОННЫЙ РАДАР"}</text>'
    s+="</svg>"
    return s

def hero_magazine_paper(lang):
    ten="THE MAGAZINE BEYOND PAPER"; tr="ЖУРНАЛ ЗА ПРЕДЕЛАМИ БУМАГИ"
    cap="Editorial core connected to print, archive, database, video, event and studio"
    s=frame("AN-MAGMEDIA-008-HERO", ten if lang=="en" else tr, cap)
    cx,cy=800,500
    en_nodes=[("PRINT",150,-130),("ARCHIVE",120,150),("DATABASE",-30,190),("VIDEO",-170,120),("EVENT",-190,-100),("STUDIO",60,-180)]
    ru_nodes=[("ПЕЧАТЬ",150,-130),("АРХИВ",120,150),("БАЗА",-30,190),("ВИДЕО",-170,120),("СОБЫТИЕ",-190,-100),("СТУДИЯ",60,-180)]
    nodes=en_nodes if lang=="en" else ru_nodes
    s+=box(cx-95,cy-44,190,88,C_INK,C_INK,2,"EDITORIAL CORE" if lang=="en" else "РЕД. ЯДРО",C_CREAM,20)
    for label,dx,dy in nodes:
        nx,ny=cx+dx,cy+dy
        s+=arrow(cx,cy,nx,ny,C_RED,2)
        s+=box(nx-70,ny-26,140,52,C_CREAM,C_INK,2,label,C_INK,16)
    s+=f'<circle cx="{cx}" cy="{cy}" r="310" fill="none" stroke="{C_NAVY}" stroke-width="2" stroke-dasharray="10 12" opacity=".5"/></svg>'
    return s

def hero_tv_network(lang):
    ten="THE FASHION HOUSE AS MEDIA SYSTEM"; tr="МОДНЫЙ ДОМ КАК МЕДИАСИСТЕМА"
    cap="Show, film, archive, podcast, cultural programme and platform fragments"
    s=frame("AN-BRANDMEDIA-007-HERO", ten if lang=="en" else tr, cap)
    # broadcast grid: rows of episodes
    labels = ["SHOW","FILM","ARCHIVE","PODCAST","PROGRAMME","FRAGMENTS"] if lang=="en" else ["ПОКАЗ","ФИЛЬМ","АРХИВ","ПОДКАСТ","ПРОГРАММА","ФРАГМЕНТЫ"]
    x0=150; y=380; w=200; gap=28
    for i,lb in enumerate(labels):
        col=[C_CREAM,C_ROSE,C_BLUE][i%3]
        s+=box(x0,y,w,150,col,C_INK,2,lb,C_INK,16)
        if i<len(labels)-1:
            s+=arrow(x0+w,y+75,x0+w+gap,y+75,C_RED,3)
        x0+=w+gap
    # broadcast bars bottom
    bx=250
    for i in range(14):
        h=40+(i*9)%110
        s+=f'<rect x="{bx}" y="{620-h}" width="18" height="{h}" fill="{C_RED if i%3==0 else C_NAVY}"/>'
        bx+=22
    s+="</svg>"
    return s

for art, fn in [
  ("visionaire",hero_visionaire),("dazed_id",hero_dazed_id),
  ("magazine_paper",hero_magazine_paper),("tv_network",hero_tv_network)]:
    save(art,"en", {"visionaire":"AN-VISIONAIRE-010-HERO","dazed_id":"AN-DAZEDID-009-HERO","magazine_paper":"AN-MAGMEDIA-008-HERO","tv_network":"AN-BRANDMEDIA-007-HERO"}[art], fn("en"))
    save(art,"ru", {"visionaire":"AN-VISIONAIRE-010-HERO","dazed_id":"AN-DAZEDID-009-HERO","magazine_paper":"AN-MAGMEDIA-008-HERO","tv_network":"AN-BRANDMEDIA-007-HERO"}[art], fn("ru"))
    print("hero distinct ok", art)

print("done heroes")

# ---------------- INLINE DIAGRAMS ----------------
def inline_frame(code, title, caption, w=1600, h=900):
    return frame(code, title, caption, w, h)

def row_flow(x0, y, labels, colors, w=150, h=90, gap=40, ar=True):
    s=""
    cx=x0
    for i,lb in enumerate(labels):
        s+=box(cx,y,w,h,colors[i%len(colors)],C_INK,2,lb,C_INK,16)
        if ar and i<len(labels)-1:
            s+=arrow(cx+w,y+h/2,cx+w+gap,y+h/2,C_RED,3)
        cx+=w+gap
    return s

def timeline(x0,x1,y,points):
    s=f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{C_INK}" stroke-width="3"/>'
    for (px,label,up) in points:
        s+=dot(px,y,8,C_RED)
        if up:
            s+=f'<line x1="{px}" y1="{y}" x2="{px}" y2="{y-22}" stroke="{C_INK}" stroke-width="2"/>'
            s+=f'<text x="{px}" y="{y-30}" fill="{C_INK}" text-anchor="middle" font-family="Arial" font-size="17" font-weight="600">{esc(label)}</text>'
        else:
            s+=f'<line x1="{px}" y1="{y}" x2="{px}" y2="{y+22}" stroke="{C_INK}" stroke-width="2"/>'
            s+=f'<text x="{px}" y="{y+40}" fill="{C_INK}" text-anchor="middle" font-family="Arial" font-size="17" font-weight="600">{esc(label)}</text>'
    return s

def two_panel(tl, bl, tr, br, label_l, label_r, tl_c, tr_c):
    # left and right panels
    s=box(140,330,620,300,C_CREAM,C_INK,2,None)
    s+=box(840,330,620,300,C_CREAM,C_INK,2,None)
    s+=f'<text x="450" y="320" fill="{C_RED}" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="2">{esc(label_l)}</text>'
    s+=f'<text x="1150" y="320" fill="{C_RED}" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="2">{esc(label_r)}</text>'
    return s

inlines = {
 "visionaire": [
  ("AN-VISIONAIRE-010-01","VISIONAIRE 61: READING AT FULL HEIGHT",
   "The reader stands beside the issue rather than holding it", "human-scale", ["DIAGRAM","57.5 x 79 IN","HUMAN SCALE"]),
  ("AN-VISIONAIRE-010-02","VISIONAIRE 01: A PROTOTYPE PORTFOLIO",
   "Loose sheets and mixed paper as editorial structure", "portfolio", ["SHEETS","MIXED PAPER","PRINTERS' REST","PORTFOLIO"]),
  ("AN-VISIONAIRE-010-03","VISIONAIRE 18: BRAND AS PRODUCTION TOOL",
   "Louis Vuitton leather portfolio, loose leaves and a long contributor list", "brand", ["LISSUE","LEATHER PORTFOLIO","LV","CONTRIBUTORS"]),
  ("AN-VISIONAIRE-010-04","VISIONAIRE 38: READING AS HANDLING",
   "A novel whose pages hold inserted objects, cards, photographs and poems", "handling", ["BOOK","INSERTS","OBJECTS","CASE"]),
  ("AN-VISIONAIRE-010-05","SURPRISE AND LARGER THAN LIFE: THEME AS MECHANISM",
   "Pop-up mechanics and extreme scale as two ways the format performs the idea", "split", ["SURPRISE","POP-UP","SCALE","LARGER THAN LIFE"]),
  ("AN-VISIONAIRE-010-06","VISIONAIRE 65 FREE: PUBLIC DISTRIBUTION",
   "Miami, Los Angeles and New York linked to free poster distribution and trucks", "map", ["MIAMI","LOS ANGELES","NEW YORK","FREE ART TRUCKS"]),
  ("AN-VISIONAIRE-010-07","FROM EDITION TO EXPERIENCE",
   "Timeline from limited portfolio to FREE public art, experiential agency and Glass Handel", "timeline", ["1991","2015","2026","GLASS HANDEL"]),
 ],
 "dazed_id": [
  ("AN-DAZEDID-009-01","i-D 1980 AND DAZED 1991: ORIGIN ENVIRONMENTS",
   "Two magazines born beside live cultural scenes rather than inside an algorithmic feed", "timeline", ["1980","1991","STREET","CLUB"]),
  ("AN-DAZEDID-009-02","i-D: STRAIGHT-UP AND THE WINK",
   "A repeatable graphic gesture coexists with the individuality of each subject", "visual", ["STRAIGHT-UP","BODY","WINK","COVER"]),
  ("AN-DAZEDID-009-03","DAZED: 'THIS IS NOT A MAGAZINE'",
   "The first four-page issue defined the publication through refusal", "refusal", ["1991","FOUR PAGES","REFUSAL","PROVOCATION"]),
  ("AN-DAZEDID-009-04","TALENT DISCOVERY: i-D AND DAZED 100",
   "Two ways of allocating early visibility to new people", "compare", ["i-D ECOSYSTEM","DAZED 100","DISCOVERY","PUBLICATION"]),
  ("AN-DAZEDID-009-05","PHOTOGRAPHY BECOMES CULTURAL MEMORY",
   "Shoot and editorial context become cover, then archive, book, exhibition and new work", "flow", ["SHOOT","EDITORIAL","COVER","ARCHIVE","MEMORY"]),
  ("AN-DAZEDID-009-06","DAZED AND i-D AS MEDIA SYSTEMS IN 2026",
   "Editorial voice distributed across print, platform, community and events", "map", ["PRINT","DIGITAL","SOCIAL","EVENTS"]),
  ("AN-DAZEDID-009-07","DISCOVERY VERSUS EXTRACTION",
   "Editorial visibility can expand a scene or reduce it to branded content", "fork", ["SCENE","VISIBILITY","SUPPORT","EXTRACTION"]),
 ],
 "magazine_paper": [
  ("AN-MAGMEDIA-008-01","FINITE ISSUE VERSUS INFINITE FEED",
   "Sequence, selection and closure against endless recommendation", "compare", ["ISSUE","SEQUENCE","FEED","ENDLESS"]),
  ("AN-MAGMEDIA-008-02","VOGUE: PRINT, ARCHIVE, RUNWAY, WORLD",
   "A historical magazine becomes an archive, a database and a live event", "map", ["PRINT","ARCHIVE","RUNWAY","VOGUE WORLD"]),
  ("AN-MAGMEDIA-008-03","DAZED MEDIA ECOSYSTEM",
   "Magazine, Studio, 100, Club and international nodes as one editorial network", "map", ["DAZED","STUDIO","100","CLUB"]),
  ("AN-MAGMEDIA-008-04","THE FACE: 1980-2004-2019-2026",
   "A magazine name and archive can outlive pauses in production", "timeline", ["1980","2004","2019","2026"]),
  ("AN-MAGMEDIA-008-05","VISIONAIRE AS PUBLICATION-OBJECT",
   "Expansion of the magazine can lead not only to the screen but to a more physical object", "object", ["BOX","SET","OBJECT","FORMAT"]),
  ("AN-MAGMEDIA-008-06","032c: MAGAZINE, FASHION, WORKSHOP, GALLERY",
   "Editorial identity distributed across media, clothing and space", "map", ["MAGAZINE","READY-TO-WEAR","WORKSHOP","GALLERY"]),
  ("AN-MAGMEDIA-008-07","EDITORIAL FILTER VERSUS ALGORITHMIC FEED",
   "Selection, hierarchy and refusal against infinite recommendation", "compare", ["FEED","ALGORITHM","EDITORIAL","REFUSAL"]),
 ],
 "tv_network": [
  ("AN-BRANDMEDIA-007-01","PRADASPHERE: PROGRAMMING MAP",
   "Shows, campaigns, special projects, events, films and places as parallel formats", "map", ["SHOWS","CAMPAIGNS","EVENTS","FILMS","PLACES"]),
  ("AN-BRANDMEDIA-007-02","CHANEL: FROM ARCHIVE TO VOICE",
   "Inside CHANEL chapters to CHANEL Connects podcast and Culture Fund", "timeline", ["INSIDE CHANEL","CONNECTS","CULTURE FUND"]),
  ("AN-BRANDMEDIA-007-03","MIU MIU WOMEN'S TALES: LONG FORMAT",
   "A commissioning platform for female-led short films kept going for more than fifteen years", "series", ["2011","EPISODES","DIRECTORS","COMMITTEE"]),
  ("AN-BRANDMEDIA-007-04","GUCCIFEST: COLLECTION AS SEVEN EPISODES",
   "Ouverture of Something That Never Ended as a seven-part film collaboration", "series", ["EPISODE 1","EPISODE 4","EPISODE 7","COLLECTION"]),
  ("AN-BRANDMEDIA-007-05","LOUIS VUITTON: LIVE TO ARCHIVE",
   "A live show becomes a full recording, a set of looks and a show archive", "flow", ["LIVE","RECORDING","LOOKS","ARCHIVE"]),
  ("AN-BRANDMEDIA-007-06","CAMPAIGN BURST VERSUS PROGRAMMING GRID",
   "Seasonal burst against a recurring brand-media grid with returning formats", "compare", ["CAMPAIGN","BURST","PROGRAMME","RETURN"]),
  ("AN-BRANDMEDIA-007-07","INDEPENDENT EDITORIAL VS BRAND-OWNED MEDIA",
   "Who chooses, funds, publishes and archives the statement", "fork", ["INDEPENDENT","GATE","BRAND MEDIA","CONTROL"]),
 ],
}

def gen_timeline(code,title,caption,points,lang):
    s=inline_frame(code,title,caption)
    s+=timeline(200,1400,520,points)
    s+="</svg>"
    return s

def gen_map(code,title,caption,labels,lang):
    s=inline_frame(code,title,caption)
    cx,cy=800,500
    n=len(labels)
    import math
    for i,lb in enumerate(labels):
        a=2*math.pi*i/n - math.pi/2
        nx,ny=cx+260*math.cos(a),cy+230*math.sin(a)
        s+=arrow(cx,cy,nx,ny,C_RED,2)
        s+=box(nx-80,ny-26,160,52,C_CREAM,C_INK,2,lb,C_INK,16)
    s+=f'<circle cx="{cx}" cy="{cy}" r="120" fill="{C_INK}"/>'
    s+=f'<text x="{cx}" y="{cy+8}" fill="{C_CREAM}" text-anchor="middle" font-family="Arial" font-size="20" font-weight="600">{"MEDIA SYSTEM" if lang=="en" else "МЕДИА-СИСТЕМА"}</text>'
    s+="</svg>"
    return s

def gen_compare(code,title,caption,labels,lang):
    s=inline_frame(code,title,caption)
    left=labels[0]; right=labels[1]
    s+=f'<text x="450" y="320" fill="{C_RED}" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="2">{esc(left)}</text>'
    s+=f'<text x="1150" y="320" fill="{C_RED}" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="2">{esc(right)}</text>'
    s+=box(140,350,620,300,C_ROSE,C_INK,2,"MODE A",C_INK,22)
    s+=box(840,350,620,300,C_BLUE,C_INK,2,"MODE B",C_INK,22)
    s+=f'<text x="450" y="560" fill="{C_MUT}" text-anchor="middle" font-family="Arial" font-size="18">{esc(labels[2] if len(labels)>2 else "")}</text>'
    s+=f'<text x="1150" y="560" fill="{C_MUT}" text-anchor="middle" font-family="Arial" font-size="18">{esc(labels[3] if len(labels)>3 else "")}</text>'
    s+="</svg>"
    return s

def gen_flow(code,title,caption,labels,lang):
    s=inline_frame(code,title,caption)
    x0=140; y=450; w=210; gap=30
    for i,lb in enumerate(labels):
        col=[C_CREAM,C_ROSE,C_BLUE][i%3]
        s+=box(x0,y,w,100,col,C_INK,2,lb,C_INK,16)
        if i<len(labels)-1:
            s+=arrow(x0+w,y+50,x0+w+gap,y+50,C_RED,3)
        x0+=w+gap
    s+="</svg>"
    return s

def gen_series(code,title,caption,labels,lang):
    s=inline_frame(code,title,caption)
    x0=140; y=450; w=210; gap=30
    for i,lb in enumerate(labels):
        col=[C_CREAM,C_ROSE,C_BLUE][i%3]
        s+=box(x0,y,w,100,col,C_INK,2,lb,C_INK,16)
        if i<len(labels)-1:
            s+=arrow(x0+w,y+50,x0+w+gap,y+50,C_RED,3)
        x0+=w+gap
    s+="</svg>"
    return s

def gen_special(code,title,caption,labels,lang,kind):
    if kind=="human-scale":
        s=inline_frame(code,title,caption)
        # person silhouette
        s+=dot(420,430,60,C_INK)
        s+=f'<rect x="390" y="490" width="60" height="160" fill="{C_INK}"/>'
        s+=f'<rect x="330" y="620" width="180" height="46" fill="{C_INK}"/>'
        # giant panel
        s+=box(700,300,600,420,C_ROSE,C_INK,3,"ISSUE 61",C_INK,30)
        s+=f'<line x1="420" y1="430" x2="700" y2="300" stroke="{C_RED}" stroke-width="3" stroke-dasharray="8 6"/>'
        s+="</svg>"
    elif kind=="portfolio":
        s=inline_frame(code,title,caption)
        for i in range(4):
            s+=box(200+i*70,360,120,180,[C_CREAM,C_ROSE,C_BLUE][i%3],C_INK,2)
        s+=f'<text x="900" y="520" fill="{C_INK}" text-anchor="middle" font-family="Georgia" font-size="34">MIXED PAPER</text>'
        s+="</svg>"
    elif kind=="brand":
        s=inline_frame(code,title,caption)
        s+=box(300,380,360,220,C_ROSE,C_INK,3,"LEATHER PORTFOLIO",C_INK,24)
        s+=box(760,420,220,160,C_BLUE,C_INK,2,"LOOSE LEAVES",C_INK,20)
        s+=box(1040,420,220,160,C_CREAM,C_INK,2,"LV CENTENARY",C_INK,18)
        s+=f'<line x1="660" y1="490" x2="760" y2="490" stroke="{C_RED}" stroke-width="3"/>'
        s+=f'<line x1="980" y1="490" x2="1040" y2="490" stroke="{C_RED}" stroke-width="3"/>'
        s+="</svg>"
    elif kind=="handling":
        s=inline_frame(code,title,caption)
        s+=box(300,360,460,300,C_CREAM,C_INK,3,"BOOK")
        # inserts
        for i,(dx,dy,col) in enumerate([(0,40,C_ROSE),(90,90,C_BLUE),(-40,150,C_ROSE),(140,180,C_BLUE)]):
            s+=box(340+dx,400+dy,70,90,col,C_INK,2)
        s+=box(820,330,420,360,C_ROSE,C_INK,3,"CASE / OBJECT")
        s+=f'<text x="1030" y="560" fill="{C_INK}" text-anchor="middle" font-family="Georgia" font-size="28">READING AS HANDLING</text>'
        s+="</svg>"
    elif kind=="split":
        s=inline_frame(code,title,caption)
        s+=f'<text x="450" y="320" fill="{C_RED}" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="2">SURPRISE</text>'
        s+=f'<text x="1150" y="320" fill="{C_RED}" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="2">LARGER THAN LIFE</text>'
        s+=box(140,350,620,300,C_ROSE,C_INK,2,"POP-UP MECHANICS",C_INK,22)
        s+=box(840,350,620,300,C_BLUE,C_INK,2,"EXTREME SCALE",C_INK,22)
        s+="</svg>"
    elif kind=="map":
        return gen_map(code,title,caption,labels,lang)
    elif kind=="visual":
        s=inline_frame(code,title,caption)
        s+=dot(600,480,80,C_CREAM); s+=f'<circle cx="600" cy="480" r="80" fill="none" stroke="{C_INK}" stroke-width="3"/>'
        s+=dot(600,480,26,C_RED)
        s+=f'<path d="M560 545 Q600 585 640 545" fill="none" stroke="{C_INK}" stroke-width="4" stroke-linecap="round"/>'
        s+=box(820,380,320,200,C_ROSE,C_INK,2,"STRAIGHT-UP",C_INK,24)
        s+=f'<text x="1100" y="620" fill="{C_INK}" text-anchor="middle" font-family="Georgia" font-size="30">WINK</text>'
        s+="</svg>"
    elif kind=="refusal":
        s=inline_frame(code,title,caption)
        s+=box(400,360,800,260,C_INK,C_INK,3)
        s+=f'<text x="800" y="480" fill="{C_CREAM}" text-anchor="middle" font-family="Georgia" font-size="40">"THIS IS NOT A MAGAZINE"</text>'
        s+=f'<text x="800" y="540" fill="{C_ROSE}" text-anchor="middle" font-family="Arial" font-size="22">1991 - FOUR PAGES</text>'
        s+="</svg>"
    elif kind=="object":
        s=inline_frame(code,title,caption)
        s+=box(700,380,400,280,C_ROSE,C_INK,3,"BOX / SET")
        s+=f'<text x="900" y="560" fill="{C_INK}" text-anchor="middle" font-family="Georgia" font-size="30">PUBLICATION-OBJECT</text>'
        s+="</svg>"
    elif kind=="fork":
        s=inline_frame(code,title,caption)
        s+=box(180,430,240,90,C_CREAM,C_INK,2,labels[0],C_INK,18)
        s+=arrow(420,475,520,400,C_RED,3)
        s+=arrow(420,475,520,550,C_RED,3)
        s+=box(520,365,300,90,C_ROSE,C_INK,2,labels[1],C_INK,16)
        s+=box(520,505,300,90,C_BLUE,C_INK,2,labels[2],C_INK,16)
        s+="</svg>"
    else:
        s=inline_frame(code,title,caption)
        s+=box(300,420,1000,140,C_CREAM,C_INK,2,labels[0] if labels else "",C_INK,22)
        s+="</svg>"
    return s

# dispatch each inline to a generator based on its kind token
def gen_inline(art, code, title, caption, labels, kind, lang):
    kinds = {
      "timeline": lambda: gen_timeline(code,title,caption,[(px,lb,True) for px,lb in zip(range(300,1501,220),labels)],lang),
      "map": lambda: gen_map(code,title,caption,labels,lang),
      "compare": lambda: gen_compare(code,title,caption,labels,lang),
      "flow": lambda: gen_flow(code,title,caption,labels,lang),
      "series": lambda: gen_series(code,title,caption,labels,lang),
    }
    if kind in kinds:
        return kinds[kind]()
    return gen_special(code,title,caption,labels,lang,kind)

# (art, code, kind) -> (title_en, caption_en, labels_en, title_ru, caption_ru, labels_ru)
INLINE_SPEC = {
 "visionaire": {
  "AN-VISIONAIRE-010-01": ("VISIONAIRE 61: READING AT FULL HEIGHT","The reader stands beside the issue rather than holding it",["57.5 x 79 IN","DELUXE","HUMAN SCALE"],"VISIONAIRE 61: ЧТЕНИЕ В ПОЛНЫЙ РОСТ","Читатель стоит рядом с выпуском, а не держит его в руках",["57,5 х 79 ДЮЙМОВ","ДЕЛЮКС","ЧЕЛОВЕЧЕСКИЙ РОСТ"]),
  "AN-VISIONAIRE-010-02": ("VISIONAIRE 01: A PROTOTYPE PORTFOLIO","Loose sheets and mixed paper as editorial structure",["SHEETS","MIXED PAPER","PORTFOLIO"],"VISIONAIRE 01: ПРОТОТИП-ПОРТФЕЛЬ","Свободные листы и разная бумага как редакционная структура",["ЛИСТЫ","РАЗНАЯ БУМАГА","ПОРТФЕЛЬ"]),
  "AN-VISIONAIRE-010-03": ("VISIONAIRE 18: BRAND AS PRODUCTION TOOL","Louis Vuitton leather portfolio, loose leaves and a long contributor list",["LOOSE LEAVES","LEATHER PORTFOLIO","LV","CONTRIBUTORS"],"VISIONAIRE 18: БРЕНД КАК ПРОИЗВОДСТВЕННЫЙ ИНСТРУМЕНТ","Кожаный портфель Louis Vuitton, свободные листы и длинный список участников",["ЛИСТЫ","КОЖАНЫЙ ПОРТФЕЛЬ","LV","УЧАСТНИКИ"]),
  "AN-VISIONAIRE-010-04": ("VISIONAIRE 38: READING AS HANDLING","A novel whose pages hold inserted objects, cards, photographs and poems",["BOOK","INSERTS","OBJECTS","CASE"],"VISIONAIRE 38: ЧТЕНИЕ КАК ОБРАЩЕНИЕ С ОБЪЕКТОМ","Роман, в страницы которого вставлены открытки, фотографии, стихи и объекты",["КНИГА","ВСТАВКИ","ОБЪЕКТЫ","ФУТЛЯР"]),
  "AN-VISIONAIRE-010-05": ("SURPRISE AND LARGER THAN LIFE: THEME AS MECHANISM","Pop-up mechanics and extreme scale as two ways the format performs the idea",["SURPRISE","POP-UP","SCALE","LARGER THAN LIFE"],"SURPRISE И LARGER THAN LIFE: ТЕМА КАК МЕХАНИЗМ","Поп-ап механика и экстремальный масштаб как два способа исполнить идею",["SURPRISE","ПОП-АП","МАСШТАБ","LARGER THAN LIFE"]),
  "AN-VISIONAIRE-010-06": ("VISIONAIRE 65 FREE: PUBLIC DISTRIBUTION","Miami, Los Angeles and New York linked to free poster distribution and trucks",["MIAMI","LOS ANGELES","NEW YORK","FREE ART TRUCKS"],"VISIONAIRE 65 FREE: ПУБЛИЧНОЕ РАСПРОСТРАНЕНИЕ","Майами, Лос-Анджелес и Нью-Йорк связаны с бесплатной раздачей постеров и грузовиками",["МАЙАМИ","ЛОС-АНДЖЕЛЕС","НЬЮ-ЙОРК","FREE ART TRUCKS"]),
  "AN-VISIONAIRE-010-07": ("FROM EDITION TO EXPERIENCE","Timeline from limited portfolio to FREE public art, experiential agency and Glass Handel",["1991","2015","2026","GLASS HANDEL"],"ОТ ВЫПУСКА К ОПЫТУ","Хронология от лимитированного портфеля к FREE, агентству впечатлений и Glass Handel",["1991","2015","2026","GLASS HANDEL"]),
 },
 "dazed_id": {
  "AN-DAZEDID-009-01": ("i-D 1980 AND DAZED 1991: ORIGIN ENVIRONMENTS","Two magazines born beside live cultural scenes rather than inside an algorithmic feed",["1980 i-D","1991 DAZED","STREET","CLUB"],"i-D 1980 И DAZED 1991: СРЕДЫ ПОЯВЛЕНИЯ","Два журнала появились рядом с живыми культурными сценами, а не внутри алгоритмической ленты",["1980 i-D","1991 DAZED","УЛИЦА","КЛУБ"]),
  "AN-DAZEDID-009-02": ("i-D: STRAIGHT-UP AND THE WINK","A repeatable graphic gesture coexists with the individuality of each subject",["STRAIGHT-UP","BODY","WINK","COVER"],"i-D: STRAIGHT-UP И ПОДМИГИВАНИЕ","Повторяемый графический жест сосуществует с индивидуальностью каждого героя",["STRAIGHT-UP","ТЕЛО","ПОДМИГИВАНИЕ","ОБЛОЖКА"]),
  "AN-DAZEDID-009-03": ("DAZED: 'THIS IS NOT A MAGAZINE'","The first four-page issue defined the publication through refusal",["1991","FOUR PAGES","REFUSAL","PROVOCATION"],"DAZED: «ЭТО НЕ ЖУРНАЛ»","Первый четырёхстраничный выпуск определил издание через отказ",["1991","ЧЕТЫРЕ СТРАНИЦЫ","ОТКАЗ","ПРОВОКАЦИЯ"]),
  "AN-DAZEDID-009-04": ("TALENT DISCOVERY: i-D AND DAZED 100","Two ways of allocating early visibility to new people",["i-D ECOSYSTEM","DAZED 100","DISCOVERY","PUBLICATION"],"ОБНАРУЖЕНИЕ ТАЛАНТА: i-D И DAZED 100","Два способа распределения ранней видимости новым людям",["ЭКОСИСТЕМА i-D","DAZED 100","ОБНАРУЖЕНИЕ","ПУБЛИКАЦИЯ"]),
  "AN-DAZEDID-009-05": ("PHOTOGRAPHY BECOMES CULTURAL MEMORY","Shoot and editorial context become cover, then archive, book, exhibition and new work",["SHOOT","EDITORIAL","COVER","ARCHIVE","MEMORY"],"ФОТОГРАФИЯ СТАНОВИТСЯ КУЛЬТУРНОЙ ПАМЯТЬЮ","Съёмка и редакционный контекст становятся обложкой, затем архивом, книгой, выставкой и новой работой",["СЪЁМКА","РЕДАКЦИЯ","ОБЛОЖКА","АРХИВ","ПАМЯТЬ"]),
  "AN-DAZEDID-009-06": ("DAZED AND i-D AS MEDIA SYSTEMS IN 2026","Editorial voice distributed across print, platform, community and events",["PRINT","DIGITAL","SOCIAL","EVENTS"],"DAZED И i-D КАК МЕДИА-СИСТЕМЫ В 2026","Редакционный голос распределён между печатью, платформой, сообществом и событиями",["ПЕЧАТЬ","ЦИФРА","СОЦСЕТИ","СОБЫТИЯ"]),
  "AN-DAZEDID-009-07": ("DISCOVERY VERSUS EXTRACTION","Editorial visibility can expand a scene or reduce it to branded content",["SCENE","VISIBILITY","SUPPORT","EXTRACTION"],"ОТКРЫВАТЬ ИЛИ ИЗВЛЕКАТЬ","Редакционная видимость может расширить сцену или свести её к брендированному контенту",["СЦЕНА","ВИДИМОСТЬ","ПОДДЕРЖКА","ИЗВЛЕЧЕНИЕ"]),
 },
 "magazine_paper": {
  "AN-MAGMEDIA-008-01": ("FINITE ISSUE VERSUS INFINITE FEED","Sequence, selection and closure against endless recommendation",["ISSUE","SEQUENCE","FEED","ENDLESS"],"КОНЕЧНЫЙ НОМЕР И БЕСКОНЕЧНАЯ ЛЕНТА","Последовательность, отбор и финал против бесконечной рекомендации",["НОМЕР","ПОСЛЕДОВАТЕЛЬНОСТЬ","ЛЕНТА","БЕСКОНЕЧНОСТЬ"]),
  "AN-MAGMEDIA-008-02": ("VOGUE: PRINT, ARCHIVE, RUNWAY, WORLD","A historical magazine becomes an archive, a database and a live event",["PRINT","ARCHIVE","RUNWAY","WORLD"],"VOGUE: ПЕЧАТЬ, АРХИВ, RUNWAY, WORLD","Исторический журнал становится архивом, базой и живым событием",["ПЕЧАТЬ","АРХИВ","RUNWAY","WORLD"]),
  "AN-MAGMEDIA-008-03": ("DAZED MEDIA ECOSYSTEM","Magazine, Studio, 100, Club and international nodes as one editorial network",["DAZED","STUDIO","100","CLUB"],"ЭКОСИСТЕМА DAZED MEDIA","Журнал, Studio, 100, Club и международные узлы как одна редакционная сеть",["DAZED","STUDIO","100","CLUB"]),
  "AN-MAGMEDIA-008-04": ("THE FACE: 1980-2004-2019-2026","A magazine name and archive can outlive pauses in production",["1980","2004","2019","2026"],"THE FACE: 1980-2004-2019-2026","Имя журнала и архив могут переживать паузы в производстве",["1980","2004","2019","2026"]),
  "AN-MAGMEDIA-008-05": ("VISIONAIRE AS PUBLICATION-OBJECT","Expansion of the magazine can lead not only to the screen but to a more physical object",["BOX","SET","OBJECT","FORMAT"],"VISIONAIRE КАК ПУБЛИКАЦИОННЫЙ ОБЪЕКТ","Расширение журнала может вести не только к экрану, но и к более физическому объекту",["КОРОБКА","НАБОР","ОБЪЕКТ","ФОРМАТ"]),
  "AN-MAGMEDIA-008-06": ("032c: MAGAZINE, FASHION, WORKSHOP, GALLERY","Editorial identity distributed across media, clothing and space",["MAGAZINE","READY-TO-WEAR","WORKSHOP","GALLERY"],"032c: ЖУРНАЛ, МОДА, WORKSHOP, ГАЛЕРЕЯ","Редакционная идентичность распределена по медиа, одежде и пространству",["ЖУРНАЛ","READY-TO-WEAR","WORKSHOP","ГАЛЕРЕЯ"]),
  "AN-MAGMEDIA-008-07": ("EDITORIAL FILTER VERSUS ALGORITHMIC FEED","Selection, hierarchy and refusal against infinite recommendation",["FEED","ALGORITHM","EDITORIAL","REFUSAL"],"РЕДАКЦИОННЫЙ ФИЛЬТР И АЛГОРИТМИЧЕСКАЯ ЛЕНТА","Отбор, иерархия и отказ против бесконечной рекомендации",["ЛЕНТА","АЛГОРИТМ","РЕДАКЦИЯ","ОТКАЗ"]),
 },
 "tv_network": {
  "AN-BRANDMEDIA-007-01": ("PRADASPHERE: PROGRAMMING MAP","Shows, campaigns, special projects, events, films and places as parallel formats",["SHOWS","CAMPAIGNS","EVENTS","FILMS","PLACES"],"PRADASPHERE: КАРТА ПРОГРАММИРОВАНИЯ","Показы, кампании, специальные проекты, события, фильмы и места как параллельные форматы",["ПОКАЗЫ","КАМПАНИИ","СОБЫТИЯ","ФИЛЬМЫ","МЕСТА"]),
  "AN-BRANDMEDIA-007-02": ("CHANEL: FROM ARCHIVE TO VOICE","Inside CHANEL chapters to CHANEL Connects podcast and Culture Fund",["INSIDE CHANEL","CONNECTS","CULTURE FUND"],"CHANEL: ОТ АРХИВА К ГОЛОСУ","От глав Inside CHANEL к подкасту CHANEL Connects и Culture Fund",["INSIDE CHANEL","CONNECTS","CULTURE FUND"]),
  "AN-BRANDMEDIA-007-03": ("MIU MIU WOMEN'S TALES: LONG FORMAT","A commissioning platform for female-led short films kept going for more than fifteen years",["2011","EPISODES","DIRECTORS","COMMITTEE"],"MIU MIU WOMEN'S TALES: ДОЛГИЙ ФОРМАТ","Платформа заказа женских короткометражек, работающая более пятнадцати лет",["2011","ЭПИЗОДЫ","РЕЖИССЁРКИ","КОМИТЕТ"]),
  "AN-BRANDMEDIA-007-04": ("GUCCIFEST: COLLECTION AS SEVEN EPISODES","Ouverture of Something That Never Ended as a seven-part film collaboration",["EPISODE 1","EPISODE 4","EPISODE 7","COLLECTION"],"GUCCIFEST: КОЛЛЕКЦИЯ КАК СЕМЬ ЭПИЗОДОВ","Ouverture of Something That Never Ended как семисерийная фильм-коллаборация",["ЭПИЗОД 1","ЭПИЗОД 4","ЭПИЗОД 7","КОЛЛЕКЦИЯ"]),
  "AN-BRANDMEDIA-007-05": ("LOUIS VUITTON: LIVE TO ARCHIVE","A live show becomes a full recording, a set of looks and a show archive",["LIVE","RECORDING","LOOKS","ARCHIVE"],"LOUIS VUITTON: ОТ ПРЯМОГО ЭФИРА К АРХИВУ","Прямой эфир показа становится полной записью, набором образов и архивом",["ЭФИР","ЗАПИСЬ","ОБРАЗЫ","АРХИВ"]),
  "AN-BRANDMEDIA-007-06": ("CAMPAIGN BURST VERSUS PROGRAMMING GRID","Seasonal burst against a recurring brand-media grid with returning formats",["CAMPAIGN","BURST","PROGRAMME","RETURN"],"ВСПЫШКА КАМПАНИИ И СЕТКА ПРОГРАММЫ","Сезонная вспышка против повторяемой сетки бренд-медиа с возвращающимися форматами",["КАМПАНИЯ","ВСПЫШКА","ПРОГРАММА","ВОЗВРАЩЕНИЕ"]),
  "AN-BRANDMEDIA-007-07": ("INDEPENDENT EDITORIAL VS BRAND-OWNED MEDIA","Who chooses, funds, publishes and archives the statement",["INDEPENDENT","GATE","BRAND MEDIA","CONTROL"],"НЕЗАВИСИМАЯ РЕДАКЦИЯ И БРЕНД-МЕДИА","Кто выбирает, финансирует, публикует и архивирует высказывание",["НЕЗАВИСИМАЯ","ФИЛЬТР","БРЕНД-МЕДИА","КОНТРОЛЬ"]),
 },
}

# map each slot to a generator kind
slot_kind = {
 "AN-VISIONAIRE-010-01":"human-scale","AN-VISIONAIRE-010-02":"portfolio","AN-VISIONAIRE-010-03":"brand",
 "AN-VISIONAIRE-010-04":"handling","AN-VISIONAIRE-010-05":"split","AN-VISIONAIRE-010-06":"map","AN-VISIONAIRE-010-07":"timeline",
 "AN-DAZEDID-009-01":"timeline","AN-DAZEDID-009-02":"visual","AN-DAZEDID-009-03":"refusal","AN-DAZEDID-009-04":"compare",
 "AN-DAZEDID-009-05":"flow","AN-DAZEDID-009-06":"map","AN-DAZEDID-009-07":"fork",
 "AN-MAGMEDIA-008-01":"compare","AN-MAGMEDIA-008-02":"map","AN-MAGMEDIA-008-03":"map","AN-MAGMEDIA-008-04":"timeline",
 "AN-MAGMEDIA-008-05":"object","AN-MAGMEDIA-008-06":"map","AN-MAGMEDIA-008-07":"compare",
 "AN-BRANDMEDIA-007-01":"map","AN-BRANDMEDIA-007-02":"timeline","AN-BRANDMEDIA-007-03":"series","AN-BRANDMEDIA-007-04":"series",
 "AN-BRANDMEDIA-007-05":"flow","AN-BRANDMEDIA-007-06":"compare","AN-BRANDMEDIA-007-07":"fork",
}

for art, spec in INLINE_SPEC.items():
    for code, (ten,tcap,len_labels,tr,rcap,rl_labels) in spec.items():
        kind = slot_kind[code]
        en_svg = gen_inline(art, code, ten, tcap, len_labels, kind, "en")
        save(art,"en",code,en_svg)
        ru_svg = gen_inline(art, code, tr, rcap, rl_labels, kind, "ru")
        save(art,"ru",code,ru_svg)
        print("inline ok", art, code)

print("ALL MEDIA GENERATED")
