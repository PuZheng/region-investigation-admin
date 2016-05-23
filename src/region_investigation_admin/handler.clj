(ns region-investigation-admin.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as response]
            [selmer.parser :refer [render-file set-resource-path!]]
            [ring.middleware.reload :refer [wrap-reload]]
            [ring.middleware.multipart-params :refer [wrap-multipart-params]]
            [ring.middleware.json :refer [wrap-json-response]]
            [ring.util.response :refer [response]]
            [clojure.java.io :as io]
            [clojure.pprint :refer [pprint]]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(set-resource-path! (clojure.java.io/resource "templates"))

(io/make-parents "assets/apks/foo.apk")
(io/make-parents "assets/poi-types/foo.zip")
(io/make-parents "assets/regions/foo.zip")


(defn upload-file
  [from to]
  (io/copy (from :tempfile) to))

(defroutes app-routes
  (GET "/" [] (render-file "application.html" {}))
  (wrap-multipart-params (POST "/application/object" {params :params}
                               (pprint params)
                               (upload-file (params :file) 
                                            (io/file "assets" "apks" (str (params :version) ".apk")))
                               (response {}))) 
  (route/resources "/static")
  (route/not-found "Not Found"))

(def app
  (-> app-routes 
      wrap-json-response 
      (wrap-defaults (assoc-in site-defaults [:security :anti-forgery] false)))
  )

(def reloadable-app
  (wrap-reload app))
