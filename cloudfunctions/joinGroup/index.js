const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const code = (event.code || '').trim().toUpperCase()

  if (!code) {
    return {
      ok: false,
      message: 'code is required'
    }
  }

  const groupRes = await db.collection('groups').where({ code }).limit(1).get()
  if (!groupRes.data.length) {
    return {
      ok: false,
      message: 'group not found'
    }
  }

  const group = groupRes.data[0]
  const memberRes = await db.collection('group_members')
    .where({
      group_id: group._id,
      user_id: wxContext.OPENID
    })
    .limit(1)
    .get()

  if (!memberRes.data.length) {
    await db.collection('group_members').add({
      data: {
        group_id: group._id,
        user_id: wxContext.OPENID,
        role: 'member',
        joined_at: db.serverDate()
      }
    })
  }

  return {
    ok: true,
    group: {
      id: group._id,
      name: group.name,
      code: group.code
    }
  }
}
