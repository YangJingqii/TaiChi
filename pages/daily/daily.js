const signLibrary = [
  { title: '松而不懈', lines: ['松，不是散。', '肩肘腕自然下沉，精神仍要提得起。'] },
  { title: '沉肩坠肘', lines: ['肩松则气顺，肘坠则劲整。', '起势时，先把肩头轻轻放下来。'] },
  { title: '虚灵顶劲', lines: ['头顶轻领，身心不散。', '颈项舒展，眼神安定，不硬顶。'] },
  { title: '上下相随', lines: ['手不独动，脚不孤行。', '感受脚、腰、手是不是一起到位。'] },
  { title: '动中求静', lines: ['慢，不是迟疑。', '动作里有定，呼吸里有安。'] },
  { title: '圆活连贯', lines: ['一式未尽，一式已生。', '转接处不断、不僵、不急。'] },
  { title: '气沉丹田', lines: ['气往下安，心也往下安。', '呼吸自然，不要用力压腹。'] },
  { title: '中正安舒', lines: ['身正，气才顺。', '今天留意脊柱是否端正而不僵。'] },
  { title: '虚实分明', lines: ['虚不是空，实不是死。', '换步时，分清哪只脚在承重。'] },
  { title: '以腰为轴', lines: ['手随腰转，劲从身来。', '不要只用手臂去完成动作。'] },
  { title: '节节贯串', lines: ['脚起于根，劲过于腰。', '让动作一节接一节地传出去。'] },
  { title: '用意不用力', lines: ['意先到，力不抢。', '今天少使蛮力，多用方向。'] },
  { title: '含胸拔背', lines: ['胸不挺，背不塌。', '胸口微含，背后自然舒展。'] },
  { title: '松腰落胯', lines: ['腰松，步才活。', '每次转身前，先让胯沉下来。'] },
  { title: '尾闾中正', lines: ['尾闾正，身法稳。', '不要翘臀，也不要塌腰。'] },
  { title: '立身中定', lines: ['中定不是站死。', '身上有轴，脚下有根。'] },
  { title: '迈步如猫', lines: ['落脚轻，重心稳。', '先探路，再把重量慢慢交过去。'] },
  { title: '运劲如抽丝', lines: ['细，匀，绵，不断。', '今天把每一式练得像线慢慢抽开。'] },
  { title: '曲中求直', lines: ['曲是蓄，直是发。', '手臂有弧度，劲路有方向。'] },
  { title: '蓄而后发', lines: ['先收得住，才放得出。', '不要急着到位，先把劲蓄满。'] },
  { title: '不丢不顶', lines: ['不逃开，也不硬抗。', '和动作相随，保持一点温和的接触感。'] },
  { title: '舍己从人', lines: ['先听清，再回应。', '练拳时也可听身体，不急着安排身体。'] },
  { title: '阴阳相济', lines: ['开中有合，合中有开。', '今天留意动作里的收与放。'] },
  { title: '开合有度', lines: ['开不散，合不憋。', '手脚展开时，中心仍要收得住。'] },
  { title: '呼吸自然', lines: ['气不追动作，动作也不追气。', '先顺，再慢慢相合。'] },
  { title: '神舒体静', lines: ['神要舒，身要静。', '脸上松一点，心里宽一点。'] },
  { title: '眼随手转', lines: ['眼到，意到。', '目光跟着主手走，但不要瞪。'] },
  { title: '手眼相合', lines: ['手有方向，眼有安放。', '看得清，动作就不散。'] },
  { title: '步随身换', lines: ['身不到，步不抢。', '换步时，让身体带着脚走。'] },
  { title: '力由脊发', lines: ['劲不是从手冒出来。', '感受后背到手指的一条路。'] },
  { title: '根在脚下', lines: ['脚下稳，身上才轻。', '脚掌贴地，重量慢慢沉下去。'] },
  { title: '轻灵圆活', lines: ['轻，不是飘。', '圆，不是绕远。'] },
  { title: '慢中有意', lines: ['慢下来，是为了听得见。', '听见重心，听见呼吸，听见转折。'] },
  { title: '柔中寓刚', lines: ['柔不是弱，刚不是硬。', '松开之后，劲才有弹性。'] },
  { title: '刚柔相济', lines: ['该松时松，该整时整。', '不要一直软，也不要一直紧。'] },
  { title: '一动无有不动', lines: ['一处动，全身应。', '今天不要让手单独忙。'] },
  { title: '一静无有不静', lines: ['一处定，全身稳。', '定式时，心也停一停。'] },
  { title: '内外相合', lines: ['外形要顺，内意要清。', '动作和心意放在同一个方向。'] },
  { title: '上下贯通', lines: ['头轻领，脚下沉。', '上下有了呼应，身法就活。'] },
  { title: '左右相顾', lines: ['左顾右盼，不是东张西望。', '两边都照顾到，身体才平衡。'] },
  { title: '前后有靠', lines: ['前有去意，后有支撑。', '向前时，不要丢了背后的根。'] },
  { title: '收放分明', lines: ['收要干净，放要从容。', '不要半收半放，动作会乱。'] },
  { title: '折叠转换', lines: ['转折处最见功夫。', '今天把换向练得轻一点、清楚一点。'] },
  { title: '圆中有方', lines: ['外形圆，内里有规矩。', '方向清楚，圆才不散。'] },
  { title: '身备五弓', lines: ['身上处处可蓄。', '脊背、两臂、两腿，都别僵死。'] },
  { title: '意守当下', lines: ['这一式，就是这一式。', '少想下一招，把当下练完整。'] },
  { title: '心静身正', lines: ['心一静，身自然正。', '急躁时，先把动作放慢半拍。'] },
  { title: '气宜鼓荡', lines: ['气要活，不要憋。', '呼吸像水，有起伏也有流动。'] },
  { title: '劲宜内敛', lines: ['劲藏在里面，不露在脸上。', '越安静，越能整。'] },
  { title: '久练自知', lines: ['功夫不靠一日热闹。', '每天一点点，身体会慢慢告诉你。'] }
]

function formatDate(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMonth(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${year}-${month}`
}

function getDailySign() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return signLibrary[seed % signLibrary.length]
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
    const date = `${month}-${`${day}`.padStart(2, '0')}`
    cells.push({
      key: date,
      day,
      date,
      checked: checked.has(date)
    })
  }

  return cells
}

function getStreak(checkinDates = []) {
  const checked = new Set(checkinDates)
  let cursor = new Date()
  let streak = 0

  while (checked.has(formatDate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

Page({
  data: {
    dailySign: getDailySign(),
    today: formatDate(),
    todayChecked: false,
    checkinDates: [],
    calendarMonth: formatMonth(),
    calendarCells: buildCalendar(formatMonth()),
    monthCount: 0,
    streak: 0,
    feltToday: false
  },

  onLoad() {
    this.loadDailyData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.loadDailyData()
  },

  onPullDownRefresh() {
    this.loadDailyData().finally(() => wx.stopPullDownRefresh())
  },

  async loadDailyData() {
    if (!wx.cloud) return
    try {
      const res = await wx.cloud.callFunction({ name: 'getMyData' })
      const data = res.result || {}
      const checkinDates = data.checkinDates || []
      const calendarMonth = this.data.calendarMonth
      const today = formatDate()
      const monthCount = checkinDates.filter(date => date.indexOf(calendarMonth) === 0).length

      this.setData({
        today,
        checkinDates,
        todayChecked: checkinDates.includes(today),
        monthCount,
        streak: getStreak(checkinDates),
        calendarCells: buildCalendar(calendarMonth, checkinDates)
      })
    } catch (err) {
      console.error('loadDailyData failed:', err)
      wx.showToast({ title: '日课加载失败', icon: 'none' })
    }
  },

  changeMonth(event) {
    const offset = Number(event.currentTarget.dataset.offset)
    const [year, month] = this.data.calendarMonth.split('-').map(Number)
    const next = new Date(year, month - 1 + offset, 1)
    const calendarMonth = formatMonth(next)
    const monthCount = this.data.checkinDates.filter(date => date.indexOf(calendarMonth) === 0).length

    this.setData({
      calendarMonth,
      monthCount,
      calendarCells: buildCalendar(calendarMonth, this.data.checkinDates)
    })
  },

  feelToday() {
    this.setData({ feltToday: true })
  },

  onShareAppMessage() {
    return {
      title: `今日拳理：${this.data.dailySign.title}`,
      path: '/pages/daily/daily'
    }
  }
})
