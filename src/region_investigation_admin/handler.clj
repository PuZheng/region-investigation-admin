(ns region-investigation-admin.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as response]
            [selmer.parser :refer [render-file set-resource-path!]]
            [ring.middleware.reload :refer [wrap-reload]]
            [ring.middleware.multipart-params :refer [wrap-multipart-params]]
            [ring.middleware.json :refer [wrap-json-response]]
            [clojure.java.io :as io]
            [clojure.pprint :refer [pprint]]
            [nomad :refer [defconfig]]
            [clj-time.format :as f]
            [clj-time.core :as t]
            [me.raynes.fs :as fs]
            [me.raynes.fs.compression :as compression]
            [ring.middleware.logger :as logger]
            [cheshire.core :refer [parse-string]]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))


(set-resource-path! (clojure.java.io/resource "templates"))
(defconfig my-config (io/resource "config.edn"))


(def uploadDir (io/file (let [v ((my-config) :upload-dir)] (if (nil? v) "assets" v)) ))
(def apkDir (io/file uploadDir "apks/"))
(def poiTypeDir (io/file uploadDir "poi-types/"))
(def regionDir (io/file uploadDir "regions/"))

(io/make-parents (io/file apkDir "foo"))
(io/make-parents (io/file poiTypeDir "foo"))
(io/make-parents (io/file regionDir "foo"))

(defn upload-file
  [from to]
  (io/copy (from :tempfile) to))

(defn read-file [file]
  (with-open [reader (io/input-stream file)]
    (let [length (.length (io/file file))
          buffer (byte-array length)]
      (.read reader buffer 0 length)
      buffer)))

(defroutes app-routes
  (GET "/" []  (render-file "application.html" {}))
  (GET "/app/version/list" [] (response/response 
                                { :data (let [sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")] 
                                          (->> apkDir
                                               .listFiles
                                               (filter (fn [f] (.endsWith (.getName f) ".apk")))
                                               (map (fn [f] {
                                                             :createdAt (.format sdf (.lastModified f))
                                                             :version (.replace (.getName f) ".apk" "")
                                                             })
                                                    ))
                                          ) }
                            ))
  (GET "/app/latest-version" [] 
       (response/response
         (let [sdf (new java.text.SimpleDateFormat "yyyy-MM-dd HH:mm:ss")] 
           ((fn [f] {
                     :createdAt (.format sdf (.lastModified f))
                     :version (.replace (.getName f) ".apk" "")
                     }) (last (sort-by (fn [f] (.lastModified f)) (.listFiles apkDir)) ) ) )
                                  ))
  (GET "/app/:version.apk" [version]
       (response/header (response/file-response (.getPath (io/file apkDir (str version ".apk")))) 
                        "content-disposition" (str "attachment; filename=\"" version ".apk\"")))
  (GET "/poi-type/latest-versions" {params :query-params}
       (response/response (let [orgCode (params "org_code")]
                   {:data (map (fn [dir] {
                                          :name (.getName dir)
                                          :timestamp ((parse-string (slurp (io/file dir "config.json"))) 
                                                      "timestamp")
                                          })
                               (filter fs/directory? (fs/list-dir (io/file poiTypeDir orgCode))))}
                   )))
  (GET "/poi-type/:orgCode/:name_.zip" [orgCode name_]
       (response/header 
         (response/file-response 
           (let [timestamp ((parse-string (slurp (io/file poiTypeDir orgCode name_ "config.json"))) 
                            "timestamp")
                 zipFile (io/file poiTypeDir orgCode (str name_ "-" timestamp ".zip"))]
             (if (not (fs/exists? zipFile)) 
               (compression/zip zipFile 
                                ; don't use slurp to read binary data
                                (map (fn [f] [(.getName f) (read-file f)]) 
                                     (filter fs/file? (fs/list-dir (io/file poiTypeDir orgCode name_))))))
             (.getPath (io/file poiTypeDir orgCode (str name_ "-" timestamp ".zip")))))
         "content-disposition" (str "attachment; filename=\"" name_ "\"")))
  (wrap-multipart-params (POST "/application/object" {params :params}
                               (let [version (params :version)
                                     versionsExist (set (->> apkDir
                                                          .listFiles
                                                          (filter (fn [f] (.endsWith (.getName f) ".apk")))
                                                          (map (fn [f] (.replace (.getName f) ".apk" "")))))]
                                 (if (versionsExist version) 
                                   (response/status (response/response {
                                                                        :version "该版本已经存在"
                                                                        }) 403)
                                   
                                   (response/response (do (upload-file (params :file) 
                                                     (io/file ((my-config) :upload-dir) "apks" 
                                                              (str version ".apk")))
                                        {}))
                                   ))
                               )) 
  (wrap-multipart-params (POST "/region" {params :params}
                               (response/response 
                                 (let [orgCode (params :orgCode)
                                       username (params :username)
                                       file (params :file)
                                       dest (io/file regionDir orgCode username (file :filename))]
                                   (io/make-parents dest)
                                   (upload-file file dest) 
                                   {}
                               )))) 
  (route/not-found "Not Found"))

(def cors-headers 
  { "Access-Control-Allow-Origin" "*"
    "Access-Control-Allow-Headers" "Content-Type"
    "Access-Control-Allow-Methods" "GET,POST,OPTIONS" })

(defn all-cors
  "Allow requests from all origins"
  [handler]
  (fn [request]
    (let [response (handler request)]
      (update-in response [:headers]
        merge cors-headers ))))

(def app
  (-> app-routes 
      wrap-json-response 
      (wrap-defaults (assoc-in site-defaults [:security :anti-forgery] false)))
  )

(def reloadable-app
  (wrap-reload app))
