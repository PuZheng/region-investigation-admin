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


(defroutes app-routes
           (context "/app" []
                    (DELETE "/version/:version" [version] 
                            (response/response 
                              (do 
                                (.delete (io/file apk-dir (str version ".apk")))
                                {})))
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
                    (wrap-multipart-params 
                      (POST "/object" {params :params}
                            (let [version (map #(Integer/valueOf %) (.split (params :version) "\\."))
                                  previousVersions (set (->> apk-dir
                                                             .listFiles
                                                             (filter (fn [f] (.endsWith (.getName f) ".apk")))
                                                             (map (fn [f] (.replace (.getName f) ".apk" "")))
                                                             (map (fn [v] (map #(Integer/valueOf %) (.split v "\\."))))
                                                             ))]
                              (if (previousVersions version)
                                (response/status (response/response {
                                                                     :version "该版本已经存在"
                                                                     }) 403)
                                (if (some (partial (fn [v1 v2] 
                                                     (= (compare (vec v1) (vec v2)) -1)) 
                                                   version) previousVersions)
                                  (response/status (response/response {
                                                                       :version "存在高于该版本的版本"
                                                                       }) 403)
                                  (response/response (let [sdf (new SimpleDateFormat "yyyy-MM-dd HH:mm:ss")
                                                           dest (io/file ((my-config) :upload-dir) "apks"
                                                                         (str (clojure.string/join "." version) ".apk"))] 
                                                       (do 
                                                         (io/make-parents dest)
                                                         (io/copy ((params :file) :tempfile) dest)
                                                         {
                                                          :version (clojure.string/join "." version),
                                                          :createdAt (.format sdf (.lastModified dest)) 
                                                          }))))
                                ))
                            ))

                    )
  )
