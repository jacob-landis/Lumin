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
    This class controls the content in the image dropdown.
    
    It displays the current user's images.
    By default, clicking on the images opens them in the fullsize image modal.
    However, other classes can change the click behavior of the images temporarily.
        This functionality is utilized to select an image, either for a post or for a profile picture.
        There is also a parameter for a message that gets displayed to the user like "Select an image for profile picture."

    This image collection supports lazy loading.
*/
var ImageDropdown = /** @class */ (function (_super) {
    __extends(ImageDropdown, _super);
    /*
        Gets handles on all necessary components.
        Sets up event listeners for image upload and lazy loading.
        Sudo-inherits from sudo-base class.
    */
    function ImageDropdown(rootElm, contentElm, imagesWrapper, prompt, btnUploadImageModal) {
        var _this = _super.call(this, rootElm, contentElm) || this;
        // Get handles on dropdown HTML elms.
        _this.imageWrapper = imagesWrapper;
        _this.prompt = prompt;
        // UPLOAD IMAGE
        // Sets up onchange event on file input.
        // This is triggered once the user has selected a file from their computers file system.
        // (Refer to this elm in /Views/Home/Index.cshtml for further explaination.)
        // This has the additional function of updating any and all active displays of the current user's images when one is added.
        btnUploadImageModal.onchange = function (e) {
            // Send file and callback to image upload modal.
            return UploadImageModal.load(e, 
            // When the image is uploaded (if it was uploaded) and it comes back,
            function (imageCard) {
                // loop through all the profileImageBoxs,
                return ProfileImagesBox.profileImageBoxes.forEach(function (p) {
                    // and if the image box is displaying the current user's images, add the newly uploaded image to it.
                    if (p.profileId == User.id)
                        p.addImageCard(imageCard);
                });
            });
        };
        // LAZY LOADING
        // When content is scrolled,
        _this.contentElm.onscroll = function () {
            // take a scroll measurement,
            var offset = _this.contentElm.scrollTop + window.innerHeight;
            // and if it surpasses the threshold, request more content.
            if (offset >= _this.imageBox.contentBox.height)
                _this.imageBox.contentBox.request(15);
        };
        return _this;
    }
    /*
        Override open() so load can be called first.
        (open() is called on dropdowns when toggled)
    */
    ImageDropdown.prototype.open = function () {
        this.load();
        _super.prototype.open.call(this);
    };
    /*
        Convert the click behavior of images in the dropdown,
        give the user a prompt,
        and bring this dropdown to the foreground.
    */
    ImageDropdown.prototype.load = function (callback) {
        var _this = this;
        // If a callback was provided, send the image to it that is selected,
        if (callback != null)
            this.convert(callback);
        // else, open the image in fullsize image modal that is selected.
        else
            this.convert(function (clickedImage) {
                return FullSizeImageModal.load(_this.imageBox.contentBox.content.indexOf(clickedImage));
            });
        // Change the prompt.
        // If the user is selecting something, indicate that clicking on an image selects it for something, 
        // else, indicate that clicking an image will make it go fullscreen.
        this.prompt.innerText = callback ? 'Select an Image' : 'My Images';
        // Put the dropdown in the foreground in case a modal is open.
        // Otherwise it is covered by the modal backdrop and that backdrop will dim the dropdown and intercept any click intended for the dropdown.
        this.rootElm.style.zIndex = "" + (Modal.openModals.length + 1);
    };
    /*
        Manually changes the click callback of each image card in the imageBox,
        moves the dropdown to the foreground,
        and prompts the user to select an image.

        This is used if the image dropdown is already open and the user needs to select an image.
    */
    ImageDropdown.prototype.convert = function (callback) {
        // Loop through each image card in the image box and change it's callback to the one provided.
        this.imageBox.contentBox.content.forEach(function (i) { return i.click = function (imageCard) { return callback(imageCard); }; });
        // Bring the dropdown to the foreground.
        this.rootElm.style.zIndex = "" + (Modal.openModals.length + 2); // XXX test if this can be exchanged for the last argument in load(). XXX
        // Prompt the user to select an image.
        this.prompt.innerText = 'Select an Image';
    };
    return ImageDropdown;
}(Dropdown));
//# sourceMappingURL=ImageDropdown.js.map