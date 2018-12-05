Component({
  externalClasses: ['i-class'],

  options: {
    multipleSlots: true
  },

  properties: {
    grey: {
      type: Boolean,
      value: false
    },
    time: {
      type: String,
      value: ''
    },
    amount: {
      type: String,
      value: ''
    },
    couponType: {
      type: String,
      value: ''
    },
    info: {
      type: String,
      value: ''
    },
    action: {
      type: String,
      value: ''
    }
  }
});
