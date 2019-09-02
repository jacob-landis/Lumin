class ImageDropdown {

    static initialize() {
        this.dropdownCon = document.getElementById('imageDropdown');
        this.content = document.getElementById('imageDropDownContent');
        this.imageWrapper = document.getElementById('selectImages');
        this.prompt = document.getElementById('selectImagePrompt');

        // UPLOAD IMAGE
        document.getElementById('imageModalUploadImage').onchange = e =>
            UploadImageModal.load(e, imageCard =>
                ProfileImagesBox.profileImageBoxes.forEach(p => {
                    if (p.profileId == User.id) p.addImageCard(imageCard);
                })
            );

        this.content.onscroll = () => {
            let offset = this.content.scrollTop + window.innerHeight;

            if (offset >= this.imageBox.contentBox.height) this.imageBox.contentBox.request(15);
        }

        Dropdown.add(this);
    }

    static load(callback) {

        this.imageBox = new ProfileImagesBox(null, callback ?
            // if the dropdown is opened for the purpose of selecting an image for something
            clickedImageCard => () => callback(clickedImageCard)
            :
            clickedImageCard => () => FullSizeImageModal.load(this.imageBox.contentBox.content.indexOf(clickedImageCard)));

        this.imageBox.onscroll = () => {
            let divHeight = Util.getDivHeight(this.imageBox);
            let offset = this.imageBox.scrollTop + divHeight - 50;

            if (offset >= divHeight) this.imagesBox.contentBox.request(5);
        }

        this.prompt.innerText = callback ? 'Select an Image' : 'My Images';

        this.dropdownCon.style.zIndex = Modal.modalCons.length + 1;

        ViewUtil.empty(this.imageWrapper);
        this.imageWrapper.append(this.imageBox.contentBox.tag);
        this.open();
    }

    static convert(callback) {
        this.imageBox.contentBox.content.forEach(i => i.click = imageCard => callback(imageCard));
        this.dropdownCon.style.zIndex = Modal.modalCons.length + 2;
        this.prompt.innerText = 'Select an Image';
    }
}