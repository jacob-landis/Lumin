/*
    This class contains the functionality of the create post form.
*/
class CreatePostModal extends Modal {
    
    // A text input elm for the user to enter a caption.
    private txtCaption: HTMLInputElement;
    
    // An elm that wraps the caption input and error messages.
    private captionWrapper: HTMLElement;
    
    // A content box for error messages.
    private errorBox: ContentBox;
    
    // A button that sends the post in a post request to the host.
    private btnSubmit: HTMLElement;

    // A button that clears the attached image. It only appears on hover and when an image is staged.
    private btnClearAttachment: HTMLElement;
    
    // An ImageBox that displays the image the user attaches to the post.
    private selectedImageBox: ImageBox;

    private maxLength: number = 1000;

    private privacyWarning: IAppendable;

    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    public constructor(
        rootElm: HTMLElement,
        txtCaption: HTMLInputElement,
        captionWrapper: HTMLElement,
        btnSubmit: HTMLElement,
        btnClearAttachment: HTMLElement,
        imageBoxElm: HTMLElement,
        private lblCaptionCharacterCount: HTMLElement,
        private selectPostPrivacy: HTMLSelectElement,
        imageClassList: string,
        contentBoxElmId: string
    ) {
        super(rootElm);

        // Get handles on modal HTML elms.
        this.txtCaption = txtCaption;
        this.captionWrapper = captionWrapper;
        this.btnSubmit = btnSubmit;
        this.btnClearAttachment = btnClearAttachment;

        // Construct a content box for errors and get a handle on it.
        this.errorBox = new ContentBox(document.getElementById(contentBoxElmId));

        this.privacyWarning = {
            rootElm: ViewUtil.tag('div', {
                classList: 'errorMsg',
                innerText: '- Warning: This image is more private than this post. The image will be visible in this post to anyone who can see this post.'
            })
        };

        // Append the error box's main tag to the caption wrapper.
        this.captionWrapper.append(this.errorBox.rootElm);

        // Construct an image box with an existing elm and get a handle on it.
        // (Any image that is selected for this post can be clicked on to pick a different image, because of the click parameter value)
        this.selectedImageBox = new ImageBox(
            imageBoxElm, 
            imageClassList, 
            'Attach an image',
            
            // When the image is clicked.
            (targetImage: ImageBox) => this.selectImage(),
            2
        );

        this.selectPostPrivacy.onchange = (e: Event) => this.checkPrivacy();

        this.btnClearAttachment.onclick = (e: MouseEvent) => this.loadPaperClip();

        // Set btnSubmit to invoke submit().
        this.btnSubmit.onclick = (e: MouseEvent) => this.submit();

        this.lblCaptionCharacterCount.innerText = `0/${this.maxLength}`;

        this.txtCaption.onkeyup = (event: KeyboardEvent) => {
            this.lblCaptionCharacterCount.innerText = `${this.txtCaption.value.length}/${this.maxLength}`;

            if (this.txtCaption.value.length > this.maxLength || this.txtCaption.value.length == 0)
                this.lblCaptionCharacterCount.classList.add('errorMsg');

            else if (this.lblCaptionCharacterCount.classList.contains('errorMsg'))
                this.lblCaptionCharacterCount.classList.remove('errorMsg');
        }

        this.loadPaperClip();
    }

    /*
        Loads an image card into the selectedImageCon.

        imageCard must be an ImageCard.
    */
    public load(imageCard?: ImageCard): void {
        
        // Wait for fullsize image.
        if (imageCard != null) {
            Ajax.getImage(imageCard.image.imageId, 2, null, "Attach image", null, (imageCard: ImageCard) => {
                this.selectedImageBox.loadImage(imageCard);
                ViewUtil.show(this.btnClearAttachment, "inline");
                this.checkPrivacy();
            });
        }

        this.selectPostPrivacy.value = `${User.postsPrivacyLevel}`;
        
        // Open this modal.
        this.open();
    }

    /*
        Clears selected image and loads the paper clip icon.
        The paper clip icon indicates that no image is attached.

        XXX The image box may be manually unloaded and loaded because paperClip does not have a tag property
        XXX I could instead wrap it in an object like: {tag: paperClip}
    */
    private loadPaperClip(): void {

        // Hide btnClearAttachment.
        ViewUtil.hide(this.btnClearAttachment);
        
        this.selectedImageBox.unload();

        // Get handle on new paper clip icon.
        let paperClip = Icons.paperClip();

        paperClip.onclick = () => this.selectImage();

        // Append paper clip icon to selected image container.
        this.selectedImageBox.rootElm.append(paperClip);

        this.errorBox.remove(this.privacyWarning);
    }

    /*
        Loads the image dropdown with a callback to return the selected image.
    */
    private selectImage(): void {
        
        // Load the image dropdown.
        imageDropdown.load(

            // Load current user.
            User.profileId,

            // Prompt Msg
            "Select an image",
            'Attach image to post',

            // When the selected image card returns.
            (imageBox: ImageBox) => {

                // Load image into selected image container by id so the fullsize version is requested and displayed.
                this.selectedImageBox.load(imageBox.imageCard.image.imageId, null, 'Attach to post');

                this.checkPrivacy(imageBox.imageCard);

                ViewUtil.show(this.btnClearAttachment);

                imageDropdown.close();
            }
        );
    }

    /*
        Checks for errors and either displays the errors or send the post to the host in a post request.
    */
    private submit(): void {
        
        // Check if there is a caption and hold result.
        let tooShort: boolean = this.txtCaption.value.length <= 0; // XXX Since this is not an error itself, noCaption would be a better name. XXX

        // Check if the caption is too long and hold result.
        let tooLong: boolean = this.txtCaption.value.length > this.maxLength;

        // Check if there is some kind of content in the post.
        let noContent: boolean = tooShort && !this.selectedImageBox.isLoaded; // XXX btnPost should be grayed out until there is content. XXX

        // Create 'too long' error tag.
        let tooLongError: IAppendable =
            { rootElm: ViewUtil.tag('div', { classList: 'errorMsg', innerText: `- Must be less than ${this.maxLength} characters` }) };

        // Create 'no content' error tag
        let noContentError: IAppendable =
            { rootElm: ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Select an image or enter a caption' }) };

        // If any errors were found,
        if (tooLong || noContent) {

            // clear the error box,
            this.errorBox.clear();

            // XXX this should be an if-else-if statement. 'No content' cannot occure while there is too much content. XXX
            if (tooLong) this.errorBox.add(tooLongError);
            if (noContent) this.errorBox.add(noContentError);
        }

        // else no errors were found.
        else {

            // Set imageId of post to the attached image's id or to 0 if no image was attached.
            let imageId: number = this.selectedImageBox.isLoaded ? this.selectedImageBox.imageCard.image.imageId : 0;

            let privacyLevel = this.selectPostPrivacy.selectedIndex;

            // Prep the caption and ImageID to be sent off.
            let post: string = JSON.stringify({ Caption: this.txtCaption.value, ImageId: imageId, PrivacyLevel: privacyLevel }); // XXX there is a method in Repo for this. XXX

            // Send post to host in a post request. XXX put post in a PostRecord XXX
            Ajax.submitPost(post,

                // If and when the post was added and comes back, loop through all the active post boxes,
                (post: PostRecord) => {
                    PostsBox.postBoxes.forEach((p: PostsBox) => {

                        // and add the returned post to the post boxes it belongs in.
                        if (p.profileId == User.profileId)
                            p.addPost(new PostCard(post));
                    });
                }
            );

            // Clear caption in form.
            this.txtCaption.value = ''; // XXX this should be done every time this is opened. Maybe there should be a clear form method. XXX

            // Close this modal.
            this.close();
        }

        this.checkPrivacy();
    }

    /*
        Outputs a warning to the user if there is a potential privacy leak.
        Removes old message if one exists and the potential risk is gone.
    */
    private checkPrivacy(imageCard: ImageCard = null): void {

        let imagePrivacy: number = 0;

        if (imageCard != null)
            imagePrivacy = imageCard.image.privacyLevel;

        else if (this.selectedImageBox.imageCard != null)
            imagePrivacy = this.selectedImageBox.imageCard.image.privacyLevel;

        if (imagePrivacy > this.selectPostPrivacy.selectedIndex) this.errorBox.add(this.privacyWarning);
        else this.errorBox.remove(this.privacyWarning)
    }

    /*
        Overrides base definition.
        Modal base class runs this before finally closing this modal.

        Checks if the user typed something and prompts them to confirm the cancelation if they did.

        callback takes a bool. Passing it true results in this modal closing, passing it false does not.
    */
    public close(): void {

        // If there is nothing in the caption,
        if (this.txtCaption.value.length < 1) {

            this.clear();

            // Proceed with default close function.
            super.close();
        }

        // else there is a caption so,
        else {

            // Prompt the user to confirm cancelation.
            confirmPrompt.load('Are you sure you want to cancel?',

                // When their descision returns,
                (confirmation: boolean) => {

                    // if they decided not to cancel, do nothing,
                    if (!confirmation) return;

                    this.clear();

                    // then call close again.
                    // Doing so will cause this method to be called again,
                    // but now that the caption has been cleared, the IF of this if-else will run instead.
                    super.close(); // XXX this could be less confusing. XXX
                }
            );
        }
    }

    private clear(): void {

        // Clear error box.
        this.errorBox.clear();

        // Clear caption.
        this.txtCaption.value = '';

        if (this.lblCaptionCharacterCount.classList.contains('errorMsg'))
            this.lblCaptionCharacterCount.classList.remove('errorMsg');

        this.loadPaperClip();

        // Close the image dropdown.
        imageDropdown.close();

        // Return image dropdown to it's 
        imageDropdown.rootElm.style.zIndex = '0';
    }
}