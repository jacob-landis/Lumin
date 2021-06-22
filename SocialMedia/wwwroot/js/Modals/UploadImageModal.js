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
var UploadImageModal = (function (_super) {
    __extends(UploadImageModal, _super);
    function UploadImageModal(rootElm, stagedUploadCon, selectPrivacySetting, btnConfirm, btnSelectDifferentImage, stagedUploadClassList, errMsgClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.selectPrivacySetting = selectPrivacySetting;
        _this.stagedUploadCon = stagedUploadCon;
        _this.btnConfirm = btnConfirm;
        _this.btnSelectDifferentImage = btnSelectDifferentImage;
        _this.stagedUploadClassList = stagedUploadClassList;
        _this.errMsgClassList = errMsgClassList;
        _this.btnConfirm.onclick = function (e) {
            Ajax.postImage(JSON.stringify({
                Name: _this.stagedFileName,
                Raw: _this.raw,
                PrivacyLevel: _this.selectPrivacySetting.selectedIndex
            }), function (imageCard) {
                if (_this.callback)
                    _this.callback(imageCard);
            });
            _super.prototype.close.call(_this);
        };
        _this.btnSelectDifferentImage.onchange = function (e) { return _this.load(e, _this.callback); };
        return _this;
    }
    UploadImageModal.prototype.load = function (e, callback) {
        var _this = this;
        this.reader = new FileReader();
        this.reader.onloadend = function (e) { return _this.stageFile(); };
        ViewUtil.empty(this.stagedUploadCon);
        ViewUtil.hide(this.btnConfirm);
        this.callback = callback;
        var imageFile = e.srcElement.files[0];
        this.stagedFileName = imageFile.name;
        var isValidSize = imageFile.size <= 15728640;
        var isValidType = this.validateType(this.stagedFileName);
        if (isValidSize && isValidType) {
            this.reader.readAsDataURL(imageFile);
        }
        else {
            if (!isValidSize)
                this.displayError('- The file you selected excedes accepted file size (15MB)');
            if (!isValidType)
                this.displayError('- The file you selected is not a valid image type (png, jpg or tif)');
        }
        this.selectPrivacySetting.value = "" + User.imagesPrivacyLevel;
        _super.prototype.open.call(this);
    };
    UploadImageModal.prototype.stageFile = function () {
        ViewUtil.show(this.btnConfirm);
        this.raw = this.reader.result.substring(this.reader.result.indexOf(',') + 1);
        var imgTag = ViewUtil.tag('img', { classList: this.stagedUploadClassList, src: this.raw });
        this.stagedUploadCon.append(imgTag);
    };
    UploadImageModal.prototype.validateType = function (name) {
        var extension = name.slice(name.indexOf('.')).toLowerCase();
        return (extension == '.png' ||
            extension == '.jpg' ||
            extension == '.tif');
    };
    UploadImageModal.prototype.displayError = function (errorMsg) {
        this.stagedUploadCon.append(ViewUtil.tag('div', {
            classList: this.errMsgClassList,
            innerText: errorMsg
        }));
    };
    return UploadImageModal;
}(Modal));
//# sourceMappingURL=UploadImageModal.js.map