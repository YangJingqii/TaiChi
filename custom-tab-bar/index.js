Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/daily/daily',
        text: '日课',
        icon: 'daily'
      },
      {
        pagePath: '/pages/album/album',
        text: '打卡',
        icon: 'album'
      },
      {
        pagePath: '/pages/me/me',
        text: '我的',
        icon: 'me'
      }
    ]
  },

  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
