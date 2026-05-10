const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

function formatDate(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const myMemberRes = await db.collection('group_members')
    .where({
      user_id: wxContext.OPENID
    })
    .get()

  const groupIds = myMemberRes.data.map(item => item.group_id)
  if (!groupIds.length) {
    return {
      groups: []
    }
  }

  const groupRes = await db.collection('groups')
    .where({
      _id: _.in(groupIds)
    })
    .get()

  const memberRes = await db.collection('group_members')
    .where({
      group_id: _.in(groupIds)
    })
    .get()

  const today = formatDate()
  const groups = await Promise.all(groupRes.data.map(async item => {
    const members = memberRes.data.filter(member => member.group_id === item._id)
    const memberIds = members.map(member => member.user_id)
    let todayCount = 0

    if (memberIds.length) {
      try {
        const todayRes = await db.collection('album')
          .where({
            user_id: _.in(memberIds),
            date: today
          })
          .count()
        todayCount = todayRes.total || 0
      } catch (err) {
        todayCount = 0
      }
    }

    return {
      id: item._id,
      name: item.name,
      code: item.code,
      member_count: members.length,
      today_count: todayCount
    }
  }))

  return {
    groups
  }
}
