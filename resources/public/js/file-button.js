
export default {
    view: function (ctrl, args) {
        return (
            m('button.ui.tiny.button', {
                style: {
                    position: 'relative',
                }, 
            }, [
                m('input[type=file]', {
                    onchange: function (e) {
                        args.file(e.currentTarget.files[0]);
                    },
                    value: "", // set value to "" to clear this field, otherwise onchange won't be callbacked when 
                    // select the same file again
                    style: {
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        opacity: '0',
                        display: 'block',
                    },
                })
            ], '点击上传APK')
        );
    },
};
