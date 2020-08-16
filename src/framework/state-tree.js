class Utils {
  // https://github.com/jashkenas/underscore/blob/master/underscore.js#L87
  static isObject(obj) {
    var type = typeof obj
    return type === 'function' || type === 'object' && !!obj
  }
}

class StateTree {
  constructor(value, parent, callbacks) {
    var _this = this
    this._parent = parent
    this._value = value
    this._callbacks = callbacks || {}

    if (Utils.isObject(value)) {

      Object.keys(value).forEach((key) => {
        value[key] = new StateTree(value[key], this)

        Object.defineProperty(this, key, {
          set: (newValue) => {
             // not pretty, I know, but it works and it's enough for now
            _this._value[key] = new StateTree(newValue, _this, _this._value[key]._callbacks)
            _this._value[key].emit('change')
          },
          get: () => _this._value[key]
        })
      })
    }
  }

  on(event, callback) {
    this._callbacks[event] = this._callbacks[event] || []
    this._callbacks[event].push(callback)

    return this
  }

  emit(event, propagate = true) {
    let callbacks = this._callbacks[event] || []

    callbacks.forEach((callback) => callback(event))

    if (propagate && this._parent) {
      this._parent.emit(event)
    }

    return this
  }
}

export default StateTree