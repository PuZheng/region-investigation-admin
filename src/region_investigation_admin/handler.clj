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
            [clojure.java.jdbc :as jdbc]
            [nomad :refer [defconfig]]
            [clj-time.format :as f]
            [clj-time.core :as t]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(def db-spec {:classname   "org.sqlite.JDBC"
         :subprotocol "sqlite"
         :subname     "db"
         })

(set-resource-path! (clojure.java.io/resource "templates"))

(defconfig my-config (io/resource "config.edn"))


(defn upload-file
  [from to]
  (io/copy (from :tempfile) to))

(defroutes app-routes
  (GET "/" [] (render-file "application.html" {}))
  (wrap-multipart-params (POST "/application/object" {params :params}
                               (let [version (params :version)]
                                 (upload-file (params :file) 
                                              (io/file ((my-config) :upload-dir) "apks" 
                                                       (str version ".apk")))
                                 (jdbc/with-connection db-spec 
                                   (jdbc/insert-record 
                                     :version {
                                               :version version 
                                               :path (str "apks/" version ".apk")
                                               :brief (params :brief)
                                               :created_at (f/unparse (f/formatter "yyyy-MM-dd HH:mm:ss") (t/now))
                                               }) )
                                 )
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
