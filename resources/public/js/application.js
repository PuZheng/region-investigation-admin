
var newVersionForm = {
    view: function (ctrl, args) {
        return (
            m('div', [
                m('.ui.top.attached.info.message', "发布新版本"),
                m('.ui.bottom.attached.segment', [
                    m('.ui.form', [
                        m('.field', [
                            m('label[for="input-version"]', "版本号(必须是x.y.z形式)"),
                            m('input#input-version[type="text"][name="version"][placeHolder="请输入版本号"]')
                        ]),
                        m('.field', [
                            m.component(fileButton, {
                                onCompleted: function (path_) {

                                },
                            }),
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
                            element.addEventListener('change', function (e) {
                                var data = new FormData();
                                data.append("file", e.currentTarget.files[0]);
                                var transport = m.prop();
                                console.log('upload begin...');
                                m.request({
                                    method: 'POST',
                                    url: '/upload',
                                    data: data,
                                    serialize: function(data) {
                                        return data;
                                    },
                                    config: transport,
                                }).then(function () {
                                    console.log('uploaded');
                                }, function () {
                                    toastr.options.positionClass = "toast-bottom-center";
                                    toastr.options.timeOut = 1000;
                                    toastr.error('上传失败');
                                }).then(function () {
                                    element.value = "";
                                });
                                var xhr = transport();
                                xhr.onprogress = function (e) {
                                    if (e.lengthComputable) {
                                        // alert(e.loaded / e.total);
                                        console.log(e.loaded / e.total);
                                    }
                                };
                                xhr.onload = function (e) {
                                    debugger;
                                };
                            });
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

m.render(document.querySelector('.ui.container'), newVersionForm);
