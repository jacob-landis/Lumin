﻿/*
    This class contains the functionality for a fullscreen image viewer.
    If an image is selected from a collection of images, the collection can be navigated from the fullscreen view.
        (There will be left and right arrows to go backward or forward in the collection.)
*/

class ImageGalleryModal extends Modal {

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

    private imageDateTime: HTMLElement;

    // The owner of the collection of images being shown.
    private profileId: number;

    // An integer that tracks the current index of the collection being displayed.
    private index: number;
    
    // The total number of images in a collection.
    private profileImagesCount: number;

    private imageClassList: string;

    // Singular flag/switch. false == plural.
    private isSingular: boolean = null;
    
    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    public constructor(
        rootElm: HTMLElement,
        btnPrev: HTMLElement,
        btnNext: HTMLElement,
        imageCount: HTMLElement,
        private imageOwnership: HTMLElement,
        private imageOwner: HTMLElement,
        private imagePrivacy: HTMLElement,
        private selectImagePrivacy: HTMLSelectElement,
        imageDateTime: HTMLElement,
        imageBoxElm: HTMLElement,
        imageClassList: string
    ) {
        super(rootElm);

        // Set background-click-to-close functionality. This element covers the real modal root element.
        rootElm.onclick = (event: MouseEvent) => { if (event.target == rootElm) this.close(); }
        
        // Get handles on modal HTML elms.
        this.btnPrev = btnPrev;
        this.btnNext = btnNext;
        this.imageCount = imageCount;
        this.imageDateTime = imageDateTime;
        this.imageClassList = imageClassList;

        // Get a handle on a group of HTML elms.
        this.imageControls = [this.imageCount, this.imageOwnership, this.imageDateTime, btnNext, btnPrev, Modal.btnClose];

        // Construct a image box for the fullsize image and get a handle on it.
        this.imageCon = new ImageBox(imageBoxElm, imageClassList, 'Toggle controls', (target: ImageBox) => this.toggleControls(), 3);

        this.imageCon.onLoadEnd = () => {
            this.imageDateTime.innerText = `Uploaded on ${Util.formatDateTime(this.imageCon.imageCard.image.dateTime)}`;
            
            if (this.imageCon.imageCard.image.profileId == User.profileId) {
                ViewUtil.hide(this.imageOwner);
                ViewUtil.show(this.imagePrivacy);
                this.selectImagePrivacy.value = `${this.imageCon.imageCard.image.privacyLevel}`;
            }
            else {
                ViewUtil.hide(this.imagePrivacy);
                ViewUtil.show(this.imageOwner);
                ViewUtil.empty(this.imageOwner);
                Ajax.getProfile(this.imageCon.imageCard.image.profileId, (profileCard: ProfileCard) => {
                    this.imageOwner.append(profileCard.rootElm);
                });
            }
        }

        this.selectImagePrivacy.onchange = () => {
            Ajax.updateImagePrivacy(this.imageCon.imageCard.image.imageId, this.selectImagePrivacy.selectedIndex);
        };

        // Set the callback of btnPrev to invoke requestImage with a deincrement.
        this.btnPrev.onclick = (e: MouseEvent) => this.requestImage(this.index - 1);

        // Set the callback of btnPrev to invoke requestImage with an increment.
        this.btnNext.onclick = (e: MouseEvent) => this.requestImage(this.index + 1);

        // Set left and right arrow keys to go to next or previous image.
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (this.hasFocus && !this.isSingular) {
                if (event.keyCode == 37) this.btnPrev.click();
                else if (event.keyCode == 39) this.btnNext.click();
            }
        });
    }

    /*
        Loads a single image (as opposed to a collection).

        imageId must be an int.
    */
    public loadSingle(imageId: number): void {

        // Load image into imageCon by ImageID.
        this.imageCon.load(imageId, this.imageClassList, 'Toggle controls', (target: ImageBox) => this.toggleControls());

        // Hides all controls.
        this.hideControls();

        this.showSingularControls();

        // Open this modal. (btnClose control is unhidden by Modal)
        this.openOverrided();

        // Raise singular flag.
        this.isSingular = true;
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
            (imageCount: string) => {

                // Get a handle on the count.
                this.profileImagesCount = +imageCount;

                // Update the image count (now that we have the current index and total count of the new collection).
                this.updateImageCount();

                // Invoke request with a neutral increment.
                this.requestImage(this.index);
            }
        );
        
        // Open this modal.
        this.openOverrided();
        
        // Get profile by id and use its name to load image dropdown.
        Ajax.getProfile(profileId, (profileCard: ProfileCard) => {

            let promptMsg: string = (profileId == User.profileId) ? "My images" : `${profileCard.profile.firstName} ${profileCard.profile.lastName}'s images`;
            
            imageDropdown.load(profileId, promptMsg, 'Fullscreen', (target: ImageBox) => {
                this.requestImage(imageDropdown.indexOf(target))
            });
        });

        this.showControls();

        this.isSingular = false;
    }

    /*
        Invokes super.open(), then undoes something that super.open() did.
        super.open() moves any dropdown to the foreground. This undoes that by moving it to the background.
        This is used so the image dropdown can be used as a pocket for full size image modal and so other dropdowns don't get in the way.
    */
    private openOverrided(): void {
        super.open();
    }
    
    /*
        Closes after reseting this modal.
    */
    public close(): void {

        // If singular, hide image dropdown.
        // (prevents incorrect showing in this.showControls())
        if (this.isSingular == true) ViewUtil.hide(imageDropdown.rootElm);

        // Clear full size image slot.
        this.imageCon.unload();

        imageDropdown.clearHighlight();
        imageDropdown.close();

        super.close();
    }
    
    private requestImage(targetIndex: number): void {

        // If target index is within range of the collection.
        if (targetIndex >= 0 && targetIndex < this.profileImagesCount) {

            // Set index to the target index.
            this.index = targetIndex;

            // Update the image count elm.
            this.updateImageCount();
            
            Ajax.getImageByIndex(this.profileId, this.index, 3, '', 'Toggle controls',
                (target: ImageBox) => this.toggleControls(),
                (imageCard: ImageCard) => this.imageCon.loadImage(imageCard));

            imageDropdown.highlightAtIndex(this.index);
        }
    }

    // Update the image count tag's inner text value.
    private updateImageCount(): void { this.imageCount.innerText = `${this.index + 1} / ${this.profileImagesCount}`; }
    
    // Toggle the visibility of the control elms.
    private toggleControls(): void {
        if (this.isSingular)
            ViewUtil.isDisplayed(Modal.btnClose) ? this.hideSingularControls() : this.showSingularControls();
        else
            ViewUtil.isDisplayed(this.btnNext) ? this.hideControls() : this.showControls();
    }

    private showSingularControls(): void {
        ViewUtil.show(Modal.btnClose);
        ViewUtil.show(this.imageDateTime, 'inline');
        ViewUtil.show(this.imageOwnership, 'inline');
        navBar.show();
    }

    private hideSingularControls(): void {
        ViewUtil.hide(Modal.btnClose);
        ViewUtil.hide(this.imageDateTime);
        ViewUtil.hide(this.imageOwnership);
        navBar.hide();
    }

    // Show the control elms.
    private showControls(): void {
        navBar.show();
        ViewUtil.show(imageDropdown.rootElm);
        this.imageControls.forEach((control: HTMLElement) => ViewUtil.show(control));
    }

    // Hide the control elms.
    private hideControls(): void {
        navBar.hide();
        ViewUtil.hide(imageDropdown.rootElm);
        this.imageControls.forEach((control: HTMLElement) => ViewUtil.hide(control));
    }
}