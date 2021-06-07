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
    function ProfileSettingsCard(rootElm, btnToggleSettingsSection, selectProfilePictureSetting, selectBioSetting, selectImagesSetting, selectFriendsSetting, selectPostsSetting, colorPalette, txtProfileColor, btnSaveColor, btnSaveSettings) {
        var _this = _super.call(this, rootElm) || this;
        _this.selectProfilePictureSetting = selectProfilePictureSetting;
        _this.selectBioSetting = selectBioSetting;
        _this.selectImagesSetting = selectImagesSetting;
        _this.selectFriendsSetting = selectFriendsSetting;
        _this.selectPostsSetting = selectPostsSetting;
        _this.colorPalette = colorPalette;
        _this.txtProfileColor = txtProfileColor;
        _this.btnSaveColor = btnSaveColor;
        _this.btnSaveSettings = btnSaveSettings;
        _this.btnToggleSettingsSection = new ToggleButton(null, btnToggleSettingsSection, null, [
            new ToggleState('fa-cog', 'Open profile settings', function () { return ViewUtil.show(_this.rootElm, 'grid'); }),
            new ToggleState('fa-times', 'Close profile settings', function () { return ViewUtil.hide(_this.rootElm); })
        ]);
        _this.btnSaveSettings.onclick = function (event) {
            confirmPrompt.load("Are you sure you want to use these privacy settings?", function (answer) {
                if (answer == true) {
                    var privacySettings_1 = [];
                    _this.selectElements.forEach(function (elm) {
                        privacySettings_1.push(elm.selectedIndex);
                    });
                    Ajax.updatePrivacySettings(privacySettings_1);
                    _this.profile.profilePicturePrivacyLevel = _this.selectProfilePictureSetting.selectedIndex;
                    _this.profile.profileBioPrivacyLevel = _this.selectBioSetting.selectedIndex;
                    _this.profile.profileImagesPrivacyLevel = _this.selectImagesSetting.selectedIndex;
                    _this.profile.profileFriendsPrivacyLevel = _this.selectFriendsSetting.selectedIndex;
                    _this.profile.profilePostsPrivacyLevel = _this.selectPostsSetting.selectedIndex;
                }
            });
        };
        _this.colorPalette.childNodes.forEach(function (childNode) {
            var elm = childNode;
            elm.onclick = function (event) {
                _this.txtProfileColor.value = elm.style.backgroundColor;
                _this.btnSaveColor.style.backgroundColor = elm.style.backgroundColor;
            };
        });
        _this.btnSaveColor.onclick = function (event) {
            Ajax.updateProfileColor(_this.txtProfileColor.value);
        };
        _this.txtProfileColor.onkeyup = function (event) {
            _this.btnSaveColor.style.backgroundColor = _this.txtProfileColor.value;
            console.log(_this.btnSaveColor.style.backgroundColor);
        };
        return _this;
    }
    Object.defineProperty(ProfileSettingsCard.prototype, "selectElements", {
        get: function () {
            return [this.selectProfilePictureSetting, this.selectBioSetting, this.selectImagesSetting, this.selectFriendsSetting, this.selectPostsSetting];
        },
        enumerable: true,
        configurable: true
    });
    ProfileSettingsCard.prototype.setPrivacySelectValues = function (profile) {
        this.profile = profile;
        this.selectProfilePictureSetting.value = "" + profile.profilePicturePrivacyLevel;
        this.selectBioSetting.value = "" + profile.profileBioPrivacyLevel;
        this.selectImagesSetting.value = "" + profile.profileImagesPrivacyLevel;
        this.selectFriendsSetting.value = "" + profile.profileFriendsPrivacyLevel;
        this.selectPostsSetting.value = "" + profile.profilePostsPrivacyLevel;
    };
    ProfileSettingsCard.prototype.isChanged = function () {
        return (this.selectProfilePictureSetting.value != "" + this.profile.profilePicturePrivacyLevel ||
            this.selectBioSetting.value != "" + this.profile.profileBioPrivacyLevel ||
            this.selectImagesSetting.value != "" + this.profile.profileImagesPrivacyLevel ||
            this.selectFriendsSetting.value != "" + this.profile.profileFriendsPrivacyLevel ||
            this.selectPostsSetting.value != "" + this.profile.profilePostsPrivacyLevel);
    };
    return ProfileSettingsCard;
}(Card));
//# sourceMappingURL=ProfileSettingsCard.js.map