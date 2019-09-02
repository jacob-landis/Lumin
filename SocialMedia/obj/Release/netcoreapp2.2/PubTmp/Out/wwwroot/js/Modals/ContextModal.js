class ContextModal {

    static initialize() {
        Modal.add(this);
        this.modalCon = document.getElementById('contextModal');
        this.optionsBox = new ContentBox(document.getElementById('contextContent'));
        
        window.addEventListener('scroll', () => {
            if (this.optionsBox.tag.style.display != "none") this.close();
        });

        this.optionsBox.tag.onclick = () => this.close();
    }

    static load(e, options) {
        this.optionsBox.clear();
        this.optionsBox.add(options);

        this.open();

        e.preventDefault();
        this.optionsBox.tag.style.left = e.clientX - this.optionsBox.width;
        this.optionsBox.tag.style.top = e.clientY - this.optionsBox.height;
    }
}