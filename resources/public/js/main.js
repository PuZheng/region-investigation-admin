import navBar from './nav-bar.js';
import { newVersionForm, versionHistory } from './app.js';



m.route.mode = 'pathname';
m.route(document.querySelector('.ui.container'), "/app", { 
    '/app': {
        view: function (ctrl, args) {
            return [
                m.component(navBar),
                m.component(newVersionForm),
                m.component(versionHistory)
            ];
        },
    },
    '/org': {
        view: function (ctrl, args) {
            return [
                m.component(navBar)
            ];
        }
    },
    '/poi-type': {
        view: function (ctrl, args) {
            return [
                m.component(navBar)
            ];
        }
    },
    '/region': {
        view: function (ctrl, args) {
            return [
                m.component(navBar)
            ];
        }
    }
});
