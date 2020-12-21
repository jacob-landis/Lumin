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
    function UploadImageModal(rootElm, stagedUploadCon, btnConfirm, btnSelectDifferentImage, stagedUploadClassList, errMsgClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.stagedUploadCon = stagedUploadCon;
        _this.btnConfirm = btnConfirm;
        _this.btnSelectDifferentImage = btnSelectDifferentImage;
        _this.stagedUploadClassList = stagedUploadClassList;
        _this.errMsgClassList = errMsgClassList;
        _this.btnConfirm.onclick = function () {
            Ajax.postImage(_this.stagedUpload, function (imageCard) {
                if (_this.callback)
                    _this.callback(imageCard);
            });
            _this.close();
        };
        _this.btnSelectDifferentImage.onchange = function (e) { return _this.load(e, _this.callback); };
        return _this;
    }
    UploadImageModal.prototype.load = function (e, callback) {
        var _this = this;
        this.reader = new FileReader();
        this.reader.onloadend = function () { return _this.stageFile(); };
        ViewUtil.empty(this.stagedUploadCon);
        ViewUtil.hide(this.btnConfirm);
        this.callback = callback;
        this.stagedFileName = e.srcElement.files[0].name;
        var isValidSize = e.srcElement.files[0].size <= 15728640;
        var isValidType = this.validateType(this.stagedFileName);
        if (isValidSize && isValidType) {
            this.reader.readAsDataURL(e.srcElement.files[0]);
        }
        else {
            if (!isValidSize)
                this.displayError('- The file you selected excedes accepted file size (15MB)');
            if (!isValidType)
                this.displayError('- The file you selected is not a valid image type (png, jpg or tif)');
        }
        this.open();
    };
    UploadImageModal.prototype.stageFile = function () {
        ViewUtil.show(this.btnConfirm);
        var raw = this.reader.result.substring(this.reader.result.indexOf(',') + 1);
        var imgTag = ViewUtil.tag('img', { classList: this.stagedUploadClassList, src: raw });
        this.stagedUploadCon.append(imgTag);
        this.stagedUpload = JSON.stringify({
            Name: this.stagedFileName,
            Raw: raw
        });
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