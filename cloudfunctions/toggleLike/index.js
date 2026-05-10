const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { albumId } = event

  if (!albumId) {
    return {
      ok: false,
      message: 'albumId is required'
    }
  }

  const exist = await db.collection('likes')
    .where({
      user_id: wxContext.OPENID,
      album_id: albumId
    })
    .limit(1)
    .get()

  if (exist.data.length) {
    await db.collection('likes').doc(exist.data[0]._id).remove()
    await db.collection('album').doc(albumId).update({
      data: {
        likes_count: _.inc(-1)
      }
    })
  } else {
    await db.collection('likes').add({
      data: {
        user_id: wxContext.OPENID,
        album_id: albumId,
        created_at: db.serverDate()
      }
    })
    await db.collection('album').doc(albumId).update({
      data: {
        likes_count: _.inc(1)
      }
    })
  }

  const album = await db.collection('album').doc(albumId).get()
  return {
    ok: true,
    liked: !exist.data.length,
    likes_count: Math.max(0, album.data.likes_count || 0)
  }
}
