class ImageBox {

    static imageBoxes = [];

    get height() { return Util.getDivHeight(this.tag); }
    get width() { return Util.getDivWidth(this.tag); }

    set height(height) { this.tag.style.height = height; }
    set onLoadEnd(onLoadEnd) { this._onLoadEnd = ()=> onLoadEnd() }
    
    constructor(existingTag, boxClassList, imageClassList, click, getThumbNail) {

        this.heldClassList = imageClassList;
        this.heldClick = click ? click : ()=> {};
        this.getThumbNail = getThumbNail;

        // modify existing tag
        if (existingTag) {
            this.tag = existingTag;
            this.tag.classList.add('image-box');
        }
        // create new tag
        else this.tag = ViewUtil.tag('div', { classList: `${boxClassList} image-box` });

        this.isLoaded = false;
        ImageBox.imageBoxes.push(this);
    }

    // give just an id to only update the raw image
    load(imageId, classList, click) {
        this.heldImageId = imageId;
        this.heldClassList = classList ? classList : this.heldClassList;
        this.heldClick = click ? click : this.heldClick;
        this.unload();
        this.reload();
    }

    loadImage(imageCard) {
        ViewUtil.empty(this.tag);
        if (this.heldClassList) imageCard.tag.classList = this.heldClassList;
        if (this.heldClick) imageCard.click = this.heldClick;
        this.tag.append(imageCard.tag);
        this.isLoaded = true;
    }

    unload() {
        if (this.isLoaded) {
            ViewUtil.empty(this.tag);
            delete this.imageCard;
            this.isLoaded = false;
        }
    }

    reload() {
        if(!this.isLoaded)
            Repo.image(this.heldImageId, this.heldClassList, this.heldClick, this.getThumbNail, imageCard => {
                this.imageCard = imageCard;
                ViewUtil.empty(this.tag);
                this.tag.append(this.imageCard.tag);
                this.isLoaded = true;
                
                if (this._onLoadEnd) this._onLoadEnd();
            });
    }
}