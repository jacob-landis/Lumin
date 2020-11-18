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
/*
    This class contains the functionality for the upload image modal.
*/
var UploadImageModal = /** @class */ (function (_super) {
    __extends(UploadImageModal, _super);
    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    function UploadImageModal(rootElm, stagedUploadCon, btnConfirm, btnSelectDifferentImage, stagedUploadClassList, errMsgClassList) {
        var _this = _super.call(this, rootElm) || this;
        // Get handles on modal HTML elms.
        _this.stagedUploadCon = stagedUploadCon;
        _this.btnConfirm = btnConfirm;
        _this.btnSelectDifferentImage = btnSelectDifferentImage;
        _this.stagedUploadClassList = stagedUploadClassList;
        _this.errMsgClassList = errMsgClassList;
        // Set btnConfirm to send image to host in a post request.
        _this.btnConfirm.onclick = function () {
            Repo.postImage(_this.stagedUpload, function (imageCard) {
                // When uploaded image returns as an image card, if another class has set up a callback, send the image card to it.
                if (_this.callback)
                    _this.callback(imageCard);
            });
            // Close this modal.
            _this.close();
        };
        // Set onchange callback of selectDifferentImage (XXX basically a button XXX) to invoke load() with the file that was selected and this callback.
        _this.btnSelectDifferentImage.onchange = function (e) { return _this.load(e, _this.callback); }; // XXX this.callback has not been initialized. Review this logic. XXX
        return _this;
    }
    /*
     
        PARAMETERS:
        e must be the onchange event of a file input.
        callback must be at least an empty callback. It receives the image that is sent back from the host after it is uploaded.
    */
    UploadImageModal.prototype.load = function (e, callback) {
        var _this = this;
        // Construct new file reader to prep image from transmission to the host.
        this.reader = new FileReader();
        // Set onloadend callback of file reader to invoke stageFile().
        // The results of the file read are read from stageFile().
        this.reader.onloadend = function () { return _this.stageFile(); };
        // Prepare for both the validation success and failure scenario.
        // Empty image container elm so it can be refilled if the file is valid.
        // This step needs to take place in both scenarios.
        ViewUtil.empty(this.stagedUploadCon);
        // Hide btnConfirm so it can be shown if the file is valid. XXX this only needs to happen for one scenario. Move this step. XXX
        ViewUtil.hide(this.btnConfirm);
        // Get a handle on the provided callback.
        this.callback = callback;
        // Get a handle on the file name.
        this.stagedFileName = e.srcElement.files[0].name;
        // Validate file size.
        // 15728640 == 15MB
        var isValidSize = e.srcElement.files[0].size <= 15728640;
        // Validate file type.
        var isValidType = this.validateType(this.stagedFileName);
        // If the file is valid, read it,
        if (isValidSize && isValidType) {
            this.reader.readAsDataURL(e.srcElement.files[0]);
        }
        // else, display validation errors.
        else {
            if (!isValidSize)
                this.displayError('- The file you selected excedes accepted file size (15MB)');
            if (!isValidType)
                this.displayError('- The file you selected is not a valid image type (png, jpg or tif)');
        }
        this.open();
    };
    /*
        Bring the image upload process to the point of user confirmation.
    */
    UploadImageModal.prototype.stageFile = function () {
        // Show btnConfirm to allow user to finalize the upload. XXX move this line to end of method for readability and so user can't click. XXX
        ViewUtil.show(this.btnConfirm);
        // Cut off "data:image/jpeg;base64," from the result and get a handle on the rest.
        var raw = this.reader.result.substring(this.reader.result.indexOf(',') + 1);
        // Create an image tag with raw image data and give it a class for CSS.
        var imgTag = ViewUtil.tag('img', { classList: this.stagedUploadClassList, src: raw });
        // Show user the image preview.
        this.stagedUploadCon.append(imgTag);
        // Put prepped image name and raw image data in JSON obj for transmission and get a handle on it.
        this.stagedUpload = JSON.stringify({
            Name: this.stagedFileName,
            Raw: raw
        });
    };
    /*
        Validates file type by checking if the file type is one of the allowed types.
    */
    UploadImageModal.prototype.validateType = function (name) {
        // Get a handle on the file type.
        var extension = name.slice(name.indexOf('.')).toLowerCase();
        // If the file type matches any of the ones listed, return true.
        return (extension == '.png' ||
            extension == '.jpg' ||
            extension == '.tif');
    };
    /*
        Shortcut for displaying errors.
        Simply provide a string.
    */
    UploadImageModal.prototype.displayError = function (errorMsg) {
        // Create tag with provided string and give it classes for CSS.
        this.stagedUploadCon.append(ViewUtil.tag('div', {
            classList: this.errMsgClassList,
            innerText: errorMsg
        }));
    };
    return UploadImageModal;
}(Modal));
//# sourceMappingURL=UploadImageModal.js.map