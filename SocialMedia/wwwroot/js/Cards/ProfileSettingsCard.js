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
var ProfileSettingsCard = (function (_super) {
    __extends(ProfileSettingsCard, _super);
    function ProfileSettingsCard(rootElm, btnToggleSettingsSection, selectProfilePictureSetting, selectBioSetting, selectImagesSetting, selectFriendsSetting, selectPostsSetting) {
        var _this = _super.call(this, rootElm) || this;
        _this.selectProfilePictureSetting = selectProfilePictureSetting;
        _this.selectBioSetting = selectBioSetting;
        _this.selectImagesSetting = selectImagesSetting;
        _this.selectFriendsSetting = selectFriendsSetting;
        _this.selectPostsSetting = selectPostsSetting;
        _this.btnToggleSettingsSection = new ToggleButton(null, btnToggleSettingsSection, null, [
            new ToggleState('fa-cog', 'Open profile settings', function () { return ViewUtil.show(_this.rootElm, 'block'); }),
            new ToggleState('fa-times', 'Close profile settings', function () { return ViewUtil.hide(_this.rootElm); })
        ]);
        return _this;
    }
    return ProfileSettingsCard;
}(Card));
//# sourceMappingURL=ProfileSettingsCard.js.map