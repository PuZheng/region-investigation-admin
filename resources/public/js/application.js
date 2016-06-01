
var newVersionForm = {
    controller: function () {
        this.init = function () {
            this.file = m.prop();
            this.loading = m.prop();
            this.version = m.prop('');
            this.errors = m.prop({
                version: '',
                file: '',
            });
        }.bind(this);
        this.init();
    },
    view: function (ctrl, args) {
        return (
                m('div', [
                    m('.ui.top.attached.red.message', "发布新版本"),
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
                                var data = new FormData();
                                data.append('file', ctrl.file());
                                data.append('version', ctrl.version());
                                var transport = m.prop();
                                ctrl.loading(true);
                                NProgress.start();
                                m.request({ 
                                    method: 'POST',
                                    url: '/app/object',
                                    data: data,
                                    serialize: function(value) {return value;},
                                    config: transport,
                                }).then((data) => {
                                    toastr.options.positionClass = "toast-bottom-center";
                                    toastr.options.timeOut = 1000;
                                    toastr.success('创建成功!');
                                    ctrl.init();
                                }, ctrl.errors).then(() => {
                                    ctrl.loading(false);
                                    NProgress.done();
                                });

                                var xhr = transport();
                                xhr.onprogress = function (e) {
                                    if (e.lengthComputable) {
                                        NProgress.set(e.loaded / e.total);
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
                                            file: ctrl.file,
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

var versionHistory = {
    controller: function () {
        this.versions = m.request({
            method: 'GET',
            url: '/app/version/list',
            deserialize: function (data) {
                return JSON.parse(data).data;
            }            
        });
    },
    view: function (ctrl, args) {
        console.log(ctrl.versions());
        return (
            m('div', [
                m('.ui.top.attached.info.message', '历史版本'),
                m('.ui.bottom.attached.segment', [
                    m('.ui.divided.list', (ctrl.versions() || []).map(function (version) {
                        return m('.item', [
                            m('.content', [
                                m('.header', {
                                    style: {
                                        display: 'inline-block',
                                    }
                                }, version.createdAt),
                                m('.span', {
                                    style: {
                                        display: 'inline-block',
                                        'padding-left': '1em',
                                        'padding-right': '1em',
                                    }
                                }, version.version),
                                m('a[href="/app/' + version.version + '.apk"]', [
                                    m('i.ui.icon.download')
                                ])
                            ])
                        ]);
                    }))
                ])
            ])
        );
    },
};

var navBar = {
    view: function (ctrl, args) {
        return (
                m('.ui.top.fixed.inverted.menu', [['/app', '应用'], 
                    ['/org', '组织'], ['/poi-type', '信息点类型'], 
                    ['/regions', '上传数据']].map(([link, label]) => 
                        m('.item', [m(`a[href=${link}]`, label)])
                        ))
               );
    }
};

m.mount(document.querySelector('.ui.container'), { 
    view: function (ctrl, args) {
        return [
            m.component(navBar),
            m.component(newVersionForm),
            m.component(versionHistory)
        ];
    },
});
