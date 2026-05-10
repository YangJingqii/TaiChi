const db = wx.cloud ? wx.cloud.database() : null

const defaultLetter = '我想象着你们今天练拳的样子：\n轻轻的动作，慢慢的呼吸，神情专注又安宁。\n这画面让我很安心。'

const signLibrary = [
  {
    title: '松而不懈',
    content: '练拳不是软塌塌，而是在放松中保持精神。今天练习时，可以多感受肩、肘、腕是否自然下沉。'
  },
  {
    title: '沉肩坠肘',
    content: '肩松则气顺，肘坠则劲整。今日行拳时，留意肩头是否悄悄耸起。'
  },
  {
    title: '虚灵顶劲',
    content: '头顶似有一线轻轻提起，身心便不散乱。练拳时让颈项舒展，眼神安定。'
  },
  {
    title: '上下相随',
    content: '手动不独动，脚动不孤行。今日练习时，感受脚、腰、手是否能一起到。'
  },
  {
    title: '动中求静',
    content: '太极的慢，不是迟疑，而是心里有定。练时让呼吸和动作彼此照应。'
  },
  {
    title: '圆活连贯',
    content: '一式未尽，一式已生。今日可留意转接处，不断、不僵、不急。'
  }
]

function getDailySign() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return signLibrary[seed % signLibrary.length]
}

const badgeTemplates = [
  {
    key: 'one_day',
    badge_name: '初练有成',
    icon: '初',
    condition: '1 天',
    target: 1
  },
  {
    key: 'three_days',
    badge_name: '三日静心',
    icon: '三',
    condition: '3 天',
    target: 3
  },
  {
    key: 'seven_days',
    badge_name: '一周有恒',
    icon: '周',
    condition: '7 天',
    target: 7
  },
  {
    key: 'fourteen_days',
    badge_name: '半月入势',
    icon: '势',
    condition: '14 天',
    target: 14
  },
  {
    key: 'twenty_one_days',
    badge_name: '三七成习',
    icon: '成',
    condition: '21 天',
    target: 21
  },
  {
    key: 'thirty_days',
    badge_name: '月满有功',
    icon: '月',
    condition: '30 天',
    target: 30
  },
  {
    key: 'sixty_days',
    badge_name: '两月不辍',
    icon: '辍',
    condition: '60 天',
    target: 60
  },
  {
    key: 'ninety_days',
    badge_name: '九旬有定',
    icon: '旬',
    condition: '90 天',
    target: 90
  },
  {
    key: 'hundred_days',
    badge_name: '百日入境',
    icon: '百',
    condition: '100 天',
    target: 100
  },
  {
    key: 'half_year_days',
    badge_name: '半载从容',
    icon: '容',
    condition: '180 天',
    target: 180
  },
  {
    key: 'year_days',
    badge_name: '四时不辍',
    icon: '时',
    condition: '365 天',
    target: 365
  },
  {
    key: 'thousand_days',
    badge_name: '千日功深',
    icon: '千',
    condition: '1000 天',
    target: 1000
  }
]

function mergeBadges(remoteBadges = [], stats = {}) {
  return badgeTemplates.map(template => {
    const saved = remoteBadges.find(item => item.badge_key === template.key || item.badge_name === template.badge_name)
    const current = stats[template.key] || (saved && saved.current) || 0
    const unlocked = current >= template.target
    const level = unlocked ? Math.max(1, Math.floor(current / template.target)) : 0
    return {
      ...template,
      level,
      current,
      unlocked,
      statusText: unlocked ? '已获得' : `再坚持 ${template.target - current} 天`
    }
  })
}

function getCurrentBadge(badges = []) {
  const unlocked = badges.filter(item => item.unlocked)
  if (!unlocked.length) {
    return {
      name: '未点亮',
      icon: '印'
    }
  }
  return unlocked[unlocked.length - 1]
}

function formatMonth(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${year}-${month}`
}

function buildCalendar(month, checkinDates = []) {
  const [year, monthText] = month.split('-').map(Number)
  const firstDay = new Date(year, monthText - 1, 1)
  const daysInMonth = new Date(year, monthText, 0).getDate()
  const startWeek = firstDay.getDay()
  const checked = new Set(checkinDates)
  const cells = []

  for (let i = 0; i < startWeek; i += 1) {
    cells.push({
      key: `empty-${i}`,
      day: '',
      date: '',
      checked: false
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayText = `${day}`.padStart(2, '0')
    const date = `${month}-${dayText}`
    cells.push({
      key: date,
      day,
      date,
      checked: checked.has(date)
    })
  }

  return cells
}

Page({
  data: {
    letterContent: defaultLetter,
    profile: {
      avatarUrl: '',
      nickName: '',
      saved: false
    },
    editingProfile: false,
    savingProfile: false,
    dailySign: getDailySign(),
    reflecting: false,
    reflectionText: '',
    savingReflection: false,
    badges: mergeBadges(),
    currentBadge: getCurrentBadge(mergeBadges()),
    checkinDates: [],
    calendarMonth: formatMonth(new Date()),
    calendarCells: buildCalendar(formatMonth(new Date()))
  },

  onLoad() {
    this.loadCachedProfile()
    this.loadMyData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  onPullDownRefresh() {
    this.loadMyData().finally(() => wx.stopPullDownRefresh())
  },

  async loadMyData() {
    if (!wx.cloud) return
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMyData'
      })
      const data = res.result || {}
      const checkinDates = data.checkinDates || []
      const calendarMonth = this.data.calendarMonth
      const profile = data.profile || this.data.profile
      const badges = mergeBadges(data.badges || [], data.stats || {})
      this.setData({
        profile: {
          avatarUrl: profile.avatarUrl || '',
          nickName: profile.nickName || '',
          saved: Boolean(profile.nickName)
        },
        badges,
        currentBadge: getCurrentBadge(badges),
        checkinDates,
        calendarCells: buildCalendar(calendarMonth, checkinDates)
      })
      if (profile.nickName) {
        wx.setStorageSync('taiji_user_info', profile)
      }
    } catch (err) {
      wx.showToast({ title: '数据加载失败', icon: 'none' })
    }
  },

  loadCachedProfile() {
    const cached = wx.getStorageSync('taiji_user_info')
    if (!cached) return
    this.setData({
      profile: {
        avatarUrl: cached.avatarUrl || '',
        nickName: cached.nickName || '',
        saved: Boolean(cached.nickName)
      }
    })
  },

  startEditProfile() {
    this.setData({ editingProfile: !this.data.editingProfile })
  },

  onChooseAvatar(event) {
    this.setData({
      'profile.avatarUrl': event.detail.avatarUrl,
      'profile.saved': false
    })
  },

  onNicknameInput(event) {
    this.setData({
      'profile.nickName': event.detail.value,
      'profile.saved': false
    })
  },

  async saveProfile() {
    const nickName = this.data.profile.nickName.trim()
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }

    this.setData({ savingProfile: true })
    try {
      let avatarUrl = this.data.profile.avatarUrl
      if (avatarUrl && !avatarUrl.startsWith('cloud://') && !avatarUrl.startsWith('http')) {
        const ext = avatarUrl.match(/\.\w+$/)
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}-${Math.floor(Math.random() * 10000)}${ext ? ext[0] : '.jpg'}`,
          filePath: avatarUrl
        })
        avatarUrl = uploadRes.fileID
      }

      const profile = { nickName, avatarUrl, saved: true }

      try {
        await wx.cloud.callFunction({
          name: 'saveUserProfile',
          data: { nickName, avatarUrl }
        })
      } catch (cloudErr) {
        console.warn('saveUserProfile cloud sync skipped:', cloudErr)
      }

      wx.setStorageSync('taiji_user_info', profile)
      this.setData({ profile, editingProfile: false })
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (err) {
      console.error('saveProfile failed:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ savingProfile: false })
    }
  },

  changeMonth(event) {
    const offset = Number(event.currentTarget.dataset.offset)
    const [year, month] = this.data.calendarMonth.split('-').map(Number)
    const next = new Date(year, month - 1 + offset, 1)
    const calendarMonth = formatMonth(next)
    this.setData({
      calendarMonth,
      calendarCells: buildCalendar(calendarMonth, this.data.checkinDates)
    })
  },

  startReflection() {
    this.setData({ reflecting: true })
    wx.nextTick(() => {
      wx.pageScrollTo({
        selector: '.reflection-box',
        duration: 260
      })
    })
  },

  onReflectionInput(event) {
    this.setData({ reflectionText: event.detail.value })
  },

  async saveReflection() {
    const content = this.data.reflectionText.trim()
    if (!content) {
      wx.showToast({ title: '先写一句体会', icon: 'none' })
      return
    }

    this.setData({ savingReflection: true })
    try {
      await wx.cloud.callFunction({
        name: 'saveReflection',
        data: {
          signTitle: this.data.dailySign.title,
          signContent: this.data.dailySign.content,
          content
        }
      })
      wx.showToast({ title: '已存下', icon: 'success' })
      this.setData({ reflecting: false })
    } catch (err) {
      console.warn('saveReflection cloud sync skipped:', err)
      const reflections = wx.getStorageSync('taiji_reflections') || []
      reflections.unshift({
        signTitle: this.data.dailySign.title,
        signContent: this.data.dailySign.content,
        content,
        createdAt: Date.now()
      })
      wx.setStorageSync('taiji_reflections', reflections.slice(0, 50))
      wx.showToast({ title: '已存下', icon: 'success' })
      this.setData({ reflecting: false })
    } finally {
      this.setData({ savingReflection: false })
    }
  },

  onShareAppMessage() {
    const topBadges = this.data.badges
      .filter(item => item.unlocked)
      .map(item => item.badge_name)
      .join('、')

    return {
      title: topBadges ? `我的太极印记：${topBadges}` : '我的太极印记正在慢慢点亮',
      path: '/pages/me/me'
    }
  }
})
