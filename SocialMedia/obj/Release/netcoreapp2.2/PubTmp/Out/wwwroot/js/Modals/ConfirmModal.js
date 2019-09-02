class ConfirmModal {

    static initialize() {
        Modal.add(this);
        this.modalCon = document.getElementById('confirmModal');
        this.promptMsg = document.getElementById('promptMessage');
        this.btnYes = document.getElementById('btnConfirmYes');
        this.btnNo = document.getElementById('btnConfirmNo');

        this.btnYes.onclick = () => this.confirm(true)
        this.btnNo.onclick = () => this.confirm(false)
    }

    static load(message, func) {
        this.func = func;
        this.promptMsg.innerText = message;
        this.open();
    }

    static confirm(confirmation) {
        this.func(confirmation);
        this.close();
    }
}