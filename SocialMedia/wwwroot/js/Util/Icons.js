var Icons = (function () {
    function Icons() {
    }
    Icons.buildIcon = function (suffixes) {
        var iconRootElm = ViewUtil.tag('div', { classList: 'icon' });
        suffixes.forEach(function (suffix) { return iconRootElm.append(ViewUtil.tag('i', { classList: "fa fa-" + suffix })); });
        return iconRootElm;
    };
    Icons.acceptRequest = function () { return Icons.buildIcon(['check icon-sm', 'user']); };
    Icons.cancelRequest = function () { return Icons.buildIcon(['times icon-sm', 'user']); };
    Icons.removeFriend = function () { return Icons.buildIcon(['minus icon-sm', 'user']); };
    Icons.sendRequest = function () { return Icons.buildIcon(['plus icon-sm', 'user']); };
    Icons.blockProfile = function () { return Icons.buildIcon(['unlock', 'user']); };
    Icons.deleteComment = function () { return Icons.buildIcon(['minus icon-sm', 'comment']); };
    Icons.attachToPost = function () { return Icons.buildIcon(['paperclip icon-sm', 'sticky-note']); };
    Icons.deleteImage = function () { return Icons.buildIcon(['minus icon-sm', 'image']); };
    Icons.createPost = function () { return Icons.buildIcon(['plus icon-sm', 'sticky-note']); };
    Icons.deletePost = function () { return Icons.buildIcon(['minus icon-sm', 'sticky-note']); };
    Icons.paperClip = function () { return Icons.buildIcon(['paperclip']); };
    Icons.confirm = function () { return Icons.buildIcon(['check']); };
    Icons.cancel = function () { return Icons.buildIcon(['times']); };
    Icons.edit = function () { return Icons.buildIcon(['edit']); };
    Icons.refresh = function () { return Icons.buildIcon(['refresh']); };
    Icons.filterByLikes = function () { return Icons.buildIcon(['filter', 'thumbs-up']); };
    Icons.history = function () { return Icons.buildIcon(['history']); };
    Icons.dropdownArrow = function () { return Icons.buildIcon(['sort-down']); };
    Icons.search = function () { return Icons.buildIcon(['search']); };
    Icons.privacy = function () { return Icons.buildIcon(['unlock']); };
    return Icons;
}());
//# sourceMappingURL=Icons.js.map