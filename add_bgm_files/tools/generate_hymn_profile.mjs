import fs from "node:fs/promises";
import path from "node:path";

const albums = [
  {
    album: "主是磐石 Unshakable Faith",
    prefix: "A1",
    tracks: [
      ["永恒的颂赞", "Timeless Tribute"],
      ["圣灵之歌", "Spirit Song"],
      ["我曾舍命为你", "I Gave My Life for Thee"],
      ["主你真美好", "O Lord, You're Beautiful"],
      ["真神之爱", "Wondrous Love"],
      ["向耶稣倾听", "I Must Tell Jesus"],
      ["我时刻需要你", "I Need Thee Every Hour"],
      ["我心灵得安宁", "Be Still, My Soul"],
      ["亲爱主，牵我手", "In His Hand"],
      ["归家", "Softly and Tenderly"],
      ["主必看顾", "Does Jesus Care?"],
      ["主领我们前行", "God Leads Us Along"],
      ["祂既看顾麻雀", "His Eye Is on the Sparrow"],
      ["如鹿切慕溪水", "As the Deer"],
      ["祷祈良辰", "Sweet Hour of Prayer"],
      ["主祷文", "Lord's Prayer"],
      ["主是磐石", "Unshakable Faith"],
      ["基督精兵前进", "Onward, Christian Soldiers"],
      ["唱哈利路亚", "Sing Hallelujah"],
      ["坚固保障", "A Mighty Fortress"],
    ],
  },
  {
    album: "主啊我赞美你 Lord, I Praise You",
    prefix: "A2",
    tracks: [
      ["你是我万有", "You Are My All in All"],
      ["啊圣哉上主", "O Lord Most Holy"],
      ["向主欢呼", "Shout to the Lord"],
      ["十字架，十字架", "Near the Cross"],
      ["奇异恩典", "Amazing Grace"],
      ["祂活着", "He Lives"],
      ["主啊我赞美你", "Lord, I Praise You"],
      ["感恩的泪", "Thankful Tears"],
      ["最知心的朋友", "Best Friend"],
      ["主耶稣，我爱你", "My Jesus, I Love Thee"],
      ["如鹿渴慕溪水", "As the Deer"],
      ["哈利路亚", "Alleluia"],
      ["主祷文", "The Lord's Prayer"],
    ],
  },
  {
    album: "十字架的故事 Story of the Cross",
    prefix: "A3",
    tracks: [
      ["美哉主耶稣", "Fairest Lord Jesus"],
      ["荣耀与颂赞", "Glory and Praise Medley"],
      ["主十架下/古旧十架", "Beneath the Cross/Old Rugged Cross"],
      ["十字架，十字架", "Near the Cross"],
      ["奇妙十架", "When I Survey the Wondrous Cross"],
      ["当主为你钉十架", "Were You There"],
      ["我曾舍命为你/领我到髑髅地", "I Gave My Life for Thee / Lead Me to Calvary"],
      ["复活得胜主", "Thine Is the Glory"],
      ["宝血洗罪/宝血大能", "Washed in the Blood / Power in the Blood"],
      ["奇异恩典", "Amazing Grace"],
      ["耶稣恩友", "What a Friend We Have in Jesus"],
      ["主耶稣我爱你/爱主更深", "My Jesus, I Love Thee / More Love to Thee"],
    ],
  },
  {
    album: "圣诞故事 The Christmas Story",
    prefix: "A4",
    tracks: [
      ["夜间歌唱", "It Came Upon the Midnight Clear"],
      ["平安夜", "Silent Night"],
      ["普世欢腾", "Joy to the World"],
      ["噢圣善夜", "O Holy Night"],
      ["圣诞天使", "Christmas Angels"],
      ["马槽圣婴", "Away in a Manger"],
      ["奇妙圣婴", "What Child Is This"],
      ["小伯利恒", "O Little Town of Bethlehem"],
      ["传扬佳音歌", "Go Tell It on the Mountain"],
      ["朝拜新生王", "We Three Kings"],
      ["铃儿响叮当", "Jingle Bells"],
    ],
  },
  {
    album: "神圣羔羊 Divine Redeemer",
    prefix: "A5",
    tracks: [
      ["荣耀归于真神", "To God Be the Glory"],
      ["神爱世人", "God So Loved the World"],
      ["天使歌唱", "Angel We Have Heard on High"],
      ["平安夜", "Silent Night"],
      ["啊圣善夜", "O Holy Night"],
      ["小伯利恒", "Back to Bethlehem"],
      ["天使高歌", "Hark! The Herald Angels Sing"],
      ["尊贵的主", "Christmas Majesty"],
      ["圣城", "The Holy City"],
      ["古旧十架", "The Old Rugged Cross"],
      ["宝架清影", "Beneath the Cross of Jesus"],
      ["奇妙十架", "When I Survey the Wondrous Cross"],
      ["虔守主餐", "Let Us Break Bread Together"],
      ["神圣救赎主", "Divine Redeemer"],
      ["基督耶稣今复生", "Praise to the Risen King"],
      ["奇妙的耶稣", "Wonderful, Wonderful Jesus"],
      ["耶稣，在万民之上", "Jesus Name Above All Names"],
      ["你的信实广大", "Great Is Thy Faithfulness"],
      ["有福的确据", "Blessed Assurance"],
      ["收成感恩", "Come, Ye Thankful People"],
    ],
  },
  {
    album: "美哉主耶稣 Fairest Lord Jesus",
    prefix: "A6",
    tracks: [
      ["赞美基督耶稣", "Morning Praise"],
      ["圣哉三一", "Holy, Holy, Holy"],
      ["美哉主耶稣", "Fairest Lord Jesus"],
      ["奇妙十架", "When I Survey the Wondrous Cross"],
      ["奇异的爱", "And Can It Be?"],
      ["恩典大过我罪", "Grace Greater Than All My Sins"],
      ["主被钉十架", "Were You There? / Crown Him"],
      ["你真伟大", "How Great Thou Art"],
      ["贺祂为王", "All Hail the Power of Jesus' Name"],
      ["主治万方", "Jesus Shall Reign"],
      ["主耶稣，我爱你", "My Jesus, I Love Thee"],
      ["尊崇主", "I Exalt Thee"],
      ["颂赞主圣名", "Blessed Be Thy Name"],
      ["耶稣恩友", "What a Friend We Have in Jesus"],
      ["主凡事引导", "All the Way My Savior Leads Me"],
      ["奔向锡安", "Marching to Zion"],
      ["与主面对面", "Face to Face"],
      ["快乐崇拜", "Joyful, Joyful We Adore Thee"],
    ],
  },
  {
    album: "藏身主怀 You Are My Hiding Place",
    prefix: "A7",
    tracks: [
      ["救主在等待", "The Savior is Waiting"],
      ["来就上主羔羊", "Just As I Am"],
      ["奇异恩典", "Amazing Grace"],
      ["救赎主", "Redeemed"],
      ["你是我藏身处", "You Are My Hiding Place"],
      ["主藏我灵在他爱中", "He Hideth My Soul"],
      ["我心灵得安宁", "It Is Well with My Soul"],
      ["主的完全平安", "Like a River Glorious"],
      ["开我的眼，主", "Open Our Eyes, Lord"],
      ["耶稣是我亲爱牧者", "Savior, Like a Shepherd"],
      ["按他时候", "In His Time"],
      ["在花园里", "In the Garden"],
      ["耶稣是我一切", "Jesus Is All the World to Me"],
      ["主的道", "His Way with Thee"],
      ["我宁愿有耶稣", "I Rather Have Jesus"],
      ["全民全族当归向他", "Once to Every Man and Nation"],
      ["今是主自己", "Himself"],
      ["奉献所有", "I Surrender All"],
      ["那片沃土", "Sweet By and By"],
      ["我是个贫穷的独行者", "I Am a Poor Wayfaring Stranger"],
      ["默祷", "Meditation on a Folk Song"],
    ],
  },
  {
    album: "锺玲新作",
    prefix: "N",
    tracks: [
      ["这是天父世界", "This Is My Father's World"],
      ["贺祂为王", "All Hail the Power of Jesus' Name"],
      ["虔守主餐", "Let Us Break Bread Together"],
      ["我曾舍命为你 / 哦，我真爱耶稣", "I Gave My Life for Thee / Oh, How I Love Jesus"],
      ["自从耶稣进到我心 / 喜传福音", "Since Jesus Came into My Heart / I Love to Tell the Story"],
      ["愿主向我吹气", "Breathe on Me, Breath of God"],
      ["祂既看顾小麻雀 / 天父必看顾你", "His Eye Is on the Sparrow / God Will Take Care of You"],
      ["有福的确据", "Blessed Assurance"],
    ],
  },
];

const rules = [
  {
    re: /Spirit Song|Breathe on Me|圣灵|愿主向我吹气/,
    themes: "圣灵工作；更新生命；成圣；属灵苏醒",
    temper: "恳切；柔和；更新；等候",
    uses: "培灵会；成圣主题；祷告会；复兴与更新信息",
    suitable: "强调圣灵光照、生命更新、成圣操练、属灵复兴和对神工作的渴慕的文章",
    unsuitable: "主要落点是圣诞叙事、主餐礼仪、追思安慰或外展凯歌的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Cross|Calvary|Rugged|Wondrous Cross|Near the Cross|Beneath|Gave My Life|Lead Me|钉十架|十架|十字架|髑髅地|宝架|我曾舍命|领我到/,
    themes: "十字架救恩；基督代赎；悔改与敬拜",
    temper: "深沉；敬畏；破碎；十字架默想",
    uses: "受难周；主餐前后；十字架信息；悔改回应",
    suitable: "以基督受苦、代赎、舍己、悔改、十字架道路为中心的文章",
    unsuitable: "主要落点是轻快赞美、圣诞叙事、普通生活感恩或宣教动员的文章",
    intensity: "中高",
    intro: "否",
    ending: "是",
  },
  {
    re: /Grace|Amazing|恩典|奇异/,
    themes: "恩典；罪得赦免；救恩确据；福音见证",
    temper: "感恩；谦卑；安慰；盼望",
    uses: "福音呼召；见证；追思安慰；救恩主题灵修",
    suitable: "强调罪人蒙恩、福音改变、神主动施恩和感恩回应的文章",
    unsuitable: "主要强调神圣洁审判、属灵争战或礼仪性主餐默想的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /God So Loved|Wondrous Love|Wonderful Jesus|真神之爱|神爱世人|奇妙的耶稣/,
    themes: "神的爱；基督救赎；福音恩典；敬拜回应",
    temper: "温暖；感恩；敬拜；安慰",
    uses: "福音信息；救恩默想；主日回应；感恩见证",
    suitable: "强调神主动的爱、基督救赎、罪人蒙恩以及被爱激发敬拜回应的文章",
    unsuitable: "主要落点是严肃警戒、属灵争战、主餐礼仪或宣教差派的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Need Thee|All in All|As the Deer|Jesus Is All|I Rather Have Jesus|我时刻需要你|你是我万有|如鹿|耶稣是我一切|宁愿有耶稣/,
    themes: "渴慕基督；倚靠主；以主为满足；成圣中的亲近",
    temper: "渴慕；安静；亲近；单纯信靠",
    uses: "灵修默想；祷告回应；退修；门徒生命操练",
    suitable: "强调人心对主的渴慕、离开自足、重新以基督为生命满足的文章",
    unsuitable: "主要落点是节期庆典、宏大宣教、公开争战或主餐礼仪的文章",
    intensity: "中低",
    intro: "是",
    ending: "是",
  },
  {
    re: /Beautiful|Fairest Lord Jesus|My Jesus, I Love|More Love|I Exalt Thee|Jesus Name Above|贺祂为王|美哉主耶稣|主你真美好|主耶稣.*爱你|爱主更深|尊崇主|耶稣，在万民之上/,
    themes: "基督的荣美；爱主回应；敬拜尊崇；基督居首位",
    temper: "敬拜；亲密；庄重；爱慕",
    uses: "主日敬拜；灵修回应；奉献回应；基督论主题信息",
    suitable: "强调基督荣美、爱主、敬拜、尊主为大的文章",
    unsuitable: "主要落点是苦难安慰、圣诞叙事、主餐记念或宣教差派的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Savior is Waiting|Just As I Am|Softly and Tenderly|The Savior|救主在等待|来就上主羔羊|归家/,
    themes: "福音呼召；悔改归主；救主怜悯；回应恩典",
    temper: "恳切；温柔；呼召；悔改",
    uses: "福音呼召；布道会回应；悔改祷告；归主见证",
    suitable: "文章最终落点是呼召人悔改、归向基督、接受福音恩典时使用",
    unsuitable: "主要是给信徒的安慰、圣诞庆贺、主餐礼仪或宣教差派文章",
    intensity: "中",
    intro: "否",
    ending: "是",
  },
  {
    re: /Holy|Most Holy|圣哉|圣善|尊贵/,
    themes: "神的圣洁；基督尊荣；敬拜与降卑",
    temper: "庄严；敬畏；崇高；肃穆",
    uses: "主日崇拜；圣洁主题；圣诞敬拜；敬拜引导",
    suitable: "强调神的圣洁、基督尊贵、敬拜秩序和人当存敬畏的文章",
    unsuitable: "以个人软弱安慰、日常陪伴或轻柔默想为主的文章",
    intensity: "中高",
    intro: "是",
    ending: "是",
  },
  {
    re: /Prayer|Lord's Prayer|祷|Tell Jesus/,
    themes: "祷告；倚靠；与主相交；把重担带到主前",
    temper: "安静；亲近；恳切；牧养",
    uses: "祷告会；灵修默想；个人退修；回应祷告",
    suitable: "引导读者回到祷告、依靠主、向主倾心吐意的文章",
    unsuitable: "主要落点是宣教差派、复活得胜或庄严审判的文章",
    intensity: "中低",
    intro: "是",
    ending: "是",
  },
  {
    re: /Faithful|Take Care|Sparrow|Care|Leads|Way|In His Time|信实|看顾|麻雀|引导|时候|带领|牵我手|磐石/,
    themes: "神的护理；信实；患难中的保守；信靠顺服",
    temper: "安稳；温柔；坚信；受安慰",
    uses: "苦难安慰；病中探访；信心坚固；灵修默想",
    suitable: "强调神在苦难、等待、未知前路中仍然掌权与看顾的文章",
    unsuitable: "主要落点是认罪悔改、得胜凯歌或圣诞庆贺的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Blessed Assurance|Redeemed|Since Jesus Came|有福的确据|救赎主|自从耶稣进到我心/,
    themes: "救恩确据；得赎身份；重生生命；福音见证",
    temper: "确据；感恩；明亮；稳妥",
    uses: "见证；福音回应；救恩主题；主日赞美",
    suitable: "强调信徒在基督里的身份、救恩确据、重生改变和感恩见证的文章",
    unsuitable: "主要落点是哀伤追思、主餐肃穆、圣洁审判或安静等候的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Peace|Still|Hiding|Garden|Shepherd|安宁|平安|藏身|花园|牧者|默祷/,
    themes: "在基督里的安息；牧养；避难所；内在更新",
    temper: "安静；温柔；默想；被主怀抱",
    uses: "灵修默想；安慰探访；退修；睡前或静默祷告",
    suitable: "以受安慰、静候主、内心更新、牧养陪伴为主的文章",
    unsuitable: "强烈呼召、公开宣教动员、庄严审判或得胜凯歌文章",
    intensity: "低中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Surrender|Rather Have Jesus|His Way|Himself|奉献|宁愿有耶稣|主的道|主自己/,
    themes: "奉献；顺服；成圣；以基督为至宝",
    temper: "委身；安静坚定；舍己；内在降服",
    uses: "奉献回应；培灵会；门徒训练；成圣主题",
    suitable: "呼召读者顺服、奉献、舍己跟随主、重新把基督居首位的文章",
    unsuitable: "单纯福音呼召、圣诞叙事或主要安慰伤痛的文章",
    intensity: "中",
    intro: "否",
    ending: "是",
  },
  {
    re: /Open Our Eyes|开我的眼/,
    themes: "属灵光照；明白真理；顺服神道；内在更新",
    temper: "恳切；安静；受教；寻求",
    uses: "读经前后；讲道回应；灵修默想；真理更新",
    suitable: "强调求主开启眼睛、明白圣经真理、从神话语受教并回应的文章",
    unsuitable: "主要落点是圣诞庆典、复活凯歌、主餐礼仪或追思安慰的文章",
    intensity: "中低",
    intro: "是",
    ending: "是",
  },
  {
    re: /Mission|Tell the Story|Go Tell|Nation|Jesus Shall Reign|Onward|Soldiers|宣教|传扬|万民|全族|主治万方|精兵/,
    themes: "福音使命；基督掌权；属灵争战；差派见证",
    temper: "坚定；外展；得胜；呼召",
    uses: "宣教聚会；差派礼；福音使命；属灵争战信息",
    suitable: "强调传福音、万民归主、教会使命、为真理站立的文章",
    unsuitable: "安静哀伤、个人退修、主餐默想或细腻牧养安慰的文章",
    intensity: "中高",
    intro: "是",
    ending: "是",
  },
  {
    re: /Resur|Lives|Glory|Hallelujah|Alleluia|Joyful|Shout|欢呼|哈利路亚|复活|得胜|快乐|荣耀|颂赞|赞美|Praise|Glory|To God/,
    themes: "赞美；复活得胜；神的荣耀；救恩欢庆",
    temper: "明亮；喜乐；得胜；颂赞",
    uses: "复活节；主日赞美；感恩回应；庆典崇拜",
    suitable: "从神的作为、复活盼望、赞美感恩走向喜乐回应的文章",
    unsuitable: "沉重悔改、受难默想、追思安慰或低声灵修文章",
    intensity: "中高",
    intro: "是",
    ending: "是",
  },
  {
    re: /How Great Thou Art|This Is My Father's World|Come, Ye Thankful People|你真伟大|这是天父世界|收成感恩/,
    themes: "创造护理；神的伟大；感恩；敬拜造物主",
    temper: "开阔；赞叹；感恩；安稳",
    uses: "感恩节；创造主题；神护理主题；主日赞美",
    suitable: "强调神创造、掌权、供应、护理，以及人以感恩敬拜回应的文章",
    unsuitable: "主要落点是悔改呼召、主餐记念、十字架受苦或个人哀伤的文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Christmas|Silent Night|Bethlehem|Manger|Child|Angels|O Holy Night|Joy to the World|Kings|Jingle|圣诞|平安夜|伯利恒|马槽|圣婴|天使|普世欢腾|新生王|铃儿/,
    themes: "道成肉身；基督降生；救主临到；敬拜新生王",
    temper: "温柔；明亮；敬拜；节期性",
    uses: "圣诞节；将临期；道成肉身信息；圣诞见证",
    suitable: "围绕基督降生、道成肉身、救主临到和圣诞敬拜的文章",
    unsuitable: "非圣诞主题的悔改、主餐、宣教争战或日常灵修文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
  {
    re: /Communion|Break Bread|主餐|虔守/,
    themes: "主餐；基督身体与宝血；记念主死；教会相交",
    temper: "肃穆；安静；敬虔；纪念",
    uses: "主餐礼；受难周；教会团契；十字架默想",
    suitable: "明确落在记念主死、主餐、基督身体和教会合一的文章",
    unsuitable: "普通生活应用、圣诞庆祝或宣教差派文章",
    intensity: "中低",
    intro: "否",
    ending: "是",
  },
  {
    re: /Face to Face|Holy City|Zion|Sweet By and By|Wayfaring|锡安|面对面|圣城|沃土|独行者/,
    themes: "天家盼望；永恒；寄居客旅；与主面对面",
    temper: "盼望；深远；安慰；天路感",
    uses: "追思安慰；永恒盼望；天路客旅；临终关怀",
    suitable: "强调今世寄居、永恒盼望、天家归宿、与主面对面的文章",
    unsuitable: "主要是现实行动呼召、轻快赞美或圣诞节期文章",
    intensity: "中",
    intro: "是",
    ending: "是",
  },
];

const curatedProfiles = {
  "A1-01": {
    identity: "赞美与敬拜导向的福音圣乐，功能是把听者带向对神永恒荣耀的颂赞。",
    themes: "神的荣耀；永恒颂赞；救恩感恩；敬拜回应",
    temper: "明亮；庄重；颂赞；开阔",
    uses: "主日赞美；感恩回应；敬拜性文章；以神荣耀作结的灵修",
    suitable: "文章最终落点是赞美神的荣耀、数算恩典、从信仰反思转向敬拜回应。",
    unsuitable: "主要气质是悔改忧伤、受难默想、病痛安慰或低声等候的文章。",
    summary: "适合承托从灵修反思走向敬拜颂赞的文章，不适合作为沉重悔改或苦难安慰的底色。",
    sources: [
      "https://hymnary.org/search?qu=Timeless%20Tribute",
      "https://songselect.ccli.com/search/results?List=Timeless%20Tribute",
    ],
    sourceNote: "未确认到标准公版圣诗条目；按专辑曲名和赞美主题初步判断，需用出版方/曲库文件名复核。",
  },
  "A1-02": {
    identity: "圣灵更新与奉献回应类圣诗，带有祷告、更新和顺服的灵修传统。",
    themes: "圣灵工作；生命更新；成圣；顺服献上",
    temper: "恳切；柔和；等候；内在更新",
    uses: "祷告会；培灵会；成圣主题；复兴与更新信息",
    suitable: "文章强调圣灵光照、内在更新、顺服神引导、从属灵迟钝转向被主更新。",
    unsuitable: "主要落点是圣诞、主餐、追思安慰、复活得胜或宣教动员的文章。",
    summary: "这首曲子的核心不是情绪安抚，而是求圣灵更新生命并带出顺服。",
    sources: [
      "https://hymnary.org/search?qu=Spirit%20Song",
      "https://songselect.ccli.com/search/results?List=Spirit%20Song",
    ],
    sourceNote: "现代敬拜曲来源以 CCLI/SongSelect 与 Hymnary 检索复核；神学判断按圣灵更新与奉献回应主题。",
  },
  "A1-03": {
    identity: "十字架奉献回应诗，核心是基督舍命与信徒回应主爱。",
    themes: "十字架救恩；基督代赎；主爱激励；奉献回应",
    temper: "深沉；敬畏；感恩；委身",
    uses: "受难周；主餐前后；十字架信息；奉献回应",
    suitable: "文章落点是基督为人舍命、主爱激励人悔改和奉献、以十字架呼召信徒回应。",
    unsuitable: "主要是轻快赞美、一般生活感恩、圣诞叙事或宣教凯歌的文章。",
    summary: "这是一首由基督舍命之爱引向信徒奉献回应的十字架圣诗。",
    sources: [
      "https://hymnary.org/search?qu=I%20Gave%20My%20Life%20for%20Thee",
      "https://hymntime.com/tch/htm/i/g/a/v/igavemyl.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal 条目；Frances R. Havergal 十字架奉献回应诗。",
  },
  "A1-04": {
    identity: "敬拜与爱主回应类现代圣诗，聚焦基督荣美与个人亲近主。",
    themes: "基督荣美；爱主；敬拜；内在更新",
    temper: "亲密；温柔；敬拜；安静",
    uses: "灵修默想；敬拜回应；爱主主题；个人奉献",
    suitable: "文章强调看见主的荣美、被主吸引、从忙乱或冷淡中回到爱主与敬拜。",
    unsuitable: "主要落点是教义争辩、属灵争战、严肃警戒、主餐礼仪或宣教差派的文章。",
    summary: "适合表达被基督荣美吸引后的安静敬拜和爱主回应。",
    sources: [
      "https://hymnary.org/search?qu=O%20Lord%2C%20You%27re%20Beautiful",
      "https://songselect.ccli.com/search/results?List=O%20Lord%2C%20You%27re%20Beautiful",
    ],
    sourceNote: "现代敬拜曲来源以 CCLI/SongSelect 与 Hymnary 检索复核；通常与 Keith Green 的敬拜传统相关。",
  },
  "A1-05": {
    identity: "神爱与救赎默想圣诗，强调神在基督里奇妙、主动、牺牲的爱。",
    themes: "神的爱；基督救赎；恩典；敬拜回应",
    temper: "温暖；深情；感恩；敬畏",
    uses: "救恩默想；福音信息；主日回应；感恩见证",
    suitable: "文章中心是神主动的爱、基督救赎、罪人蒙恩，结尾带向感恩和敬拜。",
    unsuitable: "主要落点是强烈警戒、公开争战、宣教动员或礼仪性主餐默想的文章。",
    summary: "这首曲子适合把读者从认识救恩带向对神爱与恩典的敬拜。",
    sources: [
      "https://hymnary.org/search?qu=What%20Wondrous%20Love%20Is%20This",
      "https://hymntime.com/tch/htm/w/h/a/t/wondlove.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；通常对应 What Wondrous Love Is This，救赎与神爱主题。",
  },
  "A1-06": {
    identity: "祷告与交托类福音圣诗，强调把忧虑、试探和重担带到耶稣面前。",
    themes: "祷告；交托重担；倚靠基督；主内安慰",
    temper: "恳切；亲近；牧养；安慰",
    uses: "祷告会；个人灵修；患难交托；牧养安慰",
    suitable: "文章引导读者在忧虑、试探、孤单或重担中转向基督、向主倾心吐意。",
    unsuitable: "主要落点是复活凯歌、宣教差派、庄严审判或节期庆典的文章。",
    summary: "核心功能是把人的重担带到耶稣面前，而不是泛泛营造安静气氛。",
    sources: [
      "https://hymnary.org/search?qu=I%20Must%20Tell%20Jesus",
      "https://hymntime.com/tch/htm/i/m/u/s/imustell.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Elisha A. Hoffman 祷告交托类福音圣诗。",
  },
  "A1-07": {
    identity: "倚靠与祷告回应圣诗，表达信徒每时每刻需要主的扶持。",
    themes: "倚靠主；祷告；成圣；软弱中蒙恩",
    temper: "谦卑；恳切；安静；单纯信靠",
    uses: "祷告回应；灵修默想；软弱扶持；成圣操练",
    suitable: "文章强调人的软弱有限、不可自恃，需要持续倚靠主的恩典和同在。",
    unsuitable: "主要落点是宏大宣教、得胜凯歌、圣诞庆典或主餐礼仪的文章。",
    summary: "这首曲子适合承托从自恃转向时时倚靠主的灵修文章。",
    sources: [
      "https://hymnary.org/search?qu=I%20Need%20Thee%20Every%20Hour",
      "https://hymntime.com/tch/htm/i/n/e/e/ineedteh.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Annie S. Hawks / Robert Lowry 倚靠祷告圣诗。",
  },
  "A1-08": {
    identity: "患难中信靠神护理的安慰圣诗，呼召灵魂在神里面安静。",
    themes: "神的护理；信靠等候；患难安慰；终末盼望",
    temper: "安静；深沉；忍耐；盼望",
    uses: "苦难安慰；追思或病中探访；等候主题；信靠神护理的信息",
    suitable: "文章从忧患、失落、等待或不明白中带读者转向神的掌权和信实。",
    unsuitable: "主要是轻快赞美、福音呼召、宣教动员或急切行动号召的文章。",
    summary: "这是一首让受扰动的心在神护理和终末盼望中安静下来的圣诗。",
    sources: [
      "https://hymnary.org/search?qu=Be%20Still%2C%20My%20Soul",
      "https://hymntime.com/tch/htm/b/e/s/t/bestill.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Katharina von Schlegel 文本、FINLANDIA 曲调传统。",
  },
  "A1-09": {
    identity: "软弱与人生幽谷中的引导安慰诗，强调主亲手牵引。",
    themes: "主的引导；患难同行；软弱扶持；信靠交托",
    temper: "温柔；哀而有望；亲近；受安慰",
    uses: "病痛安慰；丧亲或低谷陪伴；老年关怀；个人交托",
    suitable: "文章强调软弱、眼泪、前路不明中需要主牵手带领。",
    unsuitable: "主要落点是欢乐赞美、神学论证、宣教争战或圣洁警戒的文章。",
    summary: "适合给低谷中的信徒以主同在和牵引的安慰。",
    sources: [
      "https://hymnary.org/search?qu=Precious%20Lord%2C%20Take%20My%20Hand",
      "https://songselect.ccli.com/search/results?List=Precious%20Lord%2C%20Take%20My%20Hand",
    ],
    sourceNote: "中文名疑似对应 Precious Lord, Take My Hand；需用实际曲库文件名确认英文题名。",
  },
  "A1-10": {
    identity: "福音呼召圣诗，突出救主温柔呼唤罪人归家。",
    themes: "悔改归主；福音呼召；救主怜悯；回转",
    temper: "温柔；恳切；呼召；悔改",
    uses: "布道会回应；悔改祷告；归主见证；福音文章结尾",
    suitable: "文章最终落点是呼召人离开罪、归向基督、回应救主怜悯。",
    unsuitable: "主要是给成熟信徒的成圣反思、普通安慰、圣诞节期或宣教差派文章。",
    summary: "这首曲子适合明确福音呼召，不适合只作一般温柔背景乐。",
    sources: [
      "https://hymnary.org/search?qu=Softly%20and%20Tenderly",
      "https://hymntime.com/tch/htm/s/o/f/t/softlyat.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Will L. Thompson 福音呼召诗。",
  },
  "A1-11": {
    identity: "苦难中确认基督眷顾的安慰圣诗，回答主是否顾念人的眼泪。",
    themes: "基督怜悯；患难安慰；主的眷顾；信心确据",
    temper: "低回；温柔；受安慰；有盼望",
    uses: "病中探访；苦难文章；追思安慰；牧养陪伴",
    suitable: "文章处理痛苦、孤单、失落、忧伤，并最终指向主真实的怜悯和同在。",
    unsuitable: "主要是喜乐赞美、宣教动员、严肃责备或节期庆典的文章。",
    summary: "核心是确认基督顾念人的痛苦，适合牧养安慰性文章。",
    sources: [
      "https://hymnary.org/search?qu=Does%20Jesus%20Care",
      "https://hymntime.com/tch/htm/d/o/e/s/doesjesc.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Frank E. Graeff / J. Lincoln Hall 苦难安慰圣诗。",
  },
  "A1-12": {
    identity: "神在不同境遇中引导信徒的护理圣诗。",
    themes: "神的带领；旷野与丰盛；信靠顺服；护理",
    temper: "安稳；叙事性；信靠；受安慰",
    uses: "人生道路反思；苦乐交替中的信靠；见证；灵修默想",
    suitable: "文章强调神带领人经过高山低谷、顺境逆境，并在各样处境中供应。",
    unsuitable: "主要落点是悔改呼召、十字架受难默想、宣教凯歌或圣诞叙事的文章。",
    summary: "适合表达神在复杂人生道路中亲自带领和供应。",
    sources: [
      "https://hymnary.org/search?qu=God%20Leads%20Us%20Along",
      "https://hymntime.com/tch/htm/g/o/d/l/godleads.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；George A. Young 神带领与护理主题圣诗。",
  },
  "A1-13": {
    identity: "神细致看顾与儿女身份安慰圣诗，强调天父连微小生命也眷顾。",
    themes: "天父看顾；儿女确据；忧虑中的信靠；神的怜悯",
    temper: "温柔；明亮；安慰；信靠",
    uses: "忧虑安慰；个人见证；病痛或孤单陪伴；神护理主题",
    suitable: "文章引导读者在忧虑、被忽略感或软弱中相信天父细致看顾。",
    unsuitable: "主要是沉重认罪、属灵争战、主餐肃穆或末世警醒的文章。",
    summary: "这首曲子适合承托天父看顾和信徒不被遗忘的主题。",
    sources: [
      "https://hymnary.org/search?qu=His%20Eye%20Is%20on%20the%20Sparrow",
      "https://hymntime.com/tch/htm/h/i/s/e/hiseyeis.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Civilla D. Martin / Charles H. Gabriel，天父看顾主题。",
  },
  "A1-14": {
    identity: "渴慕神与亲近主的灵修圣诗，源于诗篇式的心灵渴慕意象。",
    themes: "渴慕神；亲近主；敬拜；以主为满足",
    temper: "安静；清澈；渴慕；亲密",
    uses: "灵修默想；敬拜回应；退修；个人祷告",
    suitable: "文章强调心灵干渴、重新寻求神、以主为满足、从外在事务回到亲近主。",
    unsuitable: "主要落点是严厉警戒、宣教动员、十字架受难或节期庆典的文章。",
    summary: "核心是渴慕并亲近神，适合安静灵修和敬拜回应。",
    sources: [
      "https://hymnary.org/search?qu=As%20the%20Deer",
      "https://songselect.ccli.com/search/results?List=As%20the%20Deer",
    ],
    sourceNote: "现代敬拜曲来源以 CCLI/SongSelect 与 Hymnary 检索复核；通常与 Martin Nystrom 诗篇42式渴慕主题相关。",
  },
  "A1-15": {
    identity: "祷告生活圣诗，强调祷告作为信徒卸下重担、亲近神的蒙恩途径。",
    themes: "祷告；亲近神；交托；等候",
    temper: "安静；亲密；恳切；退修感",
    uses: "祷告会；灵修操练；退修；讲祷告生活的文章",
    suitable: "文章真正落点是恢复祷告生活、在祷告中亲近神并交托重担。",
    unsuitable: "文章只是偶然提到祷告，实际落点在宣教、悔改、主餐或复活得胜时不宜机械选用。",
    summary: "只有当文章核心确实是祷告生活时才最贴切。",
    sources: [
      "https://hymnary.org/search?qu=Sweet%20Hour%20of%20Prayer",
      "https://hymntime.com/tch/htm/s/w/e/e/sweethop.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；William W. Walford / William B. Bradbury 祷告生活圣诗。",
  },
  "A1-16": {
    identity: "主耶稣所教祷告的礼仪与灵修性圣乐，承载天国、供应、赦免与顺服主题。",
    themes: "主祷文；神国；顺服神旨意；赦免；日用供应",
    temper: "庄重；敬虔；祈求；礼仪性",
    uses: "崇拜祷告；祷告主题；教会生活；敬虔操练",
    suitable: "文章围绕主祷文、神国、天父旨意、赦免与祷告秩序展开。",
    unsuitable: "一般个人情绪安慰、福音呼召、宣教争战或圣诞主题文章。",
    summary: "适合明确祷告神学或主祷文主题，不宜只因文章出现祷告二字就使用。",
    sources: [
      "https://hymnary.org/search?qu=The%20Lord%27s%20Prayer",
      "https://songselect.ccli.com/search/results?List=The%20Lord%27s%20Prayer",
    ],
    sourceNote: "主祷文文本直接来自马太福音6章/路加福音11章；具体钢琴版本需按曲库文件名确认是否为 Malotte 或其他谱曲。",
  },
  "A1-17": {
    identity: "信靠神为稳固根基的信心圣乐，突出患难中不可摇动的依靠。",
    themes: "神是磐石；信心稳固；患难中的依靠；神的信实",
    temper: "坚定；安稳；敬畏；有力量",
    uses: "信心坚固；苦难中站立；属灵根基；主日回应",
    suitable: "文章最终呼召读者在动荡、试炼或不确定中把信心建立在神自己身上。",
    unsuitable: "主要是柔和安慰、悔改呼召、圣诞节期或轻快赞美的文章。",
    summary: "这首曲子适合强调神为信徒不可摇动的根基。",
    sources: [
      "https://hymnary.org/search?qu=My%20Hope%20Is%20Built%20on%20Nothing%20Less",
      "https://hymntime.com/tch/htm/m/y/h/o/myhopeib.htm",
    ],
    sourceNote: "中文《主是磐石》疑似对应 My Hope Is Built / The Solid Rock；需用曲库文件名确认英文题名。",
  },
  "A1-18": {
    identity: "教会争战与使命圣诗，强调基督掌权下的群体前行。",
    themes: "属灵争战；教会使命；基督掌权；坚定前行",
    temper: "雄壮；坚定；行进；得胜",
    uses: "宣教差派；教会使命；属灵争战；公共见证",
    suitable: "文章强调教会群体、福音使命、为真理站立、在争战中忠心前行。",
    unsuitable: "安静默想、个人哀伤、细腻牧养安慰、主餐或低声悔改文章。",
    summary: "适合使命和争战主题，气质较强，不宜用于细腻安慰文。",
    sources: [
      "https://hymnary.org/search?qu=Onward%2C%20Christian%20Soldiers",
      "https://hymntime.com/tch/htm/o/n/w/a/onwardcs.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Sabine Baring-Gould / Arthur Sullivan，教会行进与争战意象。",
  },
  "A1-19": {
    identity: "哈利路亚式赞美圣乐，突出对神救恩与荣耀的欢然颂赞。",
    themes: "赞美；神的荣耀；救恩喜乐；敬拜回应",
    temper: "明亮；喜乐；颂赞；轻快",
    uses: "主日赞美；感恩文章；庆典崇拜；以赞美作结的灵修",
    suitable: "文章从神的作为、恩典或盼望走向喜乐赞美和公开颂扬。",
    unsuitable: "悔改忧伤、受难默想、病痛安慰、庄严警醒或主餐肃穆文章。",
    summary: "这首曲子适合喜乐颂赞，不适合承托沉重或内省型文章。",
    sources: [
      "https://hymnary.org/search?qu=Sing%20Hallelujah",
      "https://songselect.ccli.com/search/results?List=Sing%20Hallelujah",
    ],
    sourceNote: "题名较泛，未确认唯一标准圣诗条目；需用出版方/曲库文件名复核具体作品。",
  },
  "A1-20": {
    identity: "宗教改革传统的信心与争战圣诗，宣告神是坚固保障。",
    themes: "神是避难所；真理争战；信心坚固；基督得胜",
    temper: "庄严；刚强；得胜；敬畏",
    uses: "宗教改革纪念；真理争战；教会坚固；苦难中站立",
    suitable: "文章强调神作避难所、真理受挑战时的站立、属灵争战和信心坚固。",
    unsuitable: "温柔陪伴、个人情感安慰、圣诞叙事、主餐默想或单纯祷告操练文章。",
    summary: "这是一首刚强的信心与争战圣诗，适合真理站立和神作保障的主题。",
    sources: [
      "https://hymnary.org/search?qu=A%20Mighty%20Fortress%20Is%20Our%20God",
      "https://hymntime.com/tch/htm/m/i/g/h/mightyfo.htm",
    ],
    sourceNote: "参考 Hymnary 检索与 HymnTime/Cyber Hymnal；Martin Luther 宗教改革传统圣诗，诗篇46篇意象。",
  },
};

function infer(chinese, english) {
  const text = `${chinese} ${english}`;
  const match = rules.find((rule) => rule.re.test(text));
  if (match) {
    return {
      identity: "传统圣诗或福音圣乐，适合作为灵修文章配乐候选。",
      summary: `${match.themes}；适合${match.suitable}。`,
      ...match,
    };
  }
  return {
    identity: "传统圣诗或福音圣乐，适合作为灵修文章配乐候选。",
    themes: "敬拜；信靠；基督里的生命回应",
    temper: "安静；敬虔；稳重；灵修性",
    uses: "灵修默想；主日回应；文章背景圣乐",
    suitable: "神学重心较宽、需要安静承托文章信息的灵修文章",
    unsuitable: "主题非常明确的主餐、圣诞、宣教差派或强烈悔改文章",
    intensity: "中",
    intro: "是",
    ending: "是",
    summary: "适合一般灵修默想，但仍需按文章最终落点重新比较。",
  };
}

function sourceSearchUrl(base, title) {
  return `${base}${encodeURIComponent(title)}`;
}

function defaultSources(chinese, english) {
  const title = english.replace(/\s+—\s*/g, " ").trim();
  const text = `${chinese} ${english}`;
  const isMedley = /\/|Medley/.test(title);
  const isModernOrAmbiguous =
    /All in All|Shout to the Lord|As the Deer|Lord, I Praise You|Thankful Tears|Best Friend|Spirit Song|O Lord, You're Beautiful|Sing Hallelujah|Christmas Majesty|Jesus Name Above All Names|I Exalt Thee|Open Our Eyes|You Are My Hiding Place|In His Time|Himself|Meditation|Morning Praise|Lord's Prayer|The Lord's Prayer|Wonderful, Wonderful Jesus|Praise to the Risen King|Back to Bethlehem|Alleluia|Hallelujah/i.test(
      title,
    );
  const isGenericTitle =
    /Glory and Praise|Christmas Angels|Jingle Bells|Timeless Tribute|感恩的泪|最知心|荣耀与颂赞|圣诞天使|铃儿/.test(
      text,
    );
  const links = [sourceSearchUrl("https://hymnary.org/search?qu=", title)];
  links.push(sourceSearchUrl("https://songselect.ccli.com/search/results?List=", title));
  const qualifiers = [];
  if (isMedley) qualifiers.push("组曲/合并曲目需分别核对各组成圣诗");
  if (isModernOrAmbiguous) qualifiers.push("现代版权曲或题名不唯一，需用 CCLI/SongSelect 与曲库文件名复核");
  if (isGenericTitle) qualifiers.push("题名较泛，需用出版方或音频文件名确认具体作品");
  return {
    sources: links,
    sourceNote:
      qualifiers.length > 0
        ? `参考 Hymnary 与 CCLI/SongSelect 等可复核入口；${qualifiers.join("；")}。`
        : "参考 Hymnary 与 CCLI/SongSelect 等可复核资料入口；传统圣诗可由 Hymnary 进一步进入具体诗本/作者资料；未读取音频。",
  };
}

const rows = albums.flatMap((album) =>
  album.tracks.map(([chinese, english], index) => {
    const trackNo = index + 1;
    const id = `${album.prefix}-${String(trackNo).padStart(2, "0")}`;
    const fallbackSources = defaultSources(chinese, english);
    const profile = { ...infer(chinese, english), ...fallbackSources, ...(curatedProfiles[id] ?? {}) };
    return {
      曲目ID: id,
      中文名称: chinese,
      EnglishTitle: english,
      专辑名称: album.album,
      曲目序号: trackNo,
      音频文件名: "",
      身份定位: profile.identity,
      神学主题: profile.themes,
      属灵气质: profile.temper,
      传统用途: profile.uses,
      适合文章类型: profile.suitable,
      不适合文章类型: profile.unsuitable,
      一句话总评: profile.summary,
      来源链接: (profile.sources ?? []).join(" | "),
      来源说明: profile.sourceNote ?? "参考 Hymnary 与 CCLI/SongSelect 等可复核资料入口；未读取音频。",
    };
  }),
);

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const headers = Object.keys(rows[0]);
const csv = [
  headers.join(","),
  ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
].join("\n");

const md = `# 圣乐曲库画像（初版）

> 本文档基于已提供的圣乐目录、曲名、传统圣诗神学内涵与常见教会用途生成；尚未打开或分析音频文件。因此它是“初版画像”，后续需要用实际钢琴编曲的听感、音频时长和文件名继续修正。

## 使用原则

- 不把曲目当作普通情绪背景音乐，而是作为承载神学主题和教会传统的圣乐。
- 后续给文章配乐时，仍须先分析文章核心、神学重心、灵修气质和最终落点，再比较曲库。
- 本画像可作为筛选和比较依据，但不能取代逐篇文章判断。

## 字段说明

- 曲目ID：专辑缩写 + 曲目序号。
- 神学主题：该圣乐通常承载的核心信仰内容。
- 属灵气质：音乐和圣诗传统呈现的灵性氛围。
- 传统用途：教会历史和当代福音派语境中常见的使用场景。
- 适合/不适合文章类型：用于避免关键词式误配。
- 一句话总评：用于快速判断这首曲子的配乐功能。
- 来源链接/说明：用于后续复核；若题名不唯一或现代版权曲，已标出需人工确认处。

## 曲目画像

${albums
  .map((album) => {
    const albumRows = rows.filter((row) => row.专辑名称 === album.album);
    return `## ${album.album}

${albumRows
  .map(
    (row) => `### ${row.曲目ID} ${row.中文名称} / ${row.EnglishTitle}

- 专辑与序号：${row.专辑名称}，曲目 ${row.曲目序号}
- 身份定位：${row.身份定位}
- 神学主题：${row.神学主题}
- 属灵气质：${row.属灵气质}
- 传统用途：${row.传统用途}
- 适合文章类型：${row.适合文章类型}
- 不适合文章类型：${row.不适合文章类型}
- 一句话总评：${row.一句话总评}
- 来源链接：${row.来源链接 || "暂无来源链接"}
- 来源说明：${row.来源说明}
`,
  )
  .join("\n")}`;
  })
  .join("\n")}
`;

const outDir = path.join(process.cwd(), "outputs", "music_profiles");
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "圣乐曲库画像_初版.csv"), csv, "utf8");
await fs.writeFile(path.join(outDir, "圣乐曲库画像_初版.md"), md, "utf8");

console.log(`Generated ${rows.length} track profiles.`);
console.log(path.join(outDir, "圣乐曲库画像_初版.csv"));
console.log(path.join(outDir, "圣乐曲库画像_初版.md"));
