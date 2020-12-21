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
        this.imageBox = new ProfileImagesBox(null, (targetImageCard) =>

            // Load album into fullsize image modal starting at the index of the clicked image card.
            fullSizeImageModal.load(this.imageBox.content.indexOf(targetImageCard))
        );

        // Append ProfileImagesBox to this imageWrapper.
        this.imageWrapper.append(this.imageBox.rootElm);

        // UPLOAD IMAGE
        // Sets up onchange event on file input.
        // This is triggered once the user has selected a file from their computers file system.
        // (Refer to this elm in /Views/Home/Index.cshtml for further explaination.)
        // This has the additional function of updating any and all active displays of the current user's images when one is added.
        btnUploadImageModal.onchange = e =>

            // Send file and callback to image upload modal.
            uploadImageModal.load(e,

                // When the image is uploaded (if it was uploaded) and it comes back,
                imageCard =>

                    // loop through all the profileImageBoxs,
                    ProfileImagesBox.profileImageBoxes.forEach(p => {

                        // and if the image box is displaying the current user's images, add the newly uploaded image to it.
                        if (p.profileId == User.profileId) p.addImageCard(imageCard);
                    })
            );

        // LAZY LOADING
        // When content is scrolled,
        this.contentElm.onscroll = () => {

            // take a scroll measurement,
            let offset = this.contentElm.scrollTop + window.innerHeight;

            // and if it surpasses the threshold, request more content.
            if (offset >= this.imageBox.height) this.imageBox.request(15);
        }
    }

    /*
        Override open() so load can be called first.
        (open() is called on dropdowns when toggled)
    */
    public open() {
        this.load();
        super.open();
    }

    /*
        Convert the click behavior of images in the dropdown,
        give the user a prompt,
        and bring this dropdown to the foreground.
    */
    public load(callback?: (imageCard: ImageCard) => void): void {

        // If a callback was provided, send the image to it that is selected,
        if (callback != null) this.convert(callback);

        // else, open the image in fullsize image modal that is selected.
        else this.convert((clickedImage: ImageCard) =>
            fullSizeImageModal.load(this.imageBox.content.indexOf(<IAppendable> clickedImage)));
        
        // Change the prompt.
        // If the user is selecting something, indicate that clicking on an image selects it for something, 
        // else, indicate that clicking an image will make it go fullscreen.
        this.prompt.innerText = callback ? 'Select an Image' : 'My Images';

        // Put the dropdown in the foreground in case a modal is open.
        // Otherwise it is covered by the modal backdrop and that backdrop will dim the dropdown and intercept any click intended for the dropdown.
        this.rootElm.style.zIndex = `${Modal.openModals.length + 1}`;
    }

    /*
        Manually changes the click callback of each image card in the imageBox,
        moves the dropdown to the foreground,
        and prompts the user to select an image.

        This is used if the image dropdown is already open and the user needs to select an image.
    */
    public convert(callback: (imageCard: ImageCard) => void): void {

        // Loop through each image card in the image box and change it's callback to the one provided.
        this.imageBox.content.forEach(i => (<ImageCard> i).onImageClick = imageCard => callback(imageCard));

        // Bring the dropdown to the foreground.
        this.rootElm.style.zIndex = `${Modal.openModals.length + 2}`; // XXX test if this can be exchanged for the last argument in load(). XXX

        // Prompt the user to select an image.
        this.prompt.innerText = 'Select an Image';
    }
}