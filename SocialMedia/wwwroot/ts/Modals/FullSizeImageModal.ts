﻿/*
    This class contains the functionality for a fullscreen image viewer.
    If an image is selected from a collection of images, the collection can be navigated from the fullscreen view.
        (There will be left and right arrows to go backward or forward in the collection.)
*/

class FullSizeImageModal extends Modal {
    
    // This is used to close this modal.
    // Normally the Modal base class sets the click callback of modalCon for every sub-modal to close the highest modal,
    // but since the content elm covers up modalCon in this modal, modalCon cannot be clicked on.
    private content: HTMLElement;

    // Image box for the fullsize image to be displayed in.
    private imageCon: ImageBox;

    // An array of elms that may get in the way of the image and only apply to viewing a collection.
    // The visiblity of each one is toggled when the fullsize image is clicked on.
    private imageControls: HTMLElement[];

    // Used to go back an image.
    private btnPrev: HTMLElement;

    // Used to go forward an image.
    private btnNext: HTMLElement;

    // Displays the current index and the total number of images in a collection (ex. 7/10).
    private imageCount: HTMLElement;

    // The owner of the collection of images being shown.
    private profileId: number;

    // An integer that tracks the current index of the collection being displayed.
    private index: number;

    // The total number of images in a collection.
    private profileImagesCount: number;

    private imageClassList: string;

    // Singular flag/switch. false == plural.
    private singular: boolean = null;

    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    public constructor(
        rootElm: HTMLElement,
        content: HTMLElement,
        btnPrev: HTMLElement,
        btnNext: HTMLElement,
        imageCount: HTMLElement,
        imageBoxElm: HTMLElement,
        imageClassList: string
    ) {
        super(rootElm);

        // Get handles on modal HTML elms.
        this.content = content;
        this.btnPrev = btnPrev;
        this.btnNext = btnNext;
        this.imageCount = imageCount;
        this.imageClassList = imageClassList;

        // Get a handle on a group of HTML elms.
        this.imageControls = [this.imageCount, this.btnNext, this.btnPrev, Modal.btnClose];

        // Construct a image box for the fullsize image and get a handle on it.
        this.imageCon = new ImageBox(imageBoxElm, imageClassList, (target: ImageCard)=> this.toggleControls());

        // Set height of imageCon so the image is not overlapped by the nav bar.
        this.imageCon.height = window.innerHeight - Main.navBar.clientHeight;

        // Set the callback of btnPrev to invoke requestImage with a deincrement.
        this.btnPrev.onclick = () => this.requestImage(-1);

        // Set the callback of btnPrev to invoke requestImage with an increment.
        this.btnNext.onclick =()=> this.requestImage(1);

        // Set the callback of content to invoke close().
        // Target is checked because clicking an elm above content will still count as a click on content, but content will not be the target.
        //this.content.onclick =e => { if (e.target == this.content) this.close(); }
    }

    /*
        Loads a single image (as opposed to a collection).

        imageId must be an int.
    */
    public loadSingle(imageId: number): void {

        // Load image into imageCon by ImageID.
        this.imageCon.load(imageId, this.imageClassList, (target: ImageCard) => this.toggleClose());

        // Hides all controls.
        this.hideControls();
        
        // Open this modal. (btnClose control is unhidden by Modal)
        this.openOverrided();

        // Raise singular flag.
        this.singular = true;
    }

    /*
        Loads a collection of images, starting on the image in the collection that was clicked on.
    
        PARAMETERS:
        clickedImageIndex must be an int.
        profileId can be an int or null. If null, it will become the current user's ProfileID.
    */
    public load(clickedImageIndex: number, profileId?: number): void {

        // Get a handle on the provided ProfileID or the current user's ProfileID.
        this.profileId = profileId ? profileId : User.profileId;

        // Set the index in the current collection.
        this.index = clickedImageIndex;

        // Request the count of current collection by ProfileID.
        Ajax.getProfileImagesCount(this.profileId,

            // When the count arrives.
            (imageCount: number) => {

                // Get a handle on the count.
                this.profileImagesCount = imageCount;

                // Update the image count (now that we have the current index and total count of the new collection).
                this.updateImageCount();

                // Invoke request with a neutral increment.
                this.requestImage(0);
            }
        );
        
        // Open this modal.
        this.openOverrided();
        
        // Get profile by id and use its name to load image dropdown.
        Ajax.getProfile(profileId, (profileCard: ProfileCard) => {

            let promptMsg: string = (profileId == User.profileId) ? "My images" : `${profileCard.profile.name}'s images`;

            imageDropdown.load(profileId, promptMsg);
        });

        this.singular = false;
    }

    /*
        Invokes super.open(), then undoes something that super.open() did.
        super.open() moves any dropdown to the foreground. This undoes that by moving it to the background.
        This is used so the image dropdown can be used as a pocket for full size image modal and so other dropdowns don't get in the way.
    */
    private openOverrided() {
        super.open();

        // Move any dropdown to background.
        Dropdown.moveToBackground();
    }
    
    /*
        Closes after reseting this modal.
    */
    public close() {

        // Reset 
        this.showControls();

        // If singular, hide image dropdown.
        // (prevents incorrect showing in this.showControls())
        if (this.singular == true) ViewUtil.hide(imageDropdown.rootElm);

        // Clear full size image slot.
        this.imageCon.unload();

        super.close();
    }

    /*
        Have a request be made based on the distance and direction from the current index.

        increment should be a number between -1 and 1.
            -1 = previus image.
            0 = load current image. (kicks off the process)
            1 = next image.
    */
    private requestImage(increment: (-1|0|1)): void {

        // Get a handle on the target index.
        let indexToBe: number = this.index + increment; // XXX rename this to targetIndex.

        // If target index is within range of the collection.
        if (indexToBe >= 0 && indexToBe < this.profileImagesCount) {

            // Set index to the target index.
            this.index = indexToBe;

            // Update the image count elm.
            this.updateImageCount();

            // Request a list of images with a 1 long range. This is the only way to request by index.
            Ajax.getProfileImages(this.profileId, this.index, 1, '', () => { },

                // When the array of 1 image card arrives.
                (imageCards) => {
                    // Load that image card into the fullsize image container.
                    this.imageCon.load(imageCards[0].image.imageId, null, (target: ImageCard) => this.toggleControls());
                }
            );
        }
    }

    // Update the image count tag's inner text value.
    private updateImageCount(): void { this.imageCount.innerText = `${this.index + 1} / ${this.profileImagesCount}`; }

    // Toggle the visibility of the close button.
    private toggleClose(): void { Modal.btnClose.style.display != 'none' ? ViewUtil.hide(Modal.btnClose) : ViewUtil.show(Modal.btnClose); }

    // Toggle the visibility of the control elms.
    private toggleControls(): void { this.btnNext.style.display != 'none' ? this.hideControls() : this.showControls(); }

    // Show the control elms.
    private showControls() {
        ViewUtil.show(imageDropdown.rootElm);
        this.imageControls.forEach(c => ViewUtil.show(c));
    }

    // Hide the control elms.
    private hideControls() {
        ViewUtil.hide(imageDropdown.rootElm);
        this.imageControls.forEach(c => ViewUtil.hide(c));
    }
}