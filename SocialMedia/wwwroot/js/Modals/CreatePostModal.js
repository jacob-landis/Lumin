class CreatePostModal {
    
    static initialize() {
        Modal.add(this);
        this.modalCon = document.getElementById('createPostModal'); 
        this.txtCaption = document.getElementById('caption');
        this.captionWrapper = document.getElementById('captionWrapper');
        this.errorBox = new ContentBox('createPostErrorBox');
        this.btnSelectImage = document.getElementById('btnSelectPostImage');
        this.btnClearImage = document.getElementById('btnClearPostImage');
        this.btnSubmit = document.getElementById('btnSubmit');

        this.captionWrapper.append(this.errorBox.tag);

        this.btnCancel = document.getElementById('btnCancel');
        this.btnCancel.onclick = () => this.close();

        this.selectedImageCon = new ImageBox(
            document.getElementById('selectedImageCon'), '', 'selectedPostImage', () => ()=> this.selectImage());

        this.btnSelectImage.onclick = () => this.selectImage();
        this.btnClearImage.onclick = () => this.loadPaperClip();

        this.btnSubmit.onclick = () => this.submit();
    }

    static load(imageCard) {
        this.loadPaperClip();
        if (ImageDropdown.isOpen && !imageCard) this.convertImageDropdown();
        if (imageCard) this.selectedImageCon.load(imageCard.rawImage.id);
        this.open();
    }

    static loadPaperClip() {
        ViewUtil.empty(this.selectedImageCon.tag);
        this.selectedImageCon.isLoaded = false;
        let paperClip = Icons.paperClip();
        paperClip.onclick = () => this.selectImage();
        this.selectedImageCon.tag.append(paperClip);
    }

    static selectImage() {
        ImageDropdown.load(imageCard => {
            ImageDropdown.close();
            this.selectedImageCon.load(imageCard.rawImage.id);
        });
    }

    static convertImageDropdown() {
        ImageDropdown.convert(imageCard => ()=> {
            this.selectedImageCon.load(imageCard.rawImage.id);
            ImageDropdown.close();
        });
    }

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