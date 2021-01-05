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
var CreatePostModal = (function (_super) {
    __extends(CreatePostModal, _super);
    function CreatePostModal(rootElm, txtCaption, captionWrapper, btnSelectImage, btnClearImage, btnSubmit, btnCancel, imageBoxElm, imageClassList, contentBoxElmId) {
        var _this = _super.call(this, rootElm) || this;
        _this.txtCaption = txtCaption;
        _this.captionWrapper = captionWrapper;
        _this.btnSelectImage = btnSelectImage;
        _this.btnClearImage = btnClearImage;
        _this.btnSubmit = btnSubmit;
        _this.btnCancel = btnCancel;
        _this.errorBox = new ContentBox(document.getElementById(contentBoxElmId));
        _this.captionWrapper.append(_this.errorBox.rootElm);
        _this.selectedImageBox = new ImageBox(imageBoxElm, imageClassList, function () {
            return function () { return _this.selectImage(); };
        });
        _this.btnSelectImage.onclick = function () { return _this.selectImage(); };
        _this.btnClearImage.onclick = function () { return _this.loadPaperClip(); };
        _this.btnSubmit.onclick = function () { return _this.submit(); };
        _this.btnCancel.onclick = function () { return _this.close(); };
        return _this;
    }
    CreatePostModal.prototype.load = function (imageCard) {
        this.loadPaperClip();
        if (imageDropdown.rootElm.style.display == "none")
            imageDropdown.open();
        this.convertImageDropdown();
        if (imageCard)
            this.selectedImageBox.load(imageCard.image.imageId);
        this.open();
    };
    CreatePostModal.prototype.loadPaperClip = function () {
        var _this = this;
        ViewUtil.empty(this.selectedImageBox.rootElm);
        this.selectedImageBox.isLoaded = false;
        var paperClip = Icons.paperClip();
        paperClip.onclick = function () { return _this.selectImage(); };
        this.selectedImageBox.rootElm.append(paperClip);
    };
    CreatePostModal.prototype.selectImage = function () {
        var _this = this;
        imageDropdown.load(function (imageCard) {
            imageDropdown.close();
            _this.selectedImageBox.load(imageCard.image.imageId);
        });
    };
    CreatePostModal.prototype.convertImageDropdown = function () {
        var _this = this;
        imageDropdown.convert(function (imageCard) { return function () {
            _this.selectedImageBox.load(imageCard.image.imageId);
            imageDropdown.close();
        }; });
    };
    CreatePostModal.prototype.submit = function () {
        var charLimit = 1000;
        var tooShort = this.txtCaption.value.length <= 0;
        var tooLong = this.txtCaption.value.length > charLimit;
        var noContent = tooShort && !this.selectedImageBox.isLoaded;
        var tooLongError = { rootElm: ViewUtil.tag('div', { classList: 'errorMsg', innerText: "- Must be less than " + charLimit + " characters" }) };
        var noContentError = { rootElm: ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Select an image or enter a caption' }) };
        if (tooLong || noContent) {
            this.errorBox.clear();
            if (tooLong)
                this.errorBox.add(tooLongError);
            if (noContent)
                this.errorBox.add(noContentError);
        }
        else {
            var imageId = this.selectedImageBox.isLoaded ? this.selectedImageBox.imageCard.image.imageId : 0;
            var post = JSON.stringify({ Caption: this.txtCaption.value, ImageId: imageId });
            Ajax.submitPost(post, function (postCard) { return PostsBox.postBoxes.forEach(function (p) {
                if (p.profileId == User.profileId)
                    p.addPost(new PostCard(postCard.post));
            }); });
            this.txtCaption.value = '';
            this.close();
        }
    };
    CreatePostModal.prototype.close = function () {
        var _this = this;
        if (this.txtCaption.value.length < 1) {
            this.errorBox.clear();
            this.txtCaption.value = '';
            imageDropdown.close();
            imageDropdown.rootElm.style.zIndex = '0';
            _super.prototype.close.call(this);
        }
        else {
            confirmPrompt.load('Are you sure you want to cancel?', function (confirmation) {
                if (!confirmation)
                    return;
                _this.txtCaption.value = '';
                _super.prototype.close.call(_this);
            });
        }
    };
    return CreatePostModal;
}(Modal));
//# sourceMappingURL=CreatePostModal.js.map