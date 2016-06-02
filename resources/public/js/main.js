import navBar from './nav-bar.js';
import { newVersionForm, versionHistory } from './app.js';
import { newOrgForm } from './org.js';


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
            this.onCreate = function () {
                
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
        view: function (ctrl, args) {
            return [
                m.component(navBar, "/poi-type")
            ];
        }
    },
    '/region': {
        view: function (ctrl, args) {
            return [
                m.component(navBar, '/region')
            ];
        }
    }
});
