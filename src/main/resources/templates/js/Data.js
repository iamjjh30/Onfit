export const UserData = {
    id: "hong1",
    pwd:"0000",
    nick:"동글동글",
    name: "홍길동",
    color:"C",
    profile: "../img/interface/ProfileDefault.png",
    birth:"1998.04.21",
    phone:"01012345678",
    email:"hong1@gmail.com",
    post: [
        {
            postId: 1,
            postDesc: "오늘 입은 코디 어떤가요?",
            heartCount: 5,
            commentCount: 2
        },
        {
            postId: 2,
            postDesc: "겨울 쿨톤 외투 추천해주세요! \n 대충 기본템 다 있다는 가정 하에!!",
            heartCount: 12,
            commentCount: 8
        }
    ],
    commentedPosts: [
        { id: 3, title: "퍼스널 컬러 진단 후기", MyComment: "정보 감사합니다!" }
    ],
    heartPosts: [
        { id: 6, title: "질문", UserName: "test1"},
        { id: 7, title: "맂곰", UserName: "test2"}
    ],
    inquiry: [
        {
            id: 1,
            title: "배송은 얼마나 걸리나요?",
            date: "2026.02.01",
            isAnswered: true,
            answer: "안녕하세요, OnfitAI입니다. \n 보통 영업일 기준 3~5일 소요됩니다. \n 문의 감사합니다."
        },
        {
            id: 2,
            title: "사이즈 교환 문의",
            date: "2026.02.10",
            isAnswered: false,
            answer: ""
        }
    ],
    cartItem: [
        { prdId: 1, prdName: "s100 colorful", imgUrl: "../img/product/shirt/s100_colorful.png", personalColor: "Neutral", price: 120000, qty:2, size:"M"},
        { prdId: 2, prdName: "s200 ivory", imgUrl: "../img/product/shirt/s200_ivory.png", personalColor: "Cool", price: 110000, qty:1, size:"M"},
        { prdId: 3, prdName: "s200 white", imgUrl: "../img/product/shirt/s200_white.png", personalColor: "Cool", price: 12000, qty:3, size:"S"},
        { prdId: 4, prdName: "c450 ig", imgUrl: "../img/product/cap/c450_ivory_green.png", personalColor: "Warm", price: 100000, qty:1, size:"L"},
        { prdId: 5, prdName: "c400 ig", imgUrl: "../img/product/cap/c400_ivory_green.png", personalColor: "Neutral", price: 129000, qty:1, size:"Free"}
    ],
    order: [
        { ordId: 1, state:"배달완료", date: "2026-03-01", name: "s500 데님 긴팔 셔츠", imgUrl: "../img/product/shirt/s500_denim2_long.png", price:100000, qty:1, size:"M", customerName:"홍길동", address:"충청남도 아산시 탕정면 남서울대학교 공학관", phone:"01012345678", payMethod:"무통장입금", deliFee:0},
        { ordId: 1, state:"배달완료", date: "2026-03-01", name: "s500 데님 긴셔츠", imgUrl: "../img/product/shirt/s500_denim_long.png", price:140000, qty:3,size:"S", customerName:"홍길동", address:"충청남도 아산시 탕정면 남서울대학교 공학관", phone:"01012345678", payMethod:"무통장입금", deliFee:0},
        { ordId: 1, state:"배달완료", date: "2026-03-01", name: "s500 데님 반팔 셔츠", imgUrl: "../img/product/shirt/s500_denim_short.png", price:99000, qty:2,size:"M", customerName:"홍길동", address:"충청남도 아산시 탕정면 남서울대학교 공학관", phone:"01012345678", payMethod:"무통장입금", deliFee:0},
        { ordId: 2, state:"배달중", date: "2026-03-02", name: "h100 하양", imgUrl: "../img/product/hoodie/h100_white.png", price:100000, qty:2,size:"250mm", customerName:"홍길동", address:"충청남도 아산시 탕정면 남서울대학교 공학관", phone:"01012345678", payMethod:"무통장입금", deliFee:0},
        { ordId: 3, state:"구매확정", date: "2026-03-04", name: "j200 파랑", imgUrl: "../img/product/jacket/fit_j200_blue.jpg", price:100000, qty:2,size:"260mm", customerName:"홍길동", address:"충청남도 아산시 탕정면 남서울대학교 공학관", phone:"01012345678", payMethod:"무통장입금", deliFee:0}
    ]
};

export const FitData = ([
    {id: 1, ctg:"기타",title: "OnFIt을 즐겨보세요!", subTitle: "처음 만나는 당신을 위한 가이드", date:"2026-01-26",img:"../img/community/banner1.png", desc:"OnFit이 처음이라 무엇을 해야할지 모르겠다고요? \n 당신을 위한 OnFit의 모든 것을 알려드립니다! \n \n  AI진단은 살펴보셨나요?\n AI진단에서는 내 얼굴 사진을 보고 나의 퍼스널 컬러를 알려줍니다. \n 쿨톤인지 웜톤인지, 그것도 아니면 뉴트럴톤인지 궁금하지 않으신가요? 지금 바로 눌러보세요! \n 퀄리티 높은 진단 결과를 위해 밝은 곳에서, 하얀 배경을 두고 정면을 바라보며 사진을 찍는 것을 권장합니다. \n\n 가상피팅은 어떠신가요? \n 온라인 쇼핑은 옷을 직접 입어 볼 수가 없어서 고민이 많으셨죠? \n 가상피팅에서는 내가 이 옷이 어울리는지 미리 입어볼 수 있어요! \n 방법은 단순합니다. 내 사진과 상품 사진 또는 상품을 선택하면 AI가 입은 모습을 만들어 줍니다. 어떠신가요? \n \n"},
    {id:2, ctg: "웜톤",title:"웜톤 가이드", subTitle: "웜톤에 대하여", date:"2026-01-26", img:"../img/community/banner4.png", desc: "웜톤의 정의와 어울리는 옷, 컬러까지 알아봐요."},
    {id:3, ctg: "쿨톤",title:"쿨톤 가이드", subTitle: "쿨톤에 대하여", date:"2026-01-26", img:"../img/community/banner3.png", desc: "쿨톤의 정의와 어울리는 옷, 컬러까지 알아봐요."},
    {id:4, ctg: "뉴트럴톤",title:"뉴트럴 가이드", subTitle: "뉴트럴톤에 대하여", date:"2026-01-26", img:"../img/community/banner2.png", desc: "뉴트럴톤의 정의와 어울리는 옷, 컬러까지 알아봐요."},
])
export const ShareData = ([
    {id:1, ctg:"잡담", profile:"../img/interface/ProfileDefault.png", name:"test1", date:"2026-02-01", desc: "잡담이란 이런거다 예시", heartCnt:4, commentCnt: 5, viewCnt:401 },
    {id:2, ctg:"잡담", profile:"../img/interface/ProfileDefault.png", name:"test2", date:"2026-02-01", desc: "잡담이란 이런거다 예시", heartCnt:4, commentCnt: 0, viewCnt:60 },
    {id:3, ctg:"잡담", profile:"../img/interface/ProfileDefault.png", name:"test3", date:"2026-02-01", desc: "잡담이란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:109 },
    {id:4, ctg:"잡담", profile:"../img/interface/ProfileDefault.png", name:"test4", date:"2026-02-04", desc: "잡담이란 이런거다 예시", heartCnt:4, commentCnt: 0, viewCnt:401 },
    {id:5, ctg:"잡담", profile:"../img/interface/ProfileDefault.png", name:"test5", date:"2026-02-03", desc: "잡담이란 이런거다 예시", heartCnt:10, commentCnt: 0, viewCnt:401 },
    {id:6, ctg:"Q&A", profile:"../img/interface/ProfileDefault.png", name:"test6", date:"2026-02-10", desc: "Q&A이란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:13 },
    {id:7, ctg:"Q&A", profile:"../img/interface/ProfileDefault.png", name:"test7", date:"2026-02-09", desc: "Q&A이란 이런거다 예시", heartCnt:2, commentCnt: 0, viewCnt:14},
    {id:8, ctg:"Q&A", profile:"../img/interface/ProfileDefault.png", name:"test8", date:"2026-02-05", desc: "Q&A이란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:41 },
    {id:9, ctg:"Q&A", profile:"../img/interface/ProfileDefault.png", name:"test9", date:"2026-02-04", desc: "Q&A이란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:21 },
    {id:10, ctg:"Q&A", profile:"../img/interface/ProfileDefault.png", name:"test10", date:"2026-02-03", desc: "Q&A이란 이런거다 예시", heartCnt:1, commentCnt:0, viewCnt:82 },
    {id:11, ctg:"공유", profile:"../img/interface/ProfileDefault.png", name:"test11", date:"2026-02-04", desc: "긴 글 예시 \n 를 \n 해 \n 보 \n 겠 \n습 \n니 \n다 \n. \n이\n정\n도\n면\n긴\n거\n라\n고\n해\n줘\n야\n함\n진\n짜", heartCnt:0, commentCnt: 0, viewCnt:102 },
    {id:12, ctg:"공유", profile:"../img/interface/ProfileDefault.png", name:"test12", date:"2026-02-03", desc: "공유란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:82 },
    {id:13, ctg:"공유 ", profile:"../img/interface/ProfileDefault.png", name:"test13", date:"2026-02-06", desc: "공유란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:85 },
    {id:14, ctg:"공유", profile:"../img/interface/ProfileDefault.png", name:"test14", date:"2026-02-07", desc: "공유란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:123 },
    {id:15, ctg:"공유", profile:"../img/interface/ProfileDefault.png", name:"test15", date:"2026-02-09", desc: "공유란 이런거다 예시", heartCnt:0, commentCnt: 0, viewCnt:46 },
])
export const ShareFitData = ([
    {id:1, profile:"../img/interface/ProfileDefault.png", name:"test1", date:"2026-03-13", img:"../img/community/ShareFit1.jpg" ,desc: "test1", heartCnt:4, commentCnt: 2, viewCnt:401, product:[{id:1, name:"s600_black", img:"../img/product/shirt/s600_black.jpg", price:59000}]},
    {id:2, profile:"../img/interface/ProfileDefault.png", name:"test2", date:"2026-03-12", img:"../img/community/ShareFit2.png" ,desc: "test2", heartCnt:4, commentCnt: 0, viewCnt:401, product:[{id:1, name:"fit_j200_brown", img:"../img/product/jacket/fit_j200_brown.jpg", price:129000}] },
    {id:3, profile:"../img/interface/ProfileDefault.png", name:"test3", date:"2026-03-11", img:"../img/community/ShareFit3.png" ,desc: "test3", heartCnt:4, commentCnt: 0, viewCnt:10, product:[{id:1, name:"h500_khaki_long", img:"../img/product/hoodie/h500_khaki_long.png", price:89000}] },
    {id:4, profile:"../img/interface/ProfileDefault.png", name:"test4", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:1 },
    {id:5, profile:"../img/interface/ProfileDefault.png", name:"test5", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:0 },
    {id:6, profile:"../img/interface/ProfileDefault.png", name:"test6", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:0 },
    {id:7, profile:"../img/interface/ProfileDefault.png", name:"test7", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:0 },
    {id:8, profile:"../img/interface/ProfileDefault.png", name:"test8", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:0 },
    {id:9, profile:"../img/interface/ProfileDefault.png", name:"test9", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:0 },
    {id:10, profile:"../img/interface/ProfileDefault.png", name:"test10", date:"2026-03-10", img:"/" ,desc: "test3", heartCnt:0, commentCnt: 0, viewCnt:0 },
])