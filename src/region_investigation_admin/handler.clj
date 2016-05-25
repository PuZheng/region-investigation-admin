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
            [nomad :refer [defconfig]]
            [clj-time.format :as f]
            [clj-time.core :as t]
            [me.raynes.fs :as fs]
            [ring.middleware.logger :as logger]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))


(set-resource-path! (clojure.java.io/resource "templates"))
(defconfig my-config (io/resource "config.edn"))
(io/make-parents (str ((my-config) :upload-dir) "/apks/foo"))


(defn upload-file
  [from to]
  (io/copy (from :tempfile) to))


(def uploadDir (io/file (let [v ((my-config) :upload-dir)] (if (nil? v) "assets" v)) ))
(def apkDir (io/file uploadDir "apks/"))
(def poiTypeDir (io/file uploadDir "poi-types/"))

(io/make-parents (io/file apkDir "foo"))
(io/make-parents (io/file poiTypeDir "foo"))

(defroutes app-routes
  (GET "/" [] (render-file "application.html" {}))
  (GET "/app/version/list" [] (response 
                            (let [sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")] 
                              (map (fn [f] {
                                            :createdAt (.format sdf (.lastModified f))
                                            :version (.replace (.getName f) ".apk" "")
                                            })
                                   (.listFiles apkDir)) )
                            ))
  (GET "/app/latest-version" [] 
       (response
         (let [sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")] 
           ((fn [f] {
                     :createdAt (.format sdf (.lastModified f))
                     :version (.replace (.getName f) ".apk" "")
                     :path (str "apks/" (.getName f))
                     }) (last (sort-by (fn [f] (.lastModified f)) (.listFiles apkDir)) ) ) )
                                  ))
  (GET "/poi-type/latest-versions" {params :query-params}
       (response (let [orgCode (params "org_code")
                       sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")]
                   {:data (filter (fn [x] (not (nil? x)))
                                  (map (fn [dir] 
                                  (let [latest-version-zip 
                                        (last (sort-by (fn [f] (.lastModified f)) 
                                                       (filter (fn [f] (re-matches #"(?i).*\.zip$" (.getName f))) 
                                                               (fs/list-dir dir))))]
                                    (if (nil? latest-version-zip) nil {
                                       :name (.getName dir)
                                       :createdAt (.format sdf (.lastModified latest-version-zip))
                                       :version (clojure.string/replace (.getName latest-version-zip) #"(?i)\.zip$" "")
                                       :path (-> latest-version-zip 
                                                 (.getPath)
                                                 (.replace (.getAbsolutePath uploadDir) ""))
                                       } ))) 
                                (fs/list-dir (io/file poiTypeDir orgCode))))}
                   )))
  (wrap-multipart-params (POST "/application/object" {params :params}
                               (response 
                                 (let [version (params :version)]
                                   (upload-file (params :file) 
                                                (io/file ((my-config) :upload-dir) "apks" 
                                                         (str version ".apk")))
                               )))) 
  (route/resources "/static")
  (route/not-found "Not Found"))

(def app
  (-> app-routes 
      logger/wrap-with-logger
      wrap-json-response 
      (wrap-defaults (assoc-in site-defaults [:security :anti-forgery] false)))
  )

(def reloadable-app
  (wrap-reload app))
