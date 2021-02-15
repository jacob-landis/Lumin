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
    private imageBox: ProfileImagesBox;
    
    // Holds an onClick callback. Set when image onClicks are converted. Used for newly uploaded images so they can fit in.
    private heldOnClick: (target: ImageCard) => void;

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
        btnUploadImageModal: HTMLElement
    ) {

        super(rootElm, contentElm);

        // Get handles on dropdown HTML elms.
        this.imageWrapper = imagesWrapper;
        this.prompt = prompt;

        // Create ProfileImagesBox to hold dropdown images. Load current users images.
        this.imageBox = new ProfileImagesBox(null, this.contentElm, (target: ImageCard) =>

            // Load album into fullsize image modal starting at the index of the clicked image card.
            fullSizeImageModal.load(this.imageBox.content.indexOf(target))
        );

        // Append ProfileImagesBox to this imageWrapper.
        this.imageWrapper.append(this.imageBox.rootElm);

        // UPLOAD IMAGE
        // Sets up onchange event on file input.
        // This is triggered once the user has selected a file from their computers file system.
        // (Refer to this elm in /Views/Home/Index.cshtml for further explaination.)
        // This has the additional function of updating any and all active displays of the current user's images when one is added.
        btnUploadImageModal.onchange = (e: MouseEvent) =>

            // Send file (must be accessed through the MouseEvent) and callback to image upload modal.
            uploadImageModal.load(e,

                // When the image is uploaded (if it was uploaded) and it comes back,
                (imageCard: ImageCard) =>

                    // loop through all the profileImageBoxs,
                    ProfileImagesBox.profileImageBoxes.forEach((p: ProfileImagesBox) => {

                        // and if the image box is displaying the current user's images, add the newly uploaded image to it.
                        if (p.profileId == User.profileId) p.addImageCard(ImageCard.copy(imageCard), true);
                    })
            );
    }

    /*
        Override open() so load can be called first.
        (this.open() is called on dropdowns when toggled)
    */
    public open() {
        this.load(User.profileId, "My images");
        super.open();
    }

    /*
        Convert the click behavior of images in the dropdown,
        give the user a prompt,
        and bring this dropdown to the foreground.
    */
    public load(profileId: number, promptMsg: string = "", onImageClick?: (target: ImageCard) => void): void {

        // If a callback was provided.
        if (onImageClick != null) {

            // If its the same profile.
            if (profileId == this.imageBox.profileId) {

                // Convert the onclick of the currently loaded images to the one provided.
                this.convert(onImageClick);
            }
            else {

                // Start over image loading with new profile and onclick.
                this.imageBox.load(profileId, onImageClick);
            }
        }
        else {

            // If its the same profile.
            if (profileId == this.imageBox.profileId) {

                // Convert the onclick of the currently loaded images to the defualt onclick.
                this.convert((target: ImageCard) => {

                    // Open the image in fullsize image modal that is selected.
                    fullSizeImageModal.load(this.imageBox.content.indexOf(<IAppendable>target), profileId);
                });
            }
            else {

                // Start over image loading with new profile and defualt onclick.
                this.imageBox.load(profileId, (target: ImageCard) => {

                    // Open the image in fullsize image modal that is selected.
                    fullSizeImageModal.load(this.imageBox.content.indexOf(<IAppendable>target), profileId);
                });
            } 
        }
        
        // Change the prompt.
        // If the user is selecting something, indicate that clicking on an image selects it for something, 
        // else, indicate that clicking an image will make it go fullscreen.
        this.prompt.innerText = promptMsg;
        
        super.open();
    }

    /*
        Manually changes the click callback of each image card in the imageBox,
        moves the dropdown to the foreground,
        and prompts the user to select an image.

        This is used if the image dropdown is already open and the user needs to select an image.
    */
    public convert(callback: (imageCard: ImageCard) => void): void {

        // Save callback in ProfileImagesBox for newly uploaded images that come in to get their callback from.
        this.imageBox.clickCallback = (target: ImageCard) => callback(target);

        // Loop through each image card in the image box and change it's callback to the one provided.
        this.imageBox.content.forEach((imageCard: IAppendable) => (<ImageCard> imageCard).onImageClick = this.imageBox.clickCallback);

        // Prompt the user to select an image.
        this.prompt.innerText = 'Select an Image';

        // If this is closed, open.
        if (!ViewUtil.isDisplayed(this.rootElm)) super.open();
    }
}