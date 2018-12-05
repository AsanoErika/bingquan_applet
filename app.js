//app.js
App({
  onLaunch: function () {

    var that = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录并获取用户信息
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code
        var that = this

        wx.request({
          url: this.url + 'appletuser/v_login',
          data: {
            code: code,
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res)
            if (res.data.status == 200) {
              if (res.data.user_status == 1) {

                that.globalData.user_id = res.data.data.id
                that.globalData.token = res.data.data.token

                wx.request({
                  url: that.url + 'appletuser/userInfo',
                  data: {
                    user_id: that.globalData.user_id,
                    token: that.globalData.token
                  },
                  method: 'POST',
                  dataType: 'json',
                  responseType: 'text',
                  success: function (res) {
                    
                    if (res.data.status == 200) {
                      that.globalData.bingquan_userInfo = res.data.user_info
                      console.log(that.globalData)
                    }
                    else {
                      console.log(res.data.message)
                    }

                  },
                  fail: function (res) { console.log(res.data.message) },
                  complete: function (res) { },
                })


              }

            }
            else {
              console.log(res.data.message)
            }
          },
          fail: function () {
            console.log("error")
          }
        })

      }
    })
  },
  globalData: {
    if_showad: false,
    shelves_id: null,
    bingquan_userInfo: null,
    user_id: null,
    token: null,
    order_list: null,
    userInfo: null,
    code: null,
    encryptedData: null,
    iv: null,
    currentIndex: 0,
    tabIndex: []
  },
  url: 'https://www.bingquannet.com/index.php/api/'
})