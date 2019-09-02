class FullSizeImageModal {
    
    static initialize() {
        Modal.add(this);
        this.modalCon = document.getElementById('fullsizeImageModal');
        this.content = document.getElementById('fullSizeImageModalContent');
        this.imageCon = new ImageBox(document.getElementById('fullsizeImageCon'), '', 'fullSizeImage', () => ()=> this.toggleControls());
        this.btnPrev = document.getElementById('btnFullsizePrevious');
        this.btnNext = document.getElementById('btnFullsizeNext');
        this.imageCount = document.getElementById('imageCount');

        // set height to viewport - navbar
        this.imageCon.height = window.innerHeight - Main.navBar.clientHeight;

        this.btnPrev.onclick =()=> this.requestImage(-1);
        this.btnNext.onclick =()=> this.requestImage(1);
        this.content.onclick =e => { if (e.target == this.content) this.close(); }
        
        this.imageControls = [this.imageCount, this.btnNext, this.btnPrev, Modal.btnClose];
    }

    static loadSingle(imageId) {
        this.imageCon.load(imageId, 'fullSizeImage', () => ()=> this.toggleClose());
        this.hideControls();
        this.open();
    }
    
    static load(clickedImageIndex, profileId) {
        this.reset();
        this.profileId = profileId ? profileId : User.id;
        this.index = clickedImageIndex;

        Repo.imageCount(this.profileId, imageCount => {
            this.profileImagesCount = imageCount;
            this.updateImageCount();
            this.requestImage(0);
        });

        this.open();
    }
    
    static requestImage(increment) {
        let indexToBe = this.index + increment;

        if (indexToBe >= 0 && indexToBe < this.profileImagesCount) {
            this.index = indexToBe;
            this.updateImageCount();

            Repo.images(this.profileId, this.index, 1, '', () => { }, imageCards =>
                this.imageCon.load(imageCards[0].rawImage.id, null, ()=> ()=> this.toggleControls()));
        }
    }
    
    static updateImageCount() { this.imageCount.innerText = `${this.index + 1} / ${this.profileImagesCount}`; }
    
    static reset() {
        this.showControls();
        this.imageCon.unload();
    }

    static toggleClose() { Modal.btnClose.style.display != 'none' ? ViewUtil.hide(Modal.btnClose) : ViewUtil.show(Modal.btnClose); }
    static toggleControls() { this.btnNext.style.display != 'none' ? this.hideControls() : this.showControls(); }

    static showControls() { this.imageControls.forEach(c => ViewUtil.show(c)); }
    static hideControls() { this.imageControls.forEach(c => ViewUtil.hide(c)); }
}