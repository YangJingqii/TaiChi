const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { groupId } = event

  let memberIds = [wxContext.OPENID]

  if (groupId) {
    const selfMemberRes = await db.collection('group_members')
      .where({
        group_id: groupId,
        user_id: wxContext.OPENID
      })
      .limit(1)
      .get()

    if (!selfMemberRes.data.length) {
      return { list: [] }
    }

    const memberRes = await db.collection('group_members')
      .where({
        group_id: groupId
      })
      .get()
    memberIds = memberRes.data.map(item => item.user_id)
    if (!memberIds.length) {
      return { list: [] }
    }
  }

  let albumQuery = db.collection('album')
  if (groupId) {
    albumQuery = albumQuery.where(db.command.or([
      {
        group_id: groupId,
        user_id: db.command.in(memberIds)
      },
      {
        group_id: db.command.exists(false),
        user_id: db.command.in(memberIds)
      },
      {
        group_id: '',
        user_id: db.command.in(memberIds)
      }
    ]))
  } else {
    albumQuery = albumQuery.where({
      user_id: wxContext.OPENID
    })
  }

  const albumRes = await albumQuery
    .orderBy('date', 'desc')
    .orderBy('created_at', 'desc')
    .limit(100)
    .get()

  const albumIds = albumRes.data.map(item => item._id)

  const likeRes = albumIds.length
    ? await db.collection('likes').where({
      user_id: wxContext.OPENID,
      album_id: db.command.in(albumIds)
    }).get()
    : { data: [] }

  const likedIds = new Set(likeRes.data.map(item => item.album_id))
  const fileIds = albumRes.data
    .map(item => item.image_url)
    .filter(url => typeof url === 'string' && url.indexOf('cloud://') === 0)

  let tempUrlMap = {}
  if (fileIds.length) {
    const tempRes = await cloud.getTempFileURL({
      fileList: fileIds
    })
    tempUrlMap = tempRes.fileList.reduce((map, item) => {
      if (item.status === 0 && item.tempFileURL) {
        map[item.fileID] = item.tempFileURL
      }
      return map
    }, {})
  }

  return {
    list: albumRes.data.map(item => {
      const imageUrl = item.image_url === '<URL>' ? '' : item.image_url
      return {
        ...item,
        image_file_id: imageUrl || '',
        image_url: tempUrlMap[imageUrl] || imageUrl || '',
        liked: likedIds.has(item._id),
        is_owner: item.user_id === wxContext.OPENID,
        author_name: item.author_name || '拳友',
        author_avatar: item.author_avatar || '',
        likes_count: item.likes_count || 0
      }
    })
  }
}
