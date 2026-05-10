const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { imageUrl, date, description, moodTags, authorName, authorAvatar, groupId } = event

  if (!imageUrl) {
    return {
      ok: false,
      message: 'imageUrl is required'
    }
  }

  const res = await db.collection('album').add({
    data: {
      user_id: wxContext.OPENID,
      image_url: imageUrl,
      date,
      description,
      mood_tags: Array.isArray(moodTags) ? moodTags.slice(0, 3) : [],
      author_name: authorName || '拳友',
      author_avatar: authorAvatar || '',
      group_id: groupId || '',
      likes_count: 0,
      created_at: db.serverDate()
    }
  })

  return {
    ok: true,
    id: res._id
  }
}
