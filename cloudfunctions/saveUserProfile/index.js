const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const nickName = (event.nickName || '').trim()
  const avatarUrl = event.avatarUrl || ''

  if (!nickName) {
    return {
      ok: false,
      message: 'nickName is required'
    }
  }

  const exist = await db.collection('users').where({ user_id: wxContext.OPENID }).limit(1).get()
  if (exist.data.length) {
    await db.collection('users').doc(exist.data[0]._id).update({
      data: {
        nick_name: nickName,
        avatar_url: avatarUrl,
        updated_at: db.serverDate()
      }
    })
    return { ok: true, id: exist.data[0]._id }
  }

  const res = await db.collection('users').add({
    data: {
      user_id: wxContext.OPENID,
      nick_name: nickName,
      avatar_url: avatarUrl,
      created_at: db.serverDate(),
      updated_at: db.serverDate()
    }
  })

  return { ok: true, id: res._id }
}
