/*
    This class contains the functionality for a fullscreen image viewer.
    If an image is selected from a collection of images, the collection can be navigated from the fullscreen view.
        (There will be left and right arrows to go backward or forward in the collection.)
*/
class FullSizeImageModal {

    /*
    
    // A requirement of being a modal. The base class shows and hides this.
    modalCon;
    
    // This is used to close this modal.
    // Normally the Modal base class sets the click callback of modalCon for every sub-modal to close the highest modal,
    // but since the content elm covers up modalCon in this modal, modalCon cannot be clicked on.
    content;

    // Image box for the fullsize image to be displayed in.
    imageCon;

    // An array of elms that may get in the way of the image and only apply to viewing a collection.
    // The visiblity of each one is toggled when the fullsize image is clicked on.
    imageControls;

    // Used to go back an image.
    btnPrev;

    // Used to go forward an image.
    btnNext;

    // Displays the current index and the total number of images in a collection (ex. 7/10).
    imageCount;

    // The owner of the collection of images being shown.
    profileId;

    // An integer that tracks the current index of the collection being displayed.
    index;

    // The total number of images in a collection.
    profileImagesCount;
        
    */

    /*
        Sudo-inherits from the sudo-base class
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    static initialize() {

        // Inherit from base class.
        Modal.add(this);

        // Get handles on modal HTML elms.
        this.modalCon = document.getElementById('fullsizeImageModal');
        this.content = document.getElementById('fullSizeImageModalContent');
        this.btnPrev = document.getElementById('btnFullsizePrevious');
        this.btnNext = document.getElementById('btnFullsizeNext');
        this.imageCount = document.getElementById('imageCount');

        // Get a handle on a group of HTML elms.
        this.imageControls = [this.imageCount, this.btnNext, this.btnPrev, Modal.btnClose];

        // Construct a image box for the fullsize image and get a handle on it.
        this.imageCon = new ImageBox(document.getElementById('fullsizeImageCon'), '', 'fullSizeImage', () => ()=> this.toggleControls());

        // Set height of imageCon so the image is not overlapped by the nav bar.
        this.imageCon.height = window.innerHeight - Main.navBar.clientHeight;

        // Set the callback of btnPrev to invoke requestImage with a deincrement.
        this.btnPrev.onclick = () => this.requestImage(-1);

        // Set the callback of btnPrev to invoke requestImage with an increment.
        this.btnNext.onclick =()=> this.requestImage(1);

        // Set the callback of content to invoke close().
        // Target is checked because clicking an elm above content will still count as a click on content, but content will not be the target.
        this.content.onclick =e => { if (e.target == this.content) this.close(); }
    }

    /*
        Loads a single image (as opposed to a collection).

        imageId must be an int.
    */
    static loadSingle(imageId) {

        // Load image into imageCon by ImageID.
        this.imageCon.load(imageId, 'fullSizeImage', () => ()=> this.toggleClose());

        // Hides all controls.
        this.hideControls();

        // Open this modal. (btnClose control is unhidden by Modal)
        this.open();
    }

    /*
        Loads a collection of images, starting on the image in the collection that was clicked on.
    
        PARAMETERS:
        clickedImageIndex must be an int.
        profileId can be an int or null. If null, it will become the current user's ProfileID.
    */
    static load(clickedImageIndex, profileId) {

        // Reset this modal.
        this.reset(); // XXX reset is only two lines and is only invoked once here, replace this line with it's two line. XXX

        // Get a handle on the provided ProfileID or the current user's ProfileID.
        this.profileId = profileId ? profileId : User.id;

        // Set the index in the current collection.
        this.index = clickedImageIndex;

        // Request the count of current collection by ProfileID.
        Repo.imageCount(this.profileId,

            // When the count arrives.
            imageCount => {

                // Get a handle on the count.
                this.profileImagesCount = imageCount;

                // Update the image count (now that we have the current index and total count of the new collection).
                this.updateImageCount();

                // Invoke request with a neutral increment.
                this.requestImage(0);
            }
        );

        // Open this modal.
        this.open();
    }

    /*
        Have a request be made based on the distance and direction from the current index.

        increment should be a number between -1 and 1.
            -1 = previus image.
            0 = load current image. (kicks off the process)
            1 = next image.
    */
    static requestImage(increment) {

        // Get a handle on the target index.
        let indexToBe = this.index + increment; // XXX rename this to targetIndex.

        // If target index is within range of the collection.
        if (indexToBe >= 0 && indexToBe < this.profileImagesCount) {

            // Set index to the target index.
            this.index = indexToBe;

            // Update the image count elm.
            this.updateImageCount();

            // Request a list of images with a 1 long range. This is the only way to request by index.
            Repo.images(this.profileId, this.index, 1, '', () => { },

                // When the array of 1 image card arrives.
                imageCards =>

                    // Load that image card into the fullsize image container.
                    this.imageCon.load(imageCards[0].rawImage.id, null, ()=> ()=> this.toggleControls()));
        }
    }
    
    /*
        Resets this modal to it's default state.

        XXX not used enough. soon to be depricated. XXX
    */
    static reset() {
        this.showControls();
        this.imageCon.unload();
    }

    // Update the image count tag's inner text value.
    static updateImageCount() { this.imageCount.innerText = `${this.index + 1} / ${this.profileImagesCount}`; }

    // Toggle the visibility of the close button.
    static toggleClose() { Modal.btnClose.style.display != 'none' ? ViewUtil.hide(Modal.btnClose) : ViewUtil.show(Modal.btnClose); }

    // Toggle the visibility of the control elms.
    static toggleControls() { this.btnNext.style.display != 'none' ? this.hideControls() : this.showControls(); }

    // Show the control elms.
    static showControls() { this.imageControls.forEach(c => ViewUtil.show(c)); }

    // Hide the control elms.
    static hideControls() { this.imageControls.forEach(c => ViewUtil.hide(c)); }
}