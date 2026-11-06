/* 商品与品类数据（纯前端静态数据，无需接口） */
window.JL_CATEGORIES = [
  { id: 'yunjin',   name: '云锦织造', en: 'YUNJIN BROCADE' },
  { id: 'zheshan',  name: '金陵折扇', en: 'FOLDING FAN' },
  { id: 'yuhuashi', name: '雨花石',   en: 'RAIN FLOWER STONE' },
  { id: 'dengcai',  name: '秦淮灯彩', en: 'QINHUAI LANTERN' },
  { id: 'chengyuan', name: '城垣生活', en: 'CITY WALL LIVING' }
];

window.JL_PRODUCTS = [
  {
    id: 'p01',
    name: '缠枝莲纹 · 云锦真丝方巾',
    en: 'LOTUS TRELLIS SILK SQUARE',
    cat: 'yunjin',
    catName: '云锦织造',
    price: 399,
    oldPrice: 468,
    badge: '非遗织造',
    badgeStyle: 'red',
    sold: 326,
    rating: 4.9,
    img: 'assets/img/p-01.svg',
    gallery: ['assets/img/p-01.svg', 'assets/img/story-01.svg', 'assets/img/p-02.svg'],
    short: '90 × 90cm 桑蚕丝，缠枝莲纹取意“生生不息”。',
    desc: '以南京云锦“通经断纬”技法织就缠枝莲纹，配色取城墙灰与云锦红。真丝 12 姆米，四边手工卷边，可作颈巾、包头巾或包饰。',
    story: '云锦织造需大花楼织机与两名织工配合，日织五厘米。缠枝莲纹自六朝器物流转至今，寓意连绵不断，是金陵最温柔的一句祝福。',
    material: '100% 桑蚕丝（12 姆米）',
    size: '90 × 90 cm',
    craft: '云锦通经断纬 · 手工卷边',
    tags: ['真丝', '非遗', '礼盒装'],
    specs: [
      { label: '纹样', options: ['缠枝莲 · 朱砂红', '缠枝莲 · 黛青'] },
      { label: '包装', options: ['非遗礼盒', '简易纸封'] }
    ]
  },
  {
    id: 'p02',
    name: '秦淮八景 · 金陵折扇',
    en: 'QINHUAI EIGHT VIEWS FAN',
    cat: 'zheshan',
    catName: '金陵折扇',
    price: 168,
    oldPrice: 198,
    badge: '手绘扇面',
    badgeStyle: 'gold',
    sold: 512,
    rating: 4.8,
    img: 'assets/img/p-02.svg',
    gallery: ['assets/img/p-02.svg', 'assets/img/story-03.svg', 'assets/img/p-07.svg'],
    short: '宣纸扇面手绘秦淮水岸，竹骨 16 档。',
    desc: '扇面以淡墨写秦淮水岸、画舫灯影，竹骨选用安吉毛竹，水磨抛光，开合顺滑。配锦盒与扇袋，可题字赠人。',
    story: '金陵折扇兴盛于明清，夫子庙一带曾“扇庄林立”。一把扇子，收起来是秦淮河的一线水，展开是整座南京的夏天。',
    material: '宣纸扇面 · 毛竹扇骨',
    size: '展开 52 cm · 合拢 28 cm',
    craft: '手工绘扇 · 水磨竹骨',
    tags: ['手绘', '可题字', '锦盒'],
    specs: [
      { label: '扇面', options: ['秦淮水岸', '明城墙远眺'] },
      { label: '配件', options: ['锦盒 + 扇袋', '仅扇袋'] }
    ]
  },
  {
    id: 'p03',
    name: '缠丝玛瑙 · 雨花石耳坠',
    en: 'AGATE DROP EARRINGS',
    cat: 'yuhuashi',
    catName: '雨花石',
    price: 129,
    oldPrice: 0,
    badge: '天然纹理',
    badgeStyle: '',
    sold: 208,
    rating: 4.7,
    img: 'assets/img/p-03.svg',
    gallery: ['assets/img/p-03.svg', 'assets/img/p-08.svg', 'assets/img/p-05.svg'],
    short: '每一颗雨花石纹理独一无二，925 银镀金耳钩。',
    desc: '取雨花石中的缠丝玛瑙切片，保留天然水纹与色带，双面打磨至镜面。925 银镀 18K 金耳钩，轻巧不坠耳。',
    story: '雨花石生于长江，经亿万年水流打磨成形。南京人把它养在清水里，看纹路如山水——“石中藏着一座金陵”。',
    material: '天然缠丝玛瑙 · 925 银镀金',
    size: '坠身约 2.6 × 2.2 cm',
    craft: '手工切片 · 双面抛光',
    tags: ['天然石材', '一对装', '轻巧'],
    specs: [
      { label: '耳钩', options: ['925 银镀金', '925 银本色'] },
      { label: '包装', options: ['绒布首饰盒', '礼袋'] }
    ]
  },
  {
    id: 'p04',
    name: '秦淮灯彩 · 荷花灯',
    en: 'LOTUS LANTERN',
    cat: 'dengcai',
    catName: '秦淮灯彩',
    price: 88,
    oldPrice: 108,
    badge: '手工扎制',
    badgeStyle: 'red',
    sold: 641,
    rating: 4.9,
    img: 'assets/img/p-04.svg',
    gallery: ['assets/img/p-04.svg', 'assets/img/story-02.svg', 'assets/img/p-08.svg'],
    short: '竹篾扎骨、绢面裱糊，内置暖光 LED。',
    desc: '老艺人以竹篾扎骨、绢布裱糊，花瓣层叠十一瓣，取“和和美美”之意。内置 USB 充电暖光 LED，可作夜灯与节庆摆件。',
    story: '秦淮灯会始于南朝，盛于明清，“灯火甲天下”。荷花灯是最经典的一盏——放一盏在秦淮河，许一个平安愿。',
    material: '竹篾骨架 · 真丝绢面 · LED 灯芯',
    size: '直径约 26 cm · 高 20 cm',
    craft: '手工扎制 · 绢面裱糊',
    tags: ['手工', '可充电', '节庆'],
    specs: [
      { label: '花色', options: ['朱砂红', '藕荷粉'] },
      { label: '光源', options: ['USB 充电暖光', '电池款'] }
    ]
  },
  {
    id: 'p05',
    name: '明城墙砖纹 · 杯垫四件套',
    en: 'CITY WALL COASTERS',
    cat: 'chengyuan',
    catName: '城垣生活',
    price: 59,
    oldPrice: 79,
    badge: '城墙同款',
    badgeStyle: '',
    sold: 890,
    rating: 4.8,
    img: 'assets/img/p-05.svg',
    gallery: ['assets/img/p-05.svg', 'assets/img/story-01.svg', 'assets/img/p-07.svg'],
    short: '取明城墙砖铭文“金陵造物”，软木底防滑。',
    desc: '四片杯垫以明城墙砖为原型，砖纹压印“金陵造物”四字，表面哑光釉面，背面软木防滑。附赠收纳纸盒。',
    story: '南京明城墙现存 25.1 公里，城砖上多刻有烧制地、窑户与工匠姓名——六百年前的“质量追溯”，如今成了杯垫上的四个字。',
    material: '陶瓷釉面 · 软木底',
    size: '10 × 10 cm · 厚 0.9 cm',
    craft: '压印砖纹 · 哑光釉',
    tags: ['四件套', '防滑', '伴手礼'],
    specs: [
      { label: '配色', options: ['城墙灰', '宣纸白'] },
      { label: '数量', options: ['四件套', '两件套'] }
    ]
  },
  {
    id: 'p06',
    name: '金陵盐水鸭 · 帆布袋',
    en: 'SALTED DUCK TOTE',
    cat: 'chengyuan',
    catName: '城垣生活',
    price: 49,
    oldPrice: 0,
    badge: '本地梗',
    badgeStyle: 'gold',
    sold: 1204,
    rating: 4.6,
    img: 'assets/img/p-06.svg',
    gallery: ['assets/img/p-06.svg', 'assets/img/p-05.svg', 'assets/img/p-07.svg'],
    short: '12 安纯棉帆布，一只很南京的鸭子。',
    desc: '12 安加厚纯棉帆布，内置暗袋，可装 14 寸笔记本。正面印盐水鸭线稿——南京人一看就懂。',
    story: '“没有一只鸭子能游过长江。”盐水鸭是南京的日常，也是这座城最接地气的幽默。把它印在包上，出门就是同乡暗号。',
    material: '12 安纯棉帆布',
    size: '38 × 40 cm · 提手 28 cm',
    craft: '丝网印刷 · 车缝加固',
    tags: ['纯棉', '暗袋', '大容量'],
    specs: [
      { label: '颜色', options: ['本白', '城墙灰'] },
      { label: '印刷', options: ['单面', '双面'] }
    ]
  },
  {
    id: 'p07',
    name: '金陵十二钗 · 黄铜书签',
    en: 'BRASS BOOKMARKS',
    cat: 'chengyuan',
    catName: '城垣生活',
    price: 39,
    oldPrice: 49,
    badge: '镂空工艺',
    badgeStyle: '',
    sold: 733,
    rating: 4.7,
    img: 'assets/img/p-07.svg',
    gallery: ['assets/img/p-07.svg', 'assets/img/story-03.svg', 'assets/img/p-01.svg'],
    short: '黄铜镂空窗棂纹，配流苏，三枚一组。',
    desc: '黄铜蚀刻镂空，纹样取自甘熙宅第的窗棂与门罩，边缘手工打磨。配朱红流苏，三枚一组，附说明卡。',
    story: '金陵是《红楼梦》的底色。书签上的窗棂，是旧时宅院看出去的一角天光；夹在书里，也算留住一段金陵旧梦。',
    material: '黄铜 · 涤纶流苏',
    size: '14.5 × 4.2 cm',
    craft: '蚀刻镂空 · 手工打磨',
    tags: ['黄铜', '三枚装', '书礼'],
    specs: [
      { label: '纹样', options: ['窗棂', '门罩', '瓦当'] },
      { label: '流苏', options: ['朱红', '黛青'] }
    ]
  },
  {
    id: 'p08',
    name: '六朝瓦当 · 香插',
    en: 'TILE INCENSE HOLDER',
    cat: 'chengyuan',
    catName: '城垣生活',
    price: 119,
    oldPrice: 0,
    badge: '陶土手作',
    badgeStyle: 'red',
    sold: 187,
    rating: 4.8,
    img: 'assets/img/p-08.svg',
    gallery: ['assets/img/p-08.svg', 'assets/img/story-02.svg', 'assets/img/p-05.svg'],
    short: '六朝瓦当云纹复刻，粗陶质感，附线香。',
    desc: '以六朝瓦当云纹为原型翻模，粗陶素烧，吸水透气。中心插孔适配 2mm 线香，附赠沉香线香十支。',
    story: '瓦当是屋檐最前端的一片瓦，六朝人把云纹、莲花纹压在瓦上，替屋子接住千年的雨。如今它接住一缕烟。',
    material: '粗陶素烧',
    size: '直径 12 cm · 高 2.4 cm',
    craft: '翻模 · 手工修坯 · 素烧',
    tags: ['粗陶', '含线香', '禅意'],
    specs: [
      { label: '釉色', options: ['素坯', '青灰釉'] },
      { label: '线香', options: ['沉香 10 支', '不加香'] }
    ]
  }
];

window.JL_FIND = function (id) {
  return (window.JL_PRODUCTS || []).find(function (p) { return p.id === id; }) || null;
};
