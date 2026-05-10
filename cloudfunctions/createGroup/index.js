const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const name = (event.name || '').trim()

  if (!name) {
    return {
      ok: false,
      message: 'name is required'
    }
  }

  let code = makeCode()
  let exists = await db.collection('groups').where({ code }).count()
  while (exists.total) {
    code = makeCode()
    exists = await db.collection('groups').where({ code }).count()
  }

  const groupRes = await db.collection('groups').add({
    data: {
      name,
      code,
      owner_id: wxContext.OPENID,
      created_at: db.serverDate()
    }
  })

  await db.collection('group_members').add({
    data: {
      group_id: groupRes._id,
      user_id: wxContext.OPENID,
      role: 'owner',
      joined_at: db.serverDate()
    }
  })

  return {
    ok: true,
    group: {
      id: groupRes._id,
      name,
      code
    }
  }
}
