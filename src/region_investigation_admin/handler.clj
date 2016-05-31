(ns region-investigation-admin.handler
  (:require
    [region-investigation-admin.app :refer [app-routes]]
    [region-investigation-admin.poi_type :refer [poi-type-routes]]
    [region-investigation-admin.region :refer [region-routes]]
    [compojure.core :refer :all]
    [compojure.route :as route]
    [selmer.parser :refer [set-resource-path!]]
    [ring.middleware.reload :refer [wrap-reload]]
    [ring.middleware.json :refer [wrap-json-response]]
    [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
    [ring.util.response :as response]))


(set-resource-path! (clojure.java.io/resource "templates"))


(def app
  (-> (routes
        (GET "/" [] (response/redirect "/index.html"))
        app-routes poi-type-routes region-routes (route/not-found "Not Found"))
      wrap-json-response
      (wrap-defaults (assoc-in site-defaults [:security :anti-forgery] false)))
  )

(def reloadable-app
  (wrap-reload app))
