"use strict";

var App = function App() {
    this.name = m.prop("");
    this.brief = m.prop("");
};

var newAppForm = {
    controller: function controller(args) {
        this.init = function () {
            this.app = new App();
            this.errors = m.prop({});
            this.loading = m.prop();
        };
        this.init.apply(this);
        this.save = function () {
            var _this = this;

            this.loading(true);
            m.request({
                method: 'POST',
                url: '/api/app/object',
                data: this.app
            }).then(function (data) {
                toastr.options.positionClass = "toast-bottom-center";
                toastr.options.timeOut = 1000;
                toastr.success('创建成功!');
                _this.init.apply(_this);
                args.onsave(data);
            }, this.errors).then(function () {
                _this.loading('');
            }).bind(this);
            return false;
        }.bind(this);
    },
    view: function view(ctrl, args) {
        return m('.ui.centered.grid', [m('.ui.segment.eight.wide.column', [m('form.ui.form', {
            onsubmit: ctrl.save,
            class: ctrl.loading() ? 'loading' : ''
        }, [m('h3', '创建APP'), m(".field", [m('label[for="input-name"]', "APP名称"), m('input#input-name[type="text"][name="name"][placeholder="请输入APP名称"]', {
            oninput: m.withAttr('value', ctrl.app.name),
            value: ctrl.app.name()
        }), m('.ui.pointing.red.basic.label', {
            class: ctrl.errors().name ? "" : "invisible"
        }, ctrl.errors().name || "")]), m('.field', [m('label[for="input-brief"]', 'APP简介'), m('textarea#input-brief[placeholder="请输入简介"]', {
            oninput: m.withAttr('value', ctrl.app.brief),
            value: ctrl.app.brief()
        })]), m('input.ui.button.primary[type=submit][value="提交"]', {})])])]);
    }
};

var appGrid = {
    view: function view(ctrl, args) {
        return m('.ui.grid', [m('.ui.column', [m('.ui.segment', [m('.ui.cards', args.apps().map(function (app) {
            return m('.ui.card', {
                onclick: function onclick() {
                    m.route('/app/' + app.id);
                }
            }, [m('.content', [m('.header', app.name), m('.meta', app.createdAt), m('.description', app.brief)])]);
        }))])])]);
    }
};

var newVersionForm = {
    view: function view(ctrl, args) {
        return m('div', [m('.ui.top.attached.info.message', "发布新版本"), m('.ui.bottom.attached.segment', [m('.ui.form', [m('.field', [m('label[for="input-version"]', "版本号(必须是x.y.z形式)"), m('input#input-version[type="text"][name="version"][placeHolder="请输入版本号"]')]), m('.field', [m.component(fileButton, {
            onCompleted: function onCompleted(path_) {}
        })]), m('input.ui.button.primary[type=submit][value="提交"]', {})])])]);
    }
};

var fileButton = {
    view: function view(ctrl, args) {
        return m('button.ui.tiny.button', {
            style: {
                position: 'relative'
            }
        }, [m('input[type=file]', {
            style: {
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                opacity: '0',
                display: 'block'
            },
            config: function config(element, isinitialized) {
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
                            serialize: function serialize(data) {
                                return data;
                            },
                            config: transport
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
        })], '点击上传APK');
    }
};

var versionHistory = {
    view: function view(ctrl, args) {
        return m('div', "version history");
    }
};

m.route.mode = 'pathname';
m.route(document.querySelector('.container'), "/", {
    "/": {
        controller: function controller() {
            this.apps = m.request({
                method: 'GET',
                url: '/api/app/list',
                deserialize: function deserialize(data) {
                    return JSON.parse(data).data;
                }
            });
            this.onsave = function (app) {
                this.apps([app].concat(this.apps()));
            }.bind(this);
        },
        view: function view(ctrl) {
            return [m.component(newAppForm, {
                onsave: ctrl.onsave
            }), m.component(appGrid, {
                apps: ctrl.apps
            })];
        }
    },
    "/app/:id": {
        controller: function controller(args) {
            this.id = m.route.param('id');
            this.app = m.request({
                method: 'GET',
                url: '/api/app/object/' + this.id
            });
        },
        view: function view(ctrl, args) {
            return m('.ui.segment', [m('.ui.header', ctrl.app().name), m('p', ctrl.app().brief), m.component(newVersionForm, {
                appId: ctrl.id
            }), m.component(versionHistory, {
                app: ctrl.app().versions
            })]);
        }
    }
});
//# sourceMappingURL=bundle.js.map
