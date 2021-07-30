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
    function CreatePostModal(rootElm, txtCaption, captionWrapper, btnSubmit, btnClearAttachment, imageBoxElm, lblCaptionCharacterCount, selectPostPrivacy, imageClassList, contentBoxElmId) {
        var _this = _super.call(this, rootElm) || this;
        _this.lblCaptionCharacterCount = lblCaptionCharacterCount;
        _this.selectPostPrivacy = selectPostPrivacy;
        _this.maxLength = 1000;
        _this.txtCaption = txtCaption;
        _this.captionWrapper = captionWrapper;
        _this.btnSubmit = btnSubmit;
        _this.btnClearAttachment = btnClearAttachment;
        _this.errorBox = new ContentBox(document.getElementById(contentBoxElmId));
        _this.privacyWarning = {
            rootElm: ViewUtil.tag('div', {
                classList: 'errorMsg',
                innerText: '- Warning: This image is more private than this post. The image will be visible in this post to anyone who can see this post.'
            })
        };
        _this.captionWrapper.append(_this.errorBox.rootElm);
        _this.selectedImageBox = new ImageBox(imageBoxElm, imageClassList, 'Attach an image', function (targetImage) { return _this.selectImage(); });
        _this.btnClearAttachment.onclick = function (e) { return _this.loadPaperClip(); };
        _this.btnSubmit.onclick = function (e) { return _this.submit(); };
        _this.lblCaptionCharacterCount.innerText = "0/" + _this.maxLength;
        _this.txtCaption.onkeyup = function (event) {
            _this.lblCaptionCharacterCount.innerText = _this.txtCaption.value.length + "/" + _this.maxLength;
            if (_this.txtCaption.value.length > _this.maxLength || _this.txtCaption.value.length == 0)
                _this.lblCaptionCharacterCount.classList.add('errorMsg');
            else if (_this.lblCaptionCharacterCount.classList.contains('errorMsg'))
                _this.lblCaptionCharacterCount.classList.remove('errorMsg');
        };
        _this.loadPaperClip();
        return _this;
    }
    CreatePostModal.prototype.load = function (imageCard) {
        var _this = this;
        if (imageCard != null) {
            Ajax.getImage(imageCard.image.imageId, false, null, "Attach image", null, function (imageCard) {
                _this.selectedImageBox.loadImage(imageCard);
                ViewUtil.show(_this.btnClearAttachment, "inline");
                _this.checkPrivacy();
            });
        }
        this.selectPostPrivacy.value = "" + User.postsPrivacyLevel;
        this.open();
    };
    CreatePostModal.prototype.loadPaperClip = function () {
        var _this = this;
        ViewUtil.hide(this.btnClearAttachment);
        this.selectedImageBox.unload();
        var paperClip = Icons.paperClip();
        paperClip.onclick = function () { return _this.selectImage(); };
        this.selectedImageBox.rootElm.append(paperClip);
        this.errorBox.remove(this.privacyWarning);
    };
    CreatePostModal.prototype.selectImage = function () {
        var _this = this;
        imageDropdown.load(User.profileId, "Select an image", 'Attach image to post', function (imageBox) {
            _this.selectedImageBox.load(imageBox.imageCard.image.imageId, null, 'Attach to post');
            _this.checkPrivacy(imageBox.imageCard);
            ViewUtil.show(_this.btnClearAttachment);
            imageDropdown.close();
        });
    };
    CreatePostModal.prototype.submit = function () {
        var tooShort = this.txtCaption.value.length <= 0;
        var tooLong = this.txtCaption.value.length > this.maxLength;
        var noContent = tooShort && !this.selectedImageBox.isLoaded;
        var tooLongError = { rootElm: ViewUtil.tag('div', { classList: 'errorMsg', innerText: "- Must be less than " + this.maxLength + " characters" }) };
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
            var privacyLevel = this.selectPostPrivacy.selectedIndex;
            var post = JSON.stringify({ Caption: this.txtCaption.value, ImageId: imageId, PrivacyLevel: privacyLevel });
            Ajax.submitPost(post, function (post) {
                PostsBox.postBoxes.forEach(function (p) {
                    if (p.profileId == User.profileId)
                        p.addPost(new PostCard(post));
                });
            });
            this.txtCaption.value = '';
            this.close();
        }
        this.checkPrivacy();
    };
    CreatePostModal.prototype.checkPrivacy = function (imageCard) {
        var imagePrivacy = imageCard ? imageCard.image.privacyLevel : this.selectedImageBox.imageCard.image.privacyLevel;
        if (imagePrivacy > this.selectPostPrivacy.selectedIndex)
            this.errorBox.add(this.privacyWarning);
        else
            this.errorBox.remove(this.privacyWarning);
    };
    CreatePostModal.prototype.close = function () {
        var _this = this;
        if (this.txtCaption.value.length < 1) {
            this.clear();
            _super.prototype.close.call(this);
        }
        else {
            confirmPrompt.load('Are you sure you want to cancel?', function (confirmation) {
                if (!confirmation)
                    return;
                _this.clear();
                _super.prototype.close.call(_this);
            });
        }
    };
    CreatePostModal.prototype.clear = function () {
        this.errorBox.clear();
        this.txtCaption.value = '';
        if (this.lblCaptionCharacterCount.classList.contains('errorMsg'))
            this.lblCaptionCharacterCount.classList.remove('errorMsg');
        this.loadPaperClip();
        imageDropdown.close();
        imageDropdown.rootElm.style.zIndex = '0';
    };
    return CreatePostModal;
}(Modal));
//# sourceMappingURL=CreatePostModal.js.map