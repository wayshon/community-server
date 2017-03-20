var user = {
    subscribe: 1, 
    openid: '', 
    nickname: '', 
    sex: 1, 
    language: '', 
    city: '', 
    province: '', 
    country: '', 
    headimgurl: '', 
    subscribe_time: -1,
    unionid: '',
    remark: '',
    groupid: -1,
    phone: -1
}

var article = {
    userid: -1,
    nickname: '',
    avatar: '',
    level: '',
    id: -1,
    type: '',
    title: '',
    date: '',
    content: '',
    comments: [],
    stars: [],
    commentNum: 0,
    starNum: 0,
    readNum: 0,
    handpick: false,
    imgs: []
}

var comment = {
    userid: -1,
    avatar: '',
    nickname: '',
    articleid: -1,
    id: '',
    content: '',
    date: '',
    replyNum: 0,
    starNum: 0,
    replyUserid: -1,
    replyName: ''
}

// var reply = {
//     userid: -1,
//     avatar: '',
//     nickname: '',
//     articleid: -1,
//     commentid: -1,
//     id: -1,
//     date: '',
//     content: '',
//     starNum: 0
// }

var message = {
    userid: -1,
    avatar: '',
    nickname: '',
    authorid: -1,
    articleid: -1,
    content: '',
    id: -1,
    comment: '',
    date: '',
    star: false
}

var star = {
    userid: -1,
    avatar: '',
    nickname: '',
    articleid: -1,
    id: '',
    date: ''
}