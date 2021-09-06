var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FriendsBox = (function (_super) {
    __extends(FriendsBox, _super);
    function FriendsBox(rootElm, scrollElm, requestCallback) {
        return _super.call(this, rootElm, scrollElm, 200, 20, requestCallback) || this;
    }
    return FriendsBox;
}(ContentBox));
//# sourceMappingURL=FriendsBox.js.map