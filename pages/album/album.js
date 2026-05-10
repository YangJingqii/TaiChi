const db = wx.cloud ? wx.cloud.database() : null

function formatDate(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildMoodOptions(selected = []) {
  return ['轻盈', '宁静', '松沉', '通透', '舒展', '安定', '有劲', '微汗']
    .map(name => ({
      name,
      active: selected.includes(name)
    }))
}

function getCircleDisplayName(name) {
  const raw = (name || '').trim()
  if (!raw || ['哈哈', '测试', '方法', 'test'].includes(raw.toLowerCase())) {
    return '晨练小组'
  }
  return raw
}

function getLocalAlbumItems() {
  const items = wx.getStorageSync('taiji_local_album')
  return Array.isArray(items) ? items : []
}

function isCloudFileId(url) {
  return typeof url === 'string' && url.indexOf('cloud://') === 0
}

function isDisplayImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (url === '<URL>') return false
  return /^(https?:\/\/|wxfile:\/\/|http:\/\/tmp\/|\/tmp\/)/.test(url)
}

function normalizeAlbumItem(item = {}) {
  const rawImageUrl = item.image_url || ''
  const rawFileId = item.image_file_id || ''
  const imageFileId = isCloudFileId(rawFileId)
    ? rawFileId
    : (isCloudFileId(rawImageUrl) ? rawImageUrl : '')
  const imageUrl = isDisplayImageUrl(rawImageUrl) ? rawImageUrl : ''

  return {
    ...item,
    image_url: imageUrl,
    image_file_id: imageFileId
  }
}

function mergeAlbumItems(remoteItems = []) {
  const seen = new Set()
  return [...remoteItems, ...getLocalAlbumItems()]
    .map(normalizeAlbumItem)
    .filter(item => {
      const key = item.id || item._id || item.image_url
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

async function resolveAlbumImageUrls(albumList = []) {
  if (!wx.cloud || !wx.cloud.getTempFileURL) return albumList

  const fileIds = [...new Set(albumList
    .map(item => item.image_file_id)
    .filter(isCloudFileId))]

  if (!fileIds.length) return albumList

  try {
    const res = await new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: fileIds,
        success: resolve,
        fail: reject
      })
    })
    const urlMap = (res.fileList || []).reduce((map, item) => {
      if (item.status === 0 && item.tempFileURL) {
        map[item.fileID] = item.tempFileURL
      }
      return map
    }, {})

    return albumList.map(item => {
      const resolvedUrl = urlMap[item.image_file_id] || item.image_url
      return {
        ...item,
        image_url: resolvedUrl,
        image_load_failed: !!item.image_file_id && !resolvedUrl
      }
    })
  } catch (err) {
    console.error('resolveAlbumImageUrls failed:', err)
    return albumList.map(item => {
      const resolvedUrl = item.image_url
      return {
        ...item,
        image_url: resolvedUrl,
        image_load_failed: !!item.image_file_id && !resolvedUrl
      }
    })
  }
}

function saveLocalAlbumItem(item) {
  const next = mergeAlbumItems([item]).slice(0, 50)
  wx.setStorageSync('taiji_local_album', next)
  return next
}

function removeLocalAlbumItem(id, imageUrl) {
  const next = getLocalAlbumItems().filter(item => {
    return item.id !== id && item._id !== id && item.image_url !== imageUrl
  })
  wx.setStorageSync('taiji_local_album', next)
  return next
}

function countTodayCheckins(albumList = []) {
  const today = formatDate()
  const people = new Set()

  albumList
    .filter(item => item.date === today)
    .forEach(item => {
      people.add(item.user_id || item.author_name || item.author_avatar || item.id || item._id)
    })

  return people.size
}

function compressImageForUpload(filePath) {
  if (!wx.compressImage) return Promise.resolve(filePath)

  return new Promise(resolve => {
    wx.compressImage({
      src: filePath,
      quality: 62,
      success: res => resolve(res.tempFilePath || filePath),
      fail: () => resolve(filePath)
    })
  })
}

Page({
  data: {
    albumList: [],
    groups: [],
    selectedGroupId: '',
    selectedGroup: null,
    circleMemberCount: 0,
    circleTodayCount: 0,
    moodOptions: buildMoodOptions(),
    draft: {
      imageUrl: '',
      cloudPath: '',
      date: formatDate(),
      description: '',
      moodTags: []
    },
    userInfo: null,
    saving: false
  },

  onLoad() {
    this.loadGroups()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onPullDownRefresh() {
    this.loadAlbum().finally(() => wx.stopPullDownRefresh())
  },

  async loadAlbum() {
    if (!wx.cloud) return
    try {
      const res = await wx.cloud.callFunction({
        name: 'getAlbumList',
        data: {
          groupId: this.data.selectedGroupId
        }
      })
      const list = (res.result && res.result.list) || []
      const albumList = await resolveAlbumImageUrls(mergeAlbumItems(list.map(item => ({
        id: item._id,
        ...item
      }))))
      const cloudTodayCount = this.data.selectedGroup ? (this.data.selectedGroup.today_count || 0) : 0
      this.setData({
        albumList,
        circleTodayCount: Math.max(cloudTodayCount, countTodayCheckins(albumList))
      })
    } catch (err) {
      console.error('loadAlbum failed:', err)
      wx.showToast({ title: '相册加载失败', icon: 'none' })
    }
  },

  async loadGroups() {
    if (!wx.cloud) return
    try {
      const res = await wx.cloud.callFunction({ name: 'getGroups' })
      const groups = ((res.result && res.result.groups) || []).map(item => ({
        ...item,
        displayName: getCircleDisplayName(item.name)
      }))
      const selectedGroupId = this.data.selectedGroupId || (groups[0] && groups[0].id) || ''
      const selectedGroup = groups.find(item => item.id === selectedGroupId) || null
      this.setData({
        groups,
        selectedGroupId,
        selectedGroup,
        circleMemberCount: selectedGroup ? (selectedGroup.member_count || 1) : 0,
        circleTodayCount: selectedGroup ? (selectedGroup.today_count || 0) : 0
      })
      this.loadAlbum()
    } catch (err) {
      console.error('loadGroups failed:', err)
      wx.showToast({ title: '拳友圈加载失败', icon: 'none' })
    }
  },

  selectGroup(event) {
    const selectedGroupId = event.currentTarget.dataset.id
    const selectedGroup = this.data.groups.find(item => item.id === selectedGroupId) || null
    this.setData({
      selectedGroupId,
      selectedGroup,
      circleMemberCount: selectedGroup ? (selectedGroup.member_count || 1) : 0,
      circleTodayCount: selectedGroup ? (selectedGroup.today_count || 0) : 0
    })
    this.loadAlbum()
  },

  openCircleManager() {
    const groupItems = this.data.groups.slice(0, 4)
    const actionItems = [
      ...groupItems.map(item => item.displayName || '晨练小组'),
      '加入拳友圈',
      '创建拳友圈'
    ]

    wx.showActionSheet({
      itemList: actionItems,
      success: res => {
        const index = res.tapIndex
        if (index < groupItems.length) {
          const selectedGroup = groupItems[index]
          this.setData({
            selectedGroupId: selectedGroup.id,
            selectedGroup,
            circleMemberCount: selectedGroup.member_count || 1,
            circleTodayCount: selectedGroup.today_count || 0
          })
          this.loadAlbum()
          return
        }

        if (index === groupItems.length) {
          this.joinGroup()
          return
        }

        this.createGroup()
      }
    })
  },

  createGroup() {
    wx.showModal({
      title: '创建拳友圈',
      editable: true,
      placeholderText: '给拳友圈取个名字',
      success: async res => {
        if (!res.confirm || !res.content.trim()) return
        try {
          const createRes = await wx.cloud.callFunction({
            name: 'createGroup',
            data: { name: res.content.trim() }
          })
          const group = {
            ...createRes.result.group,
            displayName: getCircleDisplayName(createRes.result.group.name)
          }
          await this.loadGroups()
          this.setData({
            selectedGroupId: group.id,
            selectedGroup: group,
            circleMemberCount: group.member_count || 1,
            circleTodayCount: group.today_count || 0
          })
          wx.showModal({
            title: '拳友圈已创建',
            content: `圈号：${group.code}\n把圈号发给拳友即可加入。`,
            showCancel: false
          })
          this.loadAlbum()
        } catch (err) {
          console.error('createGroup failed:', err)
          wx.showToast({ title: '创建失败', icon: 'none' })
        }
      }
    })
  },

  joinGroup() {
    wx.showModal({
      title: '加入拳友圈',
      editable: true,
      placeholderText: '输入拳友圈圈号',
      success: async res => {
        if (!res.confirm || !res.content.trim()) return
        try {
          const joinRes = await wx.cloud.callFunction({
            name: 'joinGroup',
            data: { code: res.content.trim() }
          })
          const group = {
            ...joinRes.result.group,
            displayName: getCircleDisplayName(joinRes.result.group.name)
          }
          await this.loadGroups()
          this.setData({
            selectedGroupId: group.id,
            selectedGroup: group,
            circleMemberCount: group.member_count || 1,
            circleTodayCount: group.today_count || 0
          })
          wx.showToast({ title: '已加入', icon: 'success' })
          this.loadAlbum()
        } catch (err) {
          console.error('joinGroup failed:', err)
          wx.showToast({ title: '加入失败', icon: 'none' })
        }
      }
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const file = res.tempFiles[0]
        this.setData({
          draft: {
            imageUrl: file.tempFilePath,
            cloudPath: '',
            date: formatDate(),
            description: '',
            moodTags: []
          },
          moodOptions: buildMoodOptions()
        })
      }
    })
  },

  onDateInput(event) {
    this.setData({
      'draft.date': event.detail.value
    })
  },

  onDescriptionInput(event) {
    this.setData({
      'draft.description': event.detail.value
    })
  },

  toggleMood(event) {
    const mood = event.currentTarget.dataset.mood
    const moodTags = this.data.draft.moodTags || []
    const next = moodTags.includes(mood)
      ? moodTags.filter(item => item !== mood)
      : [...moodTags, mood]
    const selected = next.slice(0, 3)

    this.setData({
      'draft.moodTags': selected,
      moodOptions: buildMoodOptions(selected)
    })
  },

  clearDraft() {
    this.setData({
      draft: {
        imageUrl: '',
        cloudPath: '',
        date: formatDate(),
        description: '',
        moodTags: []
      },
      moodOptions: buildMoodOptions()
    })
  },

  getCachedUserInfo() {
    const cached = wx.getStorageSync('taiji_user_info')
    if (cached && cached.nickName) {
      this.setData({ userInfo: cached })
      return cached
    }
    return null
  },

  ensureUserInfo() {
    const cached = this.data.userInfo || this.getCachedUserInfo()
    if (cached) return cached

    return {
      nickName: '拳友',
      avatarUrl: ''
    }
  },

  async submitAlbum() {
    const { draft } = this.data
    if (!draft.imageUrl) {
      wx.showToast({ title: '请先选择照片', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    try {
      const userInfo = this.ensureUserInfo()
      const uploadFilePath = await compressImageForUpload(draft.imageUrl)
      const cloudPath = `album/${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: uploadFilePath
      })

      const saveRes = await wx.cloud.callFunction({
        name: 'uploadAlbum',
        data: {
          imageUrl: uploadRes.fileID,
          date: draft.date || formatDate(),
          description: draft.description || '今日习拳，身心舒展。',
          moodTags: draft.moodTags || [],
          authorName: userInfo.nickName,
          authorAvatar: userInfo.avatarUrl,
          groupId: this.data.selectedGroupId || ''
        }
      })
      const savedId = saveRes.result && saveRes.result.id

      await wx.cloud.callFunction({
        name: 'updateBadges',
        data: {
          action: 'upload_photo'
        }
      })

      wx.showToast({ title: '已保存', icon: 'success' })
      const localItem = {
        id: savedId || uploadRes.fileID,
        _id: savedId || uploadRes.fileID,
        image_url: uploadRes.fileID,
        image_file_id: uploadRes.fileID,
        date: draft.date || formatDate(),
        description: draft.description || '今日习拳，身心舒展。',
        mood_tags: draft.moodTags || [],
        author_name: userInfo.nickName,
        author_avatar: userInfo.avatarUrl,
        group_id: this.data.selectedGroupId || '',
        likes_count: 0,
        liked: false,
        is_owner: true
      }
      const albumList = await resolveAlbumImageUrls(saveLocalAlbumItem(localItem))
      this.setData({
        albumList,
        circleTodayCount: Math.max(this.data.circleTodayCount, countTodayCheckins(albumList))
      })
      this.clearDraft()
    } catch (err) {
      console.error('submitAlbum failed:', err)
      wx.showToast({ title: '打卡失败，看 Console', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  },

  async toggleLike(event) {
    const id = event.currentTarget.dataset.id
    try {
      const res = await wx.cloud.callFunction({
        name: 'toggleLike',
        data: {
          albumId: id
        }
      })
      const result = res.result || {}
      this.setData({
        albumList: this.data.albumList.map(item => {
          if (item.id !== id) return item
          return {
            ...item,
            liked: result.liked,
            likes_count: result.likes_count
          }
        })
      })
    } catch (err) {
      console.error('toggleLike failed:', err)
      wx.showToast({ title: '点赞失败', icon: 'none' })
    }
  },

  previewImage(event) {
    const url = event.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.albumList.map(item => item.image_url),
      current: url
    })
  },

  deleteAlbum(event) {
    const { id, url, owner } = event.currentTarget.dataset
    if (owner !== true && owner !== 'true') {
      wx.showToast({ title: '只能删除自己的记录', icon: 'none' })
      return
    }

    wx.showModal({
      title: '删除打卡',
      content: '删除后这条照片记录将无法恢复。',
      confirmText: '删除',
      confirmColor: '#9a594d',
      success: async res => {
        if (!res.confirm) return

        wx.showLoading({ title: '删除中' })
        try {
          const deleteRes = await wx.cloud.callFunction({
            name: 'deleteAlbum',
            data: {
              id,
              imageUrl: url
            }
          })
          const result = deleteRes.result || {}
          if (!result.ok) {
            wx.showToast({ title: '只能删除自己的记录', icon: 'none' })
            return
          }

          await wx.cloud.callFunction({
            name: 'updateBadges',
            data: {
              action: 'delete_photo'
            }
          })

          wx.showToast({ title: '已删除', icon: 'success' })
          const localItems = removeLocalAlbumItem(id, url)
          this.setData({
            albumList: this.data.albumList.filter(item => {
              return item.id !== id && item._id !== id && item.image_url !== url
            })
          })
          if (!localItems.length) {
            this.loadAlbum()
          }
        } catch (err) {
          console.error('deleteAlbum failed:', err)
          wx.showToast({ title: '删除失败，看 Console', icon: 'none' })
        } finally {
          wx.hideLoading()
        }
      }
    })
  },

  onShareAppMessage(event) {
    const item = event.target ? event.target.dataset.item : null
    if (item) {
      wx.cloud.callFunction({
        name: 'shareRecord',
        data: {
          shareType: 'album',
          targetId: item.id
        }
      }).catch(err => {
        console.error('shareRecord failed:', err)
      })
      return {
        title: `${item.date} 的太极晨练`,
        path: '/pages/album/album',
        imageUrl: item.image_url
      }
    }

    return {
      title: '来看看拳友们的晨练相册',
      path: '/pages/album/album'
    }
  }
})
