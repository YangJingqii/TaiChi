const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const content = (event.content || '').trim()

  if (!content) {
    return {
      ok: false,
      message: 'content is required'
    }
  }

  const res = await db.collection('reflections').add({
    data: {
      user_id: wxContext.OPENID,
      sign_title: event.signTitle || '',
      sign_content: event.signContent || '',
      content,
      created_at: db.serverDate()
    }
  })

  return { ok: true, id: res._id }
}
