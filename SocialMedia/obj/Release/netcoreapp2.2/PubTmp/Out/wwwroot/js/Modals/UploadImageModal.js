class UploadImageModal {
    
    static initialize() {
        this.modalCon = document.getElementById('imageUploadModal');
        this.stagedUploadCon = document.getElementById('stagedUploadCon');
        this.btnConfirm = document.getElementById('btnConfirmImageUpload');
        this.selectDifferntImage = document.getElementById('uploadImageModalUploadImage');
        
        //this.reader = new FileReader();
        ////this.reader.onloadend = () => {
        ////    this.open();
        ////    ViewUtil.show(this.btnConfirm);
        ////    let raw = this.reader.result.substring(this.reader.result.indexOf(',') + 1);
        ////    let imgTag = ViewUtil.tag('img', { classList: 'stagedUpload', src: raw });
            
        ////    this.stagedUploadCon.append(imgTag);

        ////    this.stagedUpload = JSON.stringify({
        ////        Name: this.stagedFileName,
        ////        Raw: raw
        ////    });
        ////}
        //this.reader.onloadend = ()=> this.stageFile()

        this.btnConfirm.onclick = () => {
            Repo.postImage(this.stagedUpload, imageCard => {
                if (this.callback) this.callback(imageCard);
            });
            this.close();
        }

        this.selectDifferntImage.onchange =e=> this.load(e, this.callback)

        Modal.add(this);
    }

    static load(e, callback) {
        this.reader = new FileReader();
        this.reader.onloadend =()=> this.stageFile()

        ViewUtil.empty(this.stagedUploadCon);
        ViewUtil.hide(this.btnConfirm);

        this.callback = callback;
        this.stagedFileName = e.srcElement.files[0].name;

        let isValidSize = e.srcElement.files[0].size <= 15728640; // 15728640 == 15MB
        let isValidType = this.validateType(this.stagedFileName);

        if (isValidSize && isValidType) {
            this.reader.readAsDataURL(e.srcElement.files[0]);
        }
        else {
            if (!isValidSize) this.displayError('- The file you selected excedes accepted file size (15MB)');
            if (!isValidType) this.displayError('- The file you selected is not a valid image type (png, jpg or tif)');
        }
    }

    static stageFile() {
        this.open();
        ViewUtil.show(this.btnConfirm);
        let raw = this.reader.result.substring(this.reader.result.indexOf(',') + 1);
        let imgTag = ViewUtil.tag('img', { classList: 'stagedUpload', src: raw });

        this.stagedUploadCon.append(imgTag);

        this.stagedUpload = JSON.stringify({
            Name: this.stagedFileName,
            Raw: raw
        });
    }

    static validateType(name) {
        let extension = name.slice(name.indexOf('.')).toLowerCase();
        return (extension == '.png' || extension == '.jpg' || extension == '.tif');
    }
    
    static displayError(errorMsg) {
        this.open();
        this.stagedUploadCon.append(ViewUtil.tag('div', {
            classList: 'errorMsg uploadImageError',
            innerText: errorMsg
        }));
    }
}