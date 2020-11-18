var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
    This class creates a prompt, giving the user a chance to back out of an action.
*/
var ConfirmModal = /** @class */ (function (_super) {
    __extends(ConfirmModal, _super);
    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    function ConfirmModal(rootElm, // Base parameter.
    // Used to show a message to the user (Ex. "Are you sure you want to delete this comment?")
    lblPrompt, // XXX consider using this technique in other places or remove this case of it. XXX
    btnYes, // Invokes confirm with true.
    btnNo // Invokes confirm with false.
    ) {
        var _this = _super.call(this, rootElm) || this;
        _this.lblPrompt = lblPrompt;
        // Connect yes and no buttons to confirm(), but load a different value into each.
        btnYes.onclick = function () { return _this.respond(true); };
        btnNo.onclick = function () { return _this.respond(false); };
        return _this;
    }
    /*
        Prompt the user to confirm or cancel.

        PARAMETERS:
        message is displayed to user before they decide.
        callback is used to send the user's decision back.
    */
    ConfirmModal.prototype.load = function (message, onUserDecision) {
        // Get a handle on the callback.
        this.onUserDecision = onUserDecision;
        // Insert the callers message into the prompt.
        this.lblPrompt.innerText = message;
        // Open this modal.
        this.open();
    };
    /*
        Returns the user's answer and closes this modal.
    */
    ConfirmModal.prototype.respond = function (answer) {
        // Return the user's answer to the caller through the previously provided callback.
        this.onUserDecision(answer);
        // Close this modal.
        this.close();
    };
    return ConfirmModal;
}(Modal));
//# sourceMappingURL=ConfirmModal.js.map