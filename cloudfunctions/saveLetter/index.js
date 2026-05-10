const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { content } = event

  if (!content || !content.trim()) {
    return {
      ok: false,
      message: 'content is required'
    }
  }

  const exist = await db.collection('letters')
    .where({
      user_id: wxContext.OPENID
    })
    .limit(1)
    .get()

  if (exist.data.length) {
    await db.collection('letters').doc(exist.data[0]._id).update({
      data: {
        content,
        updated_at: db.serverDate()
      }
    })

    return {
      ok: true,
      id: exist.data[0]._id
    }
  }

  const res = await db.collection('letters').add({
    data: {
      user_id: wxContext.OPENID,
      content,
      created_at: db.serverDate(),
      updated_at: db.serverDate()
    }
  })

  return {
    ok: true,
    id: res._id
  }
}
