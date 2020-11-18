/*
    This class contains the functionality for a fullscreen image viewer.
    If an image is selected from a collection of images, the collection can be navigated from the fullscreen view.
        (There will be left and right arrows to go backward or forward in the collection.)
*/
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
var FullSizeImageModal = /** @class */ (function (_super) {
    __extends(FullSizeImageModal, _super);
    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    function FullSizeImageModal(rootElm, content, btnPrev, btnNext, imageCount, imageBoxElm, imageClassList) {
        var _this = _super.call(this, rootElm) || this;
        // Get handles on modal HTML elms.
        _this.content = content;
        _this.btnPrev = btnPrev;
        _this.btnNext = btnNext;
        _this.imageCount = imageCount;
        _this.imageClassList = imageClassList;
        // Get a handle on a group of HTML elms.
        _this.imageControls = [_this.imageCount, _this.btnNext, _this.btnPrev, Modal.btnClose];
        // Construct a image box for the fullsize image and get a handle on it.
        _this.imageCon = new ImageBox(imageBoxElm, '', imageClassList, function () { return function () { return _this.toggleControls(); }; });
        // Set height of imageCon so the image is not overlapped by the nav bar.
        _this.imageCon.height = window.innerHeight - Main.navBar.clientHeight;
        // Set the callback of btnPrev to invoke requestImage with a deincrement.
        _this.btnPrev.onclick = function () { return _this.requestImage(-1); };
        // Set the callback of btnPrev to invoke requestImage with an increment.
        _this.btnNext.onclick = function () { return _this.requestImage(1); };
        // Set the callback of content to invoke close().
        // Target is checked because clicking an elm above content will still count as a click on content, but content will not be the target.
        _this.content.onclick = function (e) { if (e.target == _this.content)
            _this.close(); };
        return _this;
    }
    /*
        Loads a single image (as opposed to a collection).

        imageId must be an int.
    */
    FullSizeImageModal.prototype.loadSingle = function (imageId) {
        var _this = this;
        // Load image into imageCon by ImageID.
        this.imageCon.load(imageId, this.imageClassList, function () { return function () { return _this.toggleClose(); }; });
        // Hides all controls.
        this.hideControls();
        // Open this modal. (btnClose control is unhidden by Modal)
        _super.prototype.open.call(this);
    };
    /*
        Loads a collection of images, starting on the image in the collection that was clicked on.
    
        PARAMETERS:
        clickedImageIndex must be an int.
        profileId can be an int or null. If null, it will become the current user's ProfileID.
    */
    FullSizeImageModal.prototype.load = function (clickedImageIndex, profileId) {
        var _this = this;
        // Reset this modal.
        this.reset(); // XXX reset is only two lines and is only invoked once here, replace this line with it's two line. XXX
        // Get a handle on the provided ProfileID or the current user's ProfileID.
        this.profileId = profileId ? profileId : User.id;
        // Set the index in the current collection.
        this.index = clickedImageIndex;
        // Request the count of current collection by ProfileID.
        Repo.imageCount(this.profileId, 
        // When the count arrives.
        function (imageCount) {
            // Get a handle on the count.
            _this.profileImagesCount = imageCount;
            // Update the image count (now that we have the current index and total count of the new collection).
            _this.updateImageCount();
            // Invoke request with a neutral increment.
            _this.requestImage(0);
        });
        // Open this modal.
        _super.prototype.open.call(this);
    };
    /*
        Have a request be made based on the distance and direction from the current index.

        increment should be a number between -1 and 1.
            -1 = previus image.
            0 = load current image. (kicks off the process)
            1 = next image.
    */
    FullSizeImageModal.prototype.requestImage = function (increment) {
        var _this = this;
        // Get a handle on the target index.
        var indexToBe = this.index + increment; // XXX rename this to targetIndex.
        // If target index is within range of the collection.
        if (indexToBe >= 0 && indexToBe < this.profileImagesCount) {
            // Set index to the target index.
            this.index = indexToBe;
            // Update the image count elm.
            this.updateImageCount();
            // Request a list of images with a 1 long range. This is the only way to request by index.
            Repo.images(this.profileId, this.index, 1, '', function () { }, 
            // When the array of 1 image card arrives.
            function (imageCards) {
                // Load that image card into the fullsize image container.
                return _this.imageCon.load(imageCards[0].rawImage.id, null, function () { return function () { return _this.toggleControls(); }; });
            });
        }
    };
    /*
        Resets this modal to it's default state.

        XXX not used enough. soon to be depricated. XXX
    */
    FullSizeImageModal.prototype.reset = function () {
        this.showControls();
        this.imageCon.unload();
    };
    // Update the image count tag's inner text value.
    FullSizeImageModal.prototype.updateImageCount = function () { this.imageCount.innerText = this.index + 1 + " / " + this.profileImagesCount; };
    // Toggle the visibility of the close button.
    FullSizeImageModal.prototype.toggleClose = function () { Modal.btnClose.style.display != 'none' ? ViewUtil.hide(Modal.btnClose) : ViewUtil.show(Modal.btnClose); };
    // Toggle the visibility of the control elms.
    FullSizeImageModal.prototype.toggleControls = function () { this.btnNext.style.display != 'none' ? this.hideControls() : this.showControls(); };
    // Show the control elms.
    FullSizeImageModal.prototype.showControls = function () { this.imageControls.forEach(function (c) { return ViewUtil.show(c); }); };
    // Hide the control elms.
    FullSizeImageModal.prototype.hideControls = function () { this.imageControls.forEach(function (c) { return ViewUtil.hide(c); }); };
    return FullSizeImageModal;
}(Modal));
//# sourceMappingURL=FullSizeImageModal.js.map