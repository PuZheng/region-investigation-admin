
var newVersionForm = {
    controller: function () {
        this.file = m.prop();
        this.loading = m.prop();
        this.version = m.prop('');
        this.errors = m.prop({
            version: '',
            file: '',
        });
        this.onchange = function (file) {
            this.file(file);
        };
    },
    view: function (ctrl, args) {
        return (
            m('div', [
                m('.ui.top.attached.info.message', "发布新版本"),
                m('.ui.bottom.attached.segment', [
                    m('form.ui.form', {
                        onsubmit: function (e) {
                            if (!ctrl.version()) {
                                ctrl.errors(Object.assign(ctrl.errors(), {
                                    version: '版本不能为空',
                                }));
                                return false;
                            }
                            if (!ctrl.file()) {
                                ctrl.errors(Object.assign(ctrl.errors(), {
                                    file: "请上传apk文件"
                                }));
                                return false;
                            }
                            ctrl.loading(true);
                            var data = new FormData();
                            data.append('file', ctrl.file());
                            data.append('version', ctrl.version());
                            console.log(data);
                            var transport = m.prop();
                            m.request({ 
                                method: 'POST',
                                url: '<%= backend %>/application/object',
                                data: data,
                                serialize: function(value) {return value;},
                                config: transport,
                            }).then((data) => {
                                toastr.options.positionClass = "toast-bottom-center";
                                toastr.options.timeOut = 1000;
                                toastr.success('创建成功!');
                            }, ctrl.errors).then(() => {
                                ctrl.loading(false);
                            });
                            var xhr = transport();
                            xhr.onprogress = function (e) {
                                if (e.lengthComputable) {
                                    // alert(e.loaded / e.total);
                                    console.log(e.loaded / e.total);
                                }
                            };
                            return false;
                        },
                        class: ctrl.loading()? 'loading': ''
                    }, 
                    [
                        m('.field', [
                            m('label[for="input-version"]', "版本号(必须是x.y.z形式)"),
                            m('input#input-version[type="text"][name="version"][placeHolder="请输入版本号"]', {
                                oninput: m.withAttr('value', ctrl.version),
                                value: ctrl.version(),
                            }),
                            m('.ui.pointing.red.basic.label', {
                                class: (ctrl.errors() && ctrl.errors().version)? "": "invisible",
                            }, (ctrl.errors() && ctrl.errors().version) || ""),
                        ]),
                        m('.field', [
                            m('div', [
                                m.component(fileButton, {
                                    onchange: ctrl.onchange.bind(ctrl),
                                    onCompleted: function (path_) {

                                    },
                                }),
                                m('.ui.circular.green.label', {
                                    class: ctrl.file()? '': 'invisible'
                                }, ctrl.file() && ctrl.file().name),
                            ]),
                            m('.ui.pointing.red.basic.label', {
                                class: (ctrl.errors() && ctrl.errors().file)? "": "invisible",
                            }, (ctrl.errors() && ctrl.errors().file) || ""),
                        ]),
                        m('input.ui.button.primary[type=submit][value="提交"]', {})
                    ])
                ])
            ])
        );
    }
};

var fileButton = {
    view: function (ctrl, args) {
        return (
            m('button.ui.tiny.button', {
                style: {
                    position: 'relative',
                }, 
            }, [
                m('input[type=file]', {
                    onchange: function (e) {
                        args.onchange(e.currentTarget.files[0]);
                    },
                    style: {
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        opacity: '0',
                        display: 'block',
                    },
                    config: function (element, isinitialized) {
                        if (!isinitialized) {
                            // element.addEventListener('change', function (e) {
                            //     var data = new FormData();
                            //     data.append("file", e.currentTarget.files[0]);
                            //     var transport = m.prop();
                            //     console.log('upload begin...');
                            //     m.request({
                            //         method: 'POST',
                            //         url: '/upload',
                            //         data: data,
                            //         serialize: function(data) {
                            //             return data;
                            //         },
                            //         config: transport,
                            //     }).then(function () {
                            //         console.log('uploaded');
                            //     }, function () {
                            //         toastr.options.positionClass = "toast-bottom-center";
                            //         toastr.options.timeOut = 1000;
                            //         toastr.error('上传失败');
                            //     }).then(function () {
                            //         element.value = "";
                            //     });
                            //     var xhr = transport();
                            //     xhr.onprogress = function (e) {
                            //         if (e.lengthComputable) {
                            //             // alert(e.loaded / e.total);
                            //             console.log(e.loaded / e.total);
                            //         }
                            //     };
                            //     xhr.onload = function (e) {
                            //         debugger;
                            //     };
                            // });
                        }
                    }
                })
            ], '点击上传APK')
        );
    },
};

var versionHistory = {
    view: function (ctrl, args) {
        return (
            m('div', "version history")
        );
    },
};

m.mount(document.querySelector('.ui.container'), newVersionForm);
