const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { shareType, targetId } = event

  const res = await db.collection('share_logs').add({
    data: {
      user_id: wxContext.OPENID,
      share_type: shareType || 'unknown',
      target_id: targetId || '',
      created_at: db.serverDate()
    }
  })

  if (shareType === 'badges') {
    await cloud.callFunction({
      name: 'updateBadges',
      data: {
        action: 'share_badge'
      }
    })
  }

  return {
    ok: true,
    id: res._id
  }
}
