/*
    This class contains the functionality of the create post form.
*/
class CreatePostModal {

    /*
    
    // A requirement of being a modal. The base class shows and hides this.
    modalCon;
    
    // A text input elm for the user to enter a caption.
    txtCaption;
    
    // An elm that wraps the caption input and error messages.
    captionWrapper;
    
    // A content box for error messages.
    errorBox;
    
    // A button that opens the image dropdown for the user to select an image from.
    btnSelectImage;
    
    // A button that removes the image that is attached to the post.
    btnClearImage;
    
    // A button that sends the post in a post request to the host.
    btnSubmit;
    
    // A button that closes this modal.
    btnCancel;
    
    // An ImageBox that isplays the image the user attaches to the post.
    selectedImageCon;
        
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
        this.modalCon = document.getElementById('createPostModal'); 
        this.txtCaption = document.getElementById('caption');
        this.captionWrapper = document.getElementById('captionWrapper');
        this.btnSelectImage = document.getElementById('btnSelectPostImage');
        this.btnClearImage = document.getElementById('btnClearPostImage');
        this.btnSubmit = document.getElementById('btnSubmit');
        this.btnCancel = document.getElementById('btnCancel');

        // Construct a content box for errors and get a handle on it.
        this.errorBox = new ContentBox('createPostErrorBox');

        // Append the error box's main tag to the caption wrapper.
        this.captionWrapper.append(this.errorBox.tag);

        // Construct an image box with an existing elm and get a handle on it.
        // (Any image that is selected for this post can be clicked on to pick a different image, because of the click parameter value)
        this.selectedImageCon = new ImageBox(document.getElementById('selectedImageCon'), '', 'selectedPostImage',

            // Returns the following callback.
            () =>

                // When the image is clicked, invoke selectImage().
                () => this.selectImage()
        );

        // Set btnSelectImage to invoke selectImage().
        this.btnSelectImage.onclick = () => this.selectImage();

        // Set btnClearImage to invoke loadPaperClip().
        this.btnClearImage.onclick = () => this.loadPaperClip();

        // Set btnSubmit to invoke submit().
        this.btnSubmit.onclick = () => this.submit();

        // Set btnCancel to invoke close().
        this.btnCancel.onclick = () => this.close();
    }

    /*
        Loads an image card into the selectedImageCon.

        imageCard must be an ImageCard.
    */
    static load(imageCard) {
        this.loadPaperClip();
        if (ImageDropdown.isOpen && !imageCard) this.convertImageDropdown();
        if (imageCard) this.selectedImageCon.load(imageCard.rawImage.id);
        this.open();
    }

    /*
        
    */
    static loadPaperClip() {
        ViewUtil.empty(this.selectedImageCon.tag);
        this.selectedImageCon.isLoaded = false;
        let paperClip = Icons.paperClip();
        paperClip.onclick = () => this.selectImage();
        this.selectedImageCon.tag.append(paperClip);
    }

    /*
 
    */
    static selectImage() {
        ImageDropdown.load(imageCard => {
            ImageDropdown.close();
            this.selectedImageCon.load(imageCard.rawImage.id);
        });
    }

    /*
 
    */
    static convertImageDropdown() {
        ImageDropdown.convert(imageCard => ()=> {
            this.selectedImageCon.load(imageCard.rawImage.id);
            ImageDropdown.close();
        });
    }

    /*
 
    */
    static submit() {
        let charLimit = 1000;

        let tooShort = this.txtCaption.value.length <= 0;
        let tooLong = this.txtCaption.value.length > charLimit;
        let noContent = tooShort && !this.selectedImageCon.isLoaded;

        let tooLongError = { tag: ViewUtil.tag('div', { classList: 'errorMsg', innerText: `- Must be less than ${charLimit} characters` }) };
        let noContentError = { tag: ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Select an image or enter a caption' }) };

        // display errors
        if (tooLong || noContent) {
            this.errorBox.clear();
            if (tooLong) this.errorBox.add(tooLongError);
            if (noContent) this.errorBox.add(noContentError);
        }
        // submit
        else {
            let imageId = this.selectedImageCon.isLoaded ? this.selectedImageCon.imageCard.rawImage.id : 0;
            let post = JSON.stringify({ Caption: this.txtCaption.value, ImageId: imageId });

            Repo.postPost(post, postCard => PostsBox.postBoxes.forEach(p => {
                if (p.profileId == User.id) p.addPost(new PostCard(postCard.post));
            }));

            this.txtCaption.value = '';
            this.close();
        }
    }

    /*
 
    */
    static onClose(callback) {
        if (this.txtCaption.value.length < 1) {
            this.errorBox.clear();
            this.txtCaption.value = '';
            ImageDropdown.close();
            ImageDropdown.dropdownCon.style.zIndex = 0;
            callback(true);
        }
        else {
            ConfirmModal.load('Are you sure you want to cancel?', confirmation => {
                if (!confirmation) return;
                this.txtCaption.value = '';
                this.close();
            });
        }
    }
}