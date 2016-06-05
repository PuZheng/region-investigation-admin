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
                this.object = m.prop();
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
                            ctrl.object('');
                        }
                    }, [
                        m('i.plus.icon')
                    ], '创建新类型'),
                    m.component(poiTypeList, {
                        list: ctrl.list,
                        onselect: function (e) {

                        },
                    }),
                ]),
                m('.ui.segment', [
                    m.component(poiTypeForm, {
                        object: ctrl.object,
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
