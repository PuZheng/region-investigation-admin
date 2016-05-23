(ns region-investigation-admin.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as response]
            [selmer.parser :refer [render-file set-resource-path!]]
            [ring.middleware.reload :refer [wrap-reload]]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(set-resource-path! (clojure.java.io/resource "templates"))

(defroutes app-routes
  (GET "/" [] (render-file "application.html" {}))
  (route/resources "/static")
  (route/not-found "Not Found"))

(def app
  (wrap-defaults app-routes site-defaults))

(def reloadable-app
  (wrap-reload app))
