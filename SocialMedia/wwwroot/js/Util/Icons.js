class Icons {

    static buildIcon(suffixes) {
        
        let tag = ViewUtil.tag('div', { classList: 'icon' });

        suffixes.forEach(s => tag.append(ViewUtil.tag('i', { classList: `fa fa-${s}` })));
        
        return tag;
    }

    static paperClip = () => this.buildIcon(['paperclip']);

    static acceptRequest = () => this.buildIcon(['check icon-sm', 'user'])

    static cancelRequest = () => this.buildIcon(['times icon-sm', 'user'])

    static sendRequest = () => this.buildIcon(['plus icon-sm', 'user'])

    static removeFriend = () => this.buildIcon(['minus icon-sm', 'user'])

    static confirm = () => this.buildIcon(['check'])

    static cancel = () => this.buildIcon(['times'])

    static edit = () => this.buildIcon(['edit'])

    static deleteComment = () => this.buildIcon(['minus icon-sm', 'comment'])

    static createPost = () => this.buildIcon(['plus icon-sm', 'sticky-note'])

    static deletePost = () => this.buildIcon(['minus icon-sm', 'sticky-note'])

    static attachToPost = () => this.buildIcon(['paperclip icon-sm', 'sticky-note'])

    static deleteImage = () => this.buildIcon(['minus icon-sm', 'image'])
}