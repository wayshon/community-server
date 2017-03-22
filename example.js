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
    fromid: -1,
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

var newVote = {
            _id: '',
            userid: '58ca89c769f5670763e062ca',
            nickname: '原始的',
            avatar: '原始的',
            level: '初学乍练',
            startime: moment().format('YYYY-MM-DD HH:mm:ss'),
            endtime: '2017-03-22',
            // state: 1,   //0 结束，1 进行中
            type: '单选',
            desc: '投票描述',
            imgs: ['原始的','原始的','原始的'],
            // total: 0,
            choices: [
                {
                    name: '选项1',
                    // count: 66,  //根据users.length
                    // rate: '10%',    //根据users.length
                    users: [{
                        userid: '',
                        nickname: '原始的',
                        avatar: '原始的',
                    }]
                },{
                    name: '选项2',
                    count: 66,
                    rate: '20%',
                    users: [{
                        userid: '',
                        nickname: '原始的',
                        avatar: '原始的',
                    }]
                }
            ]
        }

/**
 * 前端投票时推得body应该是index,而不是name
 * {id,index,name}
 */
