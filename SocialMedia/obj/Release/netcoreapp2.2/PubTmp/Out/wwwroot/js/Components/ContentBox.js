class ContentBox {

    static contentBoxes = [];

    loading = false;
    moreContent = true;
    
    content = [];
    get length() { return this.content.length; }

    get height() { return Util.getDivHeight(this.tag); }
    get width() { return Util.getDivWidth(this.tag); }

    set height(height) { this.tag.style.height = height; }

    constructor(tagOrId, classList, take, requestFunc) {
        this.requestFunc = requestFunc;

        // create a new tag
        if (typeof tagOrId == 'string' || !tagOrId)
            this.tag = ViewUtil.tag('div',
                { classList: `${classList} content-box`, id: tagOrId });

        // or modify existing tag
        else {
            this.tag = tagOrId;
            this.tag.classList.add('content-box');
        }
        
        if (take) this.take = take;

        ContentBox.contentBoxes.push(this);
    }

    request(take) {
        if (!this.loading && this.moreContent) {
            this.take = take ? take : this.take;
            this.loading = true;
            this.requestFunc(this.length, this.take);
        }
    }
    
    // expects an array or single. content items must have a tag property.
    add(content, prepend) {
        if (!Array.isArray(content)) content = [content];

        if (this.loading && content.length < this.take) this.moreContent = false;

        content.forEach(c => {
            this.content.push(c);
            if (c) {
                if (prepend) this.tag.prepend(c.tag);
                else this.tag.append(c.tag);
            }
        });

        if (this.requestFunc) {
            this.moreContent = this.take == content.length;
            this.loading = false;
        }
    }
    
    clear() {
        this.items = [];
        ViewUtil.empty(this.tag);
    }
}