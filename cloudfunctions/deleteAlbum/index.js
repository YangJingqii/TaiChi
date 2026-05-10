const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id, imageUrl } = event

  if (!id) {
    return {
      ok: false,
      message: 'id is required'
    }
  }

  const record = await db.collection('album').doc(id).get()
  if (!record.data || record.data.user_id !== wxContext.OPENID) {
    return {
      ok: false,
      message: 'permission denied'
    }
  }

  await db.collection('album').doc(id).remove()

  const fileID = imageUrl || record.data.image_url
  if (fileID) {
    try {
      await cloud.deleteFile({
        fileList: [fileID]
      })
    } catch (err) {
      console.error('delete file failed:', err)
    }
  }

  return {
    ok: true
  }
}
