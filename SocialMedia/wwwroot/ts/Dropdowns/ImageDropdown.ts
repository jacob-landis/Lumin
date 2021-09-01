/*
    This class controls the content in the image dropdown.
    
    It displays the current user's images.
    By default, clicking on the images opens them in the fullsize image modal.
    However, other classes can change the click behavior of the images temporarily.
        This functionality is utilized to select an image, either for a post or for a profile picture.
        There is also a parameter for a message that gets displayed to the user like "Select an image for profile picture."

    This image collection supports lazy loading.
*/
class ImageDropdown extends Dropdown {
    
    // Holds the main HTML elm of imageBox.
    private imageWrapper: HTMLElement;

    // A place for instructions to the user (ex. Select an image for profile picture).
    private prompt: HTMLElement;

    // Holds image cards.
    public imagesBox: ProfileImagesBox;
    
    private highLitImage: ImageCard = null;

    /*
        Gets handles on all necessary components.
        Sets up event listeners for image upload and lazy loading.
        Sudo-inherits from sudo-base class.
    */
    public constructor(
        rootElm: HTMLElement,
        contentElm: HTMLElement,
        imagesWrapper: HTMLElement,
        prompt: HTMLElement,
        btnOpenUploadImageModal: HTMLElement,
        btnOpen: HTMLElement
    ) {

        super(rootElm, contentElm, btnOpen);

        // Get handles on dropdown HTML elms.
        this.imageWrapper = imagesWrapper;
        this.prompt = prompt;

        // Create ProfileImagesBox to hold dropdown images. Load current users images.
        this.imagesBox = new ProfileImagesBox('Fullscreen', this.contentElm, (target: ImageBox) =>

            // Load album into fullsize image modal starting at the index of the clicked image card.
            imageGalleryModal.load(this.indexOf(target))
        );

        // Append ProfileImagesBox to this imageWrapper.
        this.imageWrapper.append(this.imagesBox.rootElm);

        // UPLOAD IMAGE
        // Sets up onchange event on file input.
        // This is triggered once the user has selected a file from their computers file system.
        // (Refer to this elm in /Views/Home/Index.cshtml for further explaination.)
        // This has the additional function of updating any and all active displays of the current user's images when one is added.
        btnOpenUploadImageModal.onchange = (e: MouseEvent) =>

            // Send file (must be accessed through the MouseEvent) and callback to image upload modal.
            uploadImageModal.load(e,

                // When the image is uploaded (if it was uploaded) and it comes back,
                (imageCard: ImageCard) =>

                    // loop through all the profileImageBoxs,
                    ProfileImagesBox.profileImageBoxes.forEach((p: ProfileImagesBox) => {

                        let imageBox = new ImageBox(ViewUtil.tag("div"), imageCard.rootElm.classList.value, imageCard.tooltipMsg, null, 1);

                        imageBox.loadImage(ImageCard.copy(imageCard));

                        // and if the image box is displaying the current user's images, add the newly uploaded image to it.
                        if (p.profileId == User.profileId) p.addImage(imageBox, true);
                    })
            );
    }

    /*
        Override open() so load can be called first.
        (this.open() is called on dropdowns when toggled)
    */
    public open() {
        this.load(User.profileId, "My images");
    }

    /*
        Convert the click behavior of images in the dropdown,
        give the user a prompt,
        and bring this dropdown to the foreground.
    */
    public load(profileId: number, promptMsg: string = "", tooltipMsg: string = null, onImageClick?: (target: ImageBox) => void): void {

        // If a callback was provided.
        if (onImageClick != null) {

            // If its the same profile.
            if (profileId == this.imagesBox.profileId) {

                // Convert the onclick of the currently loaded images to the one provided.
                this.convert(tooltipMsg, onImageClick);
            }
            else {

                // Start over image loading with new profile and onclick.
                this.imagesBox.load(profileId, tooltipMsg, onImageClick);
            }
        }
        else {

            // If its the same profile.
            if (profileId == this.imagesBox.profileId) {

                // Convert the onclick of the currently loaded images to the defualt onclick.
                this.convert('Fullscreen', (target: ImageBox) => {

                    // Open the image in fullsize image modal that is selected.
                    imageGalleryModal.load(this.indexOf(target), profileId);
                });
            }
            else {

                // Start over image loading with new profile and defualt onclick.
                this.imagesBox.load(profileId, 'Fullscreen', (target: ImageBox) => {

                    // Open the image in fullsize image modal that is selected.
                    imageGalleryModal.load(this.indexOf(target), profileId);
                });
            } 
        }
        
        // Change the prompt.
        // If the user is selecting something, indicate that clicking on an image selects it for something, 
        // else, indicate that clicking an image will make it go fullscreen.
        this.prompt.innerText = promptMsg;

        // If this dropdown is not open, open it.
        if (Dropdown.openDropdown != this) super.open();
    }

    /*
        Manually changes the click callback of each image card in the imageBox,
        moves the dropdown to the foreground,
        and prompts the user to select an image.

        This is used if the image dropdown is already open and the user needs to select an image.
    */
    private convert(tooltipMsg: string, callback: (imageCard: ImageBox) => void): void {

        // Save callback in ProfileImagesBox for newly uploaded images that come in to get their callback from.
        this.imagesBox.clickCallback = (target: ImageBox) => callback(target);

        // Loop through each image card in the image box and change it's callback to the one provided.
        this.imagesBox.content.forEach((imageBox: IAppendable) => {
            (<ImageBox>imageBox).imageCard.onImageClick = this.imagesBox.clickCallback;
            (<ImageBox>imageBox).imageCard.tooltipMsg = tooltipMsg;
        });

        // Prompt the user to select an image.
        this.prompt.innerText = 'Select an Image';
    }

    public indexOf(imageBox: ImageBox): number {
        return this.imagesBox.content.indexOf(<IAppendable>imageBox);
    }

    public highlightAtIndex(targetIndex: number) {

        // un-highlight any highlit images
        this.clearHighlight();

        // Get handle on the image at the given target index.
        this.highLitImage = <ImageCard>this.imagesBox.content[targetIndex];

        // Highlight the target image.
        this.highLitImage.rootElm.classList.add('highlighted');
    }

    public clearHighlight() {
        if (this.highLitImage != null) this.highLitImage.rootElm.classList.remove('highlighted');
    }
}