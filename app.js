App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d7gi5jatk25316878',
        traceUser: true
      })
    }
  }
})
