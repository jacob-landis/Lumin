class Icons {

    static buildIcon(suffixes) {
        
        let tag = ViewUtil.tag('div', { classList: 'icon' });

        suffixes.forEach(s => tag.append(ViewUtil.tag('i', { classList: `fa fa-${s}` })));
        
        return tag;
    }


    static acceptRequest = () => Icons.buildIcon(['check icon-sm', 'user'])

    static cancelRequest = () => Icons.buildIcon(['times icon-sm', 'user'])

    static removeFriend  = () => Icons.buildIcon(['minus icon-sm', 'user'])

    static sendRequest   = () => Icons.buildIcon(['plus icon-sm', 'user'])

    static deleteComment = () => Icons.buildIcon(['minus icon-sm', 'comment'])

    static attachToPost  = () => Icons.buildIcon(['paperclip icon-sm', 'sticky-note'])

    static deleteImage   = () => Icons.buildIcon(['minus icon-sm', 'image'])

    static createPost    = () => Icons.buildIcon(['plus icon-sm', 'sticky-note'])

    static deletePost    = () => Icons.buildIcon(['minus icon-sm', 'sticky-note'])

    static paperClip     = () => Icons.buildIcon(['paperclip'])

    static confirm       = () => Icons.buildIcon(['check'])

    static cancel        = () => Icons.buildIcon(['times'])

    static edit          = () => Icons.buildIcon(['edit'])

}