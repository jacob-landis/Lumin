class ViewUtil {

//_____ TAG BUILDERS 

    static tag(tagName, x) {
        var tag = document.createElement(tagName);

        if (x) {
            if (x.id) tag.id = x.id;
            if (x.classList) tag.classList = x.classList;
            if (x.name) tag.name = x.name;
            if (x.color) tag.style.color = x.color;
            if (x.innerHTML) tag.innerHTML = x.innerHTML;
            if (x.innerText) tag.innerText = x.innerText;
            if (x.src) tag.src = `data:image/png;base64,${x.src}`;
            if (x.onclick) tag.onclick = x.onclick;
            if (x.type) tag.type = x.type;
            if (x.oncontextmenu) tag.oncontextmenu = x.oncontextmenu;
        }
        return tag;
    }


//_____ TAG MANIPULATORS

    static remove(tag) { if (tag != null) tag.remove(); }

    static empty(tag) { if (tag != null) while (tag.firstChild) tag.removeChild(tag.firstChild); }

    static hide(tag) { tag.style.display = 'none'; }

    static show(tag, displayType = 'inline') { tag.style.display = displayType; }

    static toggle(tag, displayType = 'inline') {
        if (tag.style.display != 'none') this.hide(tag);
        else this.show(tag, displayType);
    }
}