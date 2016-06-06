import navBar from './nav-bar.js';
import { newVersionForm, versionHistory } from './app.js';
import { newOrgForm, orgList } from './org.js';
import { poiTypeList, poiTypeForm } from './poi-type.js';


m.route.mode = 'pathname';
m.route(document.querySelector('.ui.container'), "/app", { 
    '/app': {
        controller: function () {
            this.onCreate = function (version) {
               this.versions([version].concat(this.versions()));
            }.bind(this);
            this.versions = m.prop([]);
            m.request({
                method: 'GET',
                url: '/app/version/list',
                deserialize: function (data) {
                    return JSON.parse(data).data;
                }            
            }).then(this.versions);
        },
        view: function (ctrl, args) {
            return [
                m.component(navBar, "/app"),
                m.component(newVersionForm, {
                    onCreate: ctrl.onCreate,
                }),
                m.component(versionHistory, {
                    versions: ctrl.versions
                })
            ];
        },
    },
    '/org': {
        controller: function () {
            this.onCreate = function (org) {
                this.orgs([org].concat(this.orgs()));
            }.bind(this);
            this.orgs = m.prop([]);
            m.request({
                method: 'GET',
                url: '/org/list',
                deserialize: function (data) {
                    return JSON.parse(data).data;
                }            
            }).then(this.orgs);
        },
        view: function (ctrl, args) {
            return [
                m.component(navBar, "/org"),
                m.component(newOrgForm, {
                    onCreate: ctrl.onCreate,
                }),
                m.component(orgList, {
                    orgs: ctrl.orgs,
                }),
            ];
        }
    },
    '/poi-type': {
        controller: class {
            constructor() {
                this.init();
            } 
            init() {
                this.object = {
                    key: '',
                    name: m.prop(''),
                    orgCode: m.prop(''),
                    ic: m.prop(''),
                    icActive: m.prop(''),
                    fields: m.prop({}),
                };
                this.list = m.prop([]);
                m.request({
                    method: 'GET',
                    url: '/poi-type/list',
                    deserialize: (data) => JSON.parse(data).data 
                }).then(this.list);
            }
        },
        view: (ctrl, args) => [
            m.component(navBar, '/poi-type'),
            m('.ui.horizontal.segments', [
                m('.ui.segment', [
                    m('button.ui.labeled.icon.primary.button', {
                        onclick: () => {
                            ctrl.object.key = '';
                            for (var key in ctrl.object) {
                                if (key != 'key' && ctrl.object.hasOwnProperty(key)) {
                                    ctrl.object[key]('');
                                }
                            }
                        }
                    }, [
                        m('i.plus.icon')
                    ], '创建新类型'),
                    m.component(poiTypeList, {
                        list: ctrl.list,
                        onselect: function (orgCode, name) {
                            var it = ctrl.object;
                            m.request({
                                method: 'GET',
                                url: `/poi-type/object/${orgCode}/${name}`,
                            }).then((data) => {
                                ctrl.object.key = data.orgCode + '-' + data.name;
                                for (var key in ctrl.object) {
                                    if (key != 'key' && ctrl.object.hasOwnProperty(key)) {
                                        ctrl.object[key](data[key]);
                                    }
                                }
                            });
                        },
                    }),
                ]),
                m('.ui.segment', [
                    m.component(poiTypeForm, {
                        object: ctrl.object,
                        save: function (poiType) {
                            ctrl.list([{
                               name: poiType.name,
                               orgCode: poiType.orgCode,
                            }].concat(ctrl.list()));
                            if (!ctrl.object.key) {
                                ctrl.object = {
                                    key: '',
                                    name: m.prop(''),
                                    orgCode: m.prop(''),
                                    ic: m.prop(''),
                                    icActive: m.prop(''),
                                    fields: m.prop({}),
                                };
                            }
                        }
                    })   
                ]),
            ]),
        ],
    },
    '/region': {
        view: function (ctrl, args) {
            return [
                m.component(navBar, '/region')
            ];
        }
    }
});
