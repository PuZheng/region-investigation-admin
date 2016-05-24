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
(io/make-parents (str ((my-config) :upload-dir) "/apks/foo"))


(defn upload-file
  [from to]
  (io/copy (from :tempfile) to))


; 保证uploadDir是以/结尾
(def uploadDir (let [v ((my-config) :upload-dir)] (if (.endsWith v "/") v (str v "/"))))
(def apkDir (str uploadDir "apks"))
(def poiTypeDir (str uploadDir "poi-types"))

(defroutes app-routes
  (GET "/" [] (render-file "application.html" {}))
  (GET "/app/version/list" [] (response 
                            (let [sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")] 
                              (map (fn [f] {
                                            :createdAt (.format sdf (.lastModified f))
                                            :version (.replace (.getName f) ".apk" "")
                                            })
                                   (.listFiles (io/file apkDir))) )
                            ))
  (GET "/app/latest-version" [] 
       (response
         (let [sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")] 
           ((fn [f] {
                     :createdAt (.format sdf (.lastModified f))
                     :version (.replace (.getName f) ".apk" "")
                     :path (str "apks/" (.getName f))
                     }) (last (sort-by (fn [f] (.lastModified f)) (.listFiles (io/file apkDir))) ) ) )
                                  ))
  (GET "/app/latest-poi-types" {params :query-params}
       (response (let [orgCode (params "org_code")
                       sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")]
                   (pprint orgCode)
                   (map (fn [dir] 
                          (let [latest-version-zip 
                                (last (sort-by (fn [f] (.lastModified f)) (.listFiles dir)))]
                            {
                             :name (.getName dir)
                             :createdAt (.format sdf (.lastModified latest-version-zip))
                             :version (.replace (.getName latest-version-zip) ".zip" "")
                             :path (-> latest-version-zip 
                                       (.getPath)
                                       (.replace uploadDir ""))
                             })) 
                        (.listFiles (io/file (str poiTypeDir "/" orgCode)))))))
  (wrap-multipart-params (POST "/application/object" {params :params}
                               (response 
                                 (let [version (params :version)]
                                   (upload-file (params :file) 
                                                (io/file ((my-config) :upload-dir) "apks" 
                                                         (str version ".apk")))
                                   {}
                                   ; (jdbc/with-connection db-spec 
                                   ;   (try (jdbc/insert-record 
                                   ;          :version {
                                   ;                    :version version 
                                   ;                    :path (str "apks/" version ".apk")
                                   ;                    :brief (params :brief)
                                   ;                    :created_at (f/unparse (f/formatter "yyyy-MM-dd HH:mm:ss") (t/now))
                                   ;                    }) 
                                   ;        {}
                                   ;        (catch java.sql.SQLException e (pprint e) { 
                                   ;                                        :version "已经存在该版本"
                                   ;                                        }))
                                   ;   ))

                               )))) 
  (route/resources "/static")
  (route/not-found "Not Found"))

(def app
  (-> app-routes 
      wrap-json-response 
      (wrap-defaults (assoc-in site-defaults [:security :anti-forgery] false)))
  )

(def reloadable-app
  (wrap-reload app))
