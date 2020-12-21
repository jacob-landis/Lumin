var Icons = (function () {
    function Icons() {
    }
    Icons.buildIcon = function (suffixes) {
        var elm = ViewUtil.tag('div', { classList: 'icon' });
        suffixes.forEach(function (s) { return elm.append(ViewUtil.tag('i', { classList: "fa fa-" + s })); });
        return elm;
    };
    Icons.acceptRequest = function () { return Icons.buildIcon(['check icon-sm', 'user']); };
    Icons.cancelRequest = function () { return Icons.buildIcon(['times icon-sm', 'user']); };
    Icons.removeFriend = function () { return Icons.buildIcon(['minus icon-sm', 'user']); };
    Icons.sendRequest = function () { return Icons.buildIcon(['plus icon-sm', 'user']); };
    Icons.deleteComment = function () { return Icons.buildIcon(['minus icon-sm', 'comment']); };
    Icons.attachToPost = function () { return Icons.buildIcon(['paperclip icon-sm', 'sticky-note']); };
    Icons.deleteImage = function () { return Icons.buildIcon(['minus icon-sm', 'image']); };
    Icons.createPost = function () { return Icons.buildIcon(['plus icon-sm', 'sticky-note']); };
    Icons.deletePost = function () { return Icons.buildIcon(['minus icon-sm', 'sticky-note']); };
    Icons.paperClip = function () { return Icons.buildIcon(['paperclip']); };
    Icons.confirm = function () { return Icons.buildIcon(['check']); };
    Icons.cancel = function () { return Icons.buildIcon(['times']); };
    Icons.edit = function () { return Icons.buildIcon(['edit']); };
    return Icons;
}());
//# sourceMappingURL=Icons.js.map