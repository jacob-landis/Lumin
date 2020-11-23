class Icons {

    private static buildIcon(suffixes: string[]): HTMLElement {
        
        let elm: HTMLElement = ViewUtil.tag('div', { classList: 'icon' });

        suffixes.forEach(s => elm.append(ViewUtil.tag('i', { classList: `fa fa-${s}` })));
        
        return elm;
    }

    public static acceptRequest(): HTMLElement { return Icons.buildIcon(['check icon-sm', 'user']) }

    public static cancelRequest(): HTMLElement { return Icons.buildIcon(['times icon-sm', 'user']) }

    public static removeFriend(): HTMLElement  { return Icons.buildIcon(['minus icon-sm', 'user']) }

    public static sendRequest(): HTMLElement   { return Icons.buildIcon(['plus icon-sm', 'user']) }

    public static deleteComment(): HTMLElement { return Icons.buildIcon(['minus icon-sm', 'comment']) }

    public static attachToPost(): HTMLElement  { return Icons.buildIcon(['paperclip icon-sm', 'sticky-note']) }

    public static deleteImage(): HTMLElement   { return Icons.buildIcon(['minus icon-sm', 'image']) }

    public static createPost(): HTMLElement    { return Icons.buildIcon(['plus icon-sm', 'sticky-note']) }

    public static deletePost(): HTMLElement    { return Icons.buildIcon(['minus icon-sm', 'sticky-note']) }

    public static paperClip(): HTMLElement     { return Icons.buildIcon(['paperclip']) }

    public static confirm(): HTMLElement       { return Icons.buildIcon(['check']) }

    public static cancel(): HTMLElement        { return Icons.buildIcon(['times']) }

    public static edit(): HTMLElement          { return Icons.buildIcon(['edit']) }
}