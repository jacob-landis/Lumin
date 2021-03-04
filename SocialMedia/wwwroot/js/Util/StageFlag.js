var StageFlag = (function () {
    function StageFlag() {
        this._flag = false;
    }
    Object.defineProperty(StageFlag.prototype, "isRaised", {
        get: function () { return this._flag; },
        enumerable: true,
        configurable: true
    });
    StageFlag.prototype.raise = function () { this._flag = true; };
    StageFlag.prototype.lower = function () { this._flag = false; };
    return StageFlag;
}());
//# sourceMappingURL=StageFlag.js.map