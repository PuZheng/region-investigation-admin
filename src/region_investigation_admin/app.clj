(ns region-investigation-admin.app
  (:require
    [ring.util.response :as response]
    [clojure.java.io :as io]
    [compojure.core :refer :all]
    [clojure.pprint :refer [pprint]]
    [ring.middleware.multipart-params :refer [wrap-multipart-params]]
    [region-investigation-admin.config :refer [upload-dir my-config]]
    )
  (:import (java.text SimpleDateFormat)))


(def apk-dir (io/file upload-dir "apks/"))
(io/make-parents (io/file apk-dir "foo"))

(defn upload-file
  [from to]
  (io/copy (from :tempfile) to))

(defroutes app-routes
           (context "/app" []
             (GET "/version/list" [] (response/response
                                       {:data (let [sdf (new SimpleDateFormat "yyyy-MM-dd HH:mm:ss")]
                                                (->> (.listFiles apk-dir)
                                                     (filter (fn [f] (.endsWith (.getName f) ".apk")))
                                                     (map (fn [f] {
                                                                   :createdAt (.format sdf (.lastModified f))
                                                                   :version   (.replace (.getName f) ".apk" "")
                                                                   })
                                                          ))
                                                )}
                                       ))
             (GET "/latest-version" []
               (response/response
                 (let [sdf (new SimpleDateFormat "yyyy-MM-dd HH:mm:ss")]
                   ((fn [f] {
                             :createdAt (.format sdf (.lastModified f))
                             :version   (.replace (.getName f) ".apk" "")
                             }) (last (sort-by (fn [f] (.lastModified f)) (.listFiles apk-dir)))))
                 ))
             (GET "/:version.apk" [version]
               (response/header (response/file-response (.getPath (io/file apk-dir (str version ".apk"))))
                                "content-disposition" (str "attachment; filename=\"" version ".apk\"")))
             (wrap-multipart-params (POST "/object" {params :params}
                                      (let [version (params :version)
                                            versionsExist (set (->> apk-dir
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

             )
           )
