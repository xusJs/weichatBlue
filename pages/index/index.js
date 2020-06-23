//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // blueList:[
    //  {
    //   RSSI: -67,
    //   advertisData: {},
    //   advertisServiceUUIDs: [],
    //   deviceId: "7E:F8:7A:46:E7:A0",
    //   localName: "",
    //   name: "未知设备",
    //   serviceData: {},
    //  },{
    //   RSSI: -67,
    //   advertisData: {},
    //   advertisServiceUUIDs: [],
    //   deviceId: "7E:F8:7A:46:E7:A0",
    //   localName: "",
    //   name: "未知设备",
    //   serviceData: {},
    //  },{
    //   RSSI: -67,
    //   advertisData: {},
    //   advertisServiceUUIDs: [],
    //   deviceId: "7E:F8:7A:46:E7:A0",
    //   localName: "",
    //   name: "未知设备",
    //   serviceData: {},
    //  },{
    //   RSSI: -67,
    //   advertisData: {},
    //   advertisServiceUUIDs: [],
    //   deviceId: "7E:F8:7A:46:E7:A0",
    //   localName: "",
    //   name: "未知设备",
    //   serviceData: {},
    //  },{
    //   RSSI: -67,
    //   advertisData: {},
    //   advertisServiceUUIDs: [],
    //   deviceId: "7E:F8:7A:46:E7:A0",
    //   localName: "",
    //   name: "未知设备",
    //   serviceData: {},
    //  }
    // ],

    blueList:[]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

/**
   * 初始化蓝牙设备
   */
  initBlue: function () {
    var that = this;
    wx.openBluetoothAdapter({//调用微信小程序api 打开蓝牙适配器接口
      success: function (res) {
        // console.log(res)
        wx.showToast({
          title: '初始化成功',
          icon: 'success',
          duration: 800
        })
        that.findBlue();//2.0
      },
      fail: function (res) {//如果手机上的蓝牙没有打开，可以提醒用户
        wx.showToast({
          title: '请开启蓝牙',
          icon: 'fails',
          duration: 1000
        })
      }
    })
  },

  /**
    *开始搜索蓝牙设备
  */
  findBlue() {
    var that = this
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      interval: 0,
      success: function (res) {

        wx.showLoading({
          title: '正在搜索设备',
        })
        that.getBlue()//3.0
      }
    })
  },
  /**
  * 获取搜索到的设备信息
 */
  getBlue() {
    var that = this
    wx.getBluetoothDevices({
      success: function (res) {
        wx.hideLoading();
        that.setData({
          blueList : res.devices
        })
        // that.blueList = res.devices
        console.log(res.devices)

        // for (var i = 0; i < res.devices.length; i++) {
        //   　　　//that.data.inputValue：表示的是需要连接的蓝牙设备ID，简单点来说就是我想要连接这个蓝牙设备，所以我去遍历我搜索到的蓝牙设备中是否有这个ID
        //   if (res.devices[i].name == that.data.inputValue || res.devices[i].localName == that.data.inputValue) {
        //     that.setData({
        //       deviceId: res.devices[i].deviceId,
        //       consoleLog: "设备：" + res.devices[i].deviceId,
        //     })
        //     that.connetBlue(res.devices[i].deviceId);//4.0
        //     return;
        //   }
        // }
      },
      fail: function () {
        console.log("搜索蓝牙设备失败")
      }
    })
  },

  /**
  * 获取到设备之后连接蓝牙设备
 */
  connetBlue(e) {
    var that = this;
    let deviceId = e.target.dataset.deviceId
    console.log(deviceId)
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: deviceId,//设备id
      success: function (res) {

        console.log(res)

        wx.showToast({
          title: '连接成功',
          icon: 'fails',
          duration: 800
        })
        console.log("连接蓝牙成功!")
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log('连接蓝牙成功之后关闭蓝牙搜索');
          }
        })
        that.getServiceId()//5.0
      }
    })
  },

  /***
  连接上需要的蓝牙设备之后，获取这个蓝牙设备的服务uuid
  */

  getServiceId() {
    var that = this
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      success: function (res) {
        var model = res.services[0]
        that.setData({
          services: model.uuid
        })
        that.getCharacteId()//6.0
      }
    })
  },

  getCharacteId() {
    var that = this
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      success: function (res) {
        for (var i = 0; i < res.characteristics.length; i++) {//2个值
          var model = res.characteristics[i]
          if (model.properties.notify == true) {
            that.setData({
              notifyId: model.uuid//监听的值
            })
            that.startNotice(model.uuid)//7.0
          }
          if (model.properties.write == true) {
            that.setData({
              writeId: model.uuid//用来写入的值
            })
          }
        }
      }
    })
  },

  startNotice(uuid) {
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: uuid,  //第一步 开启监听 notityid  第二步发送指令 write
      success: function (res) {

        // 设备返回的方法
        wx.onBLECharacteristicValueChange(function (res) {
          // 此时可以拿到蓝牙设备返回来的数据是一个ArrayBuffer类型数据，所以需要通过一个方法转换成字符串
          var nonceId = that.ab2hex(res.value)
          　　　　　　//拿到这个值后，肯定要去后台请求服务（当前步骤根据当前需求自己书写），获取下一步操作指令写入到蓝牙设备上去

          wx.request({
            method: "POST",
            data: {
              xx: nonceId
            },
            url: url,
            success: (res) => {
              //res.data.data.ciphertext：我这边服务返回来的是16进制的字符串，蓝牙设备是接收不到当前格式的数据的，需要转换成ArrayBuffer
              that.sendMy(that.string2buffer(res.data.data.ciphertext))//8.0
              // 服务器返回一个命令  我们要把这个命令写入蓝牙设备
            }
          })
        　　})
          }
        })
  },


  sendMy(buffer) {
    var that = this
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.writeId,//第二步写入的特征值
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success: function (res) {
        console.log("写入成功")
      },
      fail: function () {
        console.log('写入失败')
      },
      complete: function () {
        console.log("调用结束");
      }
    })
  },
})
