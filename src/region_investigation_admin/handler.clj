(ns region-investigation-admin.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as response]
            [ring.middleware.reload :refer [wrap-reload]]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(defroutes app-routes
  (GET "/" [] (response/redirect "/static/index.html"))
  (route/resources "/static")
  (route/not-found "Not Found"))

(def app
  (wrap-defaults app-routes site-defaults))

(def reloadable-app
  (wrap-reload app))
