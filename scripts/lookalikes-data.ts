import type { Lookalike } from './types';

/**
 * 誤同定を防ぐための「似ている在来種との判別ポイント」データ。
 * すべて環境省「特定外来生物 同定マニュアル」（分類群別PDF）および
 * 環境省ヒアリ特設サイトに実際に記載されている内容のみを転記している。
 * NIES/env.go.jp のスクレイピングでは取得できない情報のため、
 * このファイルで手動管理し、build-data.ts が species.json にマージする。
 *
 * 出典に「在来種」と明記されている比較のみを採録。他の外来種・未判定外来生物との
 * 判別記述は対象外（誤って「在来種」として扱わないため）。
 */

const MANUAL = {
  mammal: 'https://www.env.go.jp/nature/intro/2outline/manual/1hp_honyurui.pdf',
  bird: 'https://www.env.go.jp/nature/intro/2outline/manual/2hp_chorui.pdf',
  reptile:
    'https://www.env.go.jp/nature/intro/2outline/manual/3hp_hachurui.pdf',
  amphibian:
    'https://www.env.go.jp/nature/intro/2outline/manual/4hp_ryoseirui.pdf',
  fish: 'https://www.env.go.jp/nature/intro/2outline/manual/5hp_gyorui.pdf',
  insect:
    'https://www.env.go.jp/nature/intro/2outline/manual/6hp_konchurui2.pdf',
  crustacean:
    'https://www.env.go.jp/nature/intro/2outline/manual/7hp_kokakurui.pdf',
  spider:
    'https://www.env.go.jp/nature/intro/2outline/manual/8hp_kumosasori.pdf',
  mollusk: 'https://www.env.go.jp/nature/intro/2outline/manual/9hp_nantai.pdf',
  plant:
    'https://www.env.go.jp/nature/intro/2outline/manual/10hp_shokubutsu.pdf',
} as const;

const HIARI_PAGE =
  'https://www.env.go.jp/nature/intro/2outline/attention/02_general/index.html';
const HIARI_KIIRO_PDF =
  'https://www.env.go.jp/nature/intro/2outline/attention/file/miwakekata_hiari_kiiro.pdf';

/** key: species.json の id */
export const LOOKALIKES: Record<string, Lookalike[]> = {
  // ===== 哺乳類 =====
  'macaca-cyclopis': [
    {
      nativeName: 'ニホンザル',
      nativeScientificName: 'Macaca fuscata',
      point:
        'ニホンザルはタイワンザルよりもやや大型で、尾が短く10cm程度。毛色は褐色から灰色。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'macaca-fascicularis': [
    {
      nativeName: 'ニホンザル',
      nativeScientificName: 'Macaca fuscata',
      point:
        'ニホンザルはカニクイザルよりも大型で、尾は短く10cm程度。毛色は褐色から灰色。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'macaca-mulatta': [
    {
      nativeName: 'ニホンザル',
      nativeScientificName: 'Macaca fuscata',
      point:
        '体の大きさはほぼ同じだが、尾の長さと毛色で見分けられる。ニホンザルはアカゲザルよりもやや大型で尾が短く10cm程度、毛色は褐色から灰色。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'macaca-cyclopis-m-fuscata': [
    {
      nativeName: 'ニホンザル',
      nativeScientificName: 'Macaca fuscata',
      point:
        'タイワンザルの相対尾長は体長の約80%、ニホンザルは約15%。交雑個体は両親のおおよそ中間の長さの尾を持つ傾向がある。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'macaca-mulatta-m-fuscata': [
    {
      nativeName: 'ニホンザル',
      nativeScientificName: 'Macaca fuscata',
      point:
        'アカゲザルとニホンザルの交雑個体はニホンザルより尾が長く、下半身の黄色味（赤み）が強い。ニホンザルの座高に対する尾長の割合は約15%。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'callosciurus-erythraeus': [
    {
      nativeName: 'ニホンリス（亜種エゾリスを含む）',
      nativeScientificName: 'Sciurus lis',
      point:
        'ニホンリスの腹部は夏毛・冬毛とも白色で、冬毛になると耳先に毛が生え先端が尖って見える。クリハラリスは全体的に黒っぽい個体が多い。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'callosciurus-finlaysonii': [
    {
      nativeName: 'ニホンリス（亜種エゾリスを含む）',
      nativeScientificName: 'Sciurus lis',
      point:
        'ニホンリスの腹部は夏毛・冬毛とも白色で、冬毛になると耳先に毛が生え先端が尖って見える。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'pteromys-volans': [
    {
      nativeName: 'ニホンモモンガ（亜種エゾモモンガを含む）',
      point:
        'ニホンモモンガは乳頭が5対（タイリクモモンガは4対）。ただし亜種エゾモモンガは外見からの識別が困難とされる。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'sciurus-carolinensis': [
    {
      nativeName: 'ニホンリス（亜種エゾリスを含む）',
      point:
        'ニホンリスは頭胴長16～22cm、体重250～300gでトウブハイイロリスより小型。冬毛になると耳先に毛が生え先端が尖って見える。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'sciurus-vulgaris': [
    {
      nativeName: 'ニホンリス（亜種エゾリスを含む）',
      point:
        'ニホンリスは頭胴長16～22cm、体重250～300gでキタリスよりやや小型。尾の毛先が淡色で白色に近い。ただし亜種エゾリスは外見からの識別が困難とされる。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'procyon-lotor': [
    {
      nativeName: 'タヌキ',
      point:
        '前肢から肩にかけて黒い帯がある。四肢は黒色。指は4本でイヌに似ている。',
      sourceUrl: MANUAL.mammal,
    },
    {
      nativeName: 'アナグマ',
      point:
        '四肢は短く褐色か黒色。耳は小さく先端が丸い。鼻が大きい。指は5本で湾曲した長い爪がある。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'mustela-vison': [
    {
      nativeName: 'テン（クロテン）',
      point: '体重が1.1～1.5kgとやや大型。前臼歯は4/4（アメリカミンクは3/3）。',
      sourceUrl: MANUAL.mammal,
    },
    {
      nativeName: 'ニホンイタチ',
      point:
        '頭胴長は雄27～37cm、雌16～25cmでアメリカミンクよりも小型。鼻から顎、首にかけて白い斑がある。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'herpestes-auropunctatus': [
    {
      nativeName: 'テン',
      point: '体重は1kgを超え、フイリマングース（1kg未満）より明らかに大きい。',
      sourceUrl: MANUAL.mammal,
    },
    {
      nativeName: 'ニホンイタチ',
      point: '耳介は目より上に位置する。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'herpestes-javanicus': [
    {
      nativeName: 'テン',
      point: '体重は1kgを超え、ジャワマングース（1kg未満）より明らかに大きい。',
      sourceUrl: MANUAL.mammal,
    },
    {
      nativeName: 'ニホンイタチ',
      point: '耳介は目より上に位置する。',
      sourceUrl: MANUAL.mammal,
    },
  ],
  'muntiacus-reevesi': [
    {
      nativeName: 'ニホンジカ',
      nativeScientificName: 'Cervus nippon',
      point:
        'キョンの雄成獣は肩までの高さ50～60cm、体重12～14kg程度で、ニホンジカの雌成獣（肩までの高さ60～110cm、体重20～80kg）よりかなり小さい。額の黒い模様や、オスの短い角と発達した上顎犬歯からも見分けられる。',
      sourceUrl: MANUAL.mammal,
    },
  ],

  // ===== 鳥類 =====
  'branta-canadensis': [
    {
      nativeName: 'シジュウカラガン',
      point:
        'シジュウカラガンはカナダガンより小型で、嘴や首が短く、首の付け根に白色のリング模様がある（カナダガンにはこのリングがない）。',
      sourceUrl: MANUAL.bird,
    },
  ],
  'garrulax-perspicillatus': [
    {
      nativeName: 'アカハラ',
      point:
        '胸から腹が茶褐色。ただし顔全体が黒い亜種オオアカハラとの誤認には注意が必要。',
      sourceUrl: MANUAL.bird,
    },
    {
      nativeName: 'シロハラ',
      point:
        '茶褐色の部分や顔の黒色はないが、頭部や背面が灰褐色でカオグロガビチョウと似る。',
      sourceUrl: MANUAL.bird,
    },
    {
      nativeName: 'ヒヨドリ',
      point: '大きさや頭部・背面の色彩が似るが、顔は赤褐色の斑紋。',
      sourceUrl: MANUAL.bird,
    },
  ],
  'leiothrix-lutea': [
    {
      nativeName: 'メジロ',
      point:
        '頭部・喉の色彩はソウシチョウと同じだが、嘴は黒色で尾羽はM字形（叉状）ではない。',
      sourceUrl: MANUAL.bird,
    },
    {
      nativeName: 'カワラヒワ',
      point:
        '翼の黄色斑とM字形の尾がソウシチョウと似るが、嘴は淡い肉色で太く短い。',
      sourceUrl: MANUAL.bird,
    },
  ],

  // ===== 爬虫類 =====
  'trachemys-scripta': [
    {
      nativeName: 'ニホンイシガメ等',
      point:
        '黒化したアカミミガメの雄はニホンイシガメ等に間違われることがあるが、アカミミガメの雄成体は前足の爪が細長く伸びる点で見分けられる。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'mauremys-mutica': [
    {
      nativeName: 'クサガメ',
      point: 'クサガメは頸に黄色い模様があるが、ハナガメより太くて不規則。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'mauremys-sinensis-m-japonica': [
    {
      nativeName: 'ニホンイシガメ',
      point: 'ニホンイシガメは頸のしま模様がハナガメより太く、線の数が少ない。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'mauremys-sinensis-m-reevesii': [
    {
      nativeName: 'クサガメ',
      point:
        '交雑個体はクサガメに似て黒っぽいが不明瞭な斑紋があり、頸のしま模様が粗い。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'japalura-swinhonis': [
    {
      nativeName: 'オキナワキノボリトカゲ・サキシマキノボリトカゲ',
      point:
        '在来種は体が緑色がかることが多く、喉に白斑がなく口の中は淡黄色。本種は喉に白斑があり、体に緑色味がなく、口の中（口蓋）が黒い。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'boiga-irregularis': [
    {
      nativeName: 'イワサキセダカヘビ',
      point:
        'イワサキセダカヘビにはのどの縦の溝がなく、頭部と首の区別も明瞭ではない。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'elaphe-taeniura-friesi': [
    {
      nativeName: 'サキシマスジオ',
      point:
        'サキシマスジオは全体的に茶色味が濃く、斑紋は淡くて黒くならずぼやける。舌は赤く縁取られる。',
      sourceUrl: MANUAL.reptile,
    },
  ],
  'protobothrops-mucrosquamatus': [
    {
      nativeName: 'サキシマハブ',
      point:
        'サキシマハブはより太短い体型で色彩の変異が大きい。腹側の幅広い鱗が182～192枚、胴体中央部の鱗列も23～25列と、タイワンハブよりやや少ない。',
      sourceUrl: MANUAL.reptile,
    },
  ],

  // ===== 両生類 =====
  'bufo-marinus': [
    {
      nativeName: 'ニホンヒキガエル・ミヤコヒキガエル',
      point:
        '在来のニホンヒキガエルやミヤコヒキガエルにやや似ているが、耳腺（目の後ろの毒を出す器官）が極端に大型で菱形をしている点で区別できる。',
      sourceUrl: MANUAL.amphibian,
    },
  ],
  'bufo-melanostictus': [
    {
      nativeName: 'アズマヒキガエル・ミヤコヒキガエル',
      point:
        '日本産のヒキガエルには、眼の周囲から吻端に至る黒い縁取りがない。ヘリグロヒキガエルは眼の周囲から吻端、上唇にかけて黒い隆条で縁取られ、背面のイボの先端も黒く着色する。',
      sourceUrl: MANUAL.amphibian,
    },
  ],
  'bufo-regularis': [
    {
      nativeName: 'アズマヒキガエル・ミヤコヒキガエル',
      point:
        '日本産のヒキガエルには、頭頂部の十字形模様や眼上の横線がない。アフリカヒキガエルは頭頂部に十字形の明色模様があり、眼上に顕著な褐色横線、背面正中線に細い矢状帯がある。',
      sourceUrl: MANUAL.amphibian,
    },
  ],
  'kaloula-pulchra': [
    {
      nativeName: 'ヒメアマガエル',
      point:
        '在来種のヒメアマガエルはやや似ているが、はるかに小型で頭部が小さく、指先に吸盤がない（本種は指先に吸盤がある）。奄美以南の森林や水田で普通に見られる。',
      sourceUrl: MANUAL.amphibian,
    },
  ],
  andrias: [
    {
      nativeName: 'オオサンショウウオ（在来種・特別天然記念物）',
      nativeScientificName: 'Andrias japonicus',
      point:
        '交雑個体は褐色の地色に黒い斑紋と下地より淡色の斑紋を持つ（在来オオサンショウウオは褐色・黄色の地色に黒色の斑紋のみ）。頭部背面のイボは交雑個体・チュウゴクオオサンショウウオで小さく対になるものが多いが、在来種は大きく対にならない（Hara et al. 2023, Zootaxa 5369:42-56）。ただし交雑が進むにつれ外見での判別は難しくなり、確実な判別には遺伝子検査が必要。在来種は特別天然記念物・国際希少野生動植物種のため取り扱いに注意。',
      sourceUrl: MANUAL.amphibian,
    },
  ],

  // ===== 魚類 =====
  'tachysurus-fulvidraco': [
    {
      nativeName: 'ギギ・ギバチ・アリアケギバチ・ネコギギ',
      point:
        '在来のギギ科魚類とは体色、尾鰭の切れ込みの程度、胸鰭棘前縁の鋸歯構造で識別可能。ギバチは尾鰭の切れ込みが浅く、ギギは胸鰭棘の鋸歯がコウライギギほど大きくなく全面に密生しない。',
      sourceUrl: MANUAL.fish,
    },
  ],
  'silurus-glanis': [
    {
      nativeName: 'ナマズ・イワトコナマズ・ビワコオオナマズ',
      point:
        '下顎の口ひげが2対あるのに対し、日本のナマズ類は1対のみ。ただし国内種も体長数cm程度の幼魚期には下顎に2対のヒゲがあるため注意が必要。',
      sourceUrl: MANUAL.fish,
    },
  ],
  'gambusia-affinis': [
    {
      nativeName: 'メダカ',
      point:
        'メダカを正面や上から見ると背中に1本の黒い線が見える点で識別できる。体色や鰭の位置にも注目すると比較的容易に識別できる。',
      sourceUrl: MANUAL.fish,
    },
  ],
  'gambusia-holbrooki': [
    {
      nativeName: 'メダカ',
      point:
        'メダカは雌雄とも臀鰭基底がより長く、尾鰭の後縁が角張ることで識別できる。',
      sourceUrl: MANUAL.fish,
    },
  ],

  // ===== 昆虫類 =====
  'hestina-assimillis': [
    {
      nativeName: 'ゴマダラチョウ',
      point: 'ゴマダラチョウは後翅に赤色斑がないことで区別できる。',
      sourceUrl: MANUAL.insect,
    },
  ],
  'anoplophora-glabripennis': [
    {
      nativeName: 'ゴマダラカミキリ等の在来近縁種',
      point:
        '前胸の白斑の有無、小盾板の白色部の有無、上翅つけ根の顆粒状突起の有無で在来種と区別できる（在来種は前胸に白斑がない等）。',
      sourceUrl: MANUAL.insect,
    },
  ],
  'apriona-swainsoni': [
    {
      nativeName: 'クワカミキリ等の在来近縁種',
      point:
        'サビイロクワカミキリは背面に霜降り状の白く細かい斑紋があるが、在来のクワカミキリにはこの斑紋がない。',
      sourceUrl: MANUAL.insect,
    },
  ],
  'aromia-bungii': [
    {
      nativeName: 'ジャコウカミキリ',
      point:
        '前胸部が赤色で体型も似るが、ジャコウカミキリは全体的な体色が黒みを帯びず青～緑青色をしている点で識別できる（北海道のみに分布）。',
      sourceUrl: MANUAL.insect,
    },
  ],
  'bombus-terrestris': [
    {
      nativeName: 'オオマルハナバチ',
      point: '在来のオオマルハナバチは黄色と黒の縞模様に橙色が混じる。',
      sourceUrl: MANUAL.insect,
    },
    {
      nativeName: 'ノサップマルハナバチ',
      point:
        '働きバチの腹部末端が白くなる点が似るが、ノサップマルハナバチは第6節のみが白く、セイヨウオオマルハナバチは第5・6節が白い点で区別できる。',
      sourceUrl: MANUAL.insect,
    },
  ],
  'vespa-v-velutina': [
    {
      nativeName: 'キイロスズメバチ・コガタスズメバチ',
      point: '頭部の地色が黄色～黄褐色で、腹部は黄色と褐色の縞のように見える。',
      sourceUrl: MANUAL.insect,
    },
    {
      nativeName: 'ヒメスズメバチ',
      point: '腹部の前部が赤褐色を呈す個体もいるが、その場合も腹部末端は褐色。',
      sourceUrl: MANUAL.insect,
    },
    {
      nativeName: 'チャイロスズメバチ',
      point: '頭部と胸部は赤褐色で、腹部は一様に黒褐色。',
      sourceUrl: MANUAL.insect,
    },
    {
      nativeName: 'クロスズメバチ類・アシナガバチ類（フタモンアシナガバチ等）',
      point:
        'ツマアカスズメバチに比べ体サイズが小さく（2cm以下）、体型も細い。',
      sourceUrl: MANUAL.insect,
    },
  ],
  'solenopsis-2': [
    {
      nativeName: 'キイロシリアゲアリ（女王）',
      point:
        'ヒアリの女王は腹柄節・後腹柄節がともに急峻な山のように上方に突出し、後腹柄節が腹部の下方に接続、頭部・胸部が濃赤褐色。キイロシリアゲアリの女王は平らで腹柄節の突出が弱く、後腹柄節は腹部の上方に接続、頭部・胸部が黄色（環境省外来生物対策室 H29.10資料より）。9月頃に営巣のため飛び出すオレンジ色の女王アリで、ヒアリとの問い合わせが特に多い種。',
      sourceUrl: HIARI_KIIRO_PDF,
    },
    {
      nativeName: 'アリグモ類（アリグモ・ヤガタアリグモ等）',
      point:
        '体長5～7mmの小型のクモ。脚は8本だが前脚を触角に似せているため、見慣れないアリと誤認されやすい（クモの一種でアリではない）。',
      sourceUrl: HIARI_PAGE,
    },
  ],

  // ===== 甲殻類 =====
  'dikerogammarus-villosus': [
    {
      nativeName: '国内の淡水産ヨコエビ類',
      point:
        '国内には同属の在来種はいない。国内のヨコエビ類と比べてかなり大型になる。尾節背面に円錐状の突起を持つが、トゲ状の突起を持つ個体は在来種にも存在するため注意が必要。',
      sourceUrl: MANUAL.crustacean,
    },
  ],
  'pacifastacus-leniusculus': [
    {
      nativeName: 'ニホンザリガニ',
      nativeScientificName: 'Cambaroides japonicus',
      point:
        'ニホンザリガニは額角が短く幅広で、額角の後ろに棘がない。ウチダザリガニは額角が細長く幅が狭く、額角の後ろに棘がある。',
      sourceUrl: MANUAL.crustacean,
    },
  ],
  'species-128': [
    {
      nativeName: 'ニホンザリガニ',
      nativeScientificName: 'Cambaroides japonicus',
      point:
        'ニホンザリガニは額角が短く幅広で、額角の後ろに棘がない。ミステリークレイフィッシュは額角が細長く幅が狭く、額角の後ろに棘がある。',
      sourceUrl: MANUAL.crustacean,
    },
  ],

  // ===== クモ・サソリ類 =====
  atrax: [
    {
      nativeName:
        'オオクロケブカジョウゴグモ・ヤエヤマジョウゴグモ・アマミジョウゴグモ',
      point:
        '日本にも在来のジョウゴグモ科（オオクロケブカジョウゴグモ・ヤエヤマジョウゴグモは石垣島・西表島に、アマミジョウゴグモは奄美大島・徳之島に分布）がおり、外見が似る。明確な形態的識別点は乏しく、確実な区別には専門家による同定が必要とされている。',
      sourceUrl: MANUAL.spider,
    },
  ],
  hadronyche: [
    {
      nativeName:
        'オオクロケブカジョウゴグモ・ヤエヤマジョウゴグモ・アマミジョウゴグモ',
      point:
        '日本にも在来のジョウゴグモ科（オオクロケブカジョウゴグモ・ヤエヤマジョウゴグモは石垣島・西表島に、アマミジョウゴグモは奄美大島・徳之島に分布）がおり、外見が似る。明確な形態的識別点は乏しく、確実な区別には専門家による同定が必要とされている。',
      sourceUrl: MANUAL.spider,
    },
  ],
  'latrodectus-geometricus': [
    {
      nativeName: 'ムナグロヒメグモ・アシブトヒメグモ',
      point:
        '背面の斑紋が似た在来のヒメグモ科種がいるが、これらは腹面に斑紋がないことで区別できる。',
      sourceUrl: MANUAL.spider,
    },
  ],
  'latrodectus-hasseltii': [
    {
      nativeName: 'ムナグロヒメグモ・アシブトヒメグモ',
      point:
        '背面の斑紋が似た在来のヒメグモ科種がいるが、これらは腹面に斑紋がないことで区別できる。',
      sourceUrl: MANUAL.spider,
    },
  ],
  'latrodectus-mactans': [
    {
      nativeName: 'ムナグロヒメグモ・アシブトヒメグモ',
      point:
        '背面の斑紋が似た在来のヒメグモ科種がいるが、これらは腹面に斑紋がないことで区別できる。',
      sourceUrl: MANUAL.spider,
    },
  ],
  latrodectus: [
    {
      nativeName: 'ムナグロヒメグモ・アシブトヒメグモ',
      point:
        '背面の斑紋が似た在来のヒメグモ科種がいるが、これらは腹面に斑紋がないことで区別できる。',
      sourceUrl: MANUAL.spider,
    },
  ],

  // ===== 軟体動物等 =====
  'dreissena-polymorpha': [
    {
      nativeName: 'ホトトギスガイ',
      point:
        '国内の海域には殻の模様がよく似たホトトギスガイが生息しているが、これは在来種である。',
      sourceUrl: MANUAL.mollusk,
    },
  ],
  'dreissena-bugensis': [
    {
      nativeName: 'ホトトギスガイ',
      point:
        '国内の海域には殻の模様がよく似たホトトギスガイが生息しているが、これは在来種である。',
      sourceUrl: MANUAL.mollusk,
    },
  ],

  // ===== 植物 =====
  'alternanthera-philoxeroides': [
    {
      nativeName: 'タカサブロウ',
      point:
        'ナガエツルノゲイトウにやや似た白い頭状花をつけるが、鋸歯が不明瞭（ナガエツルノゲイトウは鋸歯が細かく全縁に見える）。',
      sourceUrl: MANUAL.plant,
    },
    {
      nativeName: 'スベリヒユ',
      point: '花は黄色で5枚の花弁を持ち、葉に鋸歯はなく多肉質の長楕円形。',
      sourceUrl: MANUAL.plant,
    },
  ],
  'hydrocotyle-ranunculoides': [
    {
      nativeName:
        'オオチドメ・チドメグサ・ヒメチドメ・ノチドメ・オオバチドメ・ツボクサ',
      point:
        '在来のチドメグサ属（6種、いずれも陸生）は花柄が葉柄より長く花序が葉より上に出ず、葉柄も太くない。ブラジルチドメグサは花柄が葉柄より短く花序が葉より上に出ず、葉柄が太い多肉質。',
      sourceUrl: MANUAL.plant,
    },
  ],
  'azolla-cristata': [
    {
      nativeName: 'オオアカウキクサ・アカウキクサ・サンショウモ',
      point:
        '在来のオオアカウキクサとは、葉表面のいぼ状突起が2～3個の細胞からなることと根に根毛があることで判別可能だが、肉眼での識別は困難とされる。',
      sourceUrl: MANUAL.plant,
    },
  ],
  'senecio-madagascariensis': [
    {
      nativeName:
        'サワギク・サワオグルマ・ハンゴンソウ・エゾオグルマ・コウリンカ等（約10種）',
      point:
        '生育環境や花・葉の形状で区別できる（例：ハンゴンソウは山地の湿った草原に生育し、葉が羽状に深く裂ける）。',
      sourceUrl: MANUAL.plant,
    },
  ],
  'sicyos-angulatus': [
    {
      nativeName: 'カラスウリ',
      point:
        '果実に刺がなく、長さ5～7cmで赤く熟す（アレチウリの果実には刺がある）。',
      sourceUrl: MANUAL.plant,
    },
    {
      nativeName: 'クズ',
      point:
        '果実に刺がなく、莢に入っている。河原などでアレチウリと混生していることがある。',
      sourceUrl: MANUAL.plant,
    },
  ],
  'myriophyllum-aquaticum': [
    {
      nativeName: 'ホザキノフサモ・フサモ・オグラノフサモ・タチモ・キクモ',
      point:
        '日本には在来のフサモ属4種（タチモ・ホザキノフサモ・フサモ・オグラノフサモ）が生育する。似たキクモは羽状葉が4～10（時に12）輪生し、気中葉の羽片が幅広く水中葉の羽片はさらに分かれる点で区別できる。',
      sourceUrl: MANUAL.plant,
    },
  ],
  'veronica-anagallis-aquatica': [
    {
      nativeName: 'カワヂシャ',
      nativeScientificName: 'Veronica undulata',
      point:
        'カワヂシャは花がより白く直径3～4mmと小さく、葉の鋸歯が目立つ（オオカワヂシャは花が淡い紫色または白色で直径5mm程度）。両種は交雑して雑種ホナガカワヂシャ（V.×myriantha）を形成し、発芽能力のある種子を作るため遺伝的攪乱のおそれがある。希少な在来種カワヂシャとの競合・駆逐も課題となっている。',
      sourceUrl: MANUAL.plant,
    },
  ],
};
